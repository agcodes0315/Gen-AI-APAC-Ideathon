import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const libPath = path.join(root, 'src', 'lib', 'reflectionRooms.ts');

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(libPath)) {
  fail(`Could not find ${libPath}`);
}

let source = fs.readFileSync(libPath, 'utf8');

const hasBuildExport =
  /export\s+(?:async\s+function|const|function)\s+buildMirrorRoomSummary\b/.test(source) ||
  /export\s*\{[^}]*\bbuildMirrorRoomSummary\b[^}]*\}/s.test(source);

const hasGetExport =
  /export\s+(?:async\s+function|const|function)\s+getMirrorRoomSummary\b/.test(source) ||
  /export\s*\{[^}]*\bgetMirrorRoomSummary\b[^}]*\}/s.test(source);

console.log('\nMirrorRoom export inspection');
console.log('============================');
console.log(`File: ${libPath}`);
console.log(`getMirrorRoomSummary export:   ${hasGetExport ? 'YES' : 'NO'}`);
console.log(`buildMirrorRoomSummary export: ${hasBuildExport ? 'YES' : 'NO'}`);

if (!hasGetExport) {
  fail(
    'getMirrorRoomSummary is not exported by the current reflectionRooms.ts. ' +
    'Do not overwrite blindly. Send the current file contents for a full compatibility rebuild.'
  );
}

if (!hasBuildExport) {
  const backupPath =
    path.join(root, 'src', 'lib', 'reflectionRooms.ts.before-build-summary-fix.bak');

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(libPath, backupPath);
  }

  source += `

/* ============================================================
   MIRRORROOM COMPATIBILITY EXPORT
   ============================================================ */

/**
 * Compatibility name expected by ReflectionRoomLauncher.tsx.
 * This uses the exact same factual backend summary endpoint as
 * getMirrorRoomSummary and does not invoke Gemini.
 */
export async function buildMirrorRoomSummary(
  roomId: string
) {
  return getMirrorRoomSummary(roomId);
}
`;

  fs.writeFileSync(libPath, source, 'utf8');

  console.log('\nFIXED: buildMirrorRoomSummary was appended.');
  console.log(`Backup: ${backupPath}`);
} else {
  console.log('\nNo source edit was required: the export already exists.');
}

const finalSource = fs.readFileSync(libPath, 'utf8');

const finalHasBuild =
  /export\s+(?:async\s+function|const|function)\s+buildMirrorRoomSummary\b/.test(finalSource) ||
  /export\s*\{[^}]*\bbuildMirrorRoomSummary\b[^}]*\}/s.test(finalSource);

if (!finalHasBuild) {
  fail('Post-write verification failed: buildMirrorRoomSummary is still not exported.');
}

console.log('\nPASS: buildMirrorRoomSummary is now exported on disk.');
console.log('\nNow REMOVE Vite cache and restart the server:');
console.log('  PowerShell: Remove-Item -Recurse -Force .\\node_modules\\.vite -ErrorAction SilentlyContinue');
console.log('  Then stop the running server with Ctrl+C and run npm run dev again.');
console.log('');
