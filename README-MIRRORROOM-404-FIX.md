# MirrorRoom 404 Server Mount Fix

Your PowerShell check returned no `reflectionRoomRouter` matches while:

```powershell
Test-Path .\server\reflectionRoomRoutes.ts
```

returned `True`.

That means the backend route file exists, but `server.ts` is not importing or
mounting it. As a result, the frontend POST to `/api/mirror-rooms` receives 404.

## Apply

From the MirrorTrace project root:

```powershell
node .\scripts\mount-reflection-room-router.mjs
```

The script:

- checks that `server.ts` exists;
- checks that `server/reflectionRoomRoutes.ts` exists;
- adds the complete import:
  `import { reflectionRoomRouter } from './server/reflectionRoomRoutes.ts';`
- mounts:
  `app.use(reflectionRoomRouter);`
- places the mount before Vite/static SPA handling;
- will not duplicate either line;
- creates:
  `server.ts.before-mirrorroom-mount.bak`
  before modifying the file.

## Verify

```powershell
Select-String -Path .\server.ts -Pattern "reflectionRoomRouter"
```

You should now see two matches: one import and one `app.use(...)`.

Then fully restart the backend:

```powershell
npm run lint
npm run dev
```

Open:

```text
http://localhost:3000
```

Sign in, open MirrorRoom, and create a room again.

## Expected network result

Instead of:

```text
POST /api/mirror-rooms 404
```

you should receive a successful JSON response from the MirrorRoom router.

## Git

After testing successfully:

```powershell
git add .; git commit -m "Mount MirrorRoom backend router"; git pull --rebase origin main; git push origin main
```
