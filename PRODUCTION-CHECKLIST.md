# MirrorTrace Production Checklist

## A. Functional checks

### Authentication
- [ ] Google Sign-In works.
- [ ] Sign-out works.
- [ ] Refresh retains the authenticated session.
- [ ] Cancelled popup shows a friendly state.
- [ ] Second Google account can sign in independently.

### Core reflection flow
- [ ] User can save a reflection.
- [ ] Gemini can respond in multi-turn conversation.
- [ ] A failed Gemini call does not lose the journal entry.
- [ ] History survives sign-out and sign-in.

### Consent-governed AI memory
- [ ] New AI interpretation starts pending.
- [ ] Accept creates approved reusable memory.
- [ ] Edit & Accept saves the user's edited wording.
- [ ] Reject never creates reusable memory.
- [ ] Pending/rejected snapshots are never used for future comparison.

### Thought Diff + provenance
- [ ] Two related approved snapshots can produce a Thought Diff.
- [ ] Earlier stance is visible.
- [ ] Current stance is visible.
- [ ] What changed is visible.
- [ ] What stayed consistent is visible.
- [ ] "Why am I seeing this?" shows the correct source records.
- [ ] No source from another Firebase UID can appear.

### Private Session
- [ ] Private Session creates no journal entry.
- [ ] Private Session creates no conversation record.
- [ ] Private Session creates no snapshot.
- [ ] Private Session creates no Thought Diff.
- [ ] Private Session creates no Perspective Watch.

### Memory Governance
- [ ] Approved memories are listed.
- [ ] Export works.
- [ ] Revoke removes memory from reusable AI memory.
- [ ] Retention information is correct.
- [ ] Active Perspective Watches are visible.

### Perspective Watch
- [ ] User can schedule one.
- [ ] User can revoke one.
- [ ] Push registration works.
- [ ] Test push works.
- [ ] Test email works.
- [ ] Reminder contains safe topic-level context, not raw journal text.

### Support + reviews
- [ ] User can submit support ticket.
- [ ] Admin sees only explicitly submitted support text.
- [ ] User can submit review.
- [ ] Public consent is explicit.
- [ ] Pending review does not appear publicly.
- [ ] Approved + consented review appears publicly.
- [ ] Once approved, the moderation card does not continue presenting "Approve" as an active action.

## B. Security checks

### Two-account isolation test
1. Sign in as User A.
2. Create a reflection, approved memory, watch and support ticket.
3. Sign out.
4. Sign in as User B.
5. Confirm none of User A's private reflection/memory/diff/watch data is visible.
6. Attempt direct Firestore/browser calls if you have test tooling.
7. Confirm permission is denied.

### RBAC
- [ ] Normal user cannot see Admin Control Room.
- [ ] Anonymous `/api/admin/overview` returns 401/403.
- [ ] Normal user `/api/admin/overview` returns 403.
- [ ] Changing localStorage does not grant admin.
- [ ] Admin dashboard does not expose journal/chat/snapshot/diff/provenance contents.
- [ ] Super-admin-only mutations reject ordinary admin.

### Secrets
- [ ] `.env` is ignored.
- [ ] No service-account JSON is tracked.
- [ ] Gemini API key exists server-side only.
- [ ] SMTP password exists server-side only.
- [ ] Scheduler secret exists server-side only.
- [ ] No tokens are logged.

## C. UX / stability

- [ ] 1920x1080 looks correct.
- [ ] 1366x768 looks correct.
- [ ] 390px mobile looks correct.
- [ ] Landing feature rows support vertical animation AND manual horizontal browsing.
- [ ] No visible accidental horizontal page scrollbar.
- [ ] Navbar works immediately.
- [ ] Loading states exist.
- [ ] Empty states exist.
- [ ] Retry/error states exist.
- [ ] Console has no application-breaking errors.
- [ ] Favicon loads.
- [ ] Refreshing the production URL does not show a server 404.

## D. Production

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npx tsx scripts/predeployCheck.ts`
- [ ] `firebase deploy --only firestore:rules`
- [ ] Deploy Cloud Run.
- [ ] Add Cloud Run hostname to Firebase Authentication Authorized Domains.
- [ ] Test Google Sign-In on Cloud Run URL.
- [ ] Test `/api/health`.
- [ ] Inject Secret Manager secrets.
- [ ] Configure Perspective Watch scheduler.
- [ ] Add Cloud Run label:
      `dev-tutorial=cloud-run-ai-challenge`
- [ ] Run smoke test against Cloud Run URL.
- [ ] Record walkthrough only after production tests pass.
