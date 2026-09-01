MIRRORTRACE — GRACEFUL AI OUTAGE + YEAR IN REFLECTION
=====================================================

WHAT THIS PACKAGE DOES
----------------------
1. Keeps your current Journal History search/date filters.
2. Improves the Thought Snapshot failure message when Gemini/API service is unavailable.
3. Does NOT delete or invalidate the saved reflection when AI generation fails.
4. Adds a visible "Year in Reflection" section inside Journal History.
5. Year in Reflection uses ONLY already-loaded factual data:
   - reflections this year
   - approved Thought Snapshots this year
   - Thought Diffs this year
   - most active month
   - most revisited topic/tag
6. No mood scoring, mental-health inference, or extra Gemini call is used.

REPLACE / ADD
-------------
REPLACE:
  src/components/JournalList.tsx

ADD:
  src/components/YearInReflection.tsx
  src/lib/aiError.ts

DO NOT CHANGE
-------------
- server.ts
- Firebase Authentication
- Firestore rules
- Admin Control Room
- Memory Governance
- existing CSS
- Thought Snapshot approval logic
- Thought Diff persistence logic

WHY THE CURRENT 500 IS HANDLED THIS WAY
---------------------------------------
Your browser currently receives a 500 from:
  POST /api/thought-snapshots/propose

The server/provider may be temporarily unavailable (including quota/billing/provider outages).
This package makes the UI say:

  "AI generation is temporarily unavailable.
   Your saved reflection is safe. Please try again later."

instead of presenting a generic failure as if the reflection itself was lost.

INSTALL
-------
Copy the files into your project, preserving their paths.

Then:

  npm run build
  npm run dev

Open:
  http://localhost:3000

TEST
----
Journal History:
- Search still works
- From/To date still works
- Clear filters still works
- Year in Reflection appears below the filters
- Clicking Generate Thought Snapshot during the current AI outage should show
  the safer temporary-unavailable message

When Gemini credits/service returns, retry generation normally.

NEXT RECOMMENDED FEATURE
------------------------
Daily reflection reminders should be next, but only after using the CURRENT:
- server/notificationService.ts
- server/emailService.ts
- server/perspectiveWatchProcessor.ts
- server/notificationRoutes.ts
- src/components/PushNotificationSettings.tsx

That prevents bypassing existing notification opt-in preferences.
