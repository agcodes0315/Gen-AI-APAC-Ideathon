MIRRORTRACE CSS CLEANUP
=======================

KEEP ONLY THESE TWO CSS OVERRIDE FILES:

1) src/styles/mirrortrace-app.css
   Import ONCE from src/App.tsx:
       import './styles/mirrortrace-app.css';

2) src/styles/mirrortrace-public.css
   Import ONCE from src/components/AuthView.tsx:
       import '../styles/mirrortrace-public.css';

IMPORTANT
---------
Do NOT keep the old override files imported anywhere after these.
They contain duplicate/conflicting !important rules and are the reason
the UI repeatedly flips between navy / grey / black and scrolling becomes heavy.

DELETE OLD OVERRIDE FILES AFTER REMOVING THEIR IMPORTS
-------------------------------------------------------
mirrortrace-admin-black50-page.css
mirrortrace-admin-translucent-black.css
mirrortrace-authenticated-black.css
mirrortrace-authenticated-black-50.css
mirrortrace-authenticated-black-final.css
mirrortrace-authenticated-haze.css
mirrortrace-authenticated-pages.css
mirrortrace-clean-glass.css
mirrortrace-dark-only-final.css
mirrortrace-final-black30.css
mirrortrace-final-visual-fix.css
mirrortrace-force-black50.css
mirrortrace-hero-darken.css
mirrortrace-landing-single-background.css
mirrortrace-memory-black50.css
mirrortrace-motion-and-glass.css
mirrortrace-overview-hero-black50.css
mirrortrace-scroll-performance.css
mirrortrace-translucent-black-final.css
mirrortrace-user-dashboard-black30.css
mirrortrace-user-hero-black30.css

Also delete any compatibility-only CSS file whose entire content is:
    @import './mirrortrace-final-visual-fix.css';

DO NOT DELETE
-------------
- index.css
- mirrortrace-theme.css
- any component-specific CSS that contains unique component layout
  rather than global visual overrides
- any TS/TSX component

IMPORT CLEANUP
--------------
App.tsx:
Remove old MirrorTrace visual imports and leave only:
    import './styles/mirrortrace-app.css';

AuthView.tsx:
Remove old landing/motion/hero visual imports and leave only:
    import '../styles/mirrortrace-public.css';

If another component imports one of the deleted old CSS files
(AdminDashboard.tsx, AdminPanelLauncher.tsx, etc.), remove that import.
The admin rules are now inside mirrortrace-app.css.

VERIFY
------
npm run build
npm run dev

Then hard-refresh once with Ctrl+Shift+R.
