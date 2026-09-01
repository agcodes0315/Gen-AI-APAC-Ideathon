# MirrorTrace Scroll Performance Fix

Replace these three files only:

```text
src/App.tsx
src/components/ScrollArcCard.tsx
src/styles/mirrortrace-scroll-performance.css
```

What changed:

1. ScrollArcCard no longer follows a semicircular path.
2. ScrollArcCard no longer uses useScroll/useTransform/useSpring on every scroll frame.
3. Cards now use a small one-time horizontal fade-in only.
4. Vertical swipes over the sign-in feature cards are no longer captured by the horizontal lane.
5. Large backdrop-filter layers are disabled during normal app rendering.
6. Existing backgrounds, card dimensions, colors, copy, MirrorRoom, admin logic and backend code are untouched.

After replacing:

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run lint
npm run dev
```

Then hard refresh Chrome:

```text
Ctrl + Shift + R
```
