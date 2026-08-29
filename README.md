# 🪞 MirrorTrace

### User-Governed AI Memory & Perspective Intelligence

**Version control for your thinking — with consent, provenance, security boundaries, and user-controlled AI memory.**

**React + TypeScript** · **Gemini** · **Firebase Authentication** · **Cloud Firestore** · **Google Cloud Run** · **Secret Manager** · **FCM** · **SMTP** · **RBAC**

> Built for the **Gen AI Academy APAC Edition / Cloud Run AI Challenge**.

---

## 🚀 What MirrorTrace Does

AI assistants are becoming long-lived companions, coaches, copilots, and knowledge tools. That creates a new problem:

> **What happens when an AI remembers the wrong thing about you — and you cannot inspect, correct, revoke, or trace that memory?**

Most journaling and conversational AI products optimize for generation. MirrorTrace focuses on the layer that comes after generation: **governed memory**.

MirrorTrace lets a user:

- write private reflections or brainstorm with Gemini
- receive a **Suggested Thought Snapshot**
- explicitly **approve, edit, or reject** what may become reusable AI memory
- compare related approved memories through **Thought Diffs**
- inspect **why** a comparison was generated through provenance
- revoke approved memory
- run a **Private Session** with zero persistence
- schedule **Perspective Watches** to revisit a belief later
- receive optional browser push / email reminders
- export governed memory
- submit support requests without silently attaching private journal content
- submit public product reviews only through explicit consent and moderation

The product principle is simple:

> **AI can suggest what a reflection means. The user decides what the system is allowed to remember.**

---

## 🎯 The Problem

Long-term AI systems introduce four trust failures.

### 1. Silent memory formation

A model may infer a preference, goal, belief, or identity from one conversation and silently treat it as persistent truth.

### 2. No provenance

Users often cannot answer:

> “Why does the AI think this about me?”

### 3. No memory governance

Users may be unable to inspect, edit, expire, export, or revoke model memory.

### 4. Cross-context trust risk

A system that mixes private reflections, support messages, administrative access, and public content without strong boundaries can become dangerous very quickly.

MirrorTrace treats these as product requirements rather than afterthoughts.

---

## 💡 Why This Is More Than a Journal

MirrorTrace is a prototype for **consent-bound longitudinal AI memory**.

The same architecture can be applied to:

- AI coaching platforms
- career development systems
- leadership reflection tools
- learning journals
- personal knowledge systems
- wellbeing / reflection products
- enterprise copilots that retain user context
- mentoring platforms
- long-running agentic assistants

A journal is the safest environment for demonstrating the idea because the data is personal, longitudinal, and highly sensitive.

The broader product question is:

> **Can an AI system become more useful over time without becoming less accountable?**

MirrorTrace explores one answer.

---

## 🧩 Core User Journey

```text
Private Reflection
       |
       v
Gemini assists / summarizes
       |
       v
Suggested Thought Snapshot
       |
       +------ Reject ------> discarded
       |
       +------ Edit --------> user-controlled correction
       |
       +------ Approve -----> governed AI memory
                                   |
                         related memory retrieval
                                   |
                                   v
                              Thought Diff
                                   |
                    +--------------+--------------+
                    |                             |
                    v                             v
              What Changed                What Stayed Stable
                    |
                    v
              Provenance Evidence
                    |
                    v
        Perspective Watch / Future Revisit
```

---

## ✨ Original Feature Enhancements

### 🧠 Consent-Bound Thought Snapshots

Gemini may suggest an interpretation, but suggestions remain **pending** until the user explicitly approves them.

### 🔀 Thought Diffs

Related approved snapshots can be compared over time to show:

- earlier stance
- current stance
- apparent shift
- apparent continuity

### 🔎 “Why am I seeing this?”

Generated comparisons remain traceable to authenticated source records.

### 🕶️ Private Session

A user can reflect without creating:

- journal persistence
- AI memory
- future Thought Diffs

### ⏰ Perspective Watch

A user may intentionally schedule a future revisit of an idea and opt into reminder delivery.

### 🧠 Memory Governance Center

Users can inspect:

- approved memories
- retention
- expiry
- active watches
- export
- revocation

### 🔔 Push + Email Delivery

Perspective Watch supports optional browser push and SMTP email reminders.

### 🛡️ Security & Operations Control Room

RBAC separates operational administration from private journal visibility.

Admins receive aggregate operational visibility without becoming readers of private user memory.

### 💬 Customer Support Boundary

Support receives only content explicitly submitted through the support form.

MirrorTrace does **not** automatically attach journal entries or AI conversations.

### ⭐ Consent-Based Public Reviews

A review becomes publicly eligible only when:

1. the user explicitly opts into public display, and
2. an administrator approves it.

---

## 🏗️ System Architecture

```text
                         Browser / React UI
                                |
                     Firebase Google Sign-In
                                |
                         Firebase ID Token
                                |
                                v
                    +------------------------+
                    |   Cloud Run Backend    |
                    | Express / TypeScript   |
                    +-----------+------------+
                                |
          +---------------------+----------------------+
          |                     |                      |
          v                     v                      v
      Gemini API           Cloud Firestore       Firebase Admin
          |                     |                      |
          |              /users/{uid}/...       token verification
          |                     |
          |                     +--> journals
          |                     +--> conversations
          |                     +--> thoughtSnapshots
          |                     +--> thoughtDiffs
          |                     +--> watches
          |
          +--> suggested interpretations / comparison reasoning

Additional server-side services:
  Secret Manager
  SMTP / Nodemailer
  Firebase Cloud Messaging
  Perspective Watch processor
  RBAC / Admin audit log
```

---

## 🔐 Security Architecture

MirrorTrace was designed around a deny-by-default threat model.

### Owner-Bound Data Isolation

Private application data remains scoped to the authenticated Firebase UID.

```text
/users/{uid}/...
```

The client cannot select another owner ID to gain access to private records.

### Server-Verified Authentication

Protected API requests carry a Firebase ID token.

The server verifies the token before performing user-bound operations.

### API Keys Stay Server-Side

Gemini credentials and delivery credentials are not exposed to the browser.

Production secrets are intended to be supplied through **Google Cloud Secret Manager / environment configuration**.

### Admin UI Is Not the Security Boundary

Admin permissions are enforced on backend routes.

Hiding a button in React is never treated as authorization.

### Role Source of Truth

Administrative authorization is based on verified Firebase custom claims:

```text
user
admin
super_admin
```

### Admins Do Not Automatically Read Private Memory

The operations dashboard exposes:

- system health
- aggregate counts
- masked identifiers
- support content intentionally submitted by users
- reviews intentionally submitted for moderation
- audit events

It does not automatically expose:

- private journal text
- private Gemini conversations
- Thought Snapshot contents
- Thought Diff provenance
- other users' private memory

### Moderation Auditability

Elevated administrative mutations can be recorded in an audit trail.

---

## 🧠 AI Memory Model

MirrorTrace separates four concepts that many AI applications collapse into one.

```text
Raw Reflection
     |
     v
AI Suggestion
     |
     v
User Approval
     |
     v
Reusable Memory
     |
     v
Evidence-Backed Comparison
```

This prevents a model-generated interpretation from silently becoming equivalent to user-authored truth.

---

## 🔎 Retrieval & Grounding

MirrorTrace already uses **user-scoped retrieval and provenance** to reconnect generated comparisons to authenticated historical records.

For judging, describe the current implementation precisely:

> “MirrorTrace retrieves the signed-in user’s governed historical reflection records and uses that evidence to produce traceable longitudinal comparisons.”

Do **not** claim a vector-database RAG pipeline unless semantic retrieval / embeddings are actually implemented in the backend.

### Planned RAG Upgrade

A production RAG version can rank prior approved memories using semantic similarity and inject the top relevant evidence into Gemini with source IDs.

```text
New Reflection
      |
      v
User-Scoped Retrieval
      |
      v
Top Relevant Approved Memories
      |
      v
Gemini Grounded Reasoning
      |
      +--> response
      +--> Thought Snapshot
      +--> Thought Diff
      +--> source citations
```

This upgrade strengthens continuity while preserving the same owner-bound authorization boundary.

---

## ☁️ Google Cloud & Firebase

| Layer | Technology | Why It Is Used |
|---|---|---|
| Authentication | Firebase Authentication | Google Sign-In and verified user identity |
| Data | Cloud Firestore | user-isolated journal, memory, diff and watch persistence |
| AI | Gemini API | brainstorming, structured reflection and comparison reasoning |
| Runtime | Google Cloud Run | production container runtime for frontend/backend |
| Secrets | Google Cloud Secret Manager | server-side API / delivery credentials |
| Notifications | Firebase Cloud Messaging | browser push delivery |
| Email | SMTP via backend | Perspective Watch email reminders |
| Administration | Firebase custom claims + backend RBAC | server-enforced elevated authorization |

---

## 🧪 Threat Model Highlights

| Threat | MirrorTrace Mitigation |
|---|---|
| Cross-user journal access | UID-bound routes + Firestore isolation |
| Client-side role spoofing | server-verified custom claims |
| Gemini key exposure | server-side secret handling |
| Silent AI memory | explicit Snapshot approval |
| Unsupported AI comparison | provenance back to source records |
| Admin overreach | operations dashboard excludes private memory content |
| Support data leakage | only explicitly submitted support text is visible |
| Accidental public review | public consent + moderation required |
| Revoked auth token | backend verification / revocation-aware checks |
| Notification leakage | Perspective Watch uses safe topic-level reminder context |

---

## 📊 Practical & Business Impact

MirrorTrace is not positioned as “another journaling app.”

It is a **trust layer for persistent AI memory**.

### User Impact

Users gain:

- visibility into what an AI remembers
- explicit consent over persistent interpretations
- evidence for generated conclusions
- the ability to revoke memory
- a chronological picture of how thinking changes

### Product Impact

For companies building long-lived AI assistants, this architecture can improve:

- user trust
- explainability
- privacy posture
- retention controls
- supportability
- regulatory readiness
- willingness to enable persistent personalization

### Enterprise Extension

The same governance pattern can support:

```text
Employee Copilot
      |
      v
Suggested Persistent Preference
      |
      v
Employee Approval
      |
      v
Governed Profile Memory
      |
      v
Auditable Personalized Assistance
```

That turns MirrorTrace from a journal feature into a reusable architecture for **accountable personalization**.

---

## 🏆 Why MirrorTrace Goes Beyond the Starter Challenge

The baseline challenge asks for:

- authentication
- Gemini interaction
- isolated Firestore data
- secure key management
- at least one enhancement

MirrorTrace extends the foundation with a full memory-governance model:

- explicit AI-memory approval
- Thought Diffs
- provenance
- Private Session
- Perspective Watch
- push notifications
- email reminders
- memory export and revocation
- RBAC
- operational admin dashboard
- audit logging
- customer support isolation
- consent-based review moderation

The originality is not “AI journaling.”

The originality is:

> **Treating AI memory itself as a user-governed, inspectable, revocable data product.**

---

## 🎓 Gen AI Academy / Cohort Learnings Applied

MirrorTrace turns the challenge's production lessons into application architecture:

- authenticated AI instead of anonymous demo access
- user-isolated Firestore paths
- server-side secret handling
- Cloud Run as the production runtime
- explicit threat modeling before feature implementation
- backend authorization instead of UI-only checks
- resilient external integrations
- auditable privileged operations
- grounded AI memory instead of opaque long-term context

Google AI Studio was used as an agentic development assistant under explicit secure-development instructions, while VS Code was used for iterative implementation, debugging, testing, and production hardening.

That workflow preserves the purpose of the challenge: **use AI-assisted development without outsourcing security decisions to the model.**

---

## 🧰 Tech Stack

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

---

## 📁 Repository Structure

```text
MirrorTrace/
├── public/
│   ├── firebase-messaging-sw.js
│   └── ui/
│       └── mirrortrace3.jpeg
│
├── scripts/
│   ├── bootstrapAdmin.ts
│   └── setAdminRole.ts
│
├── server/
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
│   └── supportReviewRoutes.ts
│
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminPanelLauncher.tsx
│   │   ├── AuthView.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── MemoryGovernanceCenter.tsx
│   │   ├── ProductReviews.tsx
│   │   ├── SupportCenter.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── admin.ts
│   │   ├── api.ts
│   │   ├── firebase.ts
│   │   ├── notifications.ts
│   │   └── supportReviews.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── firestore.rules
├── package.json
├── server.ts
└── README.md
```

---

## ⚙️ Run Locally

### 1. Clone

```bash
git clone https://github.com/agcodes0315/Gen-AI-APAC-Ideathon.git
cd Gen-AI-APAC-Ideathon
```

### 2. Install

```bash
npm install
```

### 3. Configure Environment

Create a local `.env` using `.env.example`.

Never commit:

- Gemini API keys
- Firebase service-account credentials
- SMTP passwords
- scheduler secrets
- ID tokens

### 4. Authenticate Local Google Cloud ADC

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

### 5. Run

```bash
npm run dev
```

---

## ☁️ Cloud Run Deployment

MirrorTrace is designed to run as one Cloud Run service containing the Vite frontend and Express backend.

Typical production flow:

```text
GitHub / local source
      |
      v
Production build
      |
      v
Cloud Run
      |
      +--> Secret Manager
      +--> Firestore
      +--> Firebase Auth
      +--> Gemini
```

After deployment:

1. verify Google Sign-In
2. verify Firestore persistence
3. verify UID isolation
4. verify Gemini server calls
5. verify admin authorization
6. verify support / moderation boundaries
7. add the Cloud Run domain to Firebase Authentication authorized domains
8. apply the challenge label:

```text
dev-tutorial=cloud-run-ai-challenge
```

---

## ✅ Submission Demo Checklist

A strong judging walkthrough should demonstrate this sequence:

```text
1. Google Sign-In
2. Write a private reflection
3. Gemini proposes a Thought Snapshot
4. Reject one suggestion to prove AI does not control memory
5. Approve / edit another suggestion
6. Open Memory Governance Center
7. Show the approved record
8. Create a second related reflection
9. Show a Thought Diff
10. Click "Why am I seeing this?"
11. Show source provenance
12. Schedule a Perspective Watch
13. Show push / email capability
14. Open Admin Control Room
15. Show aggregate operations without private journal visibility
16. Show consent-based review moderation
17. Revoke a memory
```

The most important moment is **Step 4**.

A judge should visibly see the AI suggest something and the human reject it.

That proves the central product claim instead of merely describing it.

---

## 🎤 30-Second Judge Pitch

> Most AI products ask users to trust what the model remembers. MirrorTrace reverses that relationship. Gemini can help interpret a reflection, but nothing becomes reusable memory until the user approves it. When perspectives change, MirrorTrace creates an evidence-backed Thought Diff and lets the user inspect the source records behind it. Memory can be revoked, exported, or used for a scheduled future revisit. The entire system runs behind Firebase authentication, owner-isolated Firestore paths, server-side secrets, and Cloud Run. MirrorTrace is not just an AI journal — it is a prototype for accountable long-term AI memory.

---

## 📣 Suggested Social Post

**I built MirrorTrace for #AccelerateAIwithCloudRun — version control for your thinking.**

Most AI assistants remember context for us. MirrorTrace asks a different question:

**Should an AI be allowed to decide what it remembers about you?**

With MirrorTrace:

- Gemini may suggest a Thought Snapshot
- you approve, edit, or reject it
- only approved interpretations become reusable memory
- related memories become evidence-backed Thought Diffs
- every comparison can be traced back to its source
- memory can be revoked or exported
- Private Session creates zero persistent memory
- Perspective Watch lets you intentionally revisit a belief later

Behind the interface:

**Firebase Auth + Cloud Firestore + Gemini + Secret Manager + Cloud Run + FCM + server-side RBAC**

Admins can operate the platform without automatically becoming readers of users' private journals.

The project started from the Personal Gemini Journal challenge, then evolved into an experiment in **user-governed AI memory and accountable personalization**.

#GenAI #GoogleCloud #GenAIAcademyAPAC #APACDevelopers #CloudRun #Gemini #Firebase #ResponsibleAI #AccelerateAIwithCloudRun

---

## ⚠️ Scope

MirrorTrace is a prototype.

It should not be described as a clinical or therapeutic system and is not a substitute for professional mental-health support.

The project demonstrates:

- governed AI memory
- longitudinal reflection
- secure authenticated AI
- explainable retrieval
- provenance
- revocable personalization
- privacy-aware operations

---

## 🌱 Next Steps

High-value extensions include:

- semantic RAG over approved memories only
- vector similarity with source citations
- evaluation of Thought Diff faithfulness
- prompt-injection testing
- automated security regression tests
- retention policy automation
- organization / workspace tenancy
- enterprise consent policies
- structured memory schema versioning
- analytics over aggregate, non-content operational metadata

---

## 👩‍💻 Author

### Agrima Saxena

**Applied AI · Secure AI Systems · Full-Stack Engineering · Responsible AI**

---

### AI memory should become more useful without becoming less accountable.

**MirrorTrace makes persistent AI context inspectable, consent-bound, traceable, and revocable.**
