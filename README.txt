MirrorTrace 30% Black Hero Fix

1. Copy:
   src/styles/mirrortrace-final-black30.css
   into your project's src/styles folder.

2. Import it LAST, after every other MirrorTrace CSS import.

   Example in the component or main stylesheet that already loads your visual CSS:

   import '../styles/mirrortrace-final-black30.css';

3. Restart Vite completely:
   Ctrl+C
   npm run dev

4. Hard refresh browser:
   Ctrl+Shift+R

This file only changes the authenticated "Your thinking, versioned." hero surface.
It forces the hero to rgba(0,0,0,0.30), removes old hero-owned images/pseudo overlays,
and keeps only a 2px haze so the shared page background remains visible.
