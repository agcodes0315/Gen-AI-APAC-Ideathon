Copy these files into your MirrorTrace project.

ADD:
- server/supportReviewRoutes.ts
- src/lib/supportReviews.ts
- src/components/SupportCenter.tsx
- src/components/ProductReviews.tsx
- scripts/setAdminRole.ts
- scripts/patch-support-review-routes.ps1

Then run:
powershell -ExecutionPolicy Bypass -File .\scripts\patch-support-review-routes.ps1
npm run lint
npm run build

To change super-admin email:
1) Sign into MirrorTrace once using NEW_EMAIL so Firebase creates the account.
2) Run:
   npx tsx scripts/setAdminRole.ts NEW_EMAIL@gmail.com super_admin
3) Sign out/in with NEW_EMAIL and verify Admin Control Room works.
4) Only then revoke the old account:
   npx tsx scripts/setAdminRole.ts OLD_EMAIL@gmail.com user
