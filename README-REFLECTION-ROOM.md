# MirrorRoom — Consent-Based Collaborative Reflection

**Think privately. Share deliberately. Compare perspectives without surrendering your personal history.**

MirrorRoom is a temporary collaborative reasoning mode for MirrorTrace. It is inspired by the lightweight “join a shared session” experience of products such as Spotify Jam, but its purpose is different: it lets people reason together while preserving the private-by-default architecture of MirrorTrace.

## Why this is different

MirrorRoom does **not** make private journals collaborative.

Each participant keeps their private journal, Thought Snapshots, Thought Diffs, conversations, and reusable AI memory inside their own owner-bound Firebase namespace. A room receives only content that a participant intentionally submits through **Share this thought**.

That means the collaborative layer is a consent boundary, not a shared account.

## Included in this package

- Create a temporary room
- Random invite code
- Copyable invite link
- Join by invite code
- Named or anonymous participation
- Shared room prompt
- Explicit **Share this thought** action
- Room participant list
- Shared contribution board
- Factual room summary using only explicitly shared content
- **Save only my takeaway** into the signed-in user's private journal
- Host-only room closing
- Room expiration
- Server-side membership checks
- Direct Firestore access denied for room collections
- No automatic access to journals, Thought Snapshots, Thought Diffs, provenance, or conversation history
- No automatic cross-user AI memory

## Files

```text
server/reflectionRoomRoutes.ts
src/components/ReflectionRoomLauncher.tsx
src/lib/reflectionRooms.ts
src/types/reflectionRooms.ts
firestore.mirrorroom.rules.txt
README-REFLECTION-ROOM.md
MIRRORROOM-CHECKLIST.md
MIRRORROOM-INTEGRATION.md
```

## Privacy model

The backend never queries another participant's `users/{uid}/journals`, Thought Snapshots, Thought Diffs, or conversations when serving a room.

A room contains only:

```text
mirrorRooms/{roomId}
mirrorRooms/{roomId}/participants/{participantId}
mirrorRooms/{roomId}/contributions/{contributionId}
```

The contribution endpoint accepts only text deliberately submitted by the current authenticated user.

## AI boundary

The included version intentionally uses a **human-only factual summary** so the feature remains useful even when Gemini is unavailable.

If an AI comparison is added later, it should receive only the room's explicitly shared contributions. It must never receive private journal or reusable memory unless the individual user separately and explicitly opts in.

## Target audiences

### Students and early-career professionals
Compare internship offers, project directions, course choices, MBA-versus-work reasoning, or study strategies without exposing personal journal history.

### Working professionals
Use structured pre-meeting reflection, retrospectives, mentoring sessions, role-change discussions, and difficult tradeoffs.

### Founders and builders
Capture independent product assumptions before group discussion, compare viewpoints, and preserve a traceable decision record.

### Knowledge workers and leaders
Run private-first decision calibration: everyone thinks individually before seeing what others shared, reducing anchoring and group conformity.

## Product positioning

MirrorRoom should be described as:

> A consent-based collaborative reasoning mode where people think privately first, share selectively second, and never expose their personal MirrorTrace history by joining a room.

It should **not** be marketed as a social journal.
