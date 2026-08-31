MirrorTrace Authenticated Secondary Pages Theme
=================================================

Replace:
- src/App.tsx

Add:
- src/styles/mirrortrace-authenticated-pages.css

This update intentionally does NOT change:
- Dashboard Overview
- Admin Dashboard
- Signed-out landing page
- business logic
- API calls
- authentication
- journal persistence

It themes only:
- Reflective Space
- Compose Reflection / Private Session
- Reflective Brainstorm Companion
- Journal History
- Memory
- Support
- Feedback

Visual treatment:
- white text
- black/cinematic 30% glass look
- subtle branch-background haze through cards
- lighter translucent inner panels
- consistent borders/shadows with the Overview visual family

After copying:
npm run lint
npm run build
npm run dev

Then Ctrl + Shift + R in Chrome.
