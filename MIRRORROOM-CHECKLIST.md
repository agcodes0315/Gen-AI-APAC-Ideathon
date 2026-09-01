# MirrorRoom Verification Checklist

## Build & integration

- [ ] `server/reflectionRoomRoutes.ts` exists.
- [ ] `src/lib/reflectionRooms.ts` exists.
- [ ] `src/types/reflectionRooms.ts` exists.
- [ ] `src/components/ReflectionRoomLauncher.tsx` exists.
- [ ] `reflectionRoomRouter` is mounted before Vite fallback handling.
- [ ] `<ReflectionRoomLauncher />` renders only inside the authenticated application.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Authentication

- [ ] Anonymous users cannot create a room.
- [ ] Anonymous users cannot join a room.
- [ ] Invalid Firebase tokens receive 401.
- [ ] Authenticated users can create a room.
- [ ] Authenticated users can join a valid open room.

## Privacy boundary

- [ ] Creating a room does not read journal history.
- [ ] Joining a room does not expose journal history.
- [ ] Joining a room does not expose Thought Snapshots.
- [ ] Joining a room does not expose Thought Diffs.
- [ ] Joining a room does not expose provenance.
- [ ] Joining a room does not expose Gemini conversations.
- [ ] Joining a room does not expose reusable AI memory.
- [ ] Text typed locally is not shared until **Share this thought** is pressed.
- [ ] Only explicitly shared room contributions appear to other participants.
- [ ] A participant who has not joined the room receives 403 for room content.
- [ ] Direct client Firestore access to `mirrorRooms` is denied.
- [ ] Saving a takeaway writes only to the signed-in user's own journal.

## Invite flow

- [ ] Room receives a random invite code.
- [ ] Invite code can be copied.
- [ ] Wrong invite code returns a clear error.
- [ ] Expired room cannot be joined.
- [ ] Closed room cannot be joined.
- [ ] Existing participant can reopen the room without duplicate participant count.

## Identity controls

- [ ] Named mode shows only the selected room display name.
- [ ] Anonymous mode does not reveal the user's email in the room UI.
- [ ] Participant list contains only room-facing identity information.
- [ ] Private Firebase UID is never displayed as a participant name.

## Contribution controls

- [ ] Empty contributions are rejected.
- [ ] Contribution length is bounded.
- [ ] Contribution author is derived from authenticated membership.
- [ ] User cannot impersonate another room participant through the API.
- [ ] Shared board contains no automatically imported journal text.

## Summary

- [ ] Factual summary works with Gemini completely disabled.
- [ ] Summary includes only explicitly shared room contributions.
- [ ] Summary does not access private user namespaces.
- [ ] Summary clearly states that it is based on shared room content.
- [ ] Future AI summary work is blocked until a separate privacy review is completed.

## Save my takeaway

- [ ] User chooses the takeaway text manually.
- [ ] Saving does not copy the full room automatically.
- [ ] Saving does not copy another user's private data.
- [ ] New entry is stored under `users/{authenticatedUid}/journals`.
- [ ] Saved entry is tagged as originating from MirrorRoom.
- [ ] Other participants cannot read the saved private entry.

## Room lifecycle

- [ ] Host can close the room.
- [ ] Non-host cannot close the room.
- [ ] Room expiration is enforced server-side.
- [ ] Closed rooms reject new shared contributions.
- [ ] Expired rooms reject new shared contributions.

## Two-account isolation test

### Account A

- [ ] Create room.
- [ ] Type a private draft and do not share it.
- [ ] Verify Account B cannot see the draft.
- [ ] Share exactly one selected thought.

### Account B

- [ ] Join the room.
- [ ] See only Account A's explicitly shared thought.
- [ ] Share a different thought.
- [ ] Save a personal takeaway.
- [ ] Confirm Account A cannot see Account B's saved private takeaway.

## Production

- [ ] Deploy updated Firestore rules.
- [ ] Deploy backend containing `reflectionRoomRouter`.
- [ ] Test room creation on production URL.
- [ ] Test join from a second device/browser profile.
- [ ] Test expiration.
- [ ] Test host close.
- [ ] Test anonymous mode.
- [ ] Test named mode.
- [ ] Test private takeaway persistence.
- [ ] Confirm browser console has no application-breaking errors.
- [ ] Confirm no private journal content appears in backend logs.
