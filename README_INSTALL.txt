MIRRORTRACE — CLEAN TWO-STYLE + NAVBAR PACKAGE
================================================

FILES
-----
src/components/Navbar.tsx
src/styles/mirrortrace-app.css
src/styles/mirrortrace-public.css

WHAT CHANGED
------------
1. Navbar visual organization only:
   - cleaner brand area
   - one consistent navigation capsule
   - uniform button heights
   - balanced profile/sign-out area
   - responsive behavior for narrower screens
   - dark-only appearance retained
   - NO light/dark toggle

2. Style folder is reduced to two visual authorities:
   - mirrortrace-public.css = signed-out/landing page
   - mirrortrace-app.css = authenticated pages + admin

3. Reflect & Chat remains:
   OUTER = rgba(0,0,0,.70)
   INNER = rgba(0,0,0,.40)
   NO BLUE

IMPORTS
-------
In src/App.tsx keep only:

import './styles/mirrortrace-app.css';

for the visual style folder.

In src/components/AuthView.tsx keep:

import '../styles/mirrortrace-public.css';
import '../mirrortrace-motion.css';

The second file is outside src/styles and should remain.

Remove old src/styles/... imports from:
- DashboardOverview.tsx
- BrainstormChat.tsx
- AdminDashboard.tsx
- AdminPanelLauncher.tsx

DO NOT CHANGE
-------------
- JSX content other than Navbar.tsx supplied here
- Firebase
- Gemini
- MirrorRoom
- Admin authorization
- journals
- API code
- public text/content

RESTART
-------
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
