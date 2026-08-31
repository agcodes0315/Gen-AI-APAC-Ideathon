MirrorTrace Feature Card Fix
============================

Replace exactly these two files:

1. src/components/ScrollArcCard.tsx
2. src/styles/mirrortrace-motion-and-glass.css

No other file is changed.

What this fixes:
- feature card text is white
- cards are square instead of full-width horizontal bars
- cards remain in two horizontal rows
- direction="left" cards move left as the page scrolls
- direction="right" cards move right as the page scrolls
- each card follows a shallow semicircular arc
- spring smoothing removes the harsh / laggy feel
- horizontal manual browsing still works
- no global UI/background/auth/admin logic is touched

After replacing:
npm run lint
npm run build
npm run dev

Then hard-refresh Chrome with Ctrl+Shift+R.
