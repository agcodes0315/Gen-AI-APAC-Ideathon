MIRRORTRACE EXACT REFLECT + SNAPSHOT FIX
=======================================

Replace only:
src/styles/mirrortrace-app.css

IMPORTANT
---------
BrainstormChat.tsx should NOT import the old:
../styles/mirrortrace-brainstorm-black.css

The intended two-style setup is:
App.tsx -> mirrortrace-app.css
AuthView.tsx -> mirrortrace-public.css

EXACT CHANGES
-------------

REFLECTIVE BRAINSTORM
Outer shell: rgba(0,0,0,0.82)
Header: rgba(0,0,0,0.82)
Footer: rgba(0,0,0,0.82)
Inner body: rgba(0,0,0,0.90)

FONT SIZES
Reflective Brainstorm Companion: 18px
Powered by Server-Side Gemini: 12px
New Thread: 14px
Need help untangling a thought?: 14px
Description: 14px
Topic Tags helper: 14px

THOUGHT SNAPSHOT
The cream/white "Suggested Thought Snapshot" header band:
rgba(0,0,0,0.82)

Its title/copy/badge colors are adjusted only for readability on black.

RUN
---
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
