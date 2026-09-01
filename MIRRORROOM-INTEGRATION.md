# MirrorRoom Integration

This package intentionally adds new self-contained files and avoids rewriting your current `App.tsx` or `server.ts`.

## 1. Mount the server router

In your current `server.ts`, import:

```ts
import { reflectionRoomRouter } from './server/reflectionRoomRoutes.ts';
```

Mount it **before Vite / SPA fallback handling**:

```ts
app.use(reflectionRoomRouter);
```

Do not mount it after the Vite catch-all route.

## 2. Render the authenticated launcher

In the authenticated portion of `src/App.tsx`, import:

```ts
import ReflectionRoomLauncher from './components/ReflectionRoomLauncher.tsx';
```

Render once near your existing `AdminPanelLauncher`:

```tsx
<ReflectionRoomLauncher />
<AdminPanelLauncher />
```

The MirrorRoom button is positioned above the Admin button so the two do not overlap.

## 3. Firestore direct-client rule

Add this before your final catch-all deny rule:

```text
match /mirrorRooms/{roomId}/{document=**} {
  allow read, write: if false;
}
```

The server uses Firebase Admin after verifying the signed-in user, so room access remains server-mediated.

## 4. Build

```powershell
npm run lint
npm run build
npm run dev
```

## 5. Test with two accounts

Open two browser profiles.

Account A:
1. Create a room.
2. Copy the invite code.
3. Write private text but do not press Share.
4. Verify Account B cannot see it.
5. Share one selected thought.

Account B:
1. Join with the code.
2. Verify only the selected shared thought appears.
3. Share a different thought.
4. Save a personal takeaway.

Then confirm the saved takeaway appears only under Account B's private journal.
