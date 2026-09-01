# MirrorRoom Canonical Contract Fix

This is the complete contract alignment for the current MirrorRoom UI.

The current `ReflectionRoomLauncher.tsx` expects these exact exports:

- `buildMirrorRoomSummary`
- `closeMirrorRoom`
- `createMirrorRoom`
- `getMirrorRoom`
- `joinMirrorRoom`
- `saveMirrorRoomTakeaway`
- `shareMirrorRoomContribution`

The earlier `src/lib/reflectionRooms.ts` did not export all of those names, and
the earlier backend used different payload names and response shapes.

Replace these three files together:

```text
src/lib/reflectionRooms.ts
src/types/reflectionRooms.ts
server/reflectionRoomRoutes.ts
```

Keep your current `src/components/ReflectionRoomLauncher.tsx`.

Then verify `server.ts` contains exactly one router import and one router mount:

```powershell
Select-String -Path .\server.ts -Pattern "reflectionRoomRouter"
```

Expected source lines:

```ts
import { reflectionRoomRouter } from './server/reflectionRoomRoutes.ts';
app.use(reflectionRoomRouter);
```

The mount must be before the Vite / SPA fallback.

Then run:

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run lint
npm run build
```

Stop the old server and restart:

```powershell
npm run dev
```

Diagnostic:

```text
http://localhost:3000/api/mirror-rooms/ping
```

Expected:

```json
{"ok":true,"service":"MirrorRoom API","mounted":true}
```

MirrorRoom itself does not require Gemini or paid AI credits.
