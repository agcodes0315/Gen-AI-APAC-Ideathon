import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function load(relative) {
  const file = path.resolve(root, relative);

  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${relative}`);
  }

  return {
    file,
    source:
      fs.readFileSync(
        file,
        'utf8'
      ),
  };
}

function save(
  file,
  source
) {
  fs.writeFileSync(
    file,
    source,
    'utf8'
  );
}

/* server.ts */
{
  const {
    file,
    source: original,
  } =
    load('server.ts');

  let source = original;

  const importLine =
    "import { journalEnhancementRouter } from './server/journalEnhancementRoutes.ts';";

  if (!source.includes(importLine)) {
    const anchor =
      "import { supportReviewRouter } from './server/supportReviewRoutes.ts';";

    if (!source.includes(anchor)) {
      throw new Error(
        'Could not find supportReviewRouter import anchor in server.ts'
      );
    }

    source =
      source.replace(
        anchor,
        `${anchor}\n${importLine}`
      );
  }

  if (
    !source.includes(
      'app.use(journalEnhancementRouter);'
    )
  ) {
    const anchor =
      'app.use(supportReviewRouter);';

    if (!source.includes(anchor)) {
      throw new Error(
        'Could not find supportReviewRouter mount anchor in server.ts'
      );
    }

    source =
      source.replace(
        anchor,
        `${anchor}\napp.use(journalEnhancementRouter);`
      );
  }

  save(file, source);
}

/* JournalList.tsx */
{
  const {
    file,
    source: original,
  } =
    load(
      'src/components/JournalList.tsx'
    );

  let source = original;

  const importLine =
    "import JournalEnhancementsHub from './JournalEnhancementsHub.tsx';";

  if (!source.includes(importLine)) {
    const anchors = [
      "import {\n  ThoughtDiffCard,\n} from './ThoughtDiffCard.tsx';",
      "import { ThoughtDiffCard } from './ThoughtDiffCard.tsx';",
    ];

    const anchor =
      anchors.find(
        (candidate) =>
          source.includes(
            candidate
          )
      );

    if (!anchor) {
      throw new Error(
        'Could not find ThoughtDiffCard import anchor in JournalList.tsx'
      );
    }

    source =
      source.replace(
        anchor,
        `${anchor}\n\n${importLine}`
      );
  }

  if (
    !source.includes(
      '<JournalEnhancementsHub'
    )
  ) {
    const candidates = [
      '{/* Entries */}',
      '{/* ENTRIES */}',
      '{/* Journal entries */}',
    ];

    let index = -1;

    for (
      const marker of
      candidates
    ) {
      index =
        source.indexOf(
          marker
        );

      if (index !== -1) {
        break;
      }
    }

    if (index === -1) {
      throw new Error(
        'Could not locate the Journal History entries marker. JournalList.tsx was not changed.'
      );
    }

    const block =
`            <JournalEnhancementsHub
              entries={entries}
              onChanged={() => {
                void loadData();
                onDataChanged?.();
              }}
            />

            `;

    source =
      source.slice(
        0,
        index
      ) +
      block +
      source.slice(
        index
      );
  }

  save(file, source);
}

/* JournalEditor.tsx */
{
  const {
    file,
    source: original,
  } =
    load(
      'src/components/JournalEditor.tsx'
    );

  let source = original;

  const importLine =
    "import { useJournalDraftAutosave } from '../hooks/useJournalDraftAutosave.ts';";

  if (!source.includes(importLine)) {
    const anchor =
      "import { ThoughtDiffCard } from './ThoughtDiffCard.tsx';";

    if (!source.includes(anchor)) {
      throw new Error(
        'Could not find ThoughtDiffCard import in JournalEditor.tsx'
      );
    }

    source =
      source.replace(
        anchor,
        `${anchor}\n\n${importLine}`
      );
  }

  if (
    !source.includes(
      'useJournalDraftAutosave({'
    )
  ) {
    const marker =
`  /*
   * Sync Private Session mode.
   */`;

    const index =
      source.indexOf(marker);

    if (index === -1) {
      throw new Error(
        'Could not find Private Session marker in JournalEditor.tsx'
      );
    }

    const block =
`  const {
    restored:
      draftRestored,
  } =
    useJournalDraftAutosave({
      content,
      tags,
      setContent,
      setTags,
      enabled:
        !isPrivateSession,
    });

`;

    source =
      source.slice(
        0,
        index
      ) +
      block +
      source.slice(
        index
      );
  }

  if (
    !source.includes(
      'Draft restored automatically'
    )
  ) {
    const marker =
      '{/* Journal textarea */}';

    const index =
      source.indexOf(marker);

    if (index !== -1) {
      const block =
`          {draftRestored && (
            <div className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-200">
              Draft restored automatically from this browser.
            </div>
          )}

          `;

      source =
        source.slice(
          0,
          index
        ) +
        block +
        source.slice(
          index
        );
    }
  }

  save(file, source);
}

console.log('');
console.log(
  'MirrorTrace journal enhancement bundle installed.'
);
console.log('');
console.log(
  'Current files updated:'
);
console.log(
  '  server.ts'
);
console.log(
  '  src/components/JournalList.tsx'
);
console.log(
  '  src/components/JournalEditor.tsx'
);
console.log('');
console.log(
  'Run next:'
);
console.log(
  '  node .\\scripts\\verify-journal-enhancements.mjs'
);
console.log(
  '  npm run lint'
);
console.log(
  '  npm run build'
);
