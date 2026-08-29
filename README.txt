Replace these files completely:
- src/components/DashboardOverview.tsx
- src/components/AdminDashboard.tsx
- src/components/Navbar.tsx
- src/components/MemoryGovernanceCenter.tsx
- src/components/AdminPanelLauncher.tsx
- src/App.tsx
- src/index.css
- public/ui/moody-nature.jpeg

What changed:
- Added cactus green theme (#617057 / #758467)
- Increased glass transparency so the branch background is visible
- Removed Current Reflection State block from Overview hero
- Added floating hero text / CTA motion on Overview
- Expanded layout width so the UI uses more screen space
- Applied softened glass panels across dashboard/admin/memory pages

Push:
git add .; git commit -m "Refine MirrorTrace glass UI with cactus theme"; git push origin main
