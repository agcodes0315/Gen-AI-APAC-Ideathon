<div align="center">

🪞 MirrorTrace

Privacy-First AI Reflection, Consent-Governed Memory & Collaborative Reasoning

Think privately. Remember deliberately. Compare perspectives with evidence. Share only what you choose.

Google Gemini · Firebase Authentication · Cloud Firestore · Google Cloud Run · Secret Manager · React · TypeScript · Express

Built for the Google Cloud Gen AI Academy — APAC Edition, Cloud Run Build & Deploy Social Challenge / Ideathon Challenge.

Live Cloud Run Demo · Demo / Social Post · Repository

</div>

🏆 Challenge Context

MirrorTrace was created for the Google Cloud Gen AI Academy APAC Edition Ideathon, whose baseline challenge is a secure, authenticated “Personal Gemini Journal” using Firebase Authentication, Firestore, Gemini and Google Cloud Run.

The baseline is intentionally only a launchpad. MirrorTrace extends it into a substantially broader system focused on:

consent-governed AI memory;

explainable longitudinal reasoning;

privacy-preserving collaboration;

provenance;

perspective revisits and notifications;

operational administration without unrestricted access to private reflective content.

The core product principle: AI can help interpret your thinking, but it should not silently decide what becomes part of your persistent memory.

🚀 What MirrorTrace Does

MirrorTrace is a reflective intelligence platform that helps users capture thoughts, brainstorm with Gemini, intentionally approve reusable AI memory, compare how their thinking evolves, inspect the evidence behind AI-generated comparisons and selectively collaborate without exposing their private journal history.

It combines:

private journaling;

multi-turn Gemini reflection;

Thought Snapshot proposals;

explicit AI-memory consent;

Thought Diffs;

provenance;

Perspective Watch;

Memory Governance;

Journal History tools;

MirrorRoom collaborative reasoning;

Customer Support;

feedback and public-review consent;

an administrator control room;

TraceBot, a public product guide.

<!-- =========================================================
SCREENSHOT 01 — LANDING HERO
Save as: docs/screenshots/01-landing.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/01-landing.png" alt="MirrorTrace landing page" width="100%">
</p>

❗ The Problem

Modern AI assistants are useful in the moment, but reflective applications introduce a harder question:

What happens when AI begins to remember, reinterpret and reuse what a person once thought?

1. AI memory can become invisible

Users often cannot easily see:

what the model inferred;

which inference became persistent;

why it is being reused;

how long it remains reusable;

how to revoke it.

2. Journals preserve entries, not reasoning change

A normal journal answers “What did I write?”

It does not naturally answer:

What did I think about this before?

What changed?

What stayed consistent?

Which earlier reflections support that conclusion?

3. Collaboration can destroy privacy boundaries

Users may want to compare perspectives without sharing:

their entire journal;

historical Gemini conversations;

unrelated private reflections;

reusable AI memory;

old beliefs;

personal takeaways.

4. Administration can become surveillance

Administrators need operational visibility, support queues, moderation and service health. That should not automatically give them unrestricted access to private reflective content.

💡 The Solution

MirrorTrace treats reflective AI as a consent, provenance and data-isolation problem, not merely a text-generation problem.

Private by default

Every private workflow is bound to the authenticated Firebase user.

AI interpretation requires consent

Gemini can propose a structured Thought Snapshot, but the proposal becomes reusable AI memory only when the user explicitly accepts or edits and accepts it.

Longitudinal claims require evidence

Related approved snapshots can form a Thought Diff, preserving what changed, what stayed consistent and the evidence behind the comparison.

Collaboration is selective

MirrorRoom receives only the text a participant deliberately chooses to share.

Administration is operational

The Admin Control Room is designed for service and workflow visibility without unrestricted journal-reading privileges.

👥 Who MirrorTrace Is For

🎓 Students & Early-Career Professionals

MirrorTrace can help track reasoning around:

internships;

higher studies;

examinations;

career direction;

projects;

skill priorities.

Example: A student can compare how their thinking about an MBA, MS or engineering role changes after internships, interviews and new experiences.

💼 Working Professionals

Useful for:

role changes;

negotiations;

difficult trade-offs;

retrospectives;

mentoring;

career planning.

Example: A professional can revisit why they originally wanted to change teams, then compare that reasoning with a later perspective instead of reconstructing the past from memory.

🛠️ Founders, Builders & Product Teams

Useful for preserving:

product assumptions;

architecture choices;

user hypotheses;

go-to-market reasoning;

prioritization;

risk decisions.

Example: A founder can preserve the reasoning behind a product direction before a pivot and later inspect what changed.

🧠 Knowledge Workers & Leaders

Useful for:

strategic reflection;

decision calibration;

assumption tracking;

structured peer reasoning.

Example: A leader can privately form a position, selectively share one thought in MirrorRoom and later save only their own takeaway.

🧭 Product Navigation

Page / Control

What it does

Overview

Personal reflection dashboard, metrics, quick actions and perspective-evolution state.

Reflect & Chat

Write a journal reflection or use the Gemini reflective companion.

Journal History

Search, filter, revisit, organize, edit and explore saved reflections.

Memory

Opens the Memory Governance Center for approved memory, retention, Thought Diffs, provenance, watches, export and revocation.

Support

Submit support information intentionally without automatically attaching private journal history.

Feedback

Submit product feedback and optionally consent to a public review.

MirrorRoom

Temporary selective collaborative reasoning.

Admin Control Room

Operational administration for authorized admins.

TraceBot

Public guide explaining MirrorTrace features, navigation and privacy.

🏠 Overview

The signed-in Overview page provides:

reflection counts;

approved-snapshot counts;

Thought Diff counts;

perspective-evolution state;

shortcuts into reflection and memory workflows;

quick actions.

<!-- =========================================================
SCREENSHOT 02 — OVERVIEW
Save as: docs/screenshots/02-overview.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/02-overview.png" alt="MirrorTrace Overview" width="100%">
</p>

✍️ Reflect & Chat

Compose Reflection

Users can write naturally, optionally add topic tags and save a private reflection.

Reflective Brainstorm Companion

Gemini supports multi-turn reflection around:

uncertainty;

decisions;

trade-offs;

conflicts;

assumptions;

perspective clarification.

The AI acts as a companion, not as the authority over what the user believes.

Private Session

Private Session is intended for reflection that should not become persistent journal or reusable-memory history.

<!-- =========================================================
SCREENSHOT 03 — REFLECT & CHAT
Save as: docs/screenshots/03-reflect-chat.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/03-reflect-chat.png" alt="Compose Reflection and Reflective Brainstorm" width="100%">
</p>

🧠 Consent-Governed AI Memory

Suggested Thought Snapshot

After a saved reflection, Gemini may propose a structured interpretation containing:

position statement;

topic;

tags.

The user decides what happens next:

Accept

Edit & Accept

Reject

A generated proposal is not the same thing as approved reusable memory.

<!-- =========================================================
SCREENSHOT 04 — THOUGHT SNAPSHOT
Save as: docs/screenshots/04-thought-snapshot.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/04-thought-snapshot.png" alt="MirrorTrace Suggested Thought Snapshot" width="100%">
</p>

🔄 Thought Diffs

Thought Diffs compare related approved Thought Snapshots from different moments in time.

They can surface:

earlier stance;

current stance;

what changed;

what stayed consistent;

relationship assessment;

provenance.

This turns journaling into longitudinal reflective intelligence rather than a simple archive.

<!-- =========================================================
SCREENSHOT 05 — THOUGHT DIFF
Save as: docs/screenshots/05-thought-diff.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/05-thought-diff.png" alt="MirrorTrace Thought Diff" width="100%">
</p>

🔎 Provenance

A generated comparison should be inspectable.

MirrorTrace provides provenance controls such as “Why am I seeing this?” and “Inspect provenance” so the user can understand which approved source records support the comparison.

⏰ Perspective Watch

Perspective Watch lets the user intentionally schedule a future revisit.

The user chooses what should be revisited instead of allowing the AI to silently decide which beliefs matter.

Reminder delivery is designed around safe topic-level context.

📚 Journal History

Journal History turns private reflections into a retrievable personal record.

Implemented tools include:

search and filters;

date filtering;

calendar/list browsing;

favorites and pinning;

editing;

Revisit This;

Weekly Review;

Year in Reflection;

Decision Ledger;

Reflection Chains;

Assumption Tracker;

Version History;

Knowledge Graph;

export;

reminder-oriented workflows.

<!-- =========================================================
SCREENSHOT 06 — JOURNAL HISTORY
Save as: docs/screenshots/06-journal-history.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/06-journal-history.png" alt="MirrorTrace Journal History" width="100%">
</p>

🛡️ Memory Governance Center

Memory Governance is the user's control plane for reusable reflective intelligence.

Users can inspect and manage:

approved Thought Snapshots;

retention;

Thought Diffs;

provenance;

Perspective Watches;

reminder delivery;

memory export;

memory revocation.

Gemini proposing an interpretation is not enough. The user decides whether that interpretation can become reusable memory.

<!-- =========================================================
SCREENSHOT 07 — MEMORY GOVERNANCE
Save as: docs/screenshots/07-memory-governance.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/07-memory-governance.png" alt="MirrorTrace Memory Governance Center" width="100%">
</p>

👥 MirrorRoom

Consent-Based Collaborative Reflection

Think privately. Share deliberately.

MirrorRoom is a temporary collaborative reasoning mode, not a shared journal.

Capabilities

create a temporary room;

invite-code joining;

copyable invite links;

named or anonymous participation;

explicit Share this thought control;

participant list;

shared contribution board;

factual room summary;

Save only my takeaway;

host-only closing;

expiry;

server-side membership checks.

MirrorRoom Privacy Boundary

Joining a room does not automatically expose:

journal history;

Thought Snapshots;

Thought Diffs;

provenance;

private Gemini conversations;

reusable AI memory;

saved private takeaways.

<!-- =========================================================
SCREENSHOT 08 — MIRRORROOM CREATE/JOIN
Save as: docs/screenshots/08-mirrorroom-create.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/08-mirrorroom-create.png" alt="MirrorRoom create and join" width="100%">
</p>

<!-- =========================================================
SCREENSHOT 09 — MIRRORROOM ACTIVE
Save as: docs/screenshots/09-mirrorroom-active.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/09-mirrorroom-active.png" alt="MirrorRoom active collaboration" width="100%">
</p>

🧑‍💻 Admin Control Room

The Admin Control Room provides operational visibility for authorized administrators.

It includes:

service health;

platform KPIs;

users;

support queue;

review moderation;

audit information;

MirrorRoom operational analytics.

The design separates operational metadata from unrestricted access to private reflective content.

<!-- =========================================================
SCREENSHOT 10 — ADMIN CONTROL ROOM
Save as: docs/screenshots/10-admin-dashboard.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/10-admin-dashboard.png" alt="MirrorTrace Admin Control Room" width="100%">
</p>

<!-- =========================================================
SCREENSHOT 11 — ADMIN MIRRORROOM ANALYTICS
Save as: docs/screenshots/11-admin-mirrorroom.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/11-admin-mirrorroom.png" alt="MirrorTrace Admin MirrorRoom analytics" width="100%">
</p>

🆘 Support & Feedback

Customer Support

Users deliberately submit the support text they want administrators to receive.

Feedback & Public Reviews

Public display is designed around:

explicit public-display consent;

moderation state;

admin approval.

<!-- =========================================================
SCREENSHOT 12 — SUPPORT
Save as: docs/screenshots/12-support.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/12-support.png" alt="MirrorTrace Customer Support" width="100%">
</p>

<!-- =========================================================
SCREENSHOT 13 — FEEDBACK
Save as: docs/screenshots/13-feedback.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/13-feedback.png" alt="MirrorTrace Feedback" width="100%">
</p>

🤖 TraceBot

TraceBot is the public application guide.

It explains:

what MirrorTrace does;

how navigation works;

Thought Snapshots;

Thought Diffs;

Memory Governance;

provenance;

Perspective Watch;

MirrorRoom;

Support and Feedback;

the privacy model.

It is intentionally separate from the private Gemini Reflective Brainstorm Companion.

<!-- =========================================================
SCREENSHOT 14 — TRACEBOT
Save as: docs/screenshots/14-tracebot.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/14-tracebot.png" alt="MirrorTrace TraceBot" width="100%">
</p>

🔐 Security Architecture

MirrorTrace is designed around several boundaries:

Firebase Authentication identifies the user.

Protected API requests verify authenticated identity server-side.

Owner-bound data is isolated by Firebase UID.

Frontend admin visibility is not treated as authorization.

Backend admin authorization remains authoritative.

Gemini credentials remain server-side.

Reusable AI memory requires explicit user consent.

Thought Diff claims preserve provenance.

MirrorRoom accepts only deliberately shared room content.

Private user data and collaborative room data use separate namespaces.

<!-- =========================================================
SCREENSHOT 15 — PUBLIC SECURITY SECTION
Save as: docs/screenshots/15-security.png
========================================================= -->

<p align="center">
  <img src="docs/screenshots/15-security.png" alt="MirrorTrace security architecture" width="100%">
</p>

🏗️ System Architecture

flowchart TB
    U[User] --> WEB[React + TypeScript Client]
    WEB --> FA[Firebase Authentication]
    FA --> API[Express / TypeScript Backend]
    API --> VERIFY[Firebase Admin Token Verification]

    VERIFY --> J[Journal APIs]
    VERIFY --> C[Conversation APIs]
    VERIFY --> TS[Thought Snapshot APIs]
    VERIFY --> TD[Thought Diff + Provenance APIs]
    VERIFY --> PW[Perspective Watch APIs]
    VERIFY --> MR[MirrorRoom APIs]
    VERIFY --> SR[Support + Review APIs]
    VERIFY --> AD[Admin APIs]

    J --> FS[(Cloud Firestore)]
    C --> FS
    TS --> FS
    TD --> FS
    PW --> FS
    MR --> FS
    SR --> FS
    AD --> FS

    C --> G[Google Gemini API]
    TS --> G
    TD --> G

    API --> SM[Google Cloud Secret Manager]
    API --> CR[Google Cloud Run]

Production submission note: verify that the deployed Gemini credential is actually retrieved/injected through Google Cloud Secret Manager before selecting the Secret Manager checkbox in the challenge form.

🔄 Core Reflection Flow

flowchart LR
    A[Write Reflection] --> B[Private Journal Entry]
    B --> C[Optional Gemini Reflection]
    B --> D[Gemini Suggests Thought Snapshot]
    D --> E{User Decision}
    E -->|Reject| F[No Reusable Memory]
    E -->|Accept| G[Approved Snapshot]
    E -->|Edit & Accept| G
    G --> H{Related Approved Snapshot?}
    H -->|No| I[Wait for Future Reflection]
    H -->|Yes| J[Evidence Comparison]
    J --> K[Thought Diff]
    K --> L[Provenance]
    K --> M[Optional Perspective Watch]

🧩 MirrorRoom Flow

sequenceDiagram
    participant A as Participant A
    participant API as MirrorTrace Server
    participant DB as Firestore
    participant B as Participant B

    A->>API: Create temporary room
    API->>DB: Save room + host membership
    API-->>A: Invite code/link

    B->>API: Join using code
    API->>DB: Validate room + membership
    API-->>B: Room access

    Note over A,B: Private account history is not imported

    A->>A: Type private draft
    A->>API: Share this thought
    API->>DB: Persist explicit contribution only
    API-->>B: Shared contribution

    A->>API: Request factual summary
    API->>DB: Read room contributions
    API-->>A: Shared-content summary

    B->>API: Save only my takeaway
    API->>DB: Write only to B's private journal

☁️ Google Cloud & Gemini Usage

Service

MirrorTrace use

Firebase Authentication

Google Sign-In and authenticated user identity.

Cloud Firestore

Owner-isolated journals, conversations, memory records, comparisons, governance state and application workflows.

Gemini API

Multi-turn reflective conversation, Thought Snapshot proposals and evidence-backed perspective comparison.

Google Cloud Run

Production hosting for the authenticated full-stack application.

Google Cloud Secret Manager

Production secret storage / injection for Gemini credentials. Verify this is active in the final deployment before submission.

Firebase Admin SDK

Server-side Firebase token verification and privileged backend operations.

🛠️ Technology Stack

Layer

Technology

Frontend

React, TypeScript

Styling

Tailwind utilities + consolidated custom CSS

Build

Vite

Backend

Express, TypeScript, tsx

Authentication

Firebase Authentication

Database

Cloud Firestore

Server Firebase

Firebase Admin SDK

Generative AI

Google Gemini

Hosting

Google Cloud Run

Secrets

Google Cloud Secret Manager

Icons

Lucide React

📁 Repository Structure

MirrorTrace/
├── docs/
│   └── screenshots/
├── public/
├── server/
│   ├── adminRoutes.ts
│   ├── emailRoutes.ts
│   ├── firebaseAdmin.ts
│   ├── gemini.ts
│   ├── journalEnhancementRoutes.ts
│   ├── notificationRoutes.ts
│   ├── reflectionRoomRoutes.ts
│   └── supportReviewRoutes.ts
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   │   ├── mirrortrace-app.css
│   │   └── mirrortrace-public.css
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── scripts/
├── firestore.rules
├── server.ts
├── vite.config.ts
├── package.json
└── README.md

⚙️ Local Development

npm install
npm run dev

Default local URL:

http://localhost:3000

Useful diagnostics:

GET /api/health
GET /api/mirror-rooms/ping

🔐 Production Secret Management

For challenge compliance, do not hardcode the Gemini key or expose it through client-side Vite environment variables.

Example Secret Manager flow:

gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

Grant the Cloud Run runtime service account access:

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_RUNTIME_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

Then configure the Cloud Run service to receive the secret securely.

☁️ Cloud Run Deployment

Deploy your final service using Google AI Studio's Publish flow or your existing Cloud Run deployment workflow.

After deployment, add the campaign verification label:

gcloud run services update YOUR_SERVICE_NAME \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=YOUR_REGION

Verify:

gcloud run services describe YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --format="value(metadata.labels)"

The final deployment must be publicly reachable at the URL submitted to the challenge.

✅ Pre-Submission Verification

Functional

Google Sign-In works in production.

Sign-out works.

Session survives refresh.

Reflection saves.

Saved reflection survives logout/login.

Gemini multi-turn conversation works.

Snapshot proposal appears.

Reject creates no reusable memory.

Accept creates approved memory.

Edit & Accept saves edited memory.

Related approved snapshots produce a Thought Diff.

Provenance opens.

Journal search/date filters work.

Memory export works.

Memory revocation works.

Perspective Watch works.

MirrorRoom works with two accounts.

Support submission works.

Feedback/review consent works.

TraceBot works.

Security

User A cannot read User B private data.

Unauthenticated private API calls fail.

Normal user cannot use admin APIs.

Admin authorization is checked server-side.

MirrorRoom membership is enforced server-side.

Private journal data is not imported into MirrorRoom.

.env is ignored by Git.

No service-account JSON is committed.

No Gemini API key exists in frontend source/build output.

Gemini production secret is in Secret Manager.

Firestore rules are deployed.

Stability

npm run build passes.

Available lint/type checks pass.

No application-breaking console errors.

Production route refresh does not return 404.

Empty states render.

Error/retry states render.

1920×1080 tested.

1366×768 tested.

Mobile width tested.

Challenge Verification

Cloud Run service is public and working.

Required Cloud Run label is present:
dev-tutorial=cloud-run-ai-challenge

GitHub repository is public.

README screenshots are present.

Social post contains #AccelerateAIwithCloudRun.

Every submitted URL opens in an incognito browser.

🎯 What Makes MirrorTrace Different

1. AI memory requires explicit consent

A Gemini-generated interpretation does not silently become reusable memory.

2. It models perspective change over time

Thought Snapshots and Thought Diffs create a longitudinal reasoning layer.

3. AI comparisons are inspectable

Provenance connects generated comparisons to approved source evidence.

4. Collaboration does not require surrendering private history

MirrorRoom creates a temporary selective reasoning layer.

5. Administration is separated from private reflection

Operational visibility does not automatically imply content visibility.

6. The user remains the authority

Users can reject, edit, retain, export and revoke AI memory.

📊 Why It Matters

MirrorTrace explores a direction beyond “AI that remembers more.”

It asks whether an AI product can instead provide:

more deliberate memory;

more user control;

more evidence;

more explainability;

better privacy boundaries;

safer collaboration.

The goal is not to tell users what they believe.

The goal is to help them understand how their reasoning changes while preserving control over the history that AI is allowed to reuse.

🗺️ Future Roadmap

Potential production extensions include:

richer semantic retrieval across approved memories;

configurable retention policies;

organization-level RBAC;

scheduled Cloud Tasks / Scheduler processing;

richer notification channels;

export/import portability;

accessibility audits;

observability and structured security telemetry;

additional collaborative reasoning modes.

👩‍💻 Author

Agrima Saxena

Solo Developer · Full-Stack Engineering · AI/ML · Cloud · Security

Built independently for the Google Cloud Gen AI Academy APAC Edition Ideathon / Cloud Run Build & Deploy Social Challenge.

<div align="center">

MirrorTrace

Private reflection. Consent-governed memory. Evidence-backed change. Selective collaboration.

⭐ If you find the project interesting, consider starring the repository.

</div>