MirrorTrace Hybrid Browse + Unified Theme v4

REPLACE COMPLETELY:
1. src/components/AuthView.tsx
2. src/mirrortrace-motion.css
3. src/index.css
4. index.html

WHAT THIS FIXES:
- Security / Reviews nav uses native browser smooth scrolling; no custom rAF delay.
- No tall sticky 225/320vh showcase, so the unused dead space disappears.
- Vertical page scroll still nudges:
  top row LEFT
  bottom row RIGHT
- The nudge is subtle (~120–230 px), not the only way cards are revealed.
- Each feature row is independently horizontally browsable at all times.
- Trackpad/swipe/Shift+wheel works.
- Left/right arrow controls are included.
- Horizontal scrollbar is hidden.
- Scroll snap aligns cards cleanly.
- Landing page uses the existing MirrorTrace --mt-* design tokens.
- Existing dashboard/admin token palette is preserved.
- index.html gets proper MirrorTrace title/metadata.

THEME TOKENS ALREADY USED:
Light:
--mt-page #f5f5f4
--mt-surface #ffffff
--mt-text #1c1917
--mt-text-muted #78716c
--mt-border #e7e5e4
--mt-accent #b45309
--mt-accent-strong #92400e
--mt-accent-soft #fef3c7
--mt-success #047857

Dark:
--mt-page #171d2d
--mt-surface #202940
--mt-text #f7f4f2
--mt-text-muted #b9aaa1
--mt-border rgba(154,134,120,.33)
--mt-accent #caaa98
--mt-accent-strong #e1c2af
--mt-accent-soft #4b4038
--mt-success #8ad6b7

VERIFY:
npm run lint
npm run build

RESTART:
$ports = 3000,24678; foreach ($port in $ports) { Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }; npm run dev

PUSH:
git add .; git commit -m "Refine MirrorTrace hybrid card browsing and unified theme"; git push origin main
