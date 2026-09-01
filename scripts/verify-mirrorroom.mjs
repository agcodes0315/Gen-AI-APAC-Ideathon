import fs from 'node:fs';

const checks = [
  [
    'server/reflectionRoomRoutes.ts exists',
    fs.existsSync('server/reflectionRoomRoutes.ts'),
  ],
  [
    'src/lib/reflectionRooms.ts exists',
    fs.existsSync('src/lib/reflectionRooms.ts'),
  ],
  [
    'server.ts imports router',
    fs.existsSync('server.ts') &&
      fs.readFileSync('server.ts', 'utf8').includes(
        "import { reflectionRoomRouter } from './server/reflectionRoomRoutes.ts';"
      ),
  ],
  [
    'server.ts mounts router',
    fs.existsSync('server.ts') &&
      fs.readFileSync('server.ts', 'utf8').includes(
        'app.use(reflectionRoomRouter);'
      ),
  ],
];

console.log('');
console.log('MirrorRoom Verification');
console.log('=======================');

for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
}

console.log('');
console.log('After npm run dev, open:');
console.log('  http://localhost:3000/api/mirror-rooms/ping');
console.log('');
console.log('Expected JSON:');
console.log('  {"ok":true,"service":"MirrorRoom API","mounted":true}');
console.log('');
