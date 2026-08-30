import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

type Result = {
  label: string;
  ok: boolean;
  detail: string;
  blocking: boolean;
};

const root = process.cwd();
const results: Result[] = [];

function add(
  label: string,
  ok: boolean,
  detail: string,
  blocking = true
): void {
  results.push({ label, ok, detail, blocking });
}

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function hasValue(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function trackedFiles(): string[] {
  try {
    return execFileSync('git', ['ls-files'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const requiredFiles = [
  'server.ts',
  'firestore.rules',
  'src/App.tsx',
  'src/lib/firebase.ts',
  'server/firebaseAdmin.ts',
  'server/gemini.ts',
  'server/runtimeConfig.ts',
  'server/securityMiddleware.ts',
];

for (const file of requiredFiles) {
  add(
    `Required file: ${file}`,
    exists(file),
    exists(file) ? 'present' : 'missing'
  );
}

const forbiddenTracked = trackedFiles().filter((file) => {
  const normalized = file.toLowerCase();

  return (
    normalized === '.env' ||
    normalized.endsWith('/.env') ||
    normalized.includes('service-account') ||
    normalized.includes('firebase-adminsdk') ||
    normalized.endsWith('.pem') ||
    normalized.endsWith('.p12')
  );
});

add(
  'No secret-bearing files tracked by Git',
  forbiddenTracked.length === 0,
  forbiddenTracked.length === 0
    ? 'no obvious secret files are tracked'
    : `review: ${forbiddenTracked.join(', ')}`
);

if (exists('firestore.rules')) {
  const rules = read('firestore.rules');

  add(
    'Firestore owner isolation',
    rules.includes('request.auth.uid == userId'),
    rules.includes('request.auth.uid == userId')
      ? 'owner UID check detected'
      : 'owner UID check missing'
  );

  add(
    'Firestore default deny',
    rules.includes('allow read, write: if false;'),
    rules.includes('allow read, write: if false;')
      ? 'default deny detected'
      : 'default deny missing'
  );
}

const firebaseProjectConfigured =
  hasValue(process.env.FIREBASE_PROJECT_ID) ||
  hasValue(process.env.GOOGLE_CLOUD_PROJECT) ||
  hasValue(process.env.GCLOUD_PROJECT);

add(
  'Server Firebase project configuration',
  firebaseProjectConfigured,
  firebaseProjectConfigured ? 'configured' : 'missing'
);

add(
  'Gemini server credential',
  hasValue(process.env.GEMINI_API_KEY),
  hasValue(process.env.GEMINI_API_KEY) ? 'configured' : 'missing'
);

for (const name of [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]) {
  add(
    `Frontend build variable: ${name}`,
    hasValue(process.env[name]),
    hasValue(process.env[name]) ? 'configured' : 'missing'
  );
}

const smtpConfigured =
  hasValue(process.env.MIRRORTRACE_SMTP_HOST) &&
  hasValue(process.env.MIRRORTRACE_SMTP_PORT) &&
  hasValue(process.env.MIRRORTRACE_SMTP_USER) &&
  hasValue(process.env.MIRRORTRACE_SMTP_PASSWORD);

add(
  'Optional SMTP enhancement',
  smtpConfigured,
  smtpConfigured ? 'configured' : 'not fully configured',
  false
);

const schedulerConfigured =
  hasValue(process.env.WATCH_PROCESSOR_SECRET) ||
  hasValue(process.env.MIRRORTRACE_SCHEDULER_SECRET);

add(
  'Optional scheduler authentication',
  schedulerConfigured,
  schedulerConfigured ? 'configured' : 'not configured',
  false
);

console.log('\nMirrorTrace pre-deployment check\n');

for (const result of results) {
  const symbol = result.ok
    ? 'PASS'
    : result.blocking
      ? 'FAIL'
      : 'WARN';

  console.log(`[${symbol}] ${result.label}: ${result.detail}`);
}

const failures = results.filter(
  (item) => item.blocking && !item.ok
);

if (failures.length > 0) {
  console.error(
    `\nPre-deployment check failed with ${failures.length} blocking issue(s).\n`
  );
  process.exitCode = 1;
} else {
  console.log('\nPre-deployment check passed.\n');
}
