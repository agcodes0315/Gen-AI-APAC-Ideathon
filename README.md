# MirrorTrace — Evidence-First Reflective Journal & Thought Diff

MirrorTrace is a personal reflection platform built on Google Cloud Run, Firebase Firestore, and the Gemini API via `@google/genai`. It helps individuals understand the evolution of their thoughts over time through evidence-grounded **Thought Diffs** with zero psychological diagnosis, zero prompt injection vulnerability, and strict cryptographic UID isolation.

---

## 1. Prerequisites & Environment Setup

1. **Google Cloud SDK**: Install and initialize `gcloud`:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```
2. **Enable Required Google Cloud APIs**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com
   ```
3. **Node.js**: Version 20.x or higher.

---

## 2. Secret Manager Configuration

MirrorTrace follows a zero-hardcoding security standard. The operational `GEMINI_API_KEY` is loaded dynamically from Google Cloud Secret Manager or runtime environment variables and is never exposed to the client.

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

echo -n "YOUR_GEMINI_API_KEY" | \
gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant your Cloud Run service account access
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_CLOUD_RUN_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Firestore Security Rules

Deploy the owner-bound Firestore security rules to guarantee complete cross-user data isolation:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // User-owned collections strictly isolated by verified Firebase UID
    match /users/{userId}/{document=**} {
      allow read, write:
        if request.auth != null &&
           request.auth.uid == userId;
    }
  }
}
```

---

## 4. Cloud Run Deployment

Build and deploy the application container to Google Cloud Run:

```bash
# Build & Deploy to Cloud Run
gcloud run deploy mirrortrace \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### Mandatory Campaign Verification Labeling

```bash
gcloud run services update mirrortrace \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 5. Security & Architectural Model

- **Authentication Boundary**: All endpoints require a cryptographically verified Firebase ID token via the Firebase Admin SDK. UIDs are never trusted from client payloads or request URLs.
- **Evidence-First Thought Diffs**: Diffs compare only approved earlier and later snapshots under the authenticated user's namespace (`users/{uid}/thoughtSnapshots`). Gemini is constrained by JSON schema to identify what changed and what stayed consistent without psychoanalysis.
- **Provenance & "Why Am I Seeing This?"**: Users can inspect the exact source journal excerpts and snapshot timestamps that produced each Thought Diff.
- **Cascade Deletion**: Deleting a journal entry or snapshot automatically removes dependent Thought Diffs and provenance records.
- **Private Session Mode**: Temporary reflections and brainstorming chats are held in-memory and omitted from Firestore persistence and future Thought Diff candidate sets.
