import fs from 'node:fs';

const checks = [
  [
    'server/journalEnhancementRoutes.ts exists',
    fs.existsSync(
      'server/journalEnhancementRoutes.ts'
    ),
  ],
  [
    'src/lib/journalEnhancements.ts exists',
    fs.existsSync(
      'src/lib/journalEnhancements.ts'
    ),
  ],
  [
    'JournalEnhancementsHub exists',
    fs.existsSync(
      'src/components/JournalEnhancementsHub.tsx'
    ),
  ],
  [
    'draft autosave hook exists',
    fs.existsSync(
      'src/hooks/useJournalDraftAutosave.ts'
    ),
  ],
  [
    'server router mounted',
    fs
      .readFileSync(
        'server.ts',
        'utf8'
      )
      .includes(
        'app.use(journalEnhancementRouter);'
      ),
  ],
  [
    'Journal History hub rendered',
    fs
      .readFileSync(
        'src/components/JournalList.tsx',
        'utf8'
      )
      .includes(
        '<JournalEnhancementsHub'
      ),
  ],
  [
    'draft autosave wired',
    fs
      .readFileSync(
        'src/components/JournalEditor.tsx',
        'utf8'
      )
      .includes(
        'useJournalDraftAutosave({'
      ),
  ],
];

console.log('');
console.log(
  'MirrorTrace Journal Feature Verification'
);
console.log(
  '========================================'
);

for (
  const [
    label,
    ok,
  ] of
  checks
) {
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}`
  );
}

if (
  checks.some(
    (
      [
        ,
        ok,
      ]
    ) => !ok
  )
) {
  process.exitCode = 1;
}
