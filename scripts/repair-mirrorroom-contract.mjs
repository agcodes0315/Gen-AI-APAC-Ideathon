import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const launcherPath = path.join(root, 'src', 'components', 'ReflectionRoomLauncher.tsx');
const libPath = path.join(root, 'src', 'lib', 'reflectionRooms.ts');
const routePath = path.join(root, 'server', 'reflectionRoomRoutes.ts');

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

for (const p of [launcherPath, libPath, routePath]) {
  if (!fs.existsSync(p)) {
    fail(`Required file not found: ${p}`);
  }
}

const launcher = fs.readFileSync(launcherPath, 'utf8');
let lib = fs.readFileSync(libPath, 'utf8');
let routes = fs.readFileSync(routePath, 'utf8');

function importedNamesFromReflectionRooms(source) {
  const patterns = [
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]\.\.\/lib\/reflectionRooms(?:\.ts)?['"]/m,
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]\.\/lib\/reflectionRooms(?:\.ts)?['"]/m,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match) continue;

    return match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.replace(/\s+as\s+\w+$/i, '').trim())
      .filter((name) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name));
  }

  return [];
}

function exportedNames(source) {
  const names = new Set();

  for (const m of source.matchAll(
    /export\s+(?:async\s+)?(?:function|const|let|class|interface|type)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g
  )) {
    names.add(m[1]);
  }

  for (const m of source.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    for (const part of m[1].split(',')) {
      const clean = part.trim();
      if (!clean) continue;
      const aliasMatch = clean.match(/(?:\w+\s+as\s+)?([A-Za-z_$][A-Za-z0-9_$]*)$/);
      if (aliasMatch) names.add(aliasMatch[1]);
    }
  }

  return names;
}

const imported = importedNamesFromReflectionRooms(launcher);

if (imported.length === 0) {
  fail(
    'Could not locate the ReflectionRoomLauncher import from reflectionRooms.ts. ' +
    'No files were changed.'
  );
}

console.log('\nReflectionRoomLauncher imports:');
for (const name of imported) console.log(`  - ${name}`);

const beforeExports = exportedNames(lib);
let missing = imported.filter((name) => !beforeExports.has(name));

console.log('\nMissing before repair:');
if (missing.length === 0) {
  console.log('  none');
} else {
  for (const name of missing) console.log(`  - ${name}`);
}

const libBackup = `${libPath}.before-contract-repair.bak`;
const routeBackup = `${routePath}.before-contract-repair.bak`;

if (!fs.existsSync(libBackup)) fs.copyFileSync(libPath, libBackup);
if (!fs.existsSync(routeBackup)) fs.copyFileSync(routePath, routeBackup);

function appendLib(block) {
  lib += `\n\n${block.trim()}\n`;
}

if (missing.includes('buildMirrorRoomSummary')) {
  appendLib(`
/* MirrorRoom compatibility: factual summary alias. */
export async function buildMirrorRoomSummary(
  roomId: string
) {
  return getMirrorRoomSummary(roomId);
}
  `);
}

if (missing.includes('saveMirrorRoomTakeaway')) {
  appendLib(`
/**
 * Saves a user's own MirrorRoom takeaway under their verified Firebase UID.
 * This does not expose the room to admins and does not call Gemini.
 *
 * Accepted call shapes:
 *   saveMirrorRoomTakeaway(roomId, text)
 *   saveMirrorRoomTakeaway({ roomId, text })
 */
export async function saveMirrorRoomTakeaway(
  roomOrInput:
    | string
    | {
        roomId: string;
        text?: string;
        takeaway?: string;
        content?: string;
      },
  maybeText?: string
): Promise<{
  success: boolean;
  id?: string;
}> {
  const roomId =
    typeof roomOrInput === 'string'
      ? roomOrInput
      : roomOrInput.roomId;

  const text =
    typeof roomOrInput === 'string'
      ? String(maybeText || '').trim()
      : String(
          roomOrInput.text ??
          roomOrInput.takeaway ??
          roomOrInput.content ??
          ''
        ).trim();

  if (!roomId || !text) {
    throw new Error('Room and takeaway text are required.');
  }

  return roomFetch<{
    success: boolean;
    id?: string;
  }>(
    \`/api/mirror-rooms/\${encodeURIComponent(roomId)}/takeaway\`,
    {
      method: 'POST',
      body: JSON.stringify({ text }),
    }
  );
}
  `);
}

if (missing.includes('fetchMirrorRoom')) {
  appendLib(`export const fetchMirrorRoom = getMirrorRoom;`);
}

if (missing.includes('loadMirrorRoom')) {
  appendLib(`export const loadMirrorRoom = getMirrorRoom;`);
}

if (missing.includes('submitMirrorRoomThought')) {
  appendLib(`export const submitMirrorRoomThought = shareMirrorRoomThought;`);
}

if (missing.includes('createRoom')) {
  appendLib(`export const createRoom = createMirrorRoom;`);
}

if (missing.includes('joinRoom')) {
  appendLib(`export const joinRoom = joinMirrorRoom;`);
}

if (missing.includes('closeRoom')) {
  appendLib(`export const closeRoom = closeMirrorRoom;`);
}

const takeawayRouteMarker = '/api/mirror-rooms/:roomId/takeaway';

if (
  imported.includes('saveMirrorRoomTakeaway') &&
  !routes.includes(takeawayRouteMarker)
) {
  routes += `

/* ============================================================
   SAVE PERSONAL TAKEAWAY
   Owner-bound, participant-only, no Gemini.
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/takeaway',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const roomId =
        typeof req.params.roomId === 'string'
          ? req.params.roomId.trim().slice(0, 200)
          : '';

      const takeawayText =
        typeof req.body?.text === 'string'
          ? req.body.text.trim().slice(0, 5000)
          : '';

      if (!roomId || !takeawayText) {
        return res.status(400).json({
          error: 'Room and takeaway text are required.',
          code: 'INVALID_TAKEAWAY',
        });
      }

      const participant = await firestore
        .collection('mirrorRooms')
        .doc(roomId)
        .collection('participants')
        .doc(req.user!.uid)
        .get();

      if (!participant.exists) {
        return res.status(403).json({
          error: 'You are not a participant in this MirrorRoom.',
          code: 'ROOM_MEMBERSHIP_REQUIRED',
        });
      }

      const now = new Date().toISOString();

      const ref = firestore
        .collection('users')
        .doc(req.user!.uid)
        .collection('mirrorRoomTakeaways')
        .doc();

      await ref.set({
        id: ref.id,
        roomId,
        text: takeawayText,
        createdAt: now,
        updatedAt: now,
        serverCreatedAt: FieldValue.serverTimestamp(),
        serverUpdatedAt: FieldValue.serverTimestamp(),
      });

      return res.status(201).json({
        success: true,
        id: ref.id,
      });
    } catch (error) {
      console.error(
        '[MirrorRoom] Takeaway save failed:',
        error instanceof Error ? error.message : error
      );

      return res.status(500).json({
        error: 'MirrorRoom takeaway could not be saved.',
        code: 'ROOM_TAKEAWAY_SAVE_FAILED',
      });
    }
  }
);
`;
}

fs.writeFileSync(libPath, lib, 'utf8');
fs.writeFileSync(routePath, routes, 'utf8');

const afterExports = exportedNames(fs.readFileSync(libPath, 'utf8'));
missing = imported.filter((name) => !afterExports.has(name));

console.log('\nAfter repair:');
if (missing.length === 0) {
  console.log('PASS  every ReflectionRoomLauncher import is exported.');
} else {
  console.log('FAIL  these imports are still missing:');
  for (const name of missing) console.log(`  - ${name}`);
  console.log('\nSend this missing-name list before running the app.');
  process.exitCode = 2;
}

console.log('\nBackups:');
console.log(`  ${libBackup}`);
console.log(`  ${routeBackup}`);
console.log('\nNext commands:');
console.log('  Remove-Item -Recurse -Force .\\node_modules\\.vite -ErrorAction SilentlyContinue');
console.log('  npm run lint');
console.log('  npm run dev');
console.log('');
