import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(process.cwd(), 'src/components/AuthView.tsx');
const source = fs.readFileSync(file, 'utf8');

const results = [
  ['TargetAudience import', source.includes("import TargetAudience from './TargetAudience.tsx';")],
  ['TargetAudience render', source.includes('<TargetAudience />')],
  ['who-its-for id link', source.includes('who-its-for')],
  ['security section still present', source.includes('id="security"')],
  ['reviews section still present', source.includes('id="reviews"')],
];

console.log('');
for (const [label, ok] of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
}
console.log('');

if (results.some(([, ok]) => !ok)) {
  process.exitCode = 1;
}
