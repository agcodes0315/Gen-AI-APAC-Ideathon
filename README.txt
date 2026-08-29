
MirrorTrace Clear Glass v4

Replace these files completely:
- src/components/AdminDashboard.tsx
- src/components/AdminPanelLauncher.tsx
- src/components/DashboardOverview.tsx
- src/components/MemoryGovernanceCenter.tsx
- src/components/Navbar.tsx
- src/App.tsx
- src/index.css
- public/ui/moody-nature.jpeg

What changed:
- Much less blur on cards and panels
- Background image remains clearly visible through cards
- Brighter text across dark-glass surfaces
- Security & Operations title/subtitle now float slowly up/down
- Overview hero keeps the same clearer sharp-background style
- Current Reflection State removed from Overview hero

Run:
npm run dev

Push:
git add . && git commit -m "Refine MirrorTrace glass UI and hero animations" && git push origin main
