MIRRORTRACE SECONDARY PAGE THEME — APPLY THIS EXACTLY
=====================================================

This package changes ONLY the authenticated secondary pages:
- Reflective Space
- Compose Reflection / Private Session
- Reflective Brainstorm Companion
- Journal History
- Memory
- Support
- Feedback

It intentionally does NOT change:
- Dashboard Overview
- Admin Dashboard
- Signed-out landing page
- authentication
- API calls
- journal / memory / support business logic

FILES TO REPLACE / ADD
----------------------
1. Replace:
   src/App.tsx

2. Add:
   src/styles/mirrortrace-authenticated-pages.css

WHY THE PREVIOUS ATTEMPT LOOKED UNCHANGED
-----------------------------------------
The styles need a guaranteed import and a reliable wrapper around each target page.
This App.tsx imports the stylesheet directly and adds scoped wrapper classes, so the
CSS can override the existing Tailwind bg-white/bg-stone-* surfaces inside those
pages without touching Overview/Admin/AuthView.

AFTER COPYING
-------------
Stop Vite completely, then run:

npm run lint
npm run build
npm run dev

Then hard refresh Chrome:
Ctrl + Shift + R

EXPECTED LOOK
-------------
- outer cards: cinematic dark / black translucent surface
- inner panels: lighter hazy glass
- text: white / soft gray
- branch background remains visible through cards
- no changes to Overview or Admin Dashboard
