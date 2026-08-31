MIRRORTRACE DARK-ONLY BLACK GLASS FIX

FILES
-----
src/styles/mirrortrace-dark-only-final.css
src/lib/forceDarkMode.ts

APPLY
-----
1. Copy both files into the matching project folders.

2. In your application entry file (normally src/main.tsx), add:

   import './lib/forceDarkMode.ts';

3. Import the CSS ONCE, LAST, after every other MirrorTrace stylesheet.
   Best place: src/main.tsx after your existing index.css import:

   import './styles/mirrortrace-dark-only-final.css';

   If your project imports component styles from App.tsx instead,
   importing it there as the LAST stylesheet is also fine.

4. IMPORTANT:
   Do not import this CSS into AuthView.tsx.
   The selectors are scoped to .mirrortrace-app-shell so the
   public sign-in page remains visually unchanged.

5. Restart:
   npm run dev

6. Hard refresh:
   Ctrl + Shift + R

WHAT THIS FIXES
---------------
- grey Memory KPI cells -> translucent black
- Reminder Delivery -> translucent black
- Compose Reflection -> translucent black
- Reflective Brainstorm Companion -> translucent black
- input/textarea blue-grey surfaces -> darker black inset surfaces
- History / Support / Feedback / Admin surfaces -> black glass
- removes authenticated light mode by locking data-theme="dark"
- hides authenticated theme toggle
- shared branch background remains partially visible
