MIRRORTRACE ADMIN + MEMORY EXACT FIX
===================================

Replace exactly:
src/styles/mirrortrace-app.css
src/styles/mirrortrace-public.css

ADMIN MIRRORROOM ACTIVITY
-------------------------
Visible text increased by one more pixel:
10/11px tiers -> 12/13px
text-xs -> 14px
text-sm -> 16px
text-lg -> 20px
text-3xl -> 32px
table header -> 12px
table body -> 14px

MEMORY GOVERNANCE
-----------------
Heading/top block:
rgba(0,0,0,0.70)

KPI/deeper strip:
rgba(0,0,0,0.82)

The heading area is explicitly prevented from repainting itself
solid black, so the page background stays visible through it.

RUN
---
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
