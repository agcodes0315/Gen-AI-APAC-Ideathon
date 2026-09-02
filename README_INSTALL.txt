MIRRORTRACE — FINAL TWO CSS FILE MERGE
=======================================

This package is designed for the exact situation shown in your screenshot:
src/styles contains many overlapping MirrorTrace stylesheets.

The merger converts the CURRENT WORKING CSS IMPORT GRAPH into exactly:

    src/styles/mirrortrace-bundle-1.css
    src/styles/mirrortrace-bundle-2.css

WHY THE UI SHOULD STAY THE SAME
-------------------------------

It does NOT manually redesign/rewrite the CSS.

Instead it:

- starts from the CURRENT restored App.tsx
- follows real TS/TSX module imports in order
- finds the stylesheets that are actually loaded by the app
- expands local CSS @imports exactly where they occur
- concatenates the existing CSS without changing selectors or property values
- splits the final ordered stream into two CONTIGUOUS files
- imports bundle 1 before bundle 2

That keeps CSS cascade order intact.

IMPORTANT
---------

Inactive/unreferenced CSS files are NOT injected into the final bundles.
Loading unused styles would itself change the UI.

They are removed from src/styles after the active working CSS has been
compiled.

src/index.css stays untouched because it is global/Tailwind base CSS and is
already owned by src/main.tsx.

BACKUP
------

Before deleting anything, the script creates:

    .mirrortrace-before-two-css

containing a full copy of src.

INSTALL
-------

1. FIRST restore the exact Git version whose UI currently looks correct:

    git fetch origin; git reset --hard origin/main; git clean -fd

2. Extract this ZIP into the project root.

3. Run:

    powershell -ExecutionPolicy Bypass -File .\scripts\merge-to-two-css.ps1

4. Build:

    Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run build

5. If the build passes:

    npm run dev

6. Hard refresh:

    Ctrl + Shift + R

FINAL SOURCE STRUCTURE
----------------------

src/styles/
    mirrortrace-bundle-1.css
    mirrortrace-bundle-2.css

src/App.tsx:
    import './styles/mirrortrace-bundle-1.css';
    import './styles/mirrortrace-bundle-2.css';

src/main.tsx continues to keep:
    import './index.css';

No component needs to import an old MirrorTrace stylesheet after the merge.

ROLLBACK
--------

If you do not like the result:

    git restore .
    git clean -fd

Or recover src from:

    .mirrortrace-before-two-css

DO NOT USE THE PREVIOUS CLEANUP SCRIPT.
