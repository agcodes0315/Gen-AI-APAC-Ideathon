MIRRORTRACE SCREENSHOT CORRECTIONS FINAL
========================================

Replace exactly:

src/styles/mirrortrace-app.css
src/styles/mirrortrace-public.css

Latest corrections:

1. Security by architecture cards:
   BLACK rgba(0,0,0,0.50), no blue/navy.

2. Sign-in footer:
   Firebase Authentication / Owner-bound UID isolation /
   Server-side Gemini = 13px.

3. The sentence beginning:
   "Scroll naturally through the page..."
   is removed from the rendered sign-in UI.

4. Reflective Brainstorm:
   outer/header/footer = rgba(0,0,0,0.82)
   inner/body/input = rgba(0,0,0,0.90)

5. Overview:
   "Track how your ideas evolve..." = 19px
   "Your thinking, versioned." is not resized.
   primary Write a Reflection button uses the same lighter
   stone/brown family as the Isolated UID chip.

6. Memory Governance:
   major/heading panels = rgba(0,0,0,0.72)
   KPI/deeper surfaces = rgba(0,0,0,0.82)
   background remains visibly hazy.

7. Reflection Workspace:
   top explanatory body = 17px
   all 10 Journal Tools stay in one horizontal row on desktop
   and remain horizontally scrollable if the viewport is too narrow.

Run:
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
