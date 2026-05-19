# Concurrency Audit

_Audited: 2026-05-14_

All issues below are read-then-write (TOCTOU) patterns that should be replaced with atomic MongoDB operations. MongoDB guarantees document-level atomicity for single-document operations, so `findOneAndUpdate` / `findByIdAndUpdate` with the right filter is the correct tool in every case.

---

## Critical

### C1 — Student code generation has duplicate-code window
**Files:** `src/app/api/teacher/code/regenerate/route.ts`, `src/app/api/teacher/vote-method/route.ts`, `src/lib/student-code.ts`

Both routes fetch all existing codes, generate one not in that set, then save. Two concurrent requests see the same snapshot and can generate and save the same code.

**Fix:** Add a unique index on `Teacher.joinCode`. The second writer will get a duplicate-key error, which you can catch and retry. The uniqueness constraint makes the race harmless.

---

### C2 — Vote cast is not idempotent under concurrent requests
**File:** `src/app/api/teacher/vote/cast/route.ts`

Pattern: find teacher → check `voteSubmitted === false` → set `voteSubmitted = true` + ranking → save. Two concurrent requests both pass the check before either saves; last write wins unpredictably.

**Fix:**
```ts
const teacher = await Teacher.findOneAndUpdate(
  { _id: session.userId, voteSubmitted: false },
  { $set: { submittedRanking: ranking, voteSubmitted: true } },
  { new: true }
);
if (!teacher) return NextResponse.json({ error: 'Votul a fost deja trimis.' }, { status: 409 });
```

The filter `{ voteSubmitted: false }` means only one concurrent request can win; all others get `null` back.

---

### C3 — Voting state transitions are not atomic
**Files:** `src/app/api/admin/voting/start/route.ts`, `src/app/api/admin/voting/stop/route.ts`

Pattern: find state → check current status → update → save. Two concurrent start or stop requests can both pass the guard.

**Fix (start):**
```ts
const state = await VotingState.findOneAndUpdate(
  { status: 'not_started' },
  { $set: { status: 'active' } },
  { new: true }
);
if (!state) return NextResponse.json({ error: 'Votarea este deja activă sau încheiată.' }, { status: 409 });
```

Same pattern for stop (filter on `status: 'active'`).

---

## High

### H1 — Voting method selection can be overwritten concurrently
**File:** `src/app/api/teacher/vote-method/route.ts`

Pattern: find teacher → check `votingMethod === null` → set method → save. Two concurrent requests from the same teacher can both pass and set conflicting methods.

**Fix:**
```ts
const teacher = await Teacher.findOneAndUpdate(
  { _id: session.userId, votingMethod: null },
  { $set: { votingMethod: method, ...(method === 'students' ? { joinCode: newCode } : {}) } },
  { new: true }
);
if (!teacher) return NextResponse.json({ error: 'Metoda a fost deja selectată.' }, { status: 409 });
```

---

### H2 — OTP can be consumed twice under concurrent requests
**File:** `src/app/api/auth/verify-otp/route.ts`

_Partially mitigated_ by the `otpAttempts` counter added this session (which uses atomic `$inc`). However, OTP clearing itself (`user.otp = null; await user.save()`) is still a non-atomic read-then-write. Two simultaneous correct-OTP requests can both read a valid OTP, both pass validation, and both create sessions before either clears the OTP field.

**Fix:** Clear the OTP atomically as part of the lookup:
```ts
const user = await Teacher.findOneAndUpdate(
  { email: normalizedEmail, otp: otpValue },
  { $set: { otp: null, otpExpiry: null, otpAttempts: 0 } },
  { new: false } // get pre-update doc to confirm OTP matched
);
if (!user) return NextResponse.json({ error: 'Cod incorect sau expirat.' }, { status: 400 });
```
If the OTP doesn't match the filter, no update happens and `null` is returned.

---

### H3 — Student submit aggregation has a vote-creation window
**File:** `src/app/api/teacher/students/submit/route.ts`

The route fetches active student votes (line ~33), computes the Borda ranking, then sets `voteSubmitted = true`. A student vote created between the fetch and the flag-set is silently excluded from the ranking.

**Fix:** Either: (a) set `voteSubmitted = true` atomically first (using the C2 fix above) and _then_ aggregate (any vote created after the flag is set by the student route will be rejected), or (b) accept this as a documented cut-off behaviour.

---

## Medium

### M1 — Vote removal toggle is not atomic
**File:** `src/app/api/teacher/students/votes/[id]/route.ts`

Pattern: find vote → toggle `removed` → save. Two rapid concurrent requests both read `removed=false`, both toggle to `true`, and the vote ends up removed when it should have been restored.

**Fix:** Use an update pipeline to toggle atomically:
```ts
await StudentVote.findByIdAndUpdate(id, [{ $set: { removed: { $not: '$removed' } } }]);
```
