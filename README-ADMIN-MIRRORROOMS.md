# MirrorTrace Admin MirrorRoom Analytics

Replace these four files:

```text
server/reflectionRoomRoutes.ts
src/lib/adminMirrorRooms.ts
src/components/AdminMirrorRoomsPanel.tsx
src/components/AdminPanelLauncher.tsx
```

No server.ts change is required because `reflectionRoomRouter` is already mounted.

## Admin can see

- total MirrorRooms created;
- active count;
- closed/expired count;
- masked creator identity;
- masked participant identities;
- participant role (host / participant);
- created timestamp;
- expiry timestamp;
- active / closed status.

## Admin CANNOT see

The admin endpoint does not query the `contributions` subcollection.

It also never returns:

- room prompt;
- shared contribution text;
- factual summary text;
- private takeaway text;
- journal entries;
- conversations;
- Thought Snapshots;
- Thought Diffs;
- provenance;
- reusable AI memory;
- invite codes.

This preserves MirrorTrace's operational-visibility privacy boundary.

## Install

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run lint
npm run build
npm run dev
```

Then hard refresh Chrome with Ctrl+Shift+R and open the Admin Control Room.
