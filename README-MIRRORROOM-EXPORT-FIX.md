# MirrorRoom export compatibility fix

## Error fixed

```text
ReflectionRoomLauncher.tsx:
The requested module '/src/lib/reflectionRooms.ts'
does not provide an export named 'buildMirrorRoomSummary'
```

The UI expects `buildMirrorRoomSummary`, while the previous client library only
exported `getMirrorRoomSummary`.

This replacement keeps **both** exports and routes both names to the same
factual `/api/mirror-rooms/:roomId/summary` endpoint.

No Gemini call is introduced.

## Replace

Replace only:

```text
src/lib/reflectionRooms.ts
```

with the file included in this package.

## Restart

```powershell
npm run lint
npm run dev
```

Then hard-refresh Chrome:

```text
Ctrl + Shift + R
```

## Verify export

```powershell
Select-String -Path .\src\lib\reflectionRooms.ts -Pattern "buildMirrorRoomSummary|getMirrorRoomSummary"
```

Both names should appear.
