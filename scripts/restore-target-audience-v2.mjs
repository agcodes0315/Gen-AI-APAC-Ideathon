import fs from 'node:fs';
import path from 'node:path';

const authPath = path.resolve(
  process.cwd(),
  'src/components/AuthView.tsx'
);

if (!fs.existsSync(authPath)) {
  throw new Error(`AuthView.tsx not found: ${authPath}`);
}

let source = fs.readFileSync(authPath, 'utf8');

const importLine =
  "import TargetAudience from './TargetAudience.tsx';";

if (!source.includes(importLine)) {
  const importAnchors = [
    "import ScrollArcCard from './ScrollArcCard.tsx';",
    "import ProductReviews from './ProductReviews.tsx';",
  ];

  const anchor = importAnchors.find((candidate) =>
    source.includes(candidate)
  );

  if (!anchor) {
    throw new Error(
      'Could not find a safe component-import anchor in AuthView.tsx.'
    );
  }

  source = source.replace(
    anchor,
    `${anchor}\n${importLine}`
  );
}

if (!source.includes('<TargetAudience />')) {
  const securityIdIndex = source.indexOf('id="security"');

  if (securityIdIndex === -1) {
    throw new Error(
      'Could not find the Security section (id="security") in AuthView.tsx.'
    );
  }

  const sectionStart = source.lastIndexOf(
    '<section',
    securityIdIndex
  );

  if (sectionStart === -1) {
    throw new Error(
      'Could not find the opening <section> for the Security section.'
    );
  }

  source =
    source.slice(0, sectionStart) +
    '        <TargetAudience />\n\n' +
    source.slice(sectionStart);
}

const whoCount =
  (source.match(/Who it's for/g) || []).length;

if (whoCount === 0) {
  const desktopSecurityIndex =
    source.indexOf(
      "scrollToSection(\n                        'security'"
    );

  if (desktopSecurityIndex !== -1) {
    const buttonStart =
      source.lastIndexOf(
        '<button',
        desktopSecurityIndex
      );

    if (buttonStart !== -1) {
      const desktopButton =
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

      source =
        source.slice(0, buttonStart) +
        desktopButton +
        source.slice(buttonStart);
    }
  }
}

fs.writeFileSync(
  authPath,
  source,
  'utf8'
);

console.log('');
console.log('TargetAudience restored in AuthView.tsx.');
console.log('Expected order: Features -> Who it\\'s for -> Security -> Reviews');
console.log('');
console.log('Now run:');
console.log('  npm run lint');
console.log('  npm run build');
