MIRRORTRACE BRAINSTORM HEADER LIGHT + FONT +1
=============================================

Replace only:
src/styles/mirrortrace-app.css

Changed only in Reflective Brainstorm:

Outer shell:
rgba(0,0,0,0.80)

Heading/header block:
rgba(0,0,0,0.70)

Footer:
rgba(0,0,0,0.80)

Smaller text increased by +1px:
- Powered by Server-Side Gemini -> 13px
- New Thread -> 13px
- Need help untangling a thought? -> 15px
- Supporting empty-state sentence -> 13px
- Input text -> 19px

The main title "Reflective Brainstorm Companion" is not resized.
The inner conversation body background is not changed.

Run:
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
