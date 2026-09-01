# MirrorRoom 404 — definitive server wiring fix

Your browser opening:

```text
http://localhost:3000/api/mirror-rooms/ping
```

and showing the React application proves the request is falling through to the
Vite SPA handler.

That means the Express MirrorRoom router is not mounted before the SPA fallback
in the server process serving port 3000.

This package fixes only `server.ts` wiring. It does not replace your
MirrorRoom UI/client/backend route implementation.

## 1. Run the wiring repair

From:

```text
C:\Users\Lenovo\Desktop\MirrorTrace AI
```

run:

```powershell
node .\scripts\wire-mirrorroom-before-vite.mjs
```

## 2. Verify source wiring

```powershell
Select-String -Path .\server.ts -Pattern "reflectionRoomRouter" -Context 1,1
```

You must see exactly one import and one mount.

## 3. Kill stale processes on both dev ports

```powershell
Get-NetTCPConnection -LocalPort 3000,24678 -ErrorAction SilentlyContinue |
Select-Object -ExpandProperty OwningProcess -Unique |
ForEach-Object {
  Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
}
```

## 4. Clear Vite cache and restart

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run dev
```

Keep this terminal running.

## 5. Test the backend directly

In a SECOND PowerShell window:

```powershell
curl.exe -i http://localhost:3000/api/mirror-rooms/ping
```

Expected:

```text
HTTP/1.1 200 OK
Content-Type: application/json
```

and JSON:

```json
{"ok":true,"service":"MirrorRoom API","mounted":true}
```

If the browser renders MirrorTrace at `/api/mirror-rooms/ping`, the API router
is still not part of the server process listening on port 3000.
