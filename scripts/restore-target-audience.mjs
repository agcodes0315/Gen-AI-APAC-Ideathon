import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(
  process.cwd(),
  'src/components/AuthView.tsx'
);

if (!fs.existsSync(file)) {
  throw new Error(
    `AuthView.tsx was not found at ${file}`
  );
}

let source =
  fs.readFileSync(
    file,
    'utf8'
  );

const targetImport =
  "import TargetAudience from './TargetAudience.tsx';";

if (
  !source.includes(
    targetImport
  )
) {
  const anchor =
    "import ScrollArcCard from './ScrollArcCard.tsx';";

  if (
    !source.includes(
      anchor
    )
  ) {
    throw new Error(
      'Could not find the ScrollArcCard import in AuthView.tsx.'
    );
  }

  source =
    source.replace(
      anchor,
      `${anchor}\n\n${targetImport}`
    );
}

/*
 * Add desktop nav link between Features and Security.
 */
if (
  !source.includes(
    "scrollToSection(\n                        'who-its-for'"
  )
) {
  const desktopSecurity =
`                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        'security'
                      )
                    }`;

  const desktopAudience =
`                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        'who-its-for'
                      )
                    }
                    className="
                      text-xs
                      font-medium
                      text-white/65
                      transition-colors
                      hover:text-white
                    "
                  >
                    Who it's for
                  </button>

`;

  if (
    source.includes(
      desktopSecurity
    )
  ) {
    source =
      source.replace(
        desktopSecurity,
        desktopAudience +
          desktopSecurity
      );
  } else {
    throw new Error(
      'Could not locate the desktop Security nav button.'
    );
  }
}

/*
 * Add mobile nav link between Features and Security.
 */
const mobileAudienceMarker =
  "Who it's for";

const mobileFeaturesEnd =
`                    >
                      Features
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scrollToSection(
                          'security'
                        )
                      }`;

if (
  source.includes(
    mobileFeaturesEnd
  ) &&
  (
    source.match(
      /Who it's for/g
    ) || []
  ).length < 2
) {
  const mobileAudience =
`                    >
                      Features
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scrollToSection(
                          'who-its-for'
                        )
                      }
                      className="
                        rounded-xl
                        px-3
                        py-3
                        text-left
                        text-sm
                        text-white/80
                        hover:bg-white/10
                      "
                    >
                      Who it's for
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scrollToSection(
                          'security'
                        )
                      }`;

  source =
    source.replace(
      mobileFeaturesEnd,
      mobileAudience
    );
}

/*
 * Render the audience section immediately before Security.
 * This preserves the intended order:
 * Hero -> Features -> Who it's for -> Security -> Reviews
 */
if (
  !source.includes(
    '<TargetAudience />'
  )
) {
  const securitySectionCandidates = [
    '<section\n          id="security"',
    '<section\n        id="security"',
    '<section id="security"',
  ];

  let inserted = false;

  for (
    const marker of
    securitySectionCandidates
  ) {
    if (
      source.includes(
        marker
      )
    ) {
      source =
        source.replace(
          marker,
          `<TargetAudience />\n\n        ${marker.trimStart()}`
        );

      inserted = true;
      break;
    }
  }

  if (!inserted) {
    /*
     * Fallback for formatted JSX where id appears
     * on its own line.
     */
    const securityIndex =
      source.indexOf(
        'id="security"'
      );

    if (
      securityIndex === -1
    ) {
      throw new Error(
        'Could not locate the Security section in AuthView.tsx.'
      );
    }

    const sectionStart =
      source.lastIndexOf(
        '<section',
        securityIndex
      );

    if (
      sectionStart === -1
    ) {
      throw new Error(
        'Could not locate the opening <section> for Security.'
      );
    }

    source =
      source.slice(
        0,
        sectionStart
      ) +
      '<TargetAudience />\n\n        ' +
      source.slice(
        sectionStart
      );
  }
}

/*
 * Normalize a previous formatting issue that can make
 * direction literal values include whitespace/newlines.
 */
source =
  source.replace(
    /direction="\s*left\s*"/g,
    'direction="left"'
  );

source =
  source.replace(
    /direction="\s*right\s*"/g,
    'direction="right"'
  );

fs.writeFileSync(
  file,
  source,
  'utf8'
);

console.log('');
console.log(
  'MirrorTrace target-audience section restored.'
);
console.log('');
console.log(
  'Updated: src/components/AuthView.tsx'
);
console.log(
  'Uses:    src/components/TargetAudience.tsx'
);
console.log('');
console.log(
  'Next: npm run lint'
);
