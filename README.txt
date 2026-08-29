MirrorTrace Sticky Scroll Showcase

This version matches the uploaded reference video much more closely.

THE IMPORTANT DIFFERENCE:
The cards do NOT autoplay on a timer and the user does NOT horizontally scroll.

Instead:
1. The Features section is ~225vh tall.
2. Its content becomes sticky for roughly one viewport.
3. While the user scrolls DOWN vertically:
   - top row moves LEFT
   - bottom row moves RIGHT
4. Scroll back UP and both rows reverse.
5. When the section finishes, the page naturally continues to Security.

NO HORIZONTAL SCROLLBAR:
The AuthView wrapper and sticky showcase both clip x-overflow.

REPLACE:
src/components/AuthView.tsx
src/mirrortrace-motion.css

KEEP:
public/hero/mirrortrace-hero.mp4
public/hero/mirrortrace-poster.jpg

VERIFY:
npm run lint
npm run build

RESTART:
$ports = 3000,24678; foreach ($port in $ports) { Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }; npm run dev
