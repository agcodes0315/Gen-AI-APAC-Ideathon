MIRRORTRACE EXACT FINAL CORRECTIONS
===================================

Replace exactly:

src/styles/mirrortrace-app.css
src/styles/mirrortrace-public.css

THIS REVISION
-------------

1. "Your thinking, versioned."
   font-weight = 500

2. Overview "Write a Reflection" button:
   exact Isolated UID color family:
   background rgba(211,148,69,0.10)
   border rgba(211,148,69,0.28)
   text rgba(255,244,228,0.84)

3. Memory Governance top/heading block:
   EXACT rgba(0,0,0,0.70)
   solid child utility backgrounds in the heading area are neutralized
   KPI cells = rgba(0,0,0,0.82)

4. Journal History:
   Showing/Search summary = 13.5px
   From/To labels = 11.5px
   date values = 13.5px

5. MirrorTrace Security Architecture chips:
   14.5px

6. Admin:
   background image /hero/mirrortrace3.jpeg
   full black overlay rgba(0,0,0,0.50)
   old pseudo blue layers disabled
   Admin component content remains visible

7. MirrorRoom:
   same exact font stack as the whole product:
   Georgia, Cambria, "Times New Roman", Times, serif

8. Reflective Brainstorm:
   outer = rgba(0,0,0,0.70)
   inner = rgba(0,0,0,0.90)

RUN
---
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then:
Ctrl + Shift + R
