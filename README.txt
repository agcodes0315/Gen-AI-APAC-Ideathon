MirrorTrace Smooth Scroll v3

REPLACE COMPLETELY:
- src/components/AuthView.tsx
- src/mirrortrace-motion.css

WHY THIS VERSION IS SMOOTHER:
- spring stiffness reduced from 82 to 34
- damping tuned to 18
- mass raised to 1.15 to create inertia
- string/vw transforms replaced with numeric pixel transforms
- feature section length increased to 320vh
- horizontal translation spread over much more vertical scroll distance
- navbar scroll duration increased slightly
- overflow-x is hidden/clip on html/body/root/auth page
- reduced-motion fallback hides its scrollbar visually

RUN:
npm run lint
npm run build

RESTART:
$ports = 3000,24678; foreach ($port in $ports) { Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }; npm run dev
