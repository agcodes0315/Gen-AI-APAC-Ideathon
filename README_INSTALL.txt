MIRRORTRACE UI FIX — INSTALLATION
=================================

WHY YOU SAW 404 ERRORS
----------------------
The old CSS files were deleted, but AuthView.tsx, DashboardOverview.tsx,
AdminDashboard.tsx (and possibly cached/older components) still imported them.

This package removes those imports and replaces the visual system with ONE file:
    src/styles/mirrortrace-theme.css


FILES IN THIS PACKAGE
---------------------
src/components/AuthView.tsx
src/components/DashboardOverview.tsx
src/components/AdminDashboard.tsx
src/components/AdminPanelLauncher.tsx
src/components/ScrollArcCard.tsx
src/styles/mirrortrace-theme.css
scripts/cleanup-old-style-imports.ps1


WHAT THE FIX DOES
-----------------
1. "Your thinking, versioned." uses the poster image + black at 30% opacity.
2. "Security & Operations" uses the same poster image + black at 30%.
3. Review/security/feature cards use bg-black/30 styling.
4. Old competing CSS files are no longer imported.
5. ScrollArcCard no longer binds multiple transforms to every vertical scroll frame.
6. Full-screen hero video no longer uses a costly blur filter.
7. Admin Control Room is a floating bottom-right button and opens #/admin.


INSTALL
-------
1. Extract this ZIP into your MirrorTrace project root.
   Allow it to replace the matching component files.

2. From PowerShell in the project root, run:

   powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-old-style-imports.ps1

3. IMPORTANT: keep your existing:
   src/mirrortrace-motion.css

   AuthView.tsx still imports it because it may contain project-specific motion
   rules that were not among the deleted 404 files.

4. Restart Vite completely:
   Ctrl+C
   npm run dev

5. Hard-refresh the browser:
   Ctrl+Shift+R


THE ONLY STYLE FILE YOU SHOULD KEEP FROM THE OLD src/styles MIRRORTRACE
VISUAL OVERRIDES IS:
    mirrortrace-theme.css

If another component needs MirrorTrace styles, import:
    import '../styles/mirrortrace-theme.css';


DELETE / DO NOT IMPORT
----------------------
mirrortrace-clean-glass.css
mirrortrace-authenticated-haze.css
mirrortrace-hero-darken.css
mirrortrace-scroll-performance.css
mirrortrace-final-visual-fix.css
mirrortrace-final-hero.css

The cleanup script removes stale imports automatically.
