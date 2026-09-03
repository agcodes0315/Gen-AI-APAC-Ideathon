MIRRORTRACE — SUBMISSION FINAL UI FIX
=====================================

Replace exactly:
1. src/components/BrainstormChat.tsx
2. src/components/ThoughtSnapshotCard.tsx

REFLECTIVE BRAINSTORM
---------------------
The right-side Reflective Brainstorm card is now explicitly translucent through
inline styles so old CSS cannot repaint it solid black.

Outer shell: rgba(0,0,0,0.46)
Header/footer: rgba(0,0,0,0.52)
Body: rgba(0,0,0,0.58)
Input: rgba(0,0,0,0.66)

Powered by Server-Side Gemini: +0.5px -> 12.5px
New Thread: +0.5px -> 14.5px

THOUGHT SNAPSHOT
----------------
Outer snapshot: rgba(0,0,0,0.58)
Major outer sections: rgba(0,0,0,0.62) / 0.64
Inner blocks remain darker: rgba(0,0,0,0.82)

Exact requested sizing:
Initial Greeting / topic value: 16px
TAGS label: 16px
#greeting / #reflection / #journal chips: 16px

Reduced by 1px:
Memory permission heading
Memory permission explanatory copy
Nothing becomes memory automatically + consent line
Time-bound consent text

Reduced by 1.5px:
Reject
Edit
Accept
Save & Accept

No API, Gemini, memory, approval, rejection, journal, MirrorRoom, or admin logic
was changed.

RUN
---
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
