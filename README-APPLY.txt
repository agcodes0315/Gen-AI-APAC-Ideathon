MIRRORTRACE — AUTHENTICATED BLACK 50% THEME
================================================

This package intentionally changes ONLY authenticated UI surfaces.

CHANGES:
- User Overview outer hero -> black 50% translucent surface
- Overview cards -> black 50% translucent surfaces
- Reflect & Chat -> black 50% card surfaces
- Journal History -> black 50% card surfaces
- Memory -> black 50% card surfaces
- Support -> black 50% card surfaces
- Feedback -> black 50% card surfaces
- Admin Security & Operations hero -> black 50%
- Admin metrics/cards/tables -> black 50%
- Privacy Boundary / nested panels -> lighter glass so hierarchy remains visible

NOT CHANGED:
- Sign-in / public landing page
- Authentication
- APIs
- Firebase
- journal logic
- Gemini logic
- notifications
- layout
- motion

HOW TO APPLY
------------

1. Copy:
   src/styles/mirrortrace-authenticated-black-50.css

2. Import it LAST among your authenticated CSS imports.

Recommended:
   in src/App.tsx, put this CSS import at the very top:

   import './styles/mirrortrace-authenticated-black-50.css';

If other stylesheet imports exist in App.tsx, this one MUST be after them.

3. If AdminDashboard.tsx imports old visual CSS files directly, REMOVE those visual CSS imports from AdminDashboard.tsx.
   Do not remove JS/TS imports.

4. Run:
   npm run lint
   npm run build
   npm run dev

5. Hard refresh:
   Ctrl + Shift + R

IMPORTANT:
This stylesheet is deliberately scoped to:
- .mirrortrace-app-shell
- .mirrortrace-dashboard-overview
- .mirrortrace-themed-page
- .mirrortrace-memory-governance
- .mirrortrace-admin-dashboard
- .mirrortrace-admin-page

It does NOT target .mirrortrace-auth-page, so the sign-in page is unchanged.
