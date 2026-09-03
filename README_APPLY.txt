MIRRORTRACE FINAL FONT + SURFACE CONSISTENCY
============================================

Replace exactly:

src/styles/mirrortrace-app.css
src/styles/mirrortrace-public.css

This package changes CSS only.

FINAL FONT FAMILY
-----------------
Georgia,
Cambria,
"Times New Roman",
Times,
serif

SPECIFIC CHANGES
----------------
Public sign-in:
- navbar size/color/layout untouched
- "See how your thinking evolves." untouched
- hero explanatory text untouched
- Evidence-first AI reflection: +2px => 17px
- hero Continue with Google / Explore MirrorTrace: -2px => 12px
- Firebase Authentication / UID / Gemini footer: +2px => 12px
- top feature cards remain as they are
- Who MirrorTrace is for cards: black rgba(0,0,0,0.50)
- What MirrorTrace is built for block/cards: black rgba(0,0,0,0.50)
- Security cards: black rgba(0,0,0,0.50)
- Reviews / No public reviews yet: black rgba(0,0,0,0.50)

Authenticated user pages:
- mirrortrace2.jpeg remains the shared image
- blue haze removed
- black rgba(0,0,0,0.50) haze used instead
- Overview special hero left as-is
- Reflective Brainstorm outer: rgba(0,0,0,0.82)
- Reflective Brainstorm inner: rgba(0,0,0,0.90)
- Journal History summary/filter line: 11px -> 12px
- Memory Governance entire top block: rgba(0,0,0,0.82)
- Memory Governance KPI/deep inner surfaces: rgba(0,0,0,0.90)
- Support and Feedback layouts untouched
- MirrorRoom layout/type sizes untouched
- Create MirrorRoom uses lighter brown rgba(92,78,73,0.96)

Admin:
- layout/cards preserved
- same Georgia/Cambria font
- black 0.50 backdrop rather than blue
- body/service text raised to 16px
- buttons/table text 14px
- micro timestamps 12px

RUN
---
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
