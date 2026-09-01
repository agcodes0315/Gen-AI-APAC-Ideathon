MIRRORTRACE JOURNAL WIRING FIX
==============================

Use this because the first installer stopped at:

Could not locate the Journal History entries marker.

The server router was already mounted successfully.
This replacement installer finishes the two missing pieces:
- JournalEnhancementsHub in JournalList.tsx
- Draft autosave in JournalEditor.tsx

INSTALL
-------
Copy scripts/install-journal-enhancements-v2.mjs into your project scripts folder.

Then run:

node .\scripts\install-journal-enhancements-v2.mjs
node .\scripts\verify-journal-enhancements.mjs
npm run lint
npm run build

Do not run repository cleanup yet.

If verification shows all PASS, restart the existing development server cleanly:

powershell -ExecutionPolicy Bypass -File .\scripts\free-dev-ports.ps1
npm run dev

Then hard-refresh Chrome with Ctrl+Shift+R.
