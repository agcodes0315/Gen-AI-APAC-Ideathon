<div align="center">

🪞 MirrorTrace

Privacy-First Reflective Intelligence with Consent-Governed AI Memory

Think privately. Remember deliberately. Compare perspectives with evidence. Share only what you choose.

<br/>






<br/>

<img src="mirrortrace-readme-assets/hero.png"
  alt="MirrorTrace product overview"
  width="920"/>

<br/>

Independently designed and built for the Google Cloud Gen AI Academy — APAC Edition / Cloud Run Build & Deploy Social Challenge.

</div>

✨ The Idea

Most AI systems are optimized to remember more.

MirrorTrace explores a different question:

What if AI could help you remember your thinking without deciding what deserves to be remembered?

MirrorTrace is a reflective-intelligence platform where Gemini can help interpret a user's reflections, but the user remains the authority over reusable AI memory.

A generated interpretation is only a suggestion.

AI-generated interpretation
            ≠
Approved reusable memory

Only after the user explicitly Accepts or Edits & Accepts a Thought Snapshot can it become reusable memory.

🏆 Challenge Context

MirrorTrace began from the secure Personal Gemini Journal challenge baseline built around Firebase Authentication, Cloud Firestore, Gemini, and Google Cloud Run.

It extends that baseline into a broader system for:

🧠 consent-governed AI memory

🔄 longitudinal Thought Diffs

🔎 evidence and provenance

🛡️ Memory Governance

👁️ Perspective Watch

👥 privacy-isolated collaboration through MirrorRoom

🧑‍💻 operational administration without unrestricted journal access

🤖 public product guidance through TraceBot

🚀 What MirrorTrace Does

The core product loop

┌──────────────────────┐
│   Write Reflection   │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Optional Gemini      │
│ Brainstorm           │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Thought Snapshot     │
│ Proposal             │
└──────────┬───────────┘
           ↓
     ┌─────┴─────┐
     ↓           ↓
  Reject     Accept / Edit
     │           │
     ↓           ↓
 No Memory   Approved Memory
                 │
                 ↓
        Related Memory Later
                 │
                 ↓
          Thought Diff
                 │
                 ↓
             Provenance
                 │
                 ↓
        Optional Perspective
              Watch

The key product principle

Gemini can suggest an interpretation. The user decides whether it becomes reusable memory.

🖥️ Product at a Glance

<img src="mirrortrace-readme-assets/sign-in.png"
  alt="MirrorTrace public landing page and Google Sign-In"
  width="100%"/>

The public experience introduces MirrorTrace as evidence-first AI reflection and gives users a direct path into authentication, product explanations, privacy messaging, and TraceBot.

Five design principles

Principle

MirrorTrace approach

🔒 Private reflection

Owner-bound Firebase UID isolation

🧠 AI memory

Explicit user approval before reuse

🔄 Perspective change

Thought Snapshots + Thought Diffs

🔎 Explainability

Provenance back to source reflections

👥 Collaboration

Explicit sharing through MirrorRoom

🧩 Core Features

01 — ✍️ Reflective Space

<img src="mirrortrace-readme-assets/reflective-space.png"
  alt="MirrorTrace Reflective Space"
  width="100%"/>

The Reflective Space combines private journaling with a Gemini-powered thinking companion.

Compose Reflection

Users can:

write a private journal entry

add topic tags

save reflections to Firestore

later generate a Thought Snapshot

Reflective Brainstorm Companion

Gemini supports multi-turn reflection around:

uncertainty

decisions

conflicts

trade-offs

assumptions

perspective clarification

The assistant is intentionally framed as a thinking companion, not an authority that determines what the user believes.

Private Session

A Private Session supports reflection without automatically creating persistent journal history or reusable AI memory.

02 — 🧠 Consent-Governed AI Memory

A saved reflection can be evaluated for a structured Thought Snapshot.

A snapshot can contain:

position statement

topic

tags

retention information

The user chooses:

┌───────────────┐
│    Accept     │
├───────────────┤
│ Edit & Accept │
├───────────────┤
│    Reject     │
└───────────────┘

Only accepted snapshots become reusable AI memory.

This creates an explicit boundary between AI interpretation and user-approved memory.

03 — 🔄 Thought Diffs

<img src="mirrortrace-readme-assets/thought-diffs.png"
  alt="MirrorTrace Thought Diff and evidence comparison"
  width="100%"/>

Thought Diffs compare related approved Thought Snapshots from different moments in time.

A comparison can surface:

earlier position

later position

apparent shift

apparent continuity

relationship assessment

supporting provenance

Candidate matching uses topic and tag relationships before Gemini evaluates whether enough evidence exists.

Think of it as:

Version control for human thinking.

Instead of only asking "What did I write?", MirrorTrace helps ask:

What did I believe before?
          ↓
What do I believe now?
          ↓
What changed?
          ↓
What stayed consistent?
          ↓
What evidence supports that comparison?

04 — 🔎 Provenance

Every meaningful comparison should be inspectable.

MirrorTrace connects Thought Diffs back to source evidence through provenance records containing:

earlier snapshot

later snapshot

earlier journal

later journal

timestamps

excerpts

source positions

Controls such as "Why am I seeing this?" allow the user to inspect the evidence behind an AI-generated comparison.

05 — 📚 Journal History

<img src="mirrortrace-readme-assets/journal-history.png"
  alt="MirrorTrace Journal History"
  width="100%"/>

Journal History turns private entries into a structured personal reasoning record.

Available workflows

🔍 search

🏷️ tag filtering

📅 date filtering

🗓️ calendar browsing

⭐ favorites

✏️ editing

🔁 Revisit This

📖 Weekly Review

⚖️ Decision Ledger

🔗 Reflection Chains

🧩 Assumption Tracker

🕘 Version History

🕸️ Knowledge Graph

📤 export

🔔 reminder-oriented workflows

Year in Reflection

<img src="mirrortrace-readme-assets/year-in-reflection.png"
  alt="MirrorTrace Year in Reflection"
  width="100%"/>

Year in Reflection summarizes information already present in the user's saved data.

It can surface:

reflection count

approved memories

Thought Diffs

most active period

revisited topics

It is designed as a factual reflection summary rather than a psychological or mood inference system.

06 — 🛡️ Memory Governance

<img src="mirrortrace-readme-assets/memory-governance.png"
  alt="MirrorTrace Memory Governance Center"
  width="100%"/>

Memory Governance is the control plane for everything MirrorTrace is allowed to reuse as reflective memory.

Users can inspect and manage:

approved memories

retention state

expiring memories

Thought Diffs

provenance

Perspective Watches

reminder delivery

memory export

memory revocation

👁️ Perspective Watch

Perspective Watch lets users intentionally schedule a future revisit.

The system does not silently decide which belief deserves follow-up.

The user chooses:

What to watch
      +
When to revisit it
      +
Whether reminders are enabled

07 — 👥 MirrorRoom

<img src="mirrortrace-readme-assets/mirror-room.png"
  alt="MirrorTrace MirrorRoom"
  width="100%"/>

Think privately. Share deliberately.

MirrorRoom is a temporary collaborative reasoning environment — not a shared journal.

Capabilities

create a temporary room

join using an invite code

copy invite links

choose display-name behavior

explicitly share a thought

view participants

generate a factual room summary

save only your own takeaway

host-only closing

expiry

server-side membership validation

Privacy boundary

MirrorRoom does not automatically import:

Private Journal Entries
Thought Snapshots
Thought Diffs
Provenance
Private Gemini Conversations
Reusable AI Memory
Saved Private Takeaways

Only text deliberately submitted through the room contribution flow enters collaborative scope.

08 — 🧑‍💻 Admin Control Room

<img src="mirrortrace-readme-assets/admin-dashboard.png"
  alt="MirrorTrace Admin Control Room"
  width="100%"/>

The Admin Control Room provides operational visibility while maintaining a visible privacy boundary.

It can surface aggregate information such as:

registered users

Thought Snapshot counts

Thought Diff counts

active watches

push devices

authorization state

privacy-boundary status

The administrator is not automatically granted unrestricted journal visibility.

Service Health & Aggregate Activity

<img src="mirrortrace-readme-assets/admin-health.png"
  alt="MirrorTrace Admin Service Health"
  width="100%"/>

The operations dashboard can verify:

Firebase Authentication

Cloud Firestore

Gemini configuration

SMTP configuration

FCM

scheduler configuration

aggregate reflection infrastructure

minimized account metadata

09 — 🆘 Support & Feedback

MirrorTrace includes user-facing support and feedback workflows.

Customer Support

Users explicitly submit the information they want administrators to receive.

Private journal history is not automatically attached to support requests.

Public Reviews

Public review display is designed around:

explicit display consent

moderation status

admin approval

10 — 🤖 TraceBot

TraceBot is the public product guide.

It explains:

what MirrorTrace does

navigation

Thought Snapshots

Thought Diffs

provenance

Memory Governance

Perspective Watch

MirrorRoom

Support & Feedback

the privacy model

TraceBot is separate from the authenticated Reflective Brainstorm Companion.

🔐 Security & Privacy Architecture

MirrorTrace is designed around explicit trust boundaries.

Security concern

MirrorTrace approach

User identity

Firebase Authentication

Backend identity verification

Firebase Admin token verification

User data isolation

Owner-bound users/{uid}/... Firestore paths

Gemini credentials

Server-side only

AI memory

Explicit Accept / Edit & Accept

Thought Diff evidence

Provenance records

Admin access

Server-side authorization

Collaboration

MirrorRoom membership validation

Shared content

Explicit contribution only

Client data access

Firestore rules + backend boundaries

Firestore isolation

Private reflective records are stored under user-owned paths such as:

users/{uid}/journals
users/{uid}/conversations
users/{uid}/thoughtSnapshots
users/{uid}/thoughtDiffs
users/{uid}/provenance
users/{uid}/perspectiveWatches

MirrorRoom data lives in a separate collaborative namespace.

🏗️ Architecture

flowchart TB
    U[User] --> WEB[React + TypeScript Client]

    WEB --> AUTH[Firebase Authentication]
    AUTH --> API[Express + TypeScript Backend]
    API --> VERIFY[Firebase Admin Token Verification]

    VERIFY --> JOURNAL[Journal APIs]
    VERIFY --> CHAT[Conversation APIs]
    VERIFY --> SNAP[Thought Snapshot APIs]
    VERIFY --> DIFF[Thought Diff + Provenance APIs]
    VERIFY --> WATCH[Perspective Watch APIs]
    VERIFY --> ROOM[MirrorRoom APIs]
    VERIFY --> SUPPORT[Support + Feedback APIs]
    VERIFY --> ADMIN[Admin APIs]

    JOURNAL --> FS[(Cloud Firestore)]
    CHAT --> FS
    SNAP --> FS
    DIFF --> FS
    WATCH --> FS
    ROOM --> FS
    SUPPORT --> FS
    ADMIN --> FS

    CHAT --> GEMINI[Google Gemini API]
    SNAP --> GEMINI
    DIFF --> GEMINI

    API --> SECRET[Google Cloud Secret Manager]
    API --> RUN[Google Cloud Run]

🔄 Reflection Lifecycle

flowchart LR
    A[Write Reflection] --> B[Private Journal]
    B --> C[Optional Gemini Conversation]
    B --> D[Thought Snapshot Proposal]

    D --> E{User Decision}

    E -->|Reject| F[No Reusable Memory]
    E -->|Accept| G[Approved Memory]
    E -->|Edit & Accept| G

    G --> H{Related Approved Memory Exists?}

    H -->|No| I[Wait for Future Reflection]
    H -->|Yes| J[Evidence Comparison]

    J --> K[Thought Diff]
    K --> L[Provenance]
    K --> M[Optional Perspective Watch]

👥 MirrorRoom Lifecycle

sequenceDiagram
    participant A as Participant A
    participant API as MirrorTrace Server
    participant DB as Firestore
    participant B as Participant B

    A->>API: Create room
    API->>DB: Save room + host membership
    API-->>A: Invite code

    B->>API: Join with code
    API->>DB: Validate room + membership
    API-->>B: Room access

    Note over A,B: Private account history is never imported automatically

    A->>API: Share this thought
    API->>DB: Persist explicit contribution only
    API-->>B: Shared contribution

    A->>API: Request factual summary
    API->>DB: Read room contributions
    API-->>A: Summary

    B->>API: Save only my takeaway
    API->>DB: Write to B private journal only

☁️ Google Cloud & Gemini

Service

MirrorTrace use

Firebase Authentication

Google Sign-In and authenticated identity

Cloud Firestore

Journals, conversations, approved memory, Thought Diffs, provenance, watches, rooms, support, feedback

Gemini API

Reflective conversation, Thought Snapshot generation, Thought Diff evaluation

Firebase Admin SDK

Server-side token verification and privileged backend operations

Google Cloud Secret Manager

Secure production Gemini credential storage

Google Cloud Run

Production deployment

⚙️ Key Engineering Decisions

Engineering challenge

MirrorTrace approach

AI should not silently define user memory

Explicit snapshot approval

Memory should remain inspectable

Memory Governance Center

Perspective comparisons need evidence

Thought Diff provenance

Private journals should not leak into collaboration

Separate MirrorRoom namespace

Admins need visibility without surveillance

Aggregate operations dashboard

User data must remain isolated

UID-scoped Firestore architecture

Gemini secrets must not reach the browser

Server-side API proxy

Missing API routes should not return SPA HTML

Explicit /api 404 fallback

Deployment should be testable

Health, predeploy, and smoke checks

🛠️ Tech Stack

Layer

Technology

Frontend

React, TypeScript

Build

Vite

Styling

Tailwind utilities + custom MirrorTrace CSS

Backend

Express, TypeScript, tsx

Authentication

Firebase Authentication

Database

Cloud Firestore

Server

Firebase Admin SDK

Generative AI

Google Gemini

Deployment

Google Cloud Run

Secrets

Google Cloud Secret Manager

Icons

Lucide React

📡 API Surface

Method

Endpoint

Purpose

GET

/api/health

Backend health check

POST

/api/journal

Save reflection

GET

/api/journal

List user reflections

DELETE

/api/journal/:id

Delete reflection and dependent records

POST

/api/conversations

Create reflective conversation

POST

/api/conversations/:id/messages

Multi-turn Gemini message

POST

/api/thought-snapshots/propose

Generate non-persistent snapshot proposal

POST

/api/thought-snapshots/approve

Persist approved user memory

GET

/api/thought-snapshots

List approved memories

POST

/api/thought-diffs/generate

Evaluate related approved snapshots

GET

/api/thought-diffs

List Thought Diffs

GET

/api/thought-diffs/:id/provenance

Inspect comparison provenance

POST

/api/perspective-watches

Schedule perspective revisit

GET

/api/memory/export

Export user-governed memory

GET

/api/mirror-rooms/ping

MirrorRoom service check

Unknown /api/* routes return a JSON 404 rather than falling through to the React SPA.

📁 Repository Structure

Gen-AI-APAC-Ideathon/
├── mirrortrace-readme-assets/
│   ├── hero.png
│   ├── sign-in.png
│   ├── audience.png
│   ├── overview.png
│   ├── quick-actions.png
│   ├── reflective-space.png
│   ├── journal-history.png
│   ├── year-in-reflection.png
│   ├── memory-governance.png
│   ├── mirror-room.png
│   ├── admin-dashboard.png
│   └── admin-health.png
│
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
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
│
├── scripts/
│   ├── predeployCheck.ts
│   ├── productionVerify.ts
│   ├── releaseGate.ps1
│   ├── setAdminRole.ts
│   └── smokeTest.ts
│
├── firestore.rules
├── server.ts
├── vite.config.ts
├── package.json
└── README.md

⚙️ Running Locally

Requirements

Node.js
npm
Firebase project configuration
Gemini API credential

1. Clone

git clone https://github.com/agcodes0315/Gen-AI-APAC-Ideathon.git
cd Gen-AI-APAC-Ideathon

2. Install

npm install

3. Configure environment

Use .env.example as the reference for required server and Firebase configuration.

Never commit .env files or service-account credentials.

4. Run

npm run dev

Open:

http://localhost:3000

5. Verify

npm run lint
npm run build
npx tsx ./scripts/predeployCheck.ts
npx tsx ./scripts/smokeTest.ts

🔐 Production Secret Management

Gemini credentials must remain server-side.

For Cloud Run, the intended production pattern is:

gcloud secrets create GEMINI_API_KEY \
  --replication-policy="automatic"

echo -n "YOUR_API_KEY" | \
  gcloud secrets versions add GEMINI_API_KEY --data-file=-

Grant the Cloud Run runtime service account access:

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_RUNTIME_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

Then bind the secret to the Cloud Run revision.

Important: verify that the deployed Cloud Run revision is actually using Secret Manager before treating secret management as production-ready.

☁️ Deployment

MirrorTrace is designed for Google Cloud Run.

After deployment, apply the required challenge label:

gcloud run services update YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --update-labels=dev-tutorial=cloud-run-ai-challenge

Verify:

gcloud run services describe YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --format="value(metadata.labels)"

🌐 Live Demo

<div align="center">



</div>

Add your final deployed Cloud Run URL here once the production deployment is ready.

✅ Submission Readiness

Functional

Google Sign-In works in production

Session survives refresh

Reflection saves and reloads

Gemini multi-turn conversation works

Thought Snapshot proposal appears

Reject creates no reusable memory

Accept creates approved memory

Edit & Accept persists the edited version

Related approved snapshots produce a Thought Diff

Provenance opens

Perspective Watch works

Journal search/date/calendar works

Memory export works

MirrorRoom works with two accounts

Admin Control Room works

Support and Feedback work

TraceBot works

Security

User A cannot see User B private data

Anonymous protected API access fails

Normal users cannot access admin APIs

Admin authorization is server-side

MirrorRoom membership is server-enforced

MirrorRoom does not import private journal history

.env is ignored

No service-account JSON is committed

Gemini key is not present in frontend code

Firestore rules are deployed

Secret Manager binding is verified

Stability

npm run lint passes

npm run build passes

predeployCheck.ts passes

smokeTest.ts passes

Production Cloud Run journey verified

🎯 What Makes MirrorTrace Different?

1. Consent is part of the AI memory architecture

Gemini-generated interpretations do not silently become reusable memory.

2. It models perspective change over time

Thought Snapshots and Thought Diffs create a longitudinal reasoning layer.

3. AI comparisons are evidence-backed

Provenance connects generated comparisons back to approved source evidence.

4. Collaboration is selective by design

MirrorRoom creates a temporary reasoning layer without importing private history.

5. Administration is separated from private reflection

Operational visibility does not automatically imply private-content visibility.

6. The user remains the authority

Users can reject, edit, retain, export, and revoke AI memory.

📊 What This Project Demonstrates

MirrorTrace brings together:

full-stack TypeScript engineering

React application architecture

Firebase Authentication

Cloud Firestore data modeling

Gemini integration

consent-aware AI memory

provenance and explainability

longitudinal reasoning

privacy boundaries

collaborative workflows

server-side authorization

operational administration

Cloud Run deployment

production verification

🌱 Roadmap

Phase 1 — Current
├── Consent-governed reflective AI
├── Thought Snapshots
├── Thought Diffs
├── Provenance
├── MirrorRoom
└── Memory Governance

Phase 2 — Memory Intelligence
├── Semantic retrieval across approved memory
├── Richer retention controls
└── Cross-topic reasoning summaries

Phase 3 — Team & Organization
├── Organization-level RBAC
├── Shared governed workspaces
└── Expanded moderation and audit telemetry

Phase 4 — Production Scale
├── Cloud Scheduler / Tasks
├── Structured observability
├── Accessibility audits
└── Advanced export / portability

⚠️ Scope

MirrorTrace is a reflective-intelligence application and not a medical, psychological, diagnostic, or therapeutic system.

Its purpose is to help users articulate, revisit, and compare their own reasoning while keeping them in control of reusable AI memory.

👩‍💻 Author

<div align="center">

Agrima Saxena

Solo Developer · Full-Stack Engineering · AI/ML · Cloud · Security

Built independently for the Google Cloud Gen AI Academy — APAC Edition / Cloud Run Build & Deploy Social Challenge.

<br/>



</div>

<div align="center">

MirrorTrace is not trying to remember everything.

It is trying to remember only what the user deliberately permits.

Private reflection · Consent-governed memory · Evidence-backed change · Selective collaboration

⭐ If you find MirrorTrace interesting, consider starring the repository.

</div>