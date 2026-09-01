import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const serverPath = path.join(root, 'server.ts');

if (!fs.existsSync(serverPath)) {
  throw new Error(`server.ts not found at ${serverPath}`);
}

let source = fs.readFileSync(serverPath, 'utf8');

const importLine =
  "import { reflectionRoomRouter } from './server/reflectionRoomRoutes.ts';";

const mountLine =
  'app.use(reflectionRoomRouter);';

if (!source.includes(importLine)) {
  const importMatches = [...source.matchAll(/^import[\s\S]*?;\s*$/gm)];

  if (importMatches.length === 0) {
    throw new Error('Could not locate import block in server.ts.');
  }

  const lastImport = importMatches[importMatches.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;

  source =
    source.slice(0, insertAt) +
    '\n' +
    importLine +
    source.slice(insertAt);
}

if (!source.includes(mountLine)) {
  const routerMountMatches = [
    ...source.matchAll(/^app\.use\([A-Za-z0-9_]+Router\);\s*$/gm),
  ];

  if (routerMountMatches.length > 0) {
    const last = routerMountMatches[routerMountMatches.length - 1];
    const insertAt = last.index + last[0].length;

    source =
      source.slice(0, insertAt) +
      '\n' +
      mountLine +
      source.slice(insertAt);
  } else {
    const viteMarkers = [
      'const vite = await createViteServer',
      'await createViteServer',
      'app.use(vite.middlewares)',
      'express.static',
    ];

    let done = false;

    for (const marker of viteMarkers) {
      const i = source.indexOf(marker);

      if (i !== -1) {
        source =
          source.slice(0, i) +
          mountLine +
          '\n\n' +
          source.slice(i);

        done = true;
        break;
      }
    }

    if (!done) {
      throw new Error(
        'Could not safely determine where to mount reflectionRoomRouter.'
      );
    }
  }
}

const backup = path.join(root, 'server.ts.before-mirrorroom-full-fix.bak');

if (!fs.existsSync(backup)) {
  fs.copyFileSync(serverPath, backup);
}

fs.writeFileSync(serverPath, source, 'utf8');

console.log('');
console.log('MirrorRoom router mounted.');
console.log('Backup created at:');
console.log(`  ${backup}`);
console.log('');
