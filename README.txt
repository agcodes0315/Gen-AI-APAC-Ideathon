MIRRORTRACE BLACK-50 HARD FIX
============================

This version does NOT create another stylesheet import.

It directly appends the final override to src/index.css, which your project
already loads. This avoids the import-order problem that kept the navy cards.

1. Extract this ZIP into your MirrorTrace project root.
2. Run:

powershell -ExecutionPolicy Bypass -File .\scripts\apply-black50-to-index.ps1

3. Run:

npm run dev

4. Hard refresh browser:

Ctrl + Shift + R

The sign-in/public page is not targeted.
