MIRRORTRACE — BRAINSTORM COMPONENT HARD FIX
===========================================

Replace exactly:
src/components/BrainstormChat.tsx

WHY THIS WILL ACTUALLY CHANGE
-----------------------------
The current BrainstormChat.tsx still imports:
../styles/mirrortrace-brainstorm-black.css

That stylesheet contains !important rules and was overriding the app CSS.

This replacement:
- removes that old stylesheet import entirely
- puts the requested translucent black values directly on the actual JSX blocks
- puts the requested font sizes directly on the actual JSX text

FINAL TINTS
-----------
Outer card: rgba(0,0,0,0.56)
Header: rgba(0,0,0,0.62)
Main body: rgba(0,0,0,0.68)
Footer: rgba(0,0,0,0.62)
Input: rgba(0,0,0,0.74)

FONT SIZES
----------
Powered by Server-Side Gemini: 12px
New Thread: 14px
Need help untangling a thought?: 15px
Description: 13px
Input text: 13px

No Gemini logic, conversation logic, API behavior, tags logic or send behavior changed.

RUN
---
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
