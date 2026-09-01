# MirrorRoom — Force Export Compatibility Fix

This package is intentionally safer than replacing the whole client library.

Your runtime error is:

```text
ReflectionRoomLauncher.tsx:
The requested module '/src/lib/reflectionRooms.ts'
does not provide an export named 'buildMirrorRoomSummary'
```

The script inspects your **actual current** `src/lib/reflectionRooms.ts` and only
adds the missing compatibility export if needed. It preserves every other
MirrorRoom function already in your project.

## Run from the MirrorTrace project root

```powershell
node .\scripts\force-mirrorroom-summary-export.mjs
node .\scripts\verify-mirrorroom-runtime.mjs
```

You need:

```text
PASS  reflectionRooms.ts exports buildMirrorRoomSummary
```

## Clear the Vite module cache

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
```

Then stop the currently running server with:

```text
Ctrl+C
```

and restart:

```powershell
npm run dev
```

Then hard refresh Chrome:

```text
Ctrl + Shift + R
```

## Direct on-disk check

```powershell
Select-String -Path .\src\lib\reflectionRooms.ts -Pattern "buildMirrorRoomSummary|getMirrorRoomSummary"
```

If `buildMirrorRoomSummary` appears in PowerShell but Chrome still says the
module does not export it, the browser is not being served from the same project
copy or a stale dev server is still running.

To confirm the active directory:

```powershell
Get-Location
```

It should be your intended MirrorTrace project root before `npm run dev`.
