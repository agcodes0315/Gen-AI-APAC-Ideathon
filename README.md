<div align="center">

# MirrorTrace

### Version control for your thinking.

**An evidence-first reflective journal that helps users see how their perspectives evolve over time without letting AI silently decide what they believe.**

Built with **Google AI Studio · Gemini · Firebase Authentication · Cloud Firestore · React · TypeScript · Google Cloud Run**

</div>

---

## What is MirrorTrace?

Most AI journaling apps follow a simple pattern:

> Write → AI summarizes → save → remember.

MirrorTrace takes a different approach.

It separates:

1. **what the user actually wrote,**
2. **what Gemini thinks the reflection means,**
3. **what the user explicitly approves,**
4. **what later comparisons are allowed to use.**

This creates a user-governed AI memory system where interpretations are not silently promoted into persistent memory.

The core idea is:

> **AI may propose an interpretation. The user decides whether it becomes memory.**

When the user reflects on the same topic later, MirrorTrace compares only approved interpretations and generates a traceable **Thought Diff** showing:

- what changed,
- what stayed consistent,
- which reflections produced the comparison,
- and whether the user agrees with the result.

---

# Product Preview

## Overview

<p align="center">
  <img src="docs/assets/mirrortrace-overview.png" alt="MirrorTrace Overview Dashboard" width="100%">
</p>

The Overview surfaces the user's private reflections, approved Thought Snapshots, Thought Diffs, and the latest detected perspective evolution.

---

## Consent-Bound AI Memory

<p align="center">
  <img src="docs/assets/thought-snapshot-consent.png" alt="MirrorTrace Thought Snapshot Consent" width="100%">
</p>

Gemini may propose a structured interpretation of a reflection, but the proposal remains **Pending Consent** until the user explicitly:

- accepts it,
- edits it,
- or rejects it.

Only approved Thought Snapshots become eligible for future comparisons.

---

## Thought Diffs — Version Control for Thinking

<p align="center">
  <img src="docs/assets/thought-diff.png" alt="MirrorTrace Thought Diff" width="100%">
</p>

Thought Diffs compare two approved positions on a related topic and identify:

- **Earlier Stance**
- **Current Stance**
- **What Changed**
- **What Stayed Consistent**

Instead of asking:

> “What did I write?”

MirrorTrace asks:

> **“How has my thinking evolved?”**

---

## Evidence-Backed Provenance

<p align="center">
  <img src="docs/assets/provenance-view.png" alt="MirrorTrace Provenance View" width="90%">
</p>

Every comparison includes a **Why am I seeing this?** provenance view containing:

- exact source reflections,
- approved interpretations,
- timestamps,
- chronology,
- owner-bound identity verification,
- source excerpts used to produce the comparison.

MirrorTrace does not merely claim that a perspective changed.

It shows the evidence behind that claim.

---

# Why MirrorTrace Exists

As AI applications become increasingly personalized, authentication and data isolation are only part of the trust problem.

A second question becomes important:

> **If an AI system builds a persistent model of what a person believes, who decides what enters that model?**

MirrorTrace makes that boundary explicit.

AI-generated interpretations remain proposals until the user approves them.

Later AI conclusions remain traceable to those approved interpretations and the original reflections that produced them.

This makes AI memory:

- inspectable,
- editable,
- evidence-grounded,
- reversible,
- owner-scoped,
- and user-controlled.

---

# Core Product Flow

```text
User writes a reflection
        │
        ▼
Reflection saved under authenticated UID
        │
        ▼
Gemini proposes a Thought Snapshot
        │
        ▼
User reviews interpretation
        │
        ├── Reject
        ├── Edit
        └── Accept
              │
              ▼
Approved Thought Snapshot
              │
              │ user reflects on related topic later
              ▼
Second approved Thought Snapshot
              │
              ▼
Candidate Matching
              │
              ▼
Thought Diff
              │
              ├── Earlier Stance
              ├── Current Stance
              ├── What Changed
              ├── What Stayed Consistent
              └── Provenance
```

---

# Key Features

## 1. Reflect & Chat

Users can:

- write journal entries directly,
- reflect on decisions,
- explore uncertainties,
- brainstorm ideas with Gemini,
- attach topic tags to help future matching.

The reflection space is authenticated and owner-scoped.

---

## 2. Thought Snapshots

A **Thought Snapshot** is Gemini's proposed structured interpretation of a saved reflection.

Example:

### Reflection

> “I want to start learning photography, but I think I should begin with composition and lighting before buying expensive gear.”

### Gemini Proposal

> “The user intends to prioritize foundational photography skills before purchasing high-end equipment.”

The user can:

- **Accept Snapshot**
- **Edit Interpretation**
- **Reject**

Only approved snapshots become persistent structured memory eligible for future Thought Diff comparisons.

---

## 3. User-Edited Memory

Users are not forced to accept Gemini's wording.

If an interpretation is close but imperfect, they can edit it before approval.

The final memory therefore represents:

> **the user's approved interpretation — not Gemini's unchecked inference.**

---

## 4. Thought Diffs

Thought Diffs compare approved positions across time.

Example:

### Earlier Stance

> “The user intended to begin baking by practicing simple recipes like cakes and cookies at home.”

### Current Stance

> “The user intends to focus on bread and pastry, prioritizing technical precision over casual baking.”

### What Changed

The perspective shifted from a casual entry-level approach toward a more specialized focus on technical baking.

### What Stayed Consistent

The interest in learning baking and continuing to develop the skill remained stable.

---

## 5. Perspective Evolution

The Overview surfaces the latest meaningful Thought Diff so the user can immediately see when their thinking has evolved.

This makes the flagship feature discoverable without requiring the user to search deep inside Journal History.

---

## 6. Provenance — “Why am I seeing this?”

Every Thought Diff can be inspected.

The provenance view includes:

```text
Earlier Reflection
        │
        ├── original excerpt
        ├── approved stance
        └── timestamp

Later Reflection
        │
        ├── original excerpt
        ├── approved stance
        └── timestamp

Authenticated Owner
        │
        └── verified UID namespace
```

This allows the user to inspect the exact evidence behind every comparison.

---

## 7. Human Feedback on AI Comparisons

Users can evaluate Thought Diffs with:

- **Correct / useful**
- **Not related**
- **Incorrect interpretation**

Feedback is persisted and restored after refresh.

This keeps AI-generated comparisons user-correctable instead of treating them as unquestionable truth.

---

## 8. Private Session

Not every thought should become permanent memory.

MirrorTrace includes an **Ephemeral Private Session** mode.

Private Session reflections are excluded from:

- Journal History
- Thought Snapshots
- Thought Diffs
- future comparison evidence

This gives users a space to think without automatically creating persistent AI memory.

---

## 9. Guided Example Journey

The app includes a fictional demo journey so a reviewer can understand MirrorTrace immediately without creating multiple reflections manually.

The demo shows:

```text
Reflection 1
    ↓
Approved Snapshot
    ↓
Reflection 2
    ↓
Approved Snapshot
    ↓
Thought Diff
    ↓
Evidence / Provenance
```

Demo content is presentation-only and does not enter the authenticated user's Firestore data.

---

# Security & Trust Model

MirrorTrace was designed with security as a visible product feature, not an implementation footnote.

## Authentication Boundary

Authentication is handled through **Firebase Authentication with Google Sign-In**.

The application does not directly collect or store user passwords.

Protected backend routes verify Firebase ID tokens using the Firebase Admin SDK.

The backend derives the authenticated UID from the verified token rather than trusting identity values supplied by the client.

---

## Owner-Bound Data Isolation

User data is scoped under the authenticated Firebase UID.

Conceptually:

```text
users/
  └── {uid}/
      ├── journals/
      ├── conversations/
      ├── thoughtSnapshots/
      └── thoughtDiffs/
```

This ensures data belonging to one authenticated user is not intentionally accessible to another user.

---

## Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/{document=**} {
      allow read, write:
        if request.auth != null &&
           request.auth.uid == userId;
    }
  }
}
```

---

## Server-Side Gemini Credentials

The Gemini API key is used only by the server runtime.

```text
Browser
   │
   │ Firebase ID Token
   ▼
MirrorTrace Backend
   │
   ├── verifies authenticated user
   ├── accesses owner-bound Firestore data
   └── calls Gemini with server-side secret
```

The operational Gemini secret is not intentionally exposed to client-side application code.

---

## Secret Manager Configuration

MirrorTrace follows a zero-hardcoding approach.

```bash
gcloud secrets create GEMINI_API_KEY \
  --replication-policy="automatic"

echo -n "YOUR_GEMINI_API_KEY" | \
gcloud secrets versions add GEMINI_API_KEY \
  --data-file=-
```

Grant the Cloud Run runtime service account access:

```bash
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_CLOUD_RUN_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Evidence-First Comparison Boundary

Thought Diffs compare only approved snapshots from the authenticated user's namespace.

The system is designed to distinguish:

- evidence,
- approved interpretation,
- generated comparison,
- user feedback.

MirrorTrace does not present itself as a psychological diagnostic system.

---

## Cascade Deletion

If a journal entry or approved Thought Snapshot used by a Thought Diff is deleted, dependent comparison data is invalidated or removed so unsupported provenance is not silently retained.

---

## Private Session Isolation

Private Session reflections are intentionally excluded from persistent reflection history and future Thought Diff candidate sets.

---

# Architecture

```text
┌───────────────────────────────┐
│        React Frontend         │
│                               │
│  Overview                     │
│  Reflect & Chat               │
│  Journal History              │
│  Thought Snapshot Consent     │
│  Thought Diff                 │
│  Guided Demo                  │
└───────────────┬───────────────┘
                │
                │ Firebase ID Token
                ▼
┌───────────────────────────────┐
│      Node / Express API       │
│                               │
│  Auth verification            │
│  Journal persistence          │
│  Snapshot generation          │
│  Candidate matching           │
│  Thought Diff generation      │
│  Provenance                   │
│  Feedback persistence         │
└──────────────┬─────────┬──────┘
               │         │
               │         │
               ▼         ▼
      ┌──────────────┐  ┌──────────────┐
      │  Firestore   │  │  Gemini API  │
      │              │  │              │
      │ User-scoped  │  │ Structured   │
      │ persistence  │  │ reasoning    │
      └──────────────┘  └──────────────┘
```

---

# Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Gemini via `@google/genai` |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Backend | Node.js / Express |
| Identity Verification | Firebase Admin SDK |
| Secret Management | Google Cloud Secret Manager |
| Deployment | Google Cloud Run |
| Development | Google AI Studio |
| Icons | Lucide React |

---

# Repository Structure

```text
MirrorTrace/
│
├── docs/
│   └── assets/
│       ├── mirrortrace-overview.png
│       ├── thought-snapshot-consent.png
│       ├── thought-diff.png
│       └── provenance-view.png
│
├── server/
│   ├── firebaseAdmin.ts
│   ├── firestoreService.ts
│   ├── gemini.ts
│   └── utils/
│       └── sanitizer.ts
│
├── src/
│   ├── components/
│   │   ├── AuthView.tsx
│   │   ├── BrainstormChat.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── GuidedDemoModal.tsx
│   │   ├── JournalEditor.tsx
│   │   ├── JournalList.tsx
│   │   ├── Navbar.tsx
│   │   ├── SecurityBadge.tsx
│   │   ├── ThoughtDiffCard.tsx
│   │   └── ThoughtSnapshotCard.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── firebase.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── firestore.rules
├── firebase-applet-config.json
├── firebase-blueprint.json
├── server.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# Getting Started

## Prerequisites

You need:

- Node.js 20+
- npm
- Google Cloud project
- Firebase Authentication
- Cloud Firestore
- Gemini API access
- Google Cloud SDK

Authenticate with Google Cloud:

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

Enable required APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

# Local Development

Clone the repository:

```bash
git clone https://github.com/agcodes0315/Gen-AI-APAC-Ideathon.git
cd Gen-AI-APAC-Ideathon
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

---

# Environment Configuration

Do not commit real secrets.

Example:

```env
GEMINI_API_KEY=your_key_here
```

Never commit:

```text
.env
service-account.json
firebase-adminsdk*.json
API keys
private keys
Firebase ID tokens
access tokens
```

---

# Build Verification

Run TypeScript validation:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

The verified build pipeline compiles:

- the Vite frontend,
- the Node server,
- and the Cloud Run-compatible `dist/server.cjs` bundle.

---

# Google Cloud Run Deployment

Deploy the application:

```bash
gcloud run deploy mirrortrace \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

The application endpoint may be publicly reachable, while authenticated application data remains protected by Firebase Authentication and server-side authorization checks.

---

## Campaign Verification Label

```bash
gcloud run services update mirrortrace \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## Firebase Authorized Domain

After deployment, add the Cloud Run domain to:

```text
Firebase Console
→ Authentication
→ Settings
→ Authorized Domains
```

---

# End-to-End Verified Flow

MirrorTrace was manually validated through the following workflow:

```text
Google Sign-In
      ↓
Write Reflection
      ↓
Save Journal
      ↓
Generate Suggested Thought Snapshot
      ↓
Inspect consent explanation
      ↓
Accept / Edit Interpretation
      ↓
Write related later reflection
      ↓
Approve second snapshot
      ↓
Thought Diff generated
      ↓
Inspect provenance
      ↓
Submit comparison feedback
      ↓
Refresh
      ↓
Verify persistence
```

The following behaviors were also manually verified:

- journal persistence,
- snapshot persistence,
- user-edited snapshot persistence,
- Thought Diff persistence,
- feedback persistence,
- search behavior,
- Private Session exclusion,
- deletion integrity,
- chronology validation,
- automatic dashboard refresh,
- production type-check,
- production build.

---

# Example Journey

## Reflection 1

> I want to learn baking, but I think I should start casually with simple cakes and cookies at home.

## Approved Thought Snapshot

> The user intends to begin their baking journey by practicing with simple recipes at home.

---

## Reflection 2

> After trying a few baking recipes, I now want to focus more seriously on bread and pastry because I enjoy the technical precision more than casual cake baking.

## Approved Thought Snapshot

> The user intends to focus on bread and pastry, prioritizing technical precision over casual baking.

---

## Thought Diff

### Earlier

> The user intended to start baking by practicing simple recipes like cakes and cookies at home.

### Current

> The user intends to focus on bread and pastry, prioritizing technical precision over casual baking.

### What Changed

The perspective shifted from a casual, entry-level approach toward a more specialized focus on technical skill development.

### What Stayed Consistent

The user's interest in baking as a hobby and commitment to continued practice remained stable.

---

# What Makes MirrorTrace Different?

MirrorTrace is not designed as:

- a generic chatbot with memory,
- a mood tracker,
- an automatic personality profiler,
- a sentiment dashboard,
- a journaling interface with AI summaries attached.

Its central mechanic is:

> **user-governed AI memory with evidence-backed perspective comparison.**

The product introduces four explicit boundaries:

### Consent

AI interpretations do not automatically become persistent memory.

### Evidence

Thought Diffs are grounded in approved reflections.

### Traceability

Every comparison can be inspected back to its source.

### Correction

Users can edit interpretations and challenge generated comparisons.

---

# Design Philosophy

MirrorTrace intentionally avoids unnecessary gamification and psychological profiling.

The design emphasizes:

```text
Reflection
    +
Consent
    +
Evidence
    +
Traceability
    +
User Control
```

The interface therefore uses:

- restrained visual hierarchy,
- warm journal-inspired styling,
- explicit consent states,
- clear evidence panels,
- provenance indicators,
- minimal distractions.

---

# Responsible AI Positioning

MirrorTrace is a reflection tool, not a clinical or diagnostic system.

It is designed to avoid:

- psychological diagnosis,
- hidden personality inference,
- cross-user reasoning,
- silent persistence of inferred beliefs,
- unsupported claims about the user.

The user remains the authority on what becomes structured memory.

---

# Scope & Limitations

MirrorTrace is currently a hackathon-scale prototype.

Current limitations include:

- no large-scale load testing,
- no formal external security audit,
- no automated end-to-end test suite,
- no administrative dashboard,
- no enterprise identity federation,
- no offline-first encrypted local journal.

These limitations are intentionally documented rather than hidden.

---

# Future Directions

Potential extensions include:

- multi-point belief timelines,
- perspective revisit detection,
- topic evolution maps,
- portable user-owned AI memory,
- memory expiry controls,
- local-first encrypted reflection storage,
- cryptographically verifiable provenance,
- user-controlled AI memory export.

Any future feature should preserve the same principle:

> **AI memory should remain governed by the person it describes.**

---

# Project Principle

> **AI can help interpret reflection.**  
> **The user remains the authority on what becomes memory.**

---

# Built With

MirrorTrace was built using:

- Google AI Studio
- Gemini
- Firebase Authentication
- Cloud Firestore
- Google Cloud Secret Manager
- Google Cloud Run
- React
- TypeScript

---

<div align="center">

## MirrorTrace

### Version control for your thinking.

**Consent-bound memory · Evidence-backed evolution · User-controlled interpretation**

</div>