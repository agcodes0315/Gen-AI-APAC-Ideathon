import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const serverPath = path.join(root, 'server.ts');
const routePath = path.join(root, 'server', 'reflectionRoomRoutes.ts');

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(serverPath)) {
  fail(`server.ts was not found at ${serverPath}`);
}

if (!fs.existsSync(routePath)) {
  fail(`server/reflectionRoomRoutes.ts was not found at ${routePath}`);
}

let source = fs.readFileSync(serverPath, 'utf8');
const original = source;

const importLine =
  "import { reflectionRoomRouter } from './server/reflectionRoomRoutes.ts';";

const mountLine = 'app.use(reflectionRoomRouter);';

// -----------------------------------------------------------------------------
// 1. Add the import exactly once.
// -----------------------------------------------------------------------------
if (!source.includes(importLine)) {
  const importMatches = [...source.matchAll(/^import[\s\S]*?;\s*$/gm)];

  if (importMatches.length === 0) {
    fail('Could not locate the import block in server.ts. No file was changed.');
  }

  const lastImport = importMatches[importMatches.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;

  source =
    source.slice(0, insertAt) +
    '\n' +
    importLine +
    source.slice(insertAt);
}

// -----------------------------------------------------------------------------
// 2. Add the router mount exactly once.
//    Prefer to place it alongside the other API routers.
// -----------------------------------------------------------------------------
if (!source.includes(mountLine)) {
  const preferredRouters = [
    'app.use(supportReviewRouter);',
    'app.use(emailRouter);',
    'app.use(notificationRouter);',
    'app.use(adminRouter);',
  ];

  let inserted = false;

  for (const marker of preferredRouters) {
    const index = source.indexOf(marker);

    if (index !== -1) {
      const insertAt = index + marker.length;

      source =
        source.slice(0, insertAt) +
        '\n' +
        mountLine +
        source.slice(insertAt);

      inserted = true;
      break;
    }
  }

  if (!inserted) {
    // Fallback: place it immediately before the first obvious Vite / static
    // frontend setup so the API route cannot be swallowed by the SPA.
    const fallbackMarkers = [
      'const vite = await createViteServer',
      'await createViteServer',
      'app.use(vite.middlewares)',
      "app.use(express.static(",
      'async function startServer',
    ];

    for (const marker of fallbackMarkers) {
      const index = source.indexOf(marker);

      if (index !== -1) {
        source =
          source.slice(0, index) +
          mountLine +
          '\n\n' +
          source.slice(index);

        inserted = true;
        break;
      }
    }
  }

  if (!inserted) {
    fail(
      'Could not safely determine where to mount reflectionRoomRouter. ' +
      'No file was changed.'
    );
  }
}

// -----------------------------------------------------------------------------
// 3. Refuse accidental duplicate mounts/imports.
// -----------------------------------------------------------------------------
const importCount =
  source.split(importLine).length - 1;

const mountCount =
  source.split(mountLine).length - 1;

if (importCount !== 1 || mountCount !== 1) {
  fail(
    `Safety check failed. importCount=${importCount}, mountCount=${mountCount}. ` +
    'No file was changed.'
  );
}

// -----------------------------------------------------------------------------
// 4. Create backup and write.
// -----------------------------------------------------------------------------
if (source !== original) {
  const backupPath = path.join(root, 'server.ts.before-mirrorroom-mount.bak');

  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, original, 'utf8');
  }

  fs.writeFileSync(serverPath, source, 'utf8');

  console.log('\nMirrorRoom server router mounted successfully.');
  console.log('Updated: server.ts');
  console.log(`Backup:  ${backupPath}`);
} else {
  console.log('\nMirrorRoom server router is already mounted. No changes were needed.');
}

console.log('\nExpected lines:');
console.log(`  ${importLine}`);
console.log(`  ${mountLine}`);
console.log('\nNext:');
console.log('  npm run lint');
console.log('  npm run dev');
console.log('');
