MIRRORTRACE — ANCHORED DATE PICKER FIX
======================================

WHAT THIS FIXES
---------------
The browser's native <input type="date"> calendar is controlled by Chrome/Windows,
so it can appear visually detached from the field.

This package replaces ONLY the Journal History From/To native date inputs
with a custom anchored calendar popover.

The calendar now opens directly underneath the field you clicked.

FILES
-----
REPLACE:
  src/components/JournalList.tsx

ADD:
  src/components/AnchoredDatePicker.tsx

KEEP:
  src/components/JournalCalendar.tsx
  src/components/YearInReflection.tsx

NO BACKEND CHANGES
------------------
No Firebase, Firestore, Gemini, Admin, notification, or API changes.

VERIFY
------
npm run lint
npm run build
npm run dev

Then:
1. Journal History
2. Click From date
3. Calendar should open immediately below From date
4. Click To date
5. Calendar should open immediately below To date
6. Test min/max behavior
7. Test Clear filters

FEATURE STATUS
--------------
DONE:
- keyword Journal History search
- topic/tag filtering
- date-range filtering
- graceful AI-unavailable message
- Year in Reflection
- List / Calendar history view
- target-audience landing section (if integrated)

STILL IMPORTANT:
1. Daily reflection reminder using existing notification opt-ins
2. Production verification:
   - Firebase Authentication
   - admin RBAC
   - two-account isolation
   - /api/health
   - push/email
   - Cloud Run
   - Firebase Authorized Domains

OPTIONAL AFTER STABILITY:
- edit saved reflection with provenance invalidation rules
- favorites/pinning
- export journal history
- weekly review
- manual revisit/bookmark reminders
