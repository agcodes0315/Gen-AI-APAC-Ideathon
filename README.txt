MirrorTrace Hero + Review Moderation Fix v5

REPLACE COMPLETELY:
- src/components/AdminDashboard.tsx
- src/components/DashboardOverview.tsx
- src/index.css

ADD:
- public/ui/mirrortrace3.jpeg

FIXES:
- Approved reviews no longer show Approve again.
- Hide and Reject remain available.
- mirrortrace3.jpeg is used for Overview and Admin hero blocks.
- Hero blur reduced to almost zero.
- Security & Operations title/subtitle float slowly.
- Overview title/CTA motion remains.
- Text contrast improved.

VERIFY:
npm run lint
npm run build

PUSH:
git add .; git commit -m "Fix review moderation and sharpen MirrorTrace hero backgrounds"; git push origin main
