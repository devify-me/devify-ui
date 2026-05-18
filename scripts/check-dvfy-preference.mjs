#!/usr/bin/env node
/**
 * dvfy-* preference check for @devify/ui components.
 *
 * Flags `document.createElement('<X>')` where a `dvfy-<X>` equivalent exists
 * and the file isn't the corresponding `dvfy-<X>.js` (which legitimately
 * renders the native primitive).
 *
 * Scope: only `button` and `select` for now — these are the clearest cases
 * with full-featured dvfy-* replacements. `input` / `textarea` are widely
 * used internally as the underlying primitive for many form components and
 * aren't enforced here.
 *
 * Allowlist mechanisms:
 *   1. Inline:        `// allow-dvfy-pref: <reason>` on the same line
 *   2. File-baseline: `scripts/.dvfy-preference-allowlist.json` — array of
 *                     {file, native, reason} entries for tracked cleanup.
 *                     Each entry allows ONE occurrence in that file.
 *
 * Usage:
 *   node scripts/check-dvfy-preference.mjs          # report mode (always exit 0)
 *   node scripts/check-dvfy-preference.mjs --ci     # exit 1 on any violation
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CI_MODE = process.argv.includes('--ci');
const SCAN_DIRS = ['components', 'patterns'];

// Native element → dvfy-* equivalent. Map keys are the natives we enforce.
const NATIVE_TO_DVFY = {
  button: 'dvfy-button',
  select: 'dvfy-select',
};

// createElement('X') / createElement("X") detection
const CREATE_RE = /document\.createElement\(\s*['"]([a-z][a-z0-9-]*)['"]/g;

function loadFileAllowlist() {
  const path = join(__dirname, '.dvfy-preference-allowlist.json');
  try {
    const raw = readFileSync(path, 'utf8');
    const json = JSON.parse(raw);
    if (!Array.isArray(json)) return [];
    return json.map(e => ({ ...e, used: 0 }));
  } catch {
    return [];
  }
}

function consumeAllowlistEntry(allowlist, relFile, native) {
  for (const e of allowlist) {
    if (e.file === relFile && e.native === native && e.used < 1) {
      e.used += 1;
      return true;
    }
  }
  return false;
}

function lineHasAllowComment(lineText) {
  return /\/\/\s*allow-dvfy-pref:/.test(lineText)
      || /\/\*\s*allow-dvfy-pref:/.test(lineText);
}

function lineNumberFromOffset(src, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < src.length; i += 1) {
    if (src[i] === '\n') line += 1;
  }
  return line;
}

function lineTextAt(src, offset) {
  const lineStart = src.lastIndexOf('\n', offset - 1) + 1;
  const lineEnd = src.indexOf('\n', offset);
  return src.slice(lineStart, lineEnd === -1 ? src.length : lineEnd);
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (s.isFile() && p.endsWith('.js') && !p.endsWith('.test.js')) yield p;
  }
}

let violations = 0;
const fileAllowlist = loadFileAllowlist();

for (const scanDir of SCAN_DIRS) {
  const abs = join(ROOT, scanDir);
  try { statSync(abs); } catch { continue; }
  for (const file of walk(abs)) {
    const src = readFileSync(file, 'utf8');
    const relFile = file.slice(ROOT.length + 1);
    const fileBase = basename(file, '.js'); // e.g. 'dvfy-button'

    CREATE_RE.lastIndex = 0;
    let m;
    while ((m = CREATE_RE.exec(src))) {
      const native = m[1];
      const dvfy = NATIVE_TO_DVFY[native];
      if (!dvfy) continue;
      // The corresponding dvfy-X.js file is allowed to render the native primitive
      if (fileBase === dvfy) continue;
      const lineText = lineTextAt(src, m.index);
      if (lineHasAllowComment(lineText)) continue;
      if (consumeAllowlistEntry(fileAllowlist, relFile, native)) continue;
      const line = lineNumberFromOffset(src, m.index);
      console.log(`${relFile}:${line}  document.createElement('${native}') — prefer <${dvfy}> in component templates`);
      violations += 1;
    }
  }
}

const stale = fileAllowlist.filter(e => e.used === 0);
if (stale.length > 0) {
  console.log('');
  console.log(`Stale allowlist entries (${stale.length}) — no longer matched, please remove from scripts/.dvfy-preference-allowlist.json:`);
  for (const e of stale) console.log(`  ${e.file}: ${e.native}`);
}

if (violations === 0) {
  console.log('check-dvfy-preference: OK — no preferred-component violations');
  process.exit(0);
}

console.log('');
console.log(`check-dvfy-preference: ${violations} violation(s)`);
console.log('Allowlist: add `// allow-dvfy-pref: <reason>` on the line, or add an entry');
console.log('           to scripts/.dvfy-preference-allowlist.json.');
process.exit(CI_MODE ? 1 : 0);
