MIRRORTRACE — ALL JOURNAL FEATURES
=================================

AuthView is NOT changed by this package.

This package adds the remaining journal features:

1. Daily Reflection Reminder
2. Favorites / Pinning
3. Draft Autosave
4. Provenance-aware Edit Saved Entry
5. Export
6. Revisit-this Bookmarks
7. Weekly Review
8. Decision Ledger
9. Reflection Chains
10. Assumption Tracker
11. Version History for Edits
12. Personal Knowledge Graph

FILES ADDED
-----------
server/journalEnhancementRoutes.ts
src/lib/journalEnhancements.ts
src/components/JournalEnhancementsHub.tsx
src/hooks/useJournalDraftAutosave.ts
scripts/install-journal-enhancements.mjs
scripts/verify-journal-enhancements.mjs

FILES THE INSTALLER UPDATES
---------------------------
server.ts
src/components/JournalList.tsx
src/components/JournalEditor.tsx

WHY THE INSTALLER UPDATES INSTEAD OF REPLACING THOSE THREE
----------------------------------------------------------
Your current JournalList already contains newer Search, Date Filter,
Calendar and Year-in-Reflection work. Replacing it with an older full
snapshot would regress those features.

The installer makes only narrow, deterministic insertions into the
CURRENT files.

SECURITY
--------
Persistent data remains under:

users/{verifiedFirebaseUid}/...

The UID comes from your existing authMiddleware.

New owner collections:
journalFavorites
journalVersions
revisitBookmarks
decisionLedger
reflectionChains
assumptionTracker
preferences

Server-only queue collections:
dailyReminderQueue
revisitBookmarkQueue

Your current Firestore rules already deny top-level collections by
default while allowing users/{uid}/... only to that authenticated UID.

PROVENANCE-AWARE EDITING
------------------------
Editing a reflection that already produced approved AI memory first
returns:

409 DERIVED_MEMORY_EXISTS

The UI then asks the user for explicit confirmation.

If confirmed, the backend:
- stores the previous text in journalVersions
- updates the journal
- clears snapshotId
- deletes derived Thought Snapshots for that journal
- deletes dependent Thought Diffs
- deletes provenance
- deletes affected Perspective Watches / queue records

This prevents stale AI conclusions from surviving after their source
reflection has changed.

DRAFT AUTOSAVE
--------------
Drafts are browser-local and namespaced to the current Firebase UID.

Private Session disables draft autosave.

DAILY REFLECTION REMINDER
-------------------------
The user chooses:
- enabled / disabled
- local timezone
- local hour
- push
- email

Run this protected endpoint HOURLY:

POST /api/internal/process-journal-enhancements

Header:
x-mirrortrace-scheduler-secret: MIRRORTRACE_SCHEDULER_SECRET

The processor checks the latest journal entry in the user's local
timezone and sends at most one reminder for a local calendar day.

Reminder:
"You haven’t reflected today."

No private journal text is included.

REVISIT-THIS
------------
The same hourly processor sends due revisit reminders without including
journal text.

INSTALL
-------
1. Extract into the MirrorTrace project root.

2. Make a Git checkpoint:

git add .
git commit -m "Checkpoint before journal enhancement bundle"

3. Install:

node .\scripts\install-journal-enhancements.mjs

4. Verify wiring:

node .\scripts\verify-journal-enhancements.mjs

5. Compile:

npm run lint
npm run build

6. Restart dev server:

powershell -ExecutionPolicy Bypass -File .\scripts\free-dev-ports.ps1
npm run dev

WHAT YOU SHOULD SEE
-------------------
Journal History gets a new "Reflection Workspace" section with:

Daily Reminder
Favorites
Edit Entry
Revisit This
Weekly Review
Decision Ledger
Reflection Chains
Assumptions
Version History
Knowledge Graph
Export

Reflect & Chat gets browser draft restoration.

BACKEND TEST
------------
Unauthenticated:

curl http://localhost:3000/api/journal-enhancements/favorites

Expected:
401 / 403

Scheduler local test:

$headers = @{
  "x-mirrortrace-scheduler-secret" = $env:MIRRORTRACE_SCHEDULER_SECRET
}

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/internal/process-journal-enhancements" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body "{}"

PRODUCTION VERIFICATION
-----------------------
npm run lint
npm run build
npx tsx scripts/productionVerify.ts

Then run:
- two-account isolation test
- admin RBAC test
- push test
- email test
- Cloud Run /api/health test
- Firebase Authorized Domains test
- scheduler test

IMPORTANT
---------
No code package can truthfully promise that a backend "works perfectly"
without running it against the exact Firebase project, Firestore data,
SMTP credentials, FCM configuration, scheduler secret and Cloud Run
environment.

This bundle is designed specifically around the architecture you supplied:
Firebase authMiddleware, owner-scoped users/{uid}, Firebase Admin Firestore,
your existing push service, your existing Nodemailer service, and your
existing scheduler secret.
