# MirrorTrace — Stability + Calendar/Timeline Pack

This pack is designed for the repository state shown by your latest `npm run lint` output.

## Why stability comes first

Your automated production verification passed, and `npm run build` completed, but `npm run lint` still reported five TypeScript errors:

- 2 in `AdminDashboard.tsx`
- 2 in `AuthView.tsx`
- 1 in `JournalList.tsx`

Do not add another backend feature until `npm run lint` is clean.

## Package contents

### FULL FILES

- `src/components/JournalList.tsx`
- `src/components/JournalCalendar.tsx`
- `src/components/YearInReflection.tsx`
- `src/lib/aiError.ts`

The supplied JournalList keeps the already-working:

- keyword search
- topic filtering
- date range filtering
- Thought Snapshot flow
- Thought Diff flow
- graceful AI outage message
- Year in Reflection

and adds:

- List / Calendar view toggle
- month navigation
- days with reflection counts
- click a date to inspect reflections from that day

It also fixes the `localeCompare` TypeScript error by explicitly typing topic tags as strings.

### SAFE STABILITY SCRIPT

`scripts/fix-current-typescript-errors.ps1`

This changes only two tiny patterns inside your CURRENT large files instead of overwriting them:

1. `AdminDashboard.tsx`
   - moves React `key` onto native wrapper divs around `SupportTicketCard` and `ReviewModerationCard`

2. `AuthView.tsx`
   - converts multiline `direction=" left "` and `direction=" right "` values to exact string literals

This avoids replacing your current landing page or admin UI.

### DEV PORT SCRIPT

`scripts/free-dev-ports.ps1`

Use only when you see:

- `EADDRINUSE ... port 3000`
- `WebSocket server error: Port 24678 is already in use`

## Install

Copy/extract this package into your MirrorTrace project root.

Then run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\fix-current-typescript-errors.ps1
npm run lint
npm run build
```

If lint and build both pass:

```powershell
npm run dev
```

If port 3000 or 24678 is already occupied:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\free-dev-ports.ps1
npm run dev
```

## What you should see

Journal History gains:

- **List**
- **Calendar**

In Calendar mode:
- month grid
- reflection count on dates with saved entries
- previous/next month
- Today button
- click a date to inspect that day's reflections

## Production status after this

Once lint is clean, your next priority should be:

1. Firebase/Auth smoke tests
2. admin RBAC test
3. two-account isolation test
4. push/email test
5. Cloud Run deployment verification
6. only then add the daily reflection reminder

The daily reminder should reuse your existing notification preference fields and send functions. It should not be guessed from scratch.
