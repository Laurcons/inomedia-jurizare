# Security Audit

_Audited: 2026-05-14_

---

## Critical

### C1 — Middleware file not loaded
**File:** `src/proxy.ts`

Next.js only loads middleware from a file named `middleware.ts` (or `middleware.js`) at the project root or inside `src/`. The file `src/proxy.ts` is never picked up automatically. If route protection depends solely on this file, teacher and admin routes are unprotected. Verify whether server components perform their own session checks (some do, e.g. `src/app/teacher/page.tsx`), and audit every protected route for a server-side session guard.

**Fix:** Rename to `src/middleware.ts`, or ensure every protected server component independently calls `getSession()` and redirects on failure.

---

### C2 — Ranking arrays not validated against real video IDs
**Files:** `src/app/api/teacher/vote/save/route.ts`, `src/app/api/teacher/vote/cast/route.ts`, `src/app/api/student/vote/route.ts`

Submitted ranking arrays are checked for length but not verified to contain valid, existing video ObjectIds. Arbitrary ObjectIds can be stored and will silently corrupt Borda score computation.

**Fix:** After parsing the ranking, query `Video.countDocuments({ _id: { $in: ranking } })` and reject if the count doesn't match the submitted length. Also validate each element matches `/^[0-9a-fA-F]{24}$/` before hitting the DB.

---

## High

### H1 — `Math.random()` used for OTP generation
**File:** `src/app/api/auth/send-otp/route.ts:8`

`Math.random()` is not cryptographically secure. OTPs could be predicted by an attacker who knows the seed state.

**Fix:**
```ts
import crypto from 'crypto';
function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}
```

---

### H2 — `Math.random()` used for student join codes
**File:** `src/lib/student-code.ts:8`

Same issue as H1. Join codes gate student voting access; predictable codes allow unauthorized votes.

**Fix:** Replace with `crypto.randomBytes`:
```ts
import { randomBytes } from 'crypto';
export function generateStudentCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  return Array.from({ length: CODE_LENGTH }, (_, i) => ALPHABET[bytes[i] % ALPHABET.length]).join('');
}
```
Note: `bytes[i] % ALPHABET.length` introduces slight modulo bias for non-power-of-2 alphabet sizes. For higher security, use rejection sampling.

---

### H3 — Email enumeration on OTP send
**File:** `src/app/api/auth/send-otp/route.ts:29-30`

The endpoint returns a distinct 404 error when an email is not in the system, allowing attackers to enumerate valid teacher/admin emails.

**Fix:** Return the same response regardless of whether the email exists:
```ts
return NextResponse.json({ error: 'Dacă adresa există în sistem, vei primi un cod în câteva secunde.' }, { status: 200 });
```

---

### H4 — DEV_MODE bypass could reach production
**File:** `src/app/api/auth/verify-otp/route.ts`

If `DEV_MODE=true` is set in a production environment, OTP verification is fully bypassed with the code `000000`.

**Fix:** Gate the bypass on `NODE_ENV !== 'production'` in addition to `DEV_MODE`, or remove it entirely and rely on seed data with a real OTP flow in dev.

---

### H5 — SMTP TLS certificate validation disabled
**File:** `src/lib/mailer.ts`

`rejectUnauthorized: false` allows MITM attacks on the SMTP connection, exposing OTP codes in transit.

**Fix:** Remove the `tls` override entirely (defaults to `rejectUnauthorized: true`), or explicitly set it to `true`.

---

### H6 — OTP verify rate limiting (already fixed this session)
~~The verify-otp endpoint had no attempt limiting.~~ Fixed: atomic `$inc` on `otpAttempts` with a 5-attempt lockout is now in place.

---

## Medium

### M1 — IDOR in student vote fetch
**File:** `src/app/api/teacher/students/votes/[id]/route.ts:17-23`

The route fetches a `StudentVote` by ID and then checks ownership. A teacher can probe whether arbitrary vote IDs exist via timing differences.

**Fix:** Include the ownership check in the query:
```ts
const vote = await StudentVote.findOne({ _id: id, teacherId: session.userId });
```

---

### M2 — No CSRF protection on state-mutating routes
All POST/PATCH API routes rely on `SameSite: lax` cookies. `lax` allows cookies to be sent on top-level cross-site navigations, which could be abused in some scenarios.

**Fix:** Either upgrade to `sameSite: 'strict'`, or add an explicit CSRF token check. For a low-traffic internal app `strict` is the simplest path and has no meaningful UX cost here.

---

### M3 — Input length limits missing on freetext fields
**File:** `src/app/api/student/vote/route.ts`

`studentName` and `studentClass` are trimmed but have no maximum length enforced server-side, allowing oversized payloads.

**Fix:** Reject if `studentName.length > 100 || studentClass.length > 50`.

---

## Low

### L1 — No audit logging for sensitive operations
No structured log events for OTP requests, failed verifications, vote submissions, or admin actions. Makes incident investigation impossible.

**Fix:** Emit structured JSON log lines (at minimum `event`, `email`/`userId`, `ip`, `timestamp`) for: OTP sent, OTP failed, OTP verified, vote cast, voting started/stopped.

---

### L2 — No rate limiting on student vote submission
**File:** `src/app/api/student/vote/route.ts`

A student (or attacker with a valid join code) can POST votes repeatedly. Each submission creates a new `StudentVote` document.

**Fix:** Check whether a `StudentVote` already exists for `{ teacherId, studentName, studentClass }` and either reject or replace.
