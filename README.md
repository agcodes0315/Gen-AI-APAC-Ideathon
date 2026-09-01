# 🪞 MirrorTrace

### User-Governed AI Memory & Perspective Intelligence

**Version control for your thinking — with consent, provenance, privacy boundaries, and user-controlled AI memory.**

Built for the **Gen AI Academy APAC Edition / Cloud Run AI Challenge**.

## Overview

MirrorTrace is an evidence-first reflective journaling application that helps people understand how their thinking changes over time without silently turning AI interpretations into permanent memory.

Users can write private reflections, brainstorm with Gemini, approve or edit AI-generated Thought Snapshots, compare related approved memories through Thought Diffs, inspect provenance, schedule Perspective Watches, and revoke governed memory.

> **AI can suggest what a reflection means. The user decides what the system is allowed to remember.**

## Who It Is For

MirrorTrace is useful for:
- working professionals reflecting on career, leadership, priorities, and major decisions
- students and early-career users tracking academic and career choices
- founders and builders revisiting assumptions, strategy, and product decisions
- managers and leaders documenting how viewpoints evolve
- researchers and knowledge workers reflecting on hypotheses and complex ideas
- anyone navigating long-term personal decisions who wants an evidence-backed record of how their thinking changed

## Key Features

- Reflect & Chat with Gemini
- Private Session with zero persistence
- Consent-gated Thought Snapshots
- User-edited memory
- Thought Diffs across approved memories
- Provenance / “Why am I seeing this?”
- Memory Governance and export/revoke controls
- Perspective Watches
- Push and email reminders
- Support tickets
- Consent-based public reviews
- Admin Control Room with RBAC and audit visibility

## Who Is MirrorTrace For?

MirrorTrace is designed for people whose decisions, beliefs, and priorities evolve over time.

### Students & Early-Career Professionals

Track how your thinking changes around:

- career choices
- internships
- higher education
- MBA / MS decisions
- skill development
- professional direction

### Working Professionals

Reflect on:

- career transitions
- leadership
- workplace decisions
- professional priorities
- long-term goals

### Founders & Builders

Revisit:

- product assumptions
- strategic decisions
- customer hypotheses
- pivots
- lessons learned

### Managers & Knowledge Workers

Trace how your perspective changes around:

- leadership
- team processes
- complex decisions
- hypotheses
- priorities

MirrorTrace is not simply a journal archive.

It is designed for moments where someone eventually asks:

> “What did I used to think about this, what do I think now, and why did it change?”

Thought Snapshots provide user-approved representations of a position.

Thought Diffs compare those positions across time.

Provenance connects each comparison back to the original authenticated reflections.

The result is a private, evidence-backed history of how someone's thinking evolved.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Motion | Motion for React |
| Backend | Express, TypeScript |
| AI | Gemini |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Runtime | Google Cloud Run |
| Secrets | Google Cloud Secret Manager |
| Push | Firebase Cloud Messaging |
| Email | Nodemailer / SMTP |
| RBAC | Firebase custom claims |
| Version Control | Git + GitHub |

## Architecture

```text
Browser
  │
  ├── Firebase Authentication
  ▼
React / TypeScript UI
  │ Bearer ID token
  ▼
Express / TypeScript Backend
  ├── Firebase Admin SDK
  ├── Gemini server-side calls
  ├── Notification routes
  ├── Email routes
  ├── Support / review routes
  └── Admin RBAC routes
        ▼
Cloud Firestore
  users/{uid}/...
```

All persistent private user data is owner-scoped beneath the verified Firebase UID.

## Repository Structure

```text
MirrorTrace/
├── public/
├── scripts/
├── server/
├── src/
│   ├── components/
│   ├── lib/
│   ├── styles/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── firestore.rules
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Run Locally

```bash
git clone https://github.com/agcodes0315/Gen-AI-APAC-Ideathon.git
cd Gen-AI-APAC-Ideathon
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

If you use `127.0.0.1`, add it to Firebase Authentication → Settings → Authorized domains.

## Environment

Create `.env` from `.env.example`.

Typical variables:

```env
NODE_ENV=development
PORT=3000
FIREBASE_PROJECT_ID=your-firebase-project-id
GEMINI_API_KEY=your-server-side-gemini-key

VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_VAPID_KEY=your-public-vapid-key
```

Never commit real secrets.

## Admin Access

```bash
npx tsx scripts/setAdminRole.ts YOUR_EMAIL admin
```

or:

```bash
npx tsx scripts/setAdminRole.ts YOUR_EMAIL super_admin
```

Sign out and sign back in after changing the role so Firebase issues a fresh token.

## Security Model

- private Firestore data is scoped to `users/{uid}/...`
- Firebase ID tokens are verified server-side
- Gemini credentials remain server-side
- only approved Thought Snapshots become reusable memory
- rejected/unapproved memory is not reused
- Private Session content is not persisted
- provenance source IDs remain owner-bound
- support does not automatically attach private journal/chat content
- public reviews require explicit consent and moderation
- admin visibility is operational, not private-content visibility

## Production Checklist

```bash
npm run lint
npm run build
npx tsx scripts/predeployCheck.ts
firebase deploy --only firestore:rules
```

Also verify:
- Google Sign-In
- journal save/history
- Thought Snapshot accept/edit/reject
- Thought Diff + provenance
- Private Session zero persistence
- memory export/revoke
- Perspective Watches
- push/email reminders
- two-account isolation
- admin RBAC
- Cloud Run hostname in Firebase Authorized Domains
- `/api/health`
- no application-breaking console errors

## Google AI Studio + GitHub Sync

When resolving sync conflicts:
- prefer **GitHub** for source files intentionally changed locally
- preserve **Google AI Studio/runtime configuration** when GitHub contains only placeholder secret values
- never overwrite real secret configuration with repository placeholders

## Important Limitation

MirrorTrace is a reflective intelligence and memory-governance application. AI-generated interpretations can be imperfect and should remain inspectable and user-controlled.

It is not medical, psychological, legal, or financial advice.

## Author

Built by **Agrima Saxena**

GitHub: `agcodes0315/Gen-AI-APAC-Ideathon`
