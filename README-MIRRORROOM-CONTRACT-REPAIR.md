# MirrorRoom import/export contract repair

The white screen is caused by an ES-module import failure. Vite stops evaluating
`ReflectionRoomLauncher.tsx` as soon as even one named import is absent.

The previous repair fixed `buildMirrorRoomSummary`, which exposed the **next**
missing name: `saveMirrorRoomTakeaway`.

This package fixes the problem differently: it reads your actual
`ReflectionRoomLauncher.tsx`, extracts every named import from
`src/lib/reflectionRooms.ts`, and verifies the whole contract in one pass.

It also adds a real owner-bound backend endpoint for
`saveMirrorRoomTakeaway` if the launcher uses it.

## Apply

Extract this ZIP into the MirrorTrace project root and run:

```powershell
node .\scripts\repair-mirrorroom-contract.mjs
node .\scripts\verify-mirrorroom-contract.mjs
```

Do not start the browser until the verifier ends with:

```text
PASS  all launcher imports are provided by reflectionRooms.ts.
```

Then clear Vite's module cache:

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
```

Stop the old dev server with Ctrl+C and run:

```powershell
npm run lint
npm run dev
```

Hard refresh Chrome with Ctrl+Shift+R.

## If the repair reports an unknown missing name

Do not continue adding exports one at a time. Copy the complete `Missing before
repair` / `still missing` list from the terminal. That list identifies the exact
API contract expected by your current launcher.
