import fs from 'node:fs';
import path from 'node:path';

const authPath = path.resolve(process.cwd(), 'src/components/AuthView.tsx');

if (!fs.existsSync(authPath)) {
  throw new Error(`Missing ${authPath}`);
}

let source = fs.readFileSync(authPath, 'utf8');

const backupPath = `${authPath}.before-target-audience`;
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, source, 'utf8');
}

const importLine = "import TargetAudience from './TargetAudience.tsx';";

if (!source.includes(importLine)) {
  const firstDeclaration =
    source.search(/^(?:type|interface|const|function|export\s+default|export\s+const)\s/m);

  if (firstDeclaration === -1) {
    throw new Error('Could not identify the end of the import section.');
  }

  source =
    source.slice(0, firstDeclaration) +
    `${importLine}\n\n` +
    source.slice(firstDeclaration);
}

// Remove accidental duplicate renders, then insert exactly once.
source = source.replace(/\s*<TargetAudience\s*\/>\s*/g, '\n');

const securityId = source.indexOf('id="security"');

if (securityId === -1) {
  throw new Error(
    'AuthView.tsx has no id="security" section. No changes were written.'
  );
}

const securitySectionStart = source.lastIndexOf('<section', securityId);

if (securitySectionStart === -1) {
  throw new Error(
    'Could not find the <section> opening tag for id="security".'
  );
}

source =
  source.slice(0, securitySectionStart) +
  `\n        <TargetAudience />\n\n        ` +
  source.slice(securitySectionStart);

// Add Who it's for before every Security navigation button.
// This catches both desktop and mobile variants while preserving their styling.
const securityButtonRegex =
  /<button\b[\s\S]{0,1800}?scrollToSection\(\s*['"]security['"]\s*\)[\s\S]{0,1800}?<\/button>/g;

const matches = [...source.matchAll(securityButtonRegex)];

let offset = 0;
for (const match of matches) {
  const original = match[0];

  // Avoid cloning a match that accidentally includes an already inserted audience label.
  if (original.includes("Who it's for")) {
    continue;
  }

  const clone = original
    .replace(
      /scrollToSection\(\s*['"]security['"]\s*\)/,
      "scrollToSection('who-its-for')"
    )
    .replace(/>\s*Security\s*</, ">Who it's for<");

  if (clone === original) {
    continue;
  }

  const index = match.index + offset;
  source =
    source.slice(0, index) +
    clone +
    '\n\n' +
    source.slice(index);

  offset += clone.length + 2;
}

fs.writeFileSync(authPath, source, 'utf8');

const finalSource = fs.readFileSync(authPath, 'utf8');

const checks = {
  importPresent: finalSource.includes(importLine),
  rendered: finalSource.includes('<TargetAudience />'),
  sectionTargetAvailable: finalSource.includes("'who-its-for'"),
};

console.log('');
console.log('MirrorTrace TargetAudience force-restore complete.');
console.log(checks);
console.log('');
console.log(`Backup: ${backupPath}`);
console.log('');
console.log('Run:');
console.log('  npm run lint');
console.log('  npm run build');
console.log('');
