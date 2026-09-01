import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  const filePath = path.resolve(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return {
    filePath,
    source: fs.readFileSync(filePath, 'utf8'),
  };
}

function write(filePath, source) {
  fs.writeFileSync(filePath, source, 'utf8');
}

function insertAfter(source, anchor, addition) {
  if (!source.includes(anchor)) {
    return null;
  }
  return source.replace(anchor, `${anchor}\n${addition}`);
}

function insertBefore(source, anchor, addition) {
  const index = source.indexOf(anchor);
  if (index === -1) {
    return null;
  }
  return source.slice(0, index) + addition + source.slice(index);
}

/* ============================================================
   1. server.ts
   ============================================================ */
{
  const { filePath, source: original } = read('server.ts');
  let source = original;

  const importLine =
    "import { journalEnhancementRouter } from './server/journalEnhancementRoutes.ts';";

  if (!source.includes(importLine)) {
    const importAnchors = [
      "import { supportReviewRouter } from './server/supportReviewRoutes.ts';",
      "import { notificationRouter } from './server/notificationRoutes.ts';",
      "import { emailRouter } from './server/emailRoutes.ts';",
    ];

    const anchor = importAnchors.find((candidate) => source.includes(candidate));
    if (!anchor) {
      throw new Error(
        'Could not find a safe router import anchor in server.ts. No server changes were made.'
      );
    }

    source = insertAfter(source, anchor, importLine);
  }

  if (!source.includes('app.use(journalEnhancementRouter);')) {
    const mountAnchors = [
      'app.use(supportReviewRouter);',
      'app.use(notificationRouter);',
      'app.use(emailRouter);',
    ];

    const anchor = mountAnchors.find((candidate) => source.includes(candidate));
    if (!anchor) {
      throw new Error(
        'Could not find a safe router mount anchor in server.ts. No server mount was added.'
      );
    }

    source = insertAfter(
      source,
      anchor,
      'app.use(journalEnhancementRouter);'
    );
  }

  write(filePath, source);
  console.log('PASS  server.ts router wiring');
}

/* ============================================================
   2. src/components/JournalList.tsx
   ============================================================ */
{
  const { filePath, source: original } =
    read('src/components/JournalList.tsx');

  let source = original;

  const importLine =
    "import JournalEnhancementsHub from './JournalEnhancementsHub.tsx';";

  if (!source.includes(importLine)) {
    const importAnchors = [
      "import { ThoughtDiffCard } from './ThoughtDiffCard.tsx';",
      "from './ThoughtDiffCard.tsx';",
      "import YearInReflection from './YearInReflection.tsx';",
      "import { YearInReflection } from './YearInReflection.tsx';",
      "import JournalCalendar from './JournalCalendar.tsx';",
      "import { JournalCalendar } from './JournalCalendar.tsx';",
    ];

    const anchor = importAnchors.find((candidate) => source.includes(candidate));

    if (!anchor) {
      throw new Error(
        'Could not find a safe import anchor in JournalList.tsx. No JournalList changes were made.'
      );
    }

    if (anchor === "from './ThoughtDiffCard.tsx';") {
      const lineStart = source.lastIndexOf('\n', source.indexOf(anchor)) + 1;
      const lineEnd = source.indexOf('\n', source.indexOf(anchor));
      const completeLine = source.slice(
        lineStart,
        lineEnd === -1 ? source.length : lineEnd
      );
      source = insertAfter(source, completeLine, importLine);
    } else {
      source = insertAfter(source, anchor, importLine);
    }
  }

  if (!source.includes('<JournalEnhancementsHub')) {
    const hubBlock =
`        <JournalEnhancementsHub
          entries={entries}
          onChanged={() => {
            void loadData();
            onDataChanged?.();
          }}
        />

`;

    const renderAnchors = [
      '{/* THOUGHT DIFF VIEW */}',
      '{/* REFLECTION VIEW */}',
      '{/* Thought Diff View */}',
      '{/* Reflection View */}',
      '{/* YEAR IN REFLECTION */}',
      '{/* Year in Reflection */}',
    ];

    let inserted = false;

    for (const anchor of renderAnchors) {
      if (source.includes(anchor)) {
        source = insertBefore(source, anchor, hubBlock);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      /*
       * Fallback: place the workspace immediately before the first
       * filteredEntries.map(...) rendering block. We find the start of
       * that JSX expression, then insert before its nearest preceding
       * line. This does not rewrite the existing list/calendar UI.
       */
      const mapIndex = source.indexOf('filteredEntries.map(');

      if (mapIndex !== -1) {
        const expressionStart = source.lastIndexOf('{', mapIndex);
        const lineStart = source.lastIndexOf('\n', expressionStart) + 1;

        source =
          source.slice(0, lineStart) +
          hubBlock +
          source.slice(lineStart);

        inserted = true;
      }
    }

    if (!inserted) {
      throw new Error(
        [
          'Could not locate a safe Journal History render anchor.',
          'JournalList.tsx was NOT modified.',
          '',
          'Run this diagnostic and send the output:',
          "Select-String -Path .\\src\\components\\JournalList.tsx -Pattern 'THOUGHT DIFF VIEW|REFLECTION VIEW|YearInReflection|JournalCalendar|filteredEntries\\.map' -Context 2,2",
        ].join('\n')
      );
    }
  }

  write(filePath, source);
  console.log('PASS  JournalList.tsx workspace wiring');
}

/* ============================================================
   3. src/components/JournalEditor.tsx
   ============================================================ */
{
  const { filePath, source: original } =
    read('src/components/JournalEditor.tsx');

  let source = original;

  const importLine =
    "import { useJournalDraftAutosave } from '../hooks/useJournalDraftAutosave.ts';";

  if (!source.includes(importLine)) {
    const importAnchors = [
      "import { ThoughtDiffCard } from './ThoughtDiffCard.tsx';",
      "from './ThoughtDiffCard.tsx';",
      "import React,",
      "import React from 'react';",
    ];

    const anchor = importAnchors.find((candidate) => source.includes(candidate));

    if (!anchor) {
      throw new Error(
        'Could not find a safe import anchor in JournalEditor.tsx. No editor changes were made.'
      );
    }

    if (anchor === "from './ThoughtDiffCard.tsx';") {
      const lineStart = source.lastIndexOf('\n', source.indexOf(anchor)) + 1;
      const lineEnd = source.indexOf('\n', source.indexOf(anchor));
      const completeLine = source.slice(
        lineStart,
        lineEnd === -1 ? source.length : lineEnd
      );
      source = insertAfter(source, completeLine, importLine);
    } else if (anchor === 'import React,') {
      const firstImportEnd = source.indexOf("from 'react';");
      if (firstImportEnd === -1) {
        throw new Error('Could not determine React import boundary.');
      }
      const lineEnd = source.indexOf('\n', firstImportEnd);
      const completeImport = source.slice(
        0,
        lineEnd === -1 ? source.length : lineEnd
      );
      source =
        completeImport +
        '\n\n' +
        importLine +
        source.slice(lineEnd === -1 ? source.length : lineEnd);
    } else {
      source = insertAfter(source, anchor, importLine);
    }
  }

  if (!source.includes('useJournalDraftAutosave({')) {
    const hookBlock =
`  const {
    restored: draftRestored,
  } = useJournalDraftAutosave({
    content,
    tags,
    setContent,
    setTags,
    enabled: !isPrivateSession,
  });

`;

    const hookAnchors = [
      '  /*\n   * Sync Private Session mode.',
      '  /* Sync Private Session mode.',
      '  useEffect(() => {\n    if (\n      typeof initialPrivateSession',
      '  const wordCount =',
    ];

    let inserted = false;

    for (const anchor of hookAnchors) {
      if (source.includes(anchor)) {
        source = insertBefore(source, anchor, hookBlock);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      throw new Error(
        'Could not locate a safe hook insertion point in JournalEditor.tsx. No draft hook was added.'
      );
    }
  }

  if (
    !source.includes('Draft restored automatically from this browser.')
  ) {
    const noticeBlock =
`          {draftRestored && (
            <div className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-200">
              Draft restored automatically from this browser.
            </div>
          )}

`;

    const noticeAnchors = [
      '{/* Journal textarea */}',
      '{/* Journal Textarea */}',
      '<textarea\n            id="journal-input-area"',
      '<textarea\r\n            id="journal-input-area"',
    ];

    let inserted = false;

    for (const anchor of noticeAnchors) {
      if (source.includes(anchor)) {
        source = insertBefore(source, anchor, noticeBlock);
        inserted = true;
        break;
      }
    }

    /*
     * The notice itself is optional. The autosave hook is the functional
     * feature, so if current markup drifted we do not fail installation.
     */
    if (!inserted) {
      console.log(
        'WARN  Draft hook wired, but restore notice anchor was not found.'
      );
    }
  }

  write(filePath, source);
  console.log('PASS  JournalEditor.tsx draft autosave wiring');
}

console.log('');
console.log('Journal enhancement wiring fix completed.');
console.log('');
console.log('Run next:');
console.log('  node .\\scripts\\verify-journal-enhancements.mjs');
console.log('  npm run lint');
console.log('  npm run build');
