MirrorTrace production hardening

ADD:
- server/runtimeConfig.ts
- server/securityMiddleware.ts
- scripts/predeployCheck.ts
- scripts/patch-production-hardening.ps1
- public/favicon.svg

REPLACE:
- firestore.rules
- .env.example

RUN:
powershell -ExecutionPolicy Bypass -File .\scripts\patch-production-hardening.ps1
npm run lint
npm run build
npx tsx scripts/predeployCheck.ts
firebase deploy --only firestore:rules

Do not run npm audit fix --force before submission.
