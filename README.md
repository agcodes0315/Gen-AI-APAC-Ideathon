# MirrorRoom Activity — final dark tint fix

Replace exactly:

src/components/AdminMirrorRoomsPanel.tsx

This version removes the `mirrortrace-admin-surface` class from this panel so
existing admin CSS cannot override its background.

The whole section now uses an explicit:

rgba(0, 0, 0, 0.86)

background, with darker inner counters and table surfaces.

After replacing:

Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run dev

Then hard refresh with Ctrl+Shift+R.
