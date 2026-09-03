MIRRORTRACE MEMORY GOVERNANCE TINT FINAL
=======================================

Replace:
src/styles/mirrortrace-app.css

The top Memory Governance block is now forced to:
rgba(0,0,0,0.70)

The KPI strip is:
rgba(0,0,0,0.82)

The title/header area and its nested children are explicitly painted
with 0.70 so no older solid-black utility can override it.

Run:
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
