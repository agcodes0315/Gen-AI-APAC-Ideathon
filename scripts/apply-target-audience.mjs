import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const authViewPath = path.join(root, 'src', 'components', 'AuthView.tsx');

if (!fs.existsSync(authViewPath)) {
  console.error(`AuthView.tsx not found: ${authViewPath}`);
  process.exit(1);
}

let source = fs.readFileSync(authViewPath, 'utf8');
let changed = false;

const importLine = "import TargetAudience from './TargetAudience.tsx';";

if (!source.includes(importLine)) {
  const anchor = "import ScrollArcCard from './ScrollArcCard.tsx';";

  if (!source.includes(anchor)) {
    console.error('Could not find ScrollArcCard import in AuthView.tsx.');
    process.exit(1);
  }

  source = source.replace(
    anchor,
    `${anchor}\nimport TargetAudience from './TargetAudience.tsx';`
  );

  changed = true;
}

if (!source.includes('<TargetAudience />')) {
  const securityAnchor = /(\s*<section\s*\n\s*id="security")/;

  if (!securityAnchor.test(source)) {
    console.error('Could not find the Security section in AuthView.tsx.');
    process.exit(1);
  }

  source = source.replace(
    securityAnchor,
    '\n\n          <TargetAudience />\n\n$1'
  );

  changed = true;
}

const desktopWhoButton = `                  <button
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

if (!source.includes("scrollToSection(\n                        'who-its-for'")) {
  const desktopSecurity = `                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        'security'
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
                    Security
                  </button>`;

  if (source.includes(desktopSecurity)) {
    source = source.replace(
      desktopSecurity,
      desktopWhoButton + desktopSecurity
    );
    changed = true;
  }
}

const mobileWhoButton = `                    <button
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

`;

if (!source.includes("scrollToSection(\n                          'who-its-for'")) {
  const mobileSecurity = `                    <button
                      type="button"
                      onClick={() =>
                        scrollToSection(
                          'security'
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
                      Security
                    </button>`;

  if (source.includes(mobileSecurity)) {
    source = source.replace(
      mobileSecurity,
      mobileWhoButton + mobileSecurity
    );
    changed = true;
  }
}

if (!changed) {
  console.log('Target audience integration is already present. No changes made.');
  process.exit(0);
}

fs.writeFileSync(authViewPath, source, 'utf8');
console.log('Updated src/components/AuthView.tsx successfully.');
console.log('Added:');
console.log('  - TargetAudience import');
console.log('  - TargetAudience section before Security');
console.log("  - 'Who it\\'s for' navigation links where matching nav markup was found");
