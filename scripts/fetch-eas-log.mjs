import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const buildId = process.argv[2];
if (!buildId) {
  console.error('Usage: node scripts/fetch-eas-log.mjs <build-id>');
  process.exit(1);
}

const raw = execSync(`eas build:view ${buildId} --json`, { encoding: 'utf8' });
const jsonStart = raw.indexOf('{');
const build = JSON.parse(raw.slice(jsonStart));
const url = build.logFiles?.[0];
if (!url) {
  console.error('No log URL found');
  process.exit(1);
}

const out = join(tmpdir(), 'eas-gradle-log.txt');
execSync(`curl -sL "${url}" -o "${out}"`, { stdio: 'inherit' });
const log = readFileSync(out, 'utf8');
const patterns = [/FAILURE:.*/g, /BUILD FAILED.*/g, /error:.*/gi, /Exception:.*/g, /> Task .* FAILED/g];
for (const p of patterns) {
  const matches = log.match(p);
  if (matches?.length) {
    console.log('\n---', p, '---');
    console.log(matches.slice(-15).join('\n'));
  }
}
// Also print last 80 lines
const lines = log.split('\n');
console.log('\n--- LAST 80 LINES ---');
console.log(lines.slice(-80).join('\n'));
