MIRRORTRACE BLACK-HUE FINAL FIX

FILES TO REPLACE / ADD
----------------------
1. Replace:
   src/App.tsx

2. Add:
   src/styles/mirrortrace-authenticated-black.css

IMPORTANT
---------
Do NOT run any PowerShell patch script.

The previous issue happened because the authenticated app did not actually have
the CSS scope classes that the override stylesheet was targeting.

This App.tsx now explicitly adds:
- mirrortrace-app-shell
- mirrortrace-page-skin
- mirrortrace-overview-page
- mirrortrace-reflect-page
- mirrortrace-history-page
- mirrortrace-memory-page
- mirrortrace-support-page
- mirrortrace-feedback-page

The stylesheet is imported directly by App.tsx, so there is no extra script
and no fragile manual CSS append step.

This does NOT target AuthView, so the signed-out / sign-in page remains untouched.

AFTER COPYING
-------------
npm run lint
npm run build
npm run dev

Then:
Ctrl + Shift + R

EXPECTED RESULT
---------------
- no opaque navy #202940 cards in signed-in pages
- outer cards are black at about 54% opacity
- branch background remains visible through them
- nested inputs are lighter glass
- Security & Operations hero is black transparent instead of navy
- Privacy Boundary is slightly darker
- sign-in page stays unchanged
