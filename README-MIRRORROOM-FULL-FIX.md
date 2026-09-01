# MirrorRoom — Full 404 Backend Fix

## Important: MirrorRoom does NOT require a paid AI API

MirrorRoom creation, joining, sharing, participants, invite codes, expiry and the
basic room summary use your existing Firebase Authentication + Firestore backend.

It does **not** call Gemini.

The `404 /api/mirror-rooms` error means the Express backend route is unavailable,
not that credits are missing.

## Replace these files

Copy these complete files into the matching project locations:

- `server/reflectionRoomRoutes.ts`
- `src/lib/reflectionRooms.ts`
- `src/types/reflectionRooms.ts`

## Mount the router

From the project root:

```powershell
node .\scripts\mount-mirrorroom-router.mjs
```

Then verify:

```powershell
node .\scripts\verify-mirrorroom.mjs
```

You need four PASS lines.

## Restart the real server

A server-side route is not reliably installed by browser hot reload.

Stop the existing process:

```text
Ctrl+C
```

Then:

```powershell
npm run lint
npm run dev
```

## Critical diagnostic URL

Before opening the MirrorRoom UI, directly visit:

```text
http://localhost:3000/api/mirror-rooms/ping
```

You MUST see:

```json
{
  "ok": true,
  "service": "MirrorRoom API",
  "mounted": true
}
```

If that URL still returns 404, you are either:

1. running an older server process;
2. running `npm run dev` from a different project directory; or
3. mounting Vite before the API router.

## Confirm the running process/project

PowerShell:

```powershell
Get-Location
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path
```

If port 3000 is already occupied, terminate stale Node processes:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

Then start only one server:

```powershell
npm run dev
```

## Firestore

The backend uses Firebase Admin SDK, so your existing server credentials are used.
The room data lives under the top-level `mirrorRooms` collection and its
subcollections. Client-side direct Firestore access is not required.

## Git push after testing

```powershell
git add .; git commit -m "Fix MirrorRoom backend routes"; git pull --rebase origin main; git push origin main
```
