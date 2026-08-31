MirrorTrace Admin KPI black fix

REPLACE ONLY:
src/styles/mirrortrace-admin-translucent-black.css

Do NOT replace:
- AdminDashboard.tsx
- AdminPanelLauncher.tsx
- App.tsx
- any other CSS

This update specifically makes these five cards darker black translucent:
- Registered Users
- Thought Snapshots
- Thought Diffs
- Active Watches
- Push Devices

The cards now use rgba(0,0,0,0.64), so even over the bright sky portion
of the background they remain visibly black while the branches still show through.

Nothing else is structurally changed.

Then run:
npm run dev

Hard refresh:
Ctrl + Shift + R
