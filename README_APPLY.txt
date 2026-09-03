MIRRORTRACE THOUGHT SNAPSHOT — HORIZONTAL FIXED + SOFT TINT
================================================================

Replace:
src/components/ThoughtSnapshotCard.tsx

WHAT WAS WRONG
--------------
The previous version used four fixed horizontal columns:
250px / flexible / 220px / 300px.

Inside the actual Reflect & Chat column there was not enough width, so the
Memory Permission and action content got squeezed and clipped.

WHAT THIS VERSION DOES
----------------------
The desktop snapshot uses THREE balanced columns:

[ Proposed Position + Topic/Tags ] [ Memory Permission ] [ Consent + Actions ]

The snapshot identity becomes a full-width horizontal header bar above those
columns.

This keeps the component horizontal without distorting its text.

SOFT BLACK TINTS
----------------
No solid-black main blocks are used.

Outer snapshot:
rgba(0,0,0,0.68)

Horizontal header:
rgba(0,0,0,0.74)

Main outer sections:
rgba(0,0,0,0.70) / rgba(0,0,0,0.74)

Inner blocks:
rgba(0,0,0,0.82)

This lets the shared page background remain subtly visible.

RESPONSIVE
----------
At widths below the desktop breakpoint the component stacks cleanly instead of
compressing text.

PRESERVED
---------
- Accept
- Reject
- Edit
- Save & Accept
- Memory retention
- 30 days / 6 months / 1 year / Until I remove it
- API calls
- consent rules
- retry behavior
- user-edited snapshot support

Run:
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
