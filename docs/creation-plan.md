# Plan: Inomedia Voting Platform

## Context
Building a greenfield Next.js web application for a Romanian school video-ranking competition. The platform handles three actor types (Teacher, Admin, Student), two voting flows (simple and student-delegated), and a Borda-count aggregation system. The project directory currently has only spec files — no code exists yet.

## Tech Stack Decisions
- **Framework**: Next.js 16 App Router, TypeScript
- **Session**: `iron-session` v8 (stateless encrypted cookies, App Router native)
- **Database**: MongoDB via `mongoose` (singleton connection pattern)
- **UI**: Bootstrap 5 (CDN or npm), no CSS Modules
- **Drag & Drop**: `dnd-kit` (active maintenance, works with Bootstrap 5)
- **Email**: `nodemailer` (SMTP, credentials via env vars)
- **QR Code**: `qrcode.react`
- **Linting**: ESLint + Prettier (Next.js defaults + Romanian-friendly config)

---

## Project Structure

```
src/
  app/
    layout.tsx                  # Root layout, Bootstrap CSS import
    page.tsx                    # Landing page (Login / I am a Student)
    auth/
      login/page.tsx            # Step 1: email entry
      verify/page.tsx           # Step 2: OTP entry
    teacher/
      layout.tsx                # Auth guard (role=teacher)
      page.tsx                  # Redirects based on state
      vote-method/page.tsx      # Pick Jurizare Simpla / cu Elevi
      vote/page.tsx             # Simple voting drag-and-drop
      students/page.tsx         # Student voting management
    admin/
      layout.tsx                # Auth guard (role=admin)
      page.tsx                  # Admin dashboard
    student/
      page.tsx                  # Code entry page
      [code]/page.tsx           # Voting page (also handles direct URL)
  api/
    auth/
      send-otp/route.ts
      verify-otp/route.ts
      logout/route.ts
    teacher/
      vote-method/route.ts
      vote/save/route.ts        # Auto-save ranking draft
      vote/cast/route.ts        # Cast final simple vote
      code/regenerate/route.ts
      students/votes/route.ts   # GET votes list
      students/votes/[id]/route.ts  # PATCH (remove/undo)
      students/submit/route.ts  # Submit aggregated student votes
      ranking/route.ts          # Current school ranking
    admin/
      voting/start/route.ts
      voting/stop/route.ts
      ranking/route.ts
      teachers/route.ts
    student/
      vote/route.ts
  lib/
    mongodb.ts                  # Mongoose singleton connection
    session.ts                  # iron-session config & helpers
    mailer.ts                   # nodemailer transporter
    borda.ts                    # Scoring logic
    student-code.ts             # Code generation (no look-alike chars)
  models/
    Teacher.ts
    Admin.ts
    Video.ts
    StudentVote.ts
    VotingState.ts
  middleware.ts                 # Route protection
```

---

## Database Models

### `Teacher`
```
email, fullName, school, locality, county
studentCount: "1" | "2" | "3" | "4+"
votingMethod: null | "simple" | "students"
joinCode: string              # current active code
previousCodes: string[]       # invalidated codes
voteSubmitted: boolean
submittedRanking: ObjectId[]  # video IDs in order (simple vote)
otp: string, otpExpiry: Date
```

### `Admin`
```
email, name
otp: string, otpExpiry: Date
```

### `Video`
```
title, school, locality, county, thumbnailUrl, youtubeUrl
```

### `StudentVote`
```
teacherId: ObjectId
studentName: string, class: string
ranking: ObjectId[]           # 10 video IDs in order
removed: boolean
createdAt: Date
```

### `VotingState` (singleton)
```
status: "not_started" | "active" | "stopped"
```

---

## Authentication Flow

- **Teachers/Admins**: Unified `/auth/login` → POST `/api/auth/send-otp` (stores hashed OTP + expiry on user doc, sends email) → `/auth/verify` → POST `/api/auth/verify-otp` (validates, creates iron-session) → redirect to `/teacher` or `/admin`
- **Students**: No session. Access via `/student/[code]` or `/student` (enter code manually). Code validated per-request against active teacher codes.
- **OTP**: 6-char numeric, 10-min expiry, resend rate-limited to once/minute (store `otpSentAt` on user doc)
- **Session shape**: `{ userId: string, role: "teacher" | "admin" }`

### Middleware (`middleware.ts`)
- `/teacher/*` → require session with `role=teacher`
- `/admin/*` → require session with `role=admin`
- `/student/*` → no session required

---

## Voting Logic (`lib/borda.ts`)

### Borda scores
Position 1→12, 2→10, 3→8, 4→7, 5→6, 6→5, 7→4, 8→3, 9→2, 10→1

### National aggregation (run at display time, not stored)
1. Collect all **submitted** simple teacher votes (each is a 10-video ranking → scored directly)
2. Collect all **submitted** student-mode teacher records:
   - Take their non-removed StudentVotes, Borda-aggregate them into a school ranking (top 10)
   - Score that school ranking 12→1 as a single vote
3. Sum all scores per video → sort descending → final ranking

### Student vote intermediate aggregation
- Apply Borda scoring to each student's ranking
- Sum per video → sort → take top 10 → this is the school ranking
- Teacher sees this live ranking during voting (via `/api/teacher/ranking`)

---

## Key Page Behaviors

### Teacher Dashboard (`/teacher`)
State machine based on DB:
- Voting not started → "come back later" message
- Voting stopped → relevant message
- No method chosen → redirect to `/teacher/vote-method`
- Simple, not submitted → redirect to `/teacher/vote`
- Student mode → redirect to `/teacher/students`
- Voted (simple) → show confirmation/summary

### Teacher Simple Vote (`/teacher/vote`)
- SSR: load videos + teacher's saved draft ranking
- Drag-and-drop (dnd-kit) + up/down buttons with CSS transition animation
- Auto-save: PATCH `/api/teacher/vote/save` on each reorder
- "Cast vote" button → POST `/api/teacher/vote/cast` (validates exactly 10 items, sets `voteSubmitted=true`, saves `submittedRanking`)

### Teacher Student Mode (`/teacher/students`)
- Three Bootstrap tabs: Instructions+Code, Votes List, Current Ranking
- Instructions section: join code, copyable direct URL, QR code (`qrcode.react`), regenerate button (confirmation modal)
- Votes list: SSR + manual Refresh button (client fetch to `/api/teacher/students/votes`)
- Remove/Undo: PATCH `/api/teacher/students/votes/[id]` toggles `removed` field
- Submit button: POST `/api/teacher/students/submit` (aggregates + marks teacher submitted)

### Student Voting (`/student/[code]`)
- SSR: validate code → load videos
- Prompt for name + class (modal or inline form, client-side state)
- Same drag-and-drop interface as teacher
- After cast: POST `/api/student/vote` → success screen with "Vote for another student" button (resets name/class form, same page)

### Admin Dashboard (`/admin`)
- SSR: load voting state + teacher list + ranking
- "Start Voting" button (only if not_started)
- "Stop Voting" button (if active)
- Teacher list table: name, school, locality, method chosen, vote submitted, student count (for student mode)
- Current ranking: top 10 videos with Borda scores

---

## Student Join Code Generation (`lib/student-code.ts`)
- 6-char uppercase alphanumeric
- Exclude look-alike characters: `0, O, 1, I, L`
- Alphabet: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (32 chars)
- Collision check against existing active codes

---

## Environment Variables (`.env.local`)
```
MONGODB_URI=
IRON_SESSION_PASSWORD=           # 32+ chars
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
NEXT_PUBLIC_BASE_URL=            # for QR code URL generation
```

---

## Scaffolding Steps

1. `npx create-next-app@16 . --typescript --eslint --app --src-dir --no-tailwind`
2. Install dependencies: `iron-session mongoose nodemailer qrcode.react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
3. Install Bootstrap 5: `npm i bootstrap`; import in `app/layout.tsx`
4. Configure Prettier + ESLint
5. Create `.env.local` with placeholders
6. Build models → lib utilities → API routes → pages (in that order)

---

## Verification
- Seed script: `scripts/seed.ts` — creates admin, 2+ teachers, 12+ videos, VotingState
- Manual test flow:
  1. Admin logs in → starts voting
  2. Teacher A logs in → picks simple voting → ranks videos → casts vote
  3. Teacher B logs in → picks student voting → shares code → students vote via URL
  4. Teacher B reviews + removes a vote → submits
  5. Admin sees both votes reflected in ranking with correct Borda scores
  6. Admin stops voting → teacher/student see stopped message
- Check OTP resend rate limit (1/min)
- Check regenerated code invalidates old student votes for new submissions (old votes retained)
- Check mobile layout on 375px viewport
