<div align="center">

# MirrorTrace

### Version control for your thinking

**Evidence-first reflective journaling with consent-governed AI memory and owner-isolated provenance.**

React · TypeScript · Firebase · Cloud Firestore · Gemini · Cloud Run · FCM · Nodemailer

</div>

---

## What Is MirrorTrace?

MirrorTrace is a privacy-first reflective journaling application built around one principle:

> AI may suggest what a reflection means. The user decides what the system is allowed to remember.

Instead of treating an AI interpretation as an unquestionable fact, MirrorTrace separates raw journal writing from reusable AI memory. Gemini can propose a **Thought Snapshot**, but the interpretation remains pending until the user explicitly approves or edits it. Approved snapshots can later be compared as **Thought Diffs**, with provenance linking the comparison back to the source reflections.

The application combines journaling, structured reflection, memory governance, provenance, reminders, administration, and production security in one owner-isolated system.

---

## Why MirrorTrace?

Traditional journals preserve what you wrote.

AI journals can summarize what you wrote.

MirrorTrace focuses on something different:

**How did my thinking change, what evidence produced that interpretation, and what did I actually consent to the AI remembering?**

Core product guarantees:

- Raw reflections remain private to the authenticated Firebase UID.
- Gemini credentials remain server-side.
- AI-generated interpretations do not become persistent reusable memory without approval.
- Thought Diffs preserve source references and chronology.
- Perspective Watch reminders contain safe topic-level context rather than raw journal text.
- Administrative access does not imply private reflection access.
- Support content is visible to administrators only when the user explicitly submits it.

---

## Core Experience

### Reflect & Chat

Users can write a private journal reflection or use the Gemini-powered brainstorm companion to clarify a thought before saving.

A failed AI request does not make the already-saved reflection disappear. The UI reports temporary AI unavailability separately from persistence.

### Thought Snapshots

Gemini can propose a structured interpretation containing:

- a position statement,
- a topic,
- suggested tags.

The proposal is not automatically trusted. The user can approve it, edit it before approval, or reject it.

### Thought Diffs

Two related approved snapshots can be compared to show:

- earlier position,
- later position,
- apparent change,
- apparent continuity,
- relationship assessment.

The comparison remains linked to the source journals and snapshots.

### Provenance

MirrorTrace provides a “Why am I seeing this?” path so users can inspect the source records that produced a Thought Diff.

### Memory Governance

Approved AI memory can be inspected, retained for a defined duration, or removed by the owner.

### Journal History

Journal History supports:

- keyword search,
- topic/tag filtering,
- date-range filtering,
- list/calendar browsing,
- Thought Snapshot generation,
- Thought Diff history.

### Year in Reflection

A factual yearly summary uses already-loaded journal data to show information such as reflection count, approved snapshots, Thought Diffs, active month, and recurring topics.

It deliberately avoids mood scoring or psychological inference.

### Perspective Watch

Users can choose to revisit a perspective after a fixed interval. Reminder delivery can use push notifications and email without including private journal text.

### Support & Reviews

Users can submit customer-support tickets and product feedback. Public review display requires explicit user consent and moderation.

### Admin Control Room

Authorized admin roles receive operational visibility including:

- aggregate counts,
- service health,
- account operations,
- support queue,
- review moderation,
- administrative audit events.

Private journal, conversation, Thought Snapshot, Thought Diff, and provenance content are not exposed as a consequence of being an administrator.

---

## Architecture

```text
                         ┌──────────────────────────┐
                         │       React / Vite       │
                         │      TypeScript UI       │
                         └────────────┬─────────────┘
                                      │
                               Firebase ID token
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────┐
│                    Express / TypeScript Server                    │
│                                                                   │
│  Authentication Boundary  →  Verified Firebase UID               │
│          │                                                        │
│          ├── Journal / Conversation APIs                          │
│          ├── Thought Snapshot APIs                                │
│          ├── Thought Diff + Provenance APIs                       │
│          ├── Perspective Watch APIs                               │
│          ├── Notification / Email APIs                            │
│          ├── Support / Review APIs                                │
│          └── Admin RBAC APIs                                      │
└──────────┬───────────────────┬───────────────────┬────────────────┘
           │                   │                   │
           ▼                   ▼                   ▼
   Cloud Firestore          Gemini API       FCM / Nodemailer
 owner-bound namespace     server-side only      reminders
```

Owner data remains beneath a namespace such as:

```text
users/{authenticatedUid}/...
```

The server derives `authenticatedUid` from a verified Firebase ID token. Client-supplied user IDs are not trusted as authorization boundaries.

---

## Security Model

### Owner-Bound Isolation

Firestore rules restrict user-owned documents to the authenticated UID:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/{document=**} {
      allow read, write:
        if request.auth != null
        && request.auth.uid == userId;
    }

    match /perspectiveWatchQueue/{document=**} {
      allow read, write: if false;
    }

    match /adminAuditLogs/{document=**} {
      allow read, write: if false;
    }

    match /supportTickets/{document=**} {
      allow read, write: if false;
    }

    match /productReviews/{document=**} {
      allow read, write: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Server-only operational collections are denied directly to browser clients.

### Server-Side Gemini Boundary

`GEMINI_API_KEY` belongs on the server only.

Before sending user context to Gemini:

1. verify the Firebase ID token,
2. derive the authenticated UID,
3. retrieve only owner-bound records,
4. minimize the context,
5. never ask Gemini to decide authorization.

### Consent-Governed AI Memory

AI interpretation and persistent user memory are separate states.

```text
Reflection
   ↓
Gemini proposal
   ↓
Pending Thought Snapshot
   ├── Reject → discarded
   ├── Edit   → user-controlled wording
   └── Approve
          ↓
   Reusable approved memory
```

### Administrative RBAC

Administrative roles are represented with Firebase custom claims.

Typical roles:

```text
user
admin
super_admin
```

Changing browser state or local storage must never grant administrative access.

---

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
| Push Notifications | Firebase Cloud Messaging |
| Email | Nodemailer / SMTP |
| RBAC | Firebase custom claims |
| Version Control | Git + GitHub |
| AI-assisted development | Google AI Studio |

---

## Repository Structure

The production repository should stay intentionally small. `dist/` and `node_modules/` are generated and are not source folders.

```text
MirrorTrace/
├── public/
│   ├── hero/
│   │   ├── mirrortrace-hero.mp4
│   │   ├── mirrortrace-poster.jpeg
│   │   ├── mirrortrace2.jpeg
│   │   └── mirrortrace3.jpeg
│   ├── ui/
│   │   ├── mirrortrace3.jpeg
│   │   └── moody-nature.jpeg
│   ├── favicon.svg
│   └── firebase-messaging-sw.js
│
├── scripts/
│   ├── audit-project-structure.ps1
│   ├── cleanup-repository.ps1
│   ├── bootstrapAdmin.ts
│   ├── predeployCheck.ts
│   ├── productionVerify.ts
│   ├── releaseGate.ps1
│   ├── setAdminRole.ts
│   └── smokeTest.ts
│
├── server/
│   ├── utils/
│   ├── adminRbac.ts
│   ├── adminRoutes.ts
│   ├── adminService.ts
│   ├── emailRoutes.ts
│   ├── emailService.ts
│   ├── firebaseAdmin.ts
│   ├── firestoreService.ts
│   ├── gemini.ts
│   ├── notificationRoutes.ts
│   ├── notificationService.ts
│   ├── perspectiveWatchProcessor.ts
│   ├── runtimeConfig.ts
│   ├── securityMiddleware.ts
│   └── supportReviewRoutes.ts
│
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminPanelLauncher.tsx
│   │   ├── AnchoredDatePicker.tsx
│   │   ├── AuthView.tsx
│   │   ├── BrainstormChat.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── JournalCalendar.tsx
│   │   ├── JournalEditor.tsx
│   │   ├── JournalHistoryFilters.tsx
│   │   ├── JournalList.tsx
│   │   ├── MemoryGovernance.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProductReviews.tsx
│   │   ├── PushNotificationSettings.tsx
│   │   ├── SupportCenter.tsx
│   │   ├── TargetAudience.tsx
│   │   ├── ThoughtDiffCard.tsx
│   │   ├── ThoughtSnapshotCard.tsx
│   │   └── YearInReflection.tsx
│   │
│   ├── lib/
│   │   ├── admin.ts
│   │   ├── aiError.ts
│   │   ├── api.ts
│   │   ├── emailNotifications.ts
│   │   ├── firebase.ts
│   │   ├── forceDarkMode.ts
│   │   ├── notifications.ts
│   │   └── supportReviews.ts
│   │
│   ├── styles/
│   │   ├── mirrortrace-app.css
│   │   ├── mirrortrace-public.css
│   │   └── mirrortrace-theme.css
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── .env.example
├── .gitignore
├── firebase-applet-config.json
├── firebase-blueprint.json
├── firestore.rules
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Do not confuse `public/` with `dist/`:

- `public/` is source material copied into the production build.
- `dist/` is generated output from `npm run build`.

Seeing the same hero assets inside both after a build is expected.

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/agcodes0315/Gen-AI-APAC-Ideathon.git
cd Gen-AI-APAC-Ideathon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env` from `.env.example`.

Never commit:

- Gemini API keys,
- Firebase service-account credentials,
- SMTP passwords,
- scheduler secrets,
- Firebase ID tokens.

### 4. Google Cloud ADC for local server access

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

### 5. Start MirrorTrace

```bash
npm run dev
```

Default development URL:

```text
http://localhost:3000
```

---

## Repository Audit & Cleanup

Before removing anything, create a clean Git checkpoint.

```powershell
git add .
git commit -m "Checkpoint before repository cleanup"
```

Inspect the actual source tree with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\audit-project-structure.ps1
```

Preview cleanup without deleting anything:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-repository.ps1
```

Execute conservative cleanup:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-repository.ps1 -Execute
```

Only after the app is stable, unused legacy CSS can also be removed automatically:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-repository.ps1 -Execute -RemoveUnusedStyles
```

The cleanup script creates a Git restore tag before deleting files.

After cleanup:

```powershell
npm run lint
npm run build
git status
```

Then commit:

```powershell
git add .
git commit -m "Clean repository structure"
git push origin main
```

---

## Production Verification

Run:

```bash
npm run lint
npm run build
npx tsx scripts/productionVerify.ts
```

Recommended manual checks:

- Google Sign-In works.
- Sign-out and session restore work.
- A second Firebase account cannot see the first account's journal data.
- Normal users cannot access admin APIs.
- Admin Control Room works only for authorized custom claims.
- `/api/health` returns healthy configuration information.
- push registration works.
- test email works.
- support/review moderation works.
- private journal content never appears in admin operations.

---

## Cloud Run Deployment

MirrorTrace is designed to run as a single Cloud Run service containing the Vite frontend and Express backend.

Enable the required Google Cloud services:

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com
```

Build/deploy using the deployment method configured for your project, then inject server secrets through Secret Manager rather than client-side environment variables.

Example Gemini secret:

```bash
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

echo -n "YOUR_API_KEY" | \
gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

Grant the Cloud Run runtime service account access:

```bash
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_CLOUD_RUN_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

Apply the challenge/service label when required:

```bash
gcloud run services update YOUR_SERVICE_NAME \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=YOUR_REGION
```

After deployment, add the Cloud Run hostname to:

```text
Firebase Console
→ Authentication
→ Settings
→ Authorized domains
```

---

## Notification Privacy

Perspective Watch uses topic-level reminder text.

The notification layer intentionally avoids copying raw journal content into push or email messages.

A typical reminder contains:

```text
MirrorTrace · Perspective Watch
Career direction is ready to revisit.
```

Email reminders direct the user back to MirrorTrace to inspect the actual evidence.

---

## Current Roadmap

The next product additions should preserve owner isolation and provenance rather than creating parallel local-only data stores.

Planned candidates:

- Daily reflection reminder
- Favorites / pinning
- Draft autosave
- Provenance-aware editing
- Export
- Revisit-this bookmarks
- Weekly Review
- Decision Ledger
- Reflection Chains
- Assumption Tracker
- Version history for edited reflections
- Personal Knowledge Graph

These are roadmap items, not claims about the currently deployed product.

---

## Design Principles

MirrorTrace follows five product rules:

1. **The user owns the reflection.**
2. **AI interpretations remain suggestions until approved.**
3. **Every reusable interpretation should remain inspectable.**
4. **Authorization is enforced by trusted application code, never by Gemini.**
5. **Private reflection content should never become administrative telemetry.**

---

## AI-Assisted Development

Google AI Studio was used as an agentic development assistant under explicit secure-development instructions, while VS Code was used for iterative implementation, debugging, testing, and production hardening.

The goal is not to outsource security decisions to an AI model. AI-assisted development is used to accelerate implementation while authentication, authorization, ownership boundaries, validation, and production verification remain explicit engineering responsibilities.

---

## License / Submission

MirrorTrace is an experimental reflective-journaling system built for the Google Cloud / Gemini challenge workflow.

Before production use, complete the security, privacy, accessibility, load, and data-retention reviews appropriate for the intended deployment environment.
