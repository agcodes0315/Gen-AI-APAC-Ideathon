# MirrorTrace Target Audience Integration

## What you will see

This does NOT create a separate student login or professional dashboard.

It adds a public landing-page section called:

**Who MirrorTrace Is For**

with four audience cards:

1. Students & Early-Career Professionals
2. Working Professionals
3. Founders & Builders
4. Knowledge Workers & Leaders

Recommended landing order:

Hero → Features → Who MirrorTrace Is For → Security → Reviews

## Install

Copy this package into the MirrorTrace project root.

Then run:

```powershell
node .\scripts\apply-target-audience.mjs
npm run lint
npm run build
npm run dev
```

Open:

```text
http://localhost:3000
```

Scroll below the Features section or use the **Who it's for** navigation item.

## What this changes

- adds `src/components/TargetAudience.tsx`
- updates `src/components/AuthView.tsx`
- adds the audience section before Security
- adds a navigation link when the expected desktop/mobile navigation markup is present

## What this does NOT change

- Firebase Authentication
- Firestore
- Gemini
- Admin Control Room
- authenticated Overview
- Memory Governance
- journal logic
- Thought Snapshot / Thought Diff logic
- existing CSS files
- existing hero/video assets

## What to build next

Recommended order:

1. Search + filter in Journal History
2. Daily reflection reminder using existing notification infrastructure
3. Production test / Cloud Run verification
4. Optional Year in Reflection summary
5. Calendar/timeline only if time remains

Do NOT create separate Student and Professional applications. The personas explain who benefits from the same MirrorTrace product.
