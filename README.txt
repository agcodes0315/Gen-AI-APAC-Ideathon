MIRRORTRACE CLEAN GLASS UPDATE

Replace these files exactly:
- src/components/AuthView.tsx
- src/components/DashboardOverview.tsx
- src/components/AdminDashboard.tsx

Add:
- src/styles/mirrortrace-clean-glass.css

Important:
- The ParticleOrb component is no longer imported or rendered.
- You may leave src/components/ParticleOrb.tsx in the repository; it is unused.
- Do NOT add any new spin/globe/orb code.
- No separate image is used by Overview hero or Security & Operations hero.
- #security and #reviews no longer own separate background images.
- The shared branch background shows through translucent panels.

Then run:
npm run lint
npm run build
npm run dev

If Vite is already running and shows stale visuals, stop it and start it again,
then hard refresh the browser with Ctrl+Shift+R.
