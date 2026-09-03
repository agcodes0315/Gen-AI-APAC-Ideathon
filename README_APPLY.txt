MIRRORTRACE THOUGHT SNAPSHOT — FONT + BLACK TINT FINAL
======================================================

Replace exactly:
src/components/ThoughtSnapshotCard.tsx

CHANGED
-------
Topic / Initial Greeting value:
16px

TAGS label:
16px

Tag chips (#greeting #reflection #journal):
16px

Memory Permission heading:
reduced by 1px

Memory Permission explanatory copy:
reduced by 1px

Nothing becomes memory automatically / consent copy:
reduced by 1px

Time-bound consent:
reduced by 1px

Reject / Edit / Accept:
reduced by 1.5px

BLACK TINT
----------
Outer Thought Snapshot:
rgba(0,0,0,0.72)

Header:
rgba(0,0,0,0.76)

Major outer sections:
rgba(0,0,0,0.74)

Inner content blocks:
rgba(0,0,0,0.82)

No solid black main surfaces are introduced.
No API, consent, approval, memory-retention, or snapshot logic is changed.

RUN
---
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
