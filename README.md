# Inomedia Jurizare

A voting platform for the *Inomedia. Interferențe Spirituale* competition — a Romanian nation-wide school contest where students create short videos about historical events and figures.

The app lets coordinating teachers rank videos either directly (simple vote) or by aggregating votes from their students (student vote). An admin oversees the process and controls the voting window. Rankings are computed using a Borda count.

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **MongoDB** via Mongoose
- **Bootstrap 5** for UI
- **iron-session** for auth (email OTP, no passwords)
- **dnd-kit** for drag-and-drop voting

## Running locally

```bash
cp .env.local.example .env.local  # fill in MONGODB_URI, IRON_SESSION_PASSWORD, SMTP vars
npm install
npm run seed   # populate DB with sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Contributing

All skill levels welcome. Good starting points:

- **UI/UX** — improve responsiveness, accessibility, or visual polish
- **Voting logic** — `src/lib/borda.ts` is self-contained and well-scoped
- **New features** — check the spec in `docs/product.md` for anything not yet implemented
- **Bugs & ideas** — open an issue, no PR required

If you're new to Next.js or the stack, `docs/product.md` is a great place to understand what the app is supposed to do before diving into code.
