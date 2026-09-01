import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

const root =
  process.cwd();

const baseUrl =
  (
    process.env.APP_BASE_URL ||
    process.env.APP_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');

const checks:
  Check[] = [];

function record(
  name: string,
  ok: boolean,
  detail: string
) {
  checks.push({
    name,
    ok,
    detail,
  });
}

function exists(
  relativePath: string
) {
  return fs.existsSync(
    path.join(
      root,
      relativePath
    )
  );
}

async function main() {
  record(
    '.env ignored',
    exists('.gitignore') &&
      fs.readFileSync(
        path.join(
          root,
          '.gitignore'
        ),
        'utf8'
      ).includes('.env'),
    'Verify .env is excluded from Git.'
  );

  const requiredFiles =
    [
      'package.json',
      'server.ts',
      'src/main.tsx',
      'src/App.tsx',
      'src/lib/firebase.ts',
      'src/lib/api.ts',
      'firestore.rules',
    ];

  for (
    const file of
    requiredFiles
  ) {
    record(
      `Required file: ${file}`,
      exists(file),
      file
    );
  }

  record(
    'Firebase project configured',
    Boolean(
      process.env
        .FIREBASE_PROJECT_ID
    ),
    process.env
      .FIREBASE_PROJECT_ID ||
      'missing'
  );

  record(
    'Gemini server key configured',
    Boolean(
      process.env
        .GEMINI_API_KEY
    ),
    process.env
      .GEMINI_API_KEY
      ? 'configured'
      : 'missing'
  );

  record(
    'Frontend Firebase project configured',
    Boolean(
      process.env
        .VITE_FIREBASE_PROJECT_ID
    ),
    process.env
      .VITE_FIREBASE_PROJECT_ID ||
      'missing'
  );

  try {
    const response =
      await fetch(
        `${baseUrl}/api/health`
      );

    const body =
      await response.text();

    record(
      '/api/health',
      response.ok,
      `${response.status} ${body.slice(
        0,
        180
      )}`
    );
  } catch (
    error
  ) {
    record(
      '/api/health',
      false,
      error instanceof
        Error
        ? error.message
        : String(error)
    );
  }

  console.log('');
  console.log(
    'MirrorTrace Production Verification'
  );
  console.log(
    '==================================='
  );
  console.log(
    `Base URL: ${baseUrl}`
  );
  console.log('');

  for (
    const check of
    checks
  ) {
    console.log(
      `${check.ok ? 'PASS' : 'FAIL'}  ${check.name}`
    );

    console.log(
      `      ${check.detail}`
    );
  }

  const failed =
    checks.filter(
      (check) =>
        !check.ok
    );

  console.log('');

  if (
    failed.length >
    0
  ) {
    console.error(
      `${failed.length} verification check(s) failed.`
    );

    process.exitCode =
      1;

    return;
  }

  console.log(
    'All automated checks passed.'
  );
}

void main();
