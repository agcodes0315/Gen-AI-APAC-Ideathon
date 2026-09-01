MIRRORTRACE — FULL ADMIN DASHBOARD RESTORE
==========================================

Problem fixed
-------------
The previous AdminDashboard.tsx replacement contained only the redesigned hero,
which removed the remainder of the admin dashboard from the rendered component.

This package restores:
- KPI cards
- Service Health
- Reflection Infrastructure donut chart
- Users table
- Support Queue
- Review Moderation
- Admin Audit Log

It also keeps the redesigned "Security & Operations" hero.

Replace only
------------
src/components/AdminDashboard.tsx

Do NOT replace AdminPanelLauncher.tsx from the previous owner-access fix.

Run
---
npm run lint
npm run build
npm run dev

Then hard refresh:
Ctrl + Shift + R
