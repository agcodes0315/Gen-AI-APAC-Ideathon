<div align="center">

🪞 MirrorTrace

Privacy-First Reflective Intelligence with Consent-Governed AI Memory

Think privately. Remember deliberately. Compare perspectives with evidence. Share only what you choose.

<br>






<br>




Built independently for the Google Cloud Gen AI Academy — APAC Edition
Cloud Run Build & Deploy Social Challenge / Personal Gemini Journal track.

</div>

🏆 Challenge Context

MirrorTrace began from the challenge baseline of a secure, authenticated Personal Gemini Journal built with Firebase Authentication, Cloud Firestore, Gemini, and Google Cloud Run.

I extended that baseline into a broader reflective-intelligence system centered on a stricter product question:

How can AI help a person remember and compare their thinking without silently deciding what should become permanent memory?

MirrorTrace adds:

consent-governed AI memory;

evidence-backed Thought Diffs;

provenance;

Memory Governance;

Perspective Watch;

privacy-isolated collaboration through MirrorRoom;

operational administration without unrestricted private journal access;

support, feedback, and public product guidance.

🚀 What MirrorTrace Does

MirrorTrace is a privacy-first reflective intelligence platform that helps users capture thoughts, brainstorm with Gemini, intentionally approve reusable AI memory, compare how their reasoning evolves, and collaborate without exposing private journal history.

Core product loop

Write Reflection
      ↓
Optional Gemini Brainstorm
      ↓
Gemini Suggests Thought Snapshot
      ↓
User Accepts / Edits / Rejects
      ↓
Approved Memory
      ↓
Related Approved Snapshot Later
      ↓
Thought Diff + Provenance
      ↓
Optional Perspective Watch

The important distinction is simple:

Gemini can suggest an interpretation. The user decides whether it becomes reusable memory.

🖥️ Product at a Glance

<p align="center">
  <img src="./docs/images/Sign%20in%20page.jpeg" alt="MirrorTrace public landing and Google sign-in experience" width="100%">
</p>

The public experience introduces MirrorTrace as evidence-first AI reflection and gives evaluators a direct path into Google Sign-In, product explanations, privacy messaging, and TraceBot.

The application is designed around five principles:

Principle

MirrorTrace approach

Private reflection

Owner-bound Firebase UID isolation

AI memory

Explicit user approval before reuse

Perspective change

Thought Snapshots + Thought Diffs

Explainability

Provenance back to source reflections

Collaboration

Explicit sharing only through MirrorRoom

❗ Why This Exists

Most journaling tools preserve entries. Most AI assistants preserve conversation context. Neither naturally gives users strong control over what AI is allowed to remember as an interpretation of them.

MirrorTrace addresses four problems.

1. Invisible AI memory

Users should be able to inspect:

what AI inferred;

what became reusable;

why it is being reused;

how long it remains available;

how to revoke it.

2. Journals preserve entries, not reasoning change

A normal journal can show what someone wrote.

MirrorTrace aims to answer:

What did I think earlier?

What do I think now?

What changed?

What stayed consistent?

Which reflections support that comparison?

3. Collaboration often weakens privacy boundaries

Shared spaces should not automatically import:

journal history;

prior Gemini conversations;

Thought Snapshots;

Thought Diffs;

reusable AI memory.

4. Administration should not become surveillance

Operations teams may need system health, counts, support queues, and moderation state.

That should not imply unrestricted access to private reflective content.

👥 Who MirrorTrace Is For

<p align="center">
  <img src="./docs/images/Target%20Audience.jpeg" alt="MirrorTrace audiences for reflective decision making" width="100%">
</p>

🎓 Students & Early-Career Professionals

Track changing reasoning around:

careers;

higher studies;

internships;

examinations;

opportunities;

skill priorities.

Example: compare how your thinking about an MBA, MS, consulting, or engineering role evolves after internships and interviews.

💼 Working Professionals

Useful for:

role changes;

negotiations;

difficult trade-offs;

retrospectives;

mentoring;

long-term career planning.

🛠️ Founders & Builders

Preserve the reasoning behind:

product decisions;

architecture choices;

user hypotheses;

prioritization;

pivots;

risk decisions.

🧠 Knowledge Workers & Leaders

Use MirrorTrace for:

strategic reflection;

hypothesis tracking;

decision calibration;

structured peer reasoning.

🏠 User Overview

<p align="center">
  <img src="./docs/images/User%20Overview.jpeg" alt="MirrorTrace authenticated user overview" width="100%">
</p>

The Overview acts as the user’s reflective command center.

It surfaces:

saved reflection count;

approved Thought Snapshot count;

Thought Diff count;

perspective-evolution state;

shortcuts into reflection and memory;

entry points into MirrorRoom.

Quick Actions

<p align="center">
  <img src="./docs/images/Quick%20Actions.jpeg" alt="MirrorTrace quick actions for reflection, private session and history" width="100%">
</p>

Users can jump directly into:

Write Reflection

Private Session

Journal History

The interface keeps high-frequency actions visible without exposing private content on the public surface.

✍️ Reflective Space

<p align="center">
  <img src="./docs/images/User%20Reflective%20Space.jpeg" alt="MirrorTrace Reflective Space with journal composition and Gemini companion" width="100%">
</p>

The Reflect & Chat workspace combines two modes.

Compose Reflection

Users can:

write a journal entry;

add topic tags;

save it privately to Firestore;

later generate a Thought Snapshot.

Reflective Brainstorm Companion

The Gemini-powered companion supports multi-turn reflection around:

uncertainty;

decisions;

conflicts;

trade-offs;

assumptions;

perspective clarification.

The assistant is intentionally framed as a thinking companion, not an authority that determines what the user believes.

Private Session

A Private Session allows reflection without automatically creating persistent journal history or reusable AI memory.

🧠 Consent-Governed AI Memory

A saved reflection can be evaluated for a structured Thought Snapshot.

A snapshot contains:

a position statement;

a topic;

tags;

retention information.

The user chooses:

Accept
Edit & Accept
Reject

Only accepted snapshots become reusable AI memory.

This creates a deliberate boundary between:

AI-generated interpretation
        ≠
Approved reusable memory

That distinction is one of the core design ideas behind MirrorTrace.

🔄 Thought Diffs

Thought Diffs compare related approved Thought Snapshots from different moments in time.

A valid comparison can surface:

earlier position;

later position;

apparent shift;

apparent continuity;

relationship assessment;

provenance.

MirrorTrace does not compare snapshots blindly. Candidate matching uses topic and tag relationship checks before Gemini is asked to evaluate whether enough evidence exists.

The result is closer to version control for human thinking than a normal journal archive.

🔎 Provenance

Every meaningful comparison should be inspectable.

MirrorTrace connects Thought Diffs back to their source evidence through provenance records containing:

earlier snapshot;

later snapshot;

earlier journal;

later journal;

timestamps;

excerpts;

source positions.

Controls such as “Why am I seeing this?” help the user inspect the evidence behind the AI-generated comparison.

📚 Journal History & Reflection Workspace

<p align="center">
  <img src="./docs/images/User%20Journal%20History.jpeg" alt="MirrorTrace Journal History and Reflection Workspace" width="100%">
</p>

Journal History turns private entries into a structured personal reasoning record.

Implemented tools include:

search;

tag filters;

date filtering;

list/calendar browsing;

favorites;

editing;

Revisit This;

Weekly Review;

Decision Ledger;

Reflection Chains;

Assumption Tracker;

Version History;

Knowledge Graph;

export;

reminder-oriented workflows.

Year in Reflection

<p align="center">
  <img src="./docs/images/Reflection%20Wrap.jpeg" alt="MirrorTrace Year in Reflection summary" width="100%">
</p>

Year in Reflection summarizes only information already present in the user’s saved data.

It can surface:

reflection count;

approved memories;

Thought Diffs;

most active period;

revisited topics.

It is designed as a factual reflection summary rather than a psychological or mood inference system.

🛡️ Memory Governance Center

<p align="center">
  <img src="./docs/images/User%20Memory%20Governance.jpeg" alt="MirrorTrace Memory Governance Center" width="100%">
</p>

Memory Governance is the control plane for everything MirrorTrace is allowed to reuse as reflective memory.

Users can inspect and manage:

approved memories;

memory-retention state;

expiring memories;

Thought Diffs;

provenance;

Perspective Watches;

reminder delivery;

memory export;

memory revocation.

Perspective Watch

Perspective Watch lets the user intentionally schedule a future revisit.

The system does not silently decide which belief deserves follow-up.

The user chooses:

what to watch;

when to revisit it;

whether reminder delivery is enabled.

👥 MirrorRoom

Consent-Based Collaborative Reflection

<p align="center">
  <img src="./docs/images/MirrorRoom%20.jpeg" alt="MirrorRoom create and join experience" width="100%">
</p>

Think privately. Share deliberately.

MirrorRoom is a temporary collaborative reasoning environment, not a shared journal.

Capabilities

create a temporary room;

join using an invite code;

copy invite links;

choose display-name behavior;

explicitly share a thought;

view participants;

generate a factual room summary;

save only your own takeaway;

host-only closing;

expiry;

server-side membership validation.

Privacy Boundary

MirrorRoom does not automatically read or import:

Private Journal Entries
Thought Snapshots
Thought Diffs
Provenance
Private Gemini Conversations
Reusable AI Memory
Saved Private Takeaways

Only text deliberately submitted through the room contribution flow enters collaborative scope.

🧑‍💻 Admin Control Room

<p align="center">
  <img src="./docs/images/Admin%20Dashboard.jpeg" alt="MirrorTrace Admin Control Room security and operations overview" width="100%">
</p>

The Admin Control Room provides operational visibility while maintaining a visible privacy boundary.

It surfaces aggregate information such as:

registered users;

Thought Snapshot counts;

Thought Diff counts;

active watches;

push devices;

authorization state;

privacy-boundary status.

The administrator is not automatically granted unrestricted journal visibility.

Service Health & Aggregate Activity

<p align="center">
  <img src="./docs/images/Admin%20Dashboard%202.jpeg" alt="MirrorTrace Admin service health and aggregate activity" width="100%">
</p>

The operations dashboard can verify:

Firebase Auth;

Firestore;

Gemini configuration;

SMTP configuration;

FCM;

scheduler configuration;

aggregate reflection infrastructure;

minimized account metadata.

This gives operational insight without turning the dashboard into a private-content inspection tool.

🆘 Support & Feedback

MirrorTrace also includes user-facing support and feedback workflows.

Customer Support

Users explicitly submit the information they want administrators to receive.

Private journal history is not automatically attached to support requests.

Feedback & Public Reviews

Public review display is designed around:

explicit display consent;

moderation status;

admin approval.

🤖 TraceBot

TraceBot is the public product guide.

It explains:

what MirrorTrace does;

how navigation works;

Thought Snapshots;

Thought Diffs;

provenance;

Memory Governance;

Perspective Watch;

MirrorRoom;

Support and Feedback;

the privacy model.

TraceBot is separate from the authenticated Reflective Brainstorm Companion.

🔐 Security Architecture

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
    AUTH --> API[Express / TypeScript Backend]
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

🧩 MirrorRoom Lifecycle

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

☁️ Google Cloud & Gemini Usage

Service

MirrorTrace use

Firebase Authentication

Google Sign-In and authenticated identity

Cloud Firestore

Journals, conversations, approved memory, Thought Diffs, provenance, watches, rooms, support, feedback

Gemini API

Multi-turn reflective conversation, Thought Snapshot generation, Thought Diff evaluation

Firebase Admin SDK

Server-side token verification and privileged backend operations

Google Cloud Secret Manager

Secure production Gemini credential storage / injection

Google Cloud Run

Production deployment target

⚙️ Key Engineering Decisions

Challenge

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

Server Firebase

Firebase Admin SDK

Generative AI

Google Gemini

Deployment

Google Cloud Run

Secrets

Google Cloud Secret Manager

Icons

Lucide React

📡 Key API Surface

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
├── docs/
│   └── images/
│       ├── Admin Dashboard.jpeg
│       ├── Admin Dashboard 2.jpeg
│       ├── MirrorRoom .jpeg
│       ├── Quick Actions.jpeg
│       ├── Reflection Wrap.jpeg
│       ├── Sign in page.jpeg
│       ├── Target Audience.jpeg
│       ├── User Journal History.jpeg
│       ├── User Memory Governance.jpeg
│       ├── User Overview.jpeg
│       └── User Reflective Space.jpeg
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
│   │   ├── mirrortrace-app.css
│   │   └── mirrortrace-public.css
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

Use the project’s .env.example as the reference for required server and Firebase configuration.

Do not commit .env or service-account credentials.

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

gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

Grant the Cloud Run runtime service account access:

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_RUNTIME_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

Then bind the secret to the Cloud Run revision.

Submission note: verify the deployed Cloud Run revision is actually using Secret Manager before selecting the challenge’s Secret Manager checkbox.

☁️ Cloud Run Deployment

MirrorTrace is designed for Google Cloud Run.

After deployment, apply the required challenge label:

gcloud run services update YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --update-labels=dev-tutorial=cloud-run-ai-challenge

Verify it:

gcloud run services describe YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --format="value(metadata.labels)"

✅ Submission Readiness Checklist

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

Normal user cannot access admin APIs

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

Challenge

Cloud Run URL is public and working

Required Cloud Run label is present

GitHub repository is public

README screenshots render correctly

Social post contains #AccelerateAIwithCloudRun

Every submitted URL opens in incognito

🎯 What Makes MirrorTrace Different

1. AI memory requires explicit consent

A Gemini-generated interpretation does not silently become reusable memory.

2. It models perspective change over time

Thought Snapshots and Thought Diffs create a longitudinal reasoning layer.

3. AI comparisons are inspectable

Provenance connects generated comparisons back to approved source evidence.

4. Collaboration does not require surrendering private history

MirrorRoom creates a temporary selective reasoning layer.

5. Administration is separated from private reflection

Operational visibility does not automatically imply private-content visibility.

6. The user remains the authority

Users can reject, edit, retain, export, and revoke AI memory.

📊 What This Project Demonstrates

MirrorTrace brings together:

full-stack TypeScript engineering;

Firebase Authentication;

Cloud Firestore data modeling;

Gemini integration;

consent-aware AI memory;

provenance;

longitudinal reasoning;

privacy boundaries;

collaborative workflows;

server-side authorization;

operational administration;

Cloud Run deployment readiness;

production verification.

🌱 Future Roadmap

Potential extensions include:

Phase 1 — Current Submission
Consent-governed reflective AI
Thought Snapshots
Thought Diffs
Provenance
MirrorRoom
Memory Governance

Phase 2 — Memory Intelligence
Semantic retrieval across approved memory
Richer retention controls
Cross-topic reasoning summaries

Phase 3 — Team & Organization Use
Organization-level RBAC
Shared governed workspaces
Expanded moderation and audit telemetry

Phase 4 — Production Scale
Cloud Scheduler / Tasks
Structured observability
Accessibility audits
Advanced export / portability

⚠️ Scope

MirrorTrace is a reflective intelligence application and not a medical, psychological, diagnostic, or therapeutic system.

Its purpose is to help users articulate, revisit, and compare their own reasoning while keeping them in control of reusable AI memory.

👩‍💻 Author

Agrima Saxena

Solo Developer · Full-Stack Engineering · AI/ML · Cloud · Security




Built independently for the Google Cloud Gen AI Academy APAC Edition Ideathon / Cloud Run Build & Deploy Social Challenge.

<div align="center">

MirrorTrace is not trying to remember everything.

It is trying to remember only what the user deliberately permits.

Private reflection · Consent-governed memory · Evidence-backed change · Selective collaboration

⭐ If you find the project interesting, consider starring the repository.

</div>