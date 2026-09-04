<div align="center">

🪞 MirrorTrace

Privacy-First AI Reflection, Consent-Governed Memory & Collaborative Reasoning

Think privately. Remember deliberately. Compare perspectives with evidence. Share only what you choose.

Google Gemini · Firebase Authentication · Cloud Firestore · Google Cloud Run · Secret Manager · React · TypeScript · Express

Built for the Google Cloud Gen AI Academy — APAC Edition
Cloud Run Build & Deploy Social Challenge / Ideathon Challenge

</div>

🏆 Challenge Context

MirrorTrace was created for the Google Cloud Gen AI Academy APAC Edition Ideathon, whose baseline challenge is a secure, authenticated Personal Gemini Journal using Firebase Authentication, Firestore, Gemini, and Google Cloud Run.

The baseline is intentionally only a launchpad. MirrorTrace extends it into a broader reflective-intelligence system focused on:

consent-governed AI memory;

explainable longitudinal reasoning;

privacy-preserving collaboration;

provenance;

perspective revisits and notifications;

operational administration without unrestricted access to private reflective content.

Core product principle: AI can help interpret your thinking, but it should not silently decide what becomes part of your persistent memory.

🚀 What MirrorTrace Does

MirrorTrace is a reflective intelligence platform that helps users:

capture private thoughts;

brainstorm with Gemini;

intentionally approve reusable AI memory;

compare how their thinking evolves;

inspect the evidence behind AI-generated comparisons;

selectively collaborate without exposing private journal history.

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

an administrator Control Room;

TraceBot, a public product guide.

🌐 Public Experience

MirrorTrace introduces the product before sign-in with a clear promise: users remain in control of what AI is allowed to remember.

<p align="center">
  <img src="docs/images/Sign%20in%20page.jpeg" alt="MirrorTrace public landing and Google sign-in experience" width="100%">
</p>

The landing experience communicates the key product idea directly:

evidence-first AI reflection;

Google Sign-In;

transparent product navigation;

a public-facing TraceBot guide;

clear separation between public explanation and private reflective workflows.

❗ The Problem

Modern AI assistants are useful in the moment, but reflective applications introduce a harder question:

What happens when AI begins to remember, reinterpret, and reuse what a person once thought?

1. AI memory can become invisible

Users often cannot easily see:

what the model inferred;

which inference became persistent;

why it is being reused;

how long it remains reusable;

how to revoke it.

2. Journals preserve entries, not reasoning change

A normal journal answers:

“What did I write?”

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

private takeaways.

4. Administration can become surveillance

Administrators need operational visibility, support queues, moderation, and service health. That should not automatically give them unrestricted access to private reflective content.

💡 The Solution

MirrorTrace treats reflective AI as a consent, provenance, and data-isolation problem, not merely a text-generation problem.

Private by default

Every private workflow is bound to the authenticated Firebase user.

AI interpretation requires consent

Gemini can propose a structured Thought Snapshot, but the proposal becomes reusable AI memory only when the user explicitly Accepts or Edits & Accepts it.

Longitudinal claims require evidence

Related approved snapshots can form a Thought Diff, preserving what changed, what stayed consistent, and the evidence behind the comparison.

Collaboration is selective

MirrorRoom receives only the text a participant deliberately chooses to share.

Administration is operational

The Admin Control Room is designed for service and workflow visibility without unrestricted journal-reading privileges.

👥 Who MirrorTrace Is For

MirrorTrace is designed for people who make decisions, revisit ideas, and want to understand how their reasoning changes over time without letting AI silently decide what gets remembered.

<p align="center">
  <img src="docs/images/Target%20Audience.jpeg" alt="MirrorTrace target audience section" width="100%">
</p>

🎓 Students & Early-Career Professionals

MirrorTrace can help track reasoning around:

internships;

higher studies;

examinations;

career direction;

projects;

skill priorities.

Example: A student can compare how their thinking about an MBA, MS, or engineering role changes after internships, interviews, and new experiences.

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

Example: A leader can privately form a position, selectively share one thought in MirrorRoom, and later save only their own takeaway.

🧭 Product Navigation

Page / Control

What it does

Overview

Personal reflection dashboard, metrics, quick actions, and perspective-evolution state.

Reflect & Chat

Write a journal reflection or use the Gemini reflective companion.

Journal History

Search, filter, revisit, organize, edit, and explore saved reflections.

Memory

Opens the Memory Governance Center for approved memory, retention, Thought Diffs, provenance, watches, export, and revocation.

Support

Submit support information intentionally without automatically attaching private journal history.

Feedback

Submit product feedback and optionally consent to a public review.

MirrorRoom

Temporary selective collaborative reasoning.

Admin Control Room

Operational administration for authorized admins.

TraceBot

Public guide explaining MirrorTrace features, navigation, and privacy.

🏠 Overview

The signed-in Overview provides:

reflection counts;

approved-snapshot counts;

Thought Diff counts;

perspective-evolution state;

shortcuts into reflection and memory workflows.

<p align="center">
  <img src="docs/images/User%20Overview.jpeg" alt="MirrorTrace signed-in user overview" width="100%">
</p>

Quick Actions

The Overview also gives users direct access to the most common workflows:

Write Reflection

Private Session

Journal History

<p align="center">
  <img src="docs/images/Quick%20Actions.jpeg" alt="MirrorTrace quick actions" width="100%">
</p>

✍️ Reflect & Chat

Compose Reflection

Users can write naturally, optionally add topic tags, and save a private reflection.

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

<p align="center">
  <img src="docs/images/User%20Reflective%20Space.jpeg" alt="MirrorTrace Reflective Space with private journal composition and Gemini companion" width="100%">
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

This is a central distinction in MirrorTrace: AI can suggest a memory candidate, but the user remains the authority over whether that interpretation is permitted to persist.

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

A Thought Diff is not created merely because two snapshots exist. The comparison pipeline checks for meaningful relationship signals such as topic and tag overlap before evaluating the pair.

🔎 Provenance

A generated comparison should be inspectable.

MirrorTrace provides provenance controls such as:

Why am I seeing this?

Inspect provenance

These allow the user to understand which approved source records support a comparison.

The goal is not merely to generate an interpretation, but to preserve a traceable path back to the reflections and approved memory records that produced it.

⏰ Perspective Watch

Perspective Watch lets the user intentionally schedule a future revisit.

The user chooses what should be revisited instead of allowing the AI to silently decide which beliefs matter.

Reminder delivery is designed around safe, topic-level context rather than exposing private journal text unnecessarily.

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

<p align="center">
  <img src="docs/images/User%20Journal%20History.jpeg" alt="MirrorTrace Journal History with Reflection Workspace, search, filters and journal tools" width="100%">
</p>

Year in Reflection

MirrorTrace can summarize the user’s existing reflective record without attempting mood diagnosis or psychological inference.

<p align="center">
  <img src="docs/images/Reflection%20Wrap.jpeg" alt="MirrorTrace Year in Reflection summary" width="100%">
</p>

The Year in Reflection view highlights factual signals already present in the user’s data, such as:

number of reflections;

approved snapshots;

Thought Diffs;

active periods;

revisited topics.

🛡️ Memory Governance Center

Memory Governance is the user’s control plane for reusable reflective intelligence.

Users can inspect and manage:

approved Thought Snapshots;

retention;

Thought Diffs;

provenance;

Perspective Watches;

reminder delivery;

memory export;

memory revocation.

<p align="center">
  <img src="docs/images/User%20Memory%20Governance.jpeg" alt="MirrorTrace Memory Governance Center" width="100%">
</p>

Gemini proposing an interpretation is not enough. The user decides whether that interpretation can become reusable memory and can later inspect, export, retain, or revoke it.

👥 MirrorRoom

Consent-Based Collaborative Reflection

Think privately. Share deliberately.

MirrorRoom is a temporary collaborative reasoning mode, not a shared journal.

<p align="center">
  <img src="docs/images/MirrorRoom%20.jpeg" alt="MirrorRoom create and join interface" width="100%">
</p>

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

Only content a participant explicitly shares enters the room.

🧑‍💻 Admin Control Room

The Admin Control Room provides operational visibility for authorized administrators while preserving a strict separation between system operations and private reflective content.

<p align="center">
  <img src="docs/images/Admin%20Dashboard.jpeg" alt="MirrorTrace Admin Control Room security and operations dashboard" width="100%">
</p>

The dashboard surfaces:

registered-user counts;

Thought Snapshot counts;

Thought Diff counts;

active watches;

push-device counts;

privacy-boundary status;

authorized admin state.

Service Health & Aggregate Activity

The operations layer can also surface platform health and aggregate activity without exposing private journal bodies.

<p align="center">
  <img src="docs/images/Admin%20Dashboard%202.jpeg" alt="MirrorTrace Admin service health and aggregate reflection infrastructure" width="100%">
</p>

Operational indicators include:

Firebase Auth health;

Firestore health;

Gemini configuration;

SMTP configuration;

FCM configuration;

Scheduler configuration;

aggregate reflection infrastructure;

user/account metadata;

support and moderation workflows.

The design separates operational metadata from unrestricted access to private reflective content.

🆘 Support & Feedback

Customer Support

Users deliberately submit the support text they want administrators to receive.

Feedback & Public Reviews

Public display is designed around:

explicit public-display consent;

moderation state;

admin approval.

This prevents private reflective content from being silently repurposed as public-facing product material.

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

The public sign-in flow introduces the user-facing side of this model, while the authenticated application enforces it at the data and API layers.

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

Owner-isolated journals, conversations, memory records, comparisons, governance state, and application workflows.

Gemini API

Multi-turn reflective conversation, Thought Snapshot proposals, and evidence-backed perspective comparison.

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
│   └── images/
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

npm run lint passes.

npm run build passes.

npx tsx .\scripts\predeployCheck.ts passes.

npx tsx .\scripts\smokeTest.ts passes.

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

Users can reject, edit, retain, export, and revoke AI memory.

📊 Why It Matters

MirrorTrace explores a direction beyond:

“AI that remembers more.”

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