# UI/UX Audit

_Audited: 2026-05-14_

---

## High

### H1 — Silent save failure in voting interface
**File:** `src/components/VotingInterface.tsx` (scheduleSave)

Auto-save fires on every ranking change but swallows errors silently. A network failure means the user's ranking is lost with no indication.

**Fix:** On save failure, show an inline error banner ("Salvarea a eșuat — verificați conexiunea") and keep retrying or block submission until a successful save is confirmed.

---

### H2 — Non-accessible modal dialog
**File:** `src/app/teacher/students/StudentsClient.tsx` (regenerate modal, lines ~326-351)

The regenerate-code modal is a styled `<div>` with no `role="dialog"`, no `aria-labelledby`, no `aria-modal`, and no Escape-to-close. Keyboard users cannot reach or dismiss it properly.

**Fix:** Add ARIA attributes and an Escape key handler, or replace with a proper Bootstrap modal (`data-bs-toggle="modal"`):
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="regenModalTitle" ...>
  <h5 id="regenModalTitle">...</h5>
  <button aria-label="Închide" className="btn-close" ...>
```

---

### H3 — Vote method cards not keyboard/label accessible
**File:** `src/app/teacher/vote-method/VoteMethodForm.tsx` (lines ~46-90)

Radio inputs are inside clickable `<div>` cards, not wrapped in `<label>`. Clicking the card text does not toggle the radio, and keyboard users must tab directly to the hidden radio input.

**Fix:** Wrap each card's content in a `<label htmlFor="...">` that matches the radio `id`, so the entire card area activates the input.

---

## Medium

### M1 — Silent failure on vote toggle and vote refresh
**File:** `src/app/teacher/students/StudentsClient.tsx` (`toggleRemove`, `refreshVotes`, `refreshRanking`)

`toggleRemove` doesn't check `res.ok` — if the PATCH fails, the UI updates optimistically and gets out of sync with the server. The refresh functions check `res.ok` but show no error to the user.

**Fix:** On non-ok responses, revert optimistic UI updates and display a brief error alert.

---

### M2 — No confirmation before irreversible vote submission
**File:** `src/components/VotingInterface.tsx` (submit button, line ~335)

Clicking "Trimite votul" immediately casts the final vote with no confirmation dialog. Vote submission cannot be undone.

**Fix:** Show a confirmation: _"Ești sigur că vrei să trimiți votul? Această acțiune nu poate fi anulată."_

---

### M3 — Missing alt text on video thumbnails
**Files:** `src/components/VotingInterface.tsx`, `src/app/videos/VideoList.tsx`

`alt=""` is set on all thumbnails. Screen reader users receive no context about what video is shown.

**Fix:** Use `alt={video.title}`.

---

### M4 — Missing aria-label on icon-only buttons
**File:** `src/components/VotingInterface.tsx` (move up/down buttons)

Buttons use only a `title` attribute. Screen readers may not announce `title` in all modes.

**Fix:** Add `aria-label="Mută videoclipul sus"` / `"Mută videoclipul jos"` alongside the existing `title`.

---

### M5 — Color-only vote status indication in admin panel
**File:** `src/app/admin/AdminClient.tsx` (vote submitted badges)

"Voted / not voted" status is conveyed only through badge color (`bg-success` vs `bg-light`). Fails WCAG 1.4.1 (use of color).

**Fix:** Include a text label inside the badge that works without color ("Da" / "Nu" is already there — verify it is visible at low contrast and consider adding an icon).

---

### M6 — No session expiry feedback
**Scope:** App-wide API calls

If a session expires while the user is active, subsequent API calls return 401 but errors are shown as generic "Eroare internă". The user has no indication they've been logged out.

**Fix:** Intercept 401 responses globally (in a shared fetch wrapper or per-component) and redirect to `/auth` with a query param that shows "Sesiunea a expirat. Autentifică-te din nou."

---

### M7 — No unsaved-changes warning on navigation away
**File:** `src/components/VotingInterface.tsx`

If the user navigates away while auto-save is in-flight (or has failed), no browser-standard "unsaved changes" warning is shown.

**Fix:** Use `useEffect` to register a `beforeunload` handler while `saveStatus === 'saving'` or `saveStatus === 'error'`.

---

### M8 — Admin teacher table not readable on narrow viewports
**File:** `src/app/admin/AdminClient.tsx` (teacher list table)

The table is wrapped in `table-responsive` so it scrolls horizontally on mobile, but with 6+ columns it becomes unusable on small screens.

**Fix:** On `xs`/`sm` breakpoints, collapse to a card-per-row layout, or hide lower-priority columns (`county`, `studentCount`) behind a `d-none d-md-table-cell`.

---

## Low

### L1 — Auto-save indicator is easy to miss
**File:** `src/components/VotingInterface.tsx`

The saving spinner is small and located far from the submit button. Users may not notice it.

**Fix:** Move the save status indicator adjacent to the submit button, or add a brief "Salvat ✓" flash after each successful save.

---

### L2 — Resend OTP cooldown resets on page refresh
**File:** `src/app/auth/verify/page.tsx`

The 60-second resend cooldown is held in component state, so a page refresh resets it. The server will still enforce it (429), but the button appears enabled.

**Fix:** Persist the `otpSentAt` timestamp in `sessionStorage` and derive the remaining cooldown from it on mount.

---

### L3 — Student success screen has no exit path
**File:** `src/app/student/[code]/StudentVotingClient.tsx` (success state, lines ~41-53)

After voting, the only option is "Alt elev votează". There is no way to simply close / go home.

**Fix:** Add a secondary link: `<a href="/">Înapoi la pagina principală</a>`.

---

### L4 — Empty student votes list lacks actionable hint
**File:** `src/app/teacher/students/StudentsClient.tsx`

"Niciun vot primit încă." is shown but gives no next step.

**Fix:** Add: "Distribuie codul de acces sau codul QR elevilor pentru a începe votarea."

---

### L5 — QR code is not printable at a useful size
**File:** `src/app/teacher/students/StudentsClient.tsx` (line ~216)

QR is rendered at 180×180px on-screen, which is too small when printed.

**Fix:** Add a print-specific CSS class that scales the QR to at least 400×400px, or add a download-as-PNG button.

---

### L6 — Inconsistent back-link styling
**Scope:** Multiple pages

Back links alternate between `btn btn-primary`, `text-muted small text-decoration-none`, and plain `<a>` elements with no class. There is no consistent "secondary navigation" pattern.

**Fix:** Pick one style (`btn btn-outline-secondary` or a plain `text-muted` link) and apply it consistently.
