import fs from 'node:fs';

const launcher = 'src/components/ReflectionRoomLauncher.tsx';
const lib = 'src/lib/reflectionRooms.ts';

console.log('');
console.log('MirrorRoom Runtime Compatibility Check');
console.log('======================================');

for (const file of [launcher, lib]) {
  console.log(`${fs.existsSync(file) ? 'PASS' : 'FAIL'}  ${file} exists`);
}

if (fs.existsSync(launcher)) {
  const s = fs.readFileSync(launcher, 'utf8');
  console.log(
    `${s.includes('buildMirrorRoomSummary') ? 'PASS' : 'INFO'}  launcher references buildMirrorRoomSummary`
  );
}

if (fs.existsSync(lib)) {
  const s = fs.readFileSync(lib, 'utf8');
  const ok =
    /export\s+(?:async\s+function|const|function)\s+buildMirrorRoomSummary\b/.test(s) ||
    /export\s*\{[^}]*\bbuildMirrorRoomSummary\b[^}]*\}/s.test(s);

  console.log(`${ok ? 'PASS' : 'FAIL'}  reflectionRooms.ts exports buildMirrorRoomSummary`);
}

console.log('');
