MIRRORTRACE — THOUGHT SNAPSHOT COMPONENT FONT FIX
=================================================

Replace only:
src/components/ThoughtSnapshotCard.tsx

This time the change is made directly inside ThoughtSnapshotCard.tsx,
not in mirrortrace-app.css.

Exact visible values:
- Retention = 13px
- Until I remove it / 30 days / 6 months / 1 year = 13px
- Nothing becomes memory automatically + consent boundary = 16px

The component includes final scoped !important rules at the end of its own
<style> block, so global app CSS cannot repaint these values.

Nothing else was intentionally changed.

Run:
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
