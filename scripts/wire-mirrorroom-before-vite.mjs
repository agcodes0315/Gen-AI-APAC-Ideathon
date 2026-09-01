import fs from 'node:fs';
import path from 'node:path';

const serverPath =
  path.resolve(
    process.cwd(),
    'server.ts'
  );

const routePath =
  path.resolve(
    process.cwd(),
    'server',
    'reflectionRoomRoutes.ts'
  );

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(serverPath)) {
  fail(`server.ts not found: ${serverPath}`);
}

if (!fs.existsSync(routePath)) {
  fail(
    `server/reflectionRoomRoutes.ts not found: ${routePath}`
  );
}

let source =
  fs.readFileSync(
    serverPath,
    'utf8'
  );

const backupPath =
  `${serverPath}.before-mirrorroom-wiring.bak`;

if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(
    backupPath,
    source,
    'utf8'
  );
}

const importLine =
  "import { reflectionRoomRouter } from './server/reflectionRoomRoutes.ts';";

const mountLine =
  'app.use(reflectionRoomRouter);';

/* ============================================================
   1. NORMALIZE IMPORT
   ============================================================ */

// Remove malformed/duplicate MirrorRoom router imports first.
source =
  source
    .split(/\r?\n/)
    .filter(
      (line) =>
        !(
          line.includes(
            'reflectionRoomRouter'
          ) &&
          line.trim()
            .startsWith(
              'import'
            )
        )
    )
    .join('\n');

const importMatches =
  [
    ...source.matchAll(
      /^import[\s\S]*?;\s*$/gm
    ),
  ];

if (
  importMatches.length === 0
) {
  fail(
    'Could not locate the import block in server.ts.'
  );
}

const lastImport =
  importMatches[
    importMatches.length - 1
  ];

const importInsertAt =
  lastImport.index +
  lastImport[0].length;

source =
  source.slice(
    0,
    importInsertAt
  ) +
  '\n' +
  importLine +
  source.slice(
    importInsertAt
  );

/* ============================================================
   2. REMOVE ALL OLD MOUNTS
   ============================================================ */

source =
  source.replace(
    /^[ \t]*app\.use\(\s*reflectionRoomRouter\s*\);[ \t]*\r?\n?/gm,
    ''
  );

/* ============================================================
   3. MOUNT BEFORE ALL API ROUTES / BEFORE VITE
   ============================================================ */

const preferredAnchors = [
  "app.get('/api/health'",
  'app.get("/api/health"',
  '/* ============================================================\n   3. HEALTH ROUTE',
  '/* ============================================================\r\n   3. HEALTH ROUTE',
];

let anchorIndex =
  -1;

for (
  const anchor of
  preferredAnchors
) {
  anchorIndex =
    source.indexOf(
      anchor
    );

  if (
    anchorIndex !== -1
  ) {
    break;
  }
}

if (
  anchorIndex === -1
) {
  // Safe fallback: mount immediately after urlencoded middleware.
  const urlencodedPattern =
    /app\.use\(\s*express\.urlencoded\([\s\S]*?\)\s*\);/m;

  const match =
    source.match(
      urlencodedPattern
    );

  if (!match || match.index == null) {
    fail(
      'Could not find a safe location before the API/Vite routes. No final write performed.'
    );
  }

  anchorIndex =
    match.index +
    match[0].length;

  source =
    source.slice(
      0,
      anchorIndex
    ) +
    '\n\n' +
    mountLine +
    source.slice(
      anchorIndex
    );
} else {
  source =
    source.slice(
      0,
      anchorIndex
    ) +
    mountLine +
    '\n\n' +
    source.slice(
      anchorIndex
    );
}

/* ============================================================
   4. VERIFY EXACTLY ONE IMPORT + ONE MOUNT
   ============================================================ */

const importCount =
  (
    source.match(
      /import\s*\{\s*reflectionRoomRouter\s*\}\s*from\s*['"]\.\/server\/reflectionRoomRoutes\.ts['"]\s*;/g
    ) || []
  ).length;

const mountCount =
  (
    source.match(
      /app\.use\(\s*reflectionRoomRouter\s*\);/g
    ) || []
  ).length;

if (
  importCount !== 1 ||
  mountCount !== 1
) {
  fail(
    `Verification failed: importCount=${importCount}, mountCount=${mountCount}`
  );
}

/* ============================================================
   5. ENSURE MOUNT IS BEFORE VITE MIDDLEWARE
   ============================================================ */

const mountIndex =
  source.indexOf(
    mountLine
  );

const viteCandidates = [
  source.indexOf(
    'app.use(vite.middlewares)'
  ),
  source.indexOf(
    'createViteServer'
  ),
];

const actualViteIndexes =
  viteCandidates.filter(
    (value) =>
      value >= 0 &&
      value > source.indexOf(
        'const app = express()'
      )
  );

if (
  actualViteIndexes.length > 0
) {
  const firstViteIndex =
    Math.min(
      ...actualViteIndexes
    );

  if (
    mountIndex >
    firstViteIndex
  ) {
    fail(
      'MirrorRoom router would still be mounted after Vite. No final write performed.'
    );
  }
}

fs.writeFileSync(
  serverPath,
  source,
  'utf8'
);

console.log('');
console.log(
  'PASS: MirrorRoom router is now wired into server.ts.'
);
console.log('');
console.log(
  `Backup: ${backupPath}`
);
console.log('');
console.log(
  'Expected server.ts lines:'
);
console.log(
  `  ${importLine}`
);
console.log(
  `  ${mountLine}`
);
console.log('');
console.log(
  'IMPORTANT: kill the old Node process before restarting.'
);
console.log('');
