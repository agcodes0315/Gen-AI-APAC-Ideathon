import fs from 'node:fs';

const launcherPath = 'src/components/ReflectionRoomLauncher.tsx';
const libPath = 'src/lib/reflectionRooms.ts';

function importedNames(source) {
  const match = source.match(
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]\.\.\/lib\/reflectionRooms(?:\.ts)?['"]/m
  );

  if (!match) return [];

  return match[1]
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.replace(/\s+as\s+\w+$/i, '').trim())
    .filter((x) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(x));
}

function exportedNames(source) {
  const result = new Set();

  for (const m of source.matchAll(
    /export\s+(?:async\s+)?(?:function|const|let|class|interface|type)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g
  )) {
    result.add(m[1]);
  }

  for (const m of source.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    for (const p of m[1].split(',')) {
      const clean = p.trim();
      const match = clean.match(/(?:\w+\s+as\s+)?([A-Za-z_$][A-Za-z0-9_$]*)$/);
      if (match) result.add(match[1]);
    }
  }

  return result;
}

console.log('\nMirrorRoom import/export contract');
console.log('=================================');

if (!fs.existsSync(launcherPath) || !fs.existsSync(libPath)) {
  console.log('FAIL  required files are missing');
  process.exit(1);
}

const imported = importedNames(fs.readFileSync(launcherPath, 'utf8'));
const exported = exportedNames(fs.readFileSync(libPath, 'utf8'));
const missing = imported.filter((name) => !exported.has(name));

for (const name of imported) {
  console.log(`${exported.has(name) ? 'PASS' : 'FAIL'}  ${name}`);
}

console.log('');

if (missing.length) {
  console.log(`FAIL  ${missing.length} missing export(s).`);
  process.exit(2);
}

console.log('PASS  all launcher imports are provided by reflectionRooms.ts.');
console.log('');
