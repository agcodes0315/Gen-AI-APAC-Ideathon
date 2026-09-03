MIRRORTRACE MEMORY GOVERNANCE HEADING 0.90
=========================================

Replace:
src/styles/mirrortrace-app.css

Change:
Memory Governance heading/top block:
rgba(0,0,0,0.90)

KPI strip remains:
rgba(0,0,0,0.82)

No other styling or component logic changed.

Run:
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
