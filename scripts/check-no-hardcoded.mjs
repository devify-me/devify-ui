#!/usr/bin/env node
/**
 * Hardcoded-values check for @devify/ui components.
 *
 * Scans component CSS (template literals inside components/ and patterns/) for
 * raw color values that should be flowing through --dvfy-* tokens.
 *
 * Scope: COLORS ONLY (hex, rgb/rgba, hsl/hsla). Theming requires tokens here —
 * a hardcoded color breaks dark mode and brand themes.
 *
 * Lengths (px/em/rem) are not enforced by default — many components legitimately
 * use font-relative scaling inside their own CSS. Pass --strict to opt in to a
 * stricter pass that also flags raw lengths.
 *
 * Allowlist mechanisms (use the lightest one that fits):
 *   1. Inline same-line:  `// allow-hardcoded: <reason>` or `/* allow-hardcoded: <reason> */`
 *   2. Block:             `/* allow-hardcoded-start: <reason> *​/ ... /* allow-hardcoded-end *​/`
 *   3. File-baseline:     `scripts/.hardcoded-allowlist.json` — array of {file, value, reason}
 *                         entries for tech-debt cleanup that's tracked separately. Each
 *                         entry allows ONE occurrence of `value` in that file.
 *
 * Usage:
 *   node scripts/check-no-hardcoded.mjs               # report mode (always exit 0)
 *   node scripts/check-no-hardcoded.mjs --ci          # exit 1 on any color violation
 *   node scripts/check-no-hardcoded.mjs --strict      # also flag raw px/em/rem
 *   node scripts/check-no-hardcoded.mjs --ci --strict # CI + strict
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CI_MODE = process.argv.includes('--ci');
const STRICT_MODE = process.argv.includes('--strict');
const SCAN_DIRS = ['components', 'patterns'];

// ── Patterns ──────────────────────────────────────────────────────────────────

const COLOR_PATTERNS = [
  {
    name: 'hex-color',
    re: /(?<![\w#])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    suggest: 'Use a --dvfy-* color token instead of a hex literal',
  },
  {
    name: 'rgb-color',
    re: /\brgba?\s*\([^)]+\)/g,
    suggest: 'Use a --dvfy-* color token instead of rgb()/rgba()',
  },
  {
    name: 'hsl-color',
    re: /\bhsla?\s*\([^)]+\)/g,
    suggest: 'Use a --dvfy-* color token instead of hsl()/hsla()',
  },
];

const LENGTH_PATTERNS = [
  {
    name: 'px-length',
    re: /(?<![\w.])(\d+(?:\.\d+)?)px\b/g,
    test: (match) => {
      const n = parseFloat(match[1]);
      return n > 1; // 0px and 1px (hairline) are allowed
    },
    suggest: 'Use a --dvfy-space-* / --dvfy-radius-* / --dvfy-border-* token instead of a raw px value',
  },
  {
    name: 'em-length',
    re: /(?<![\w.])(\d+(?:\.\d+)?)(em|rem)\b/g,
    test: match => parseFloat(match[1]) > 0,
    suggest: 'Use a --dvfy-* token (text-/space-/radius-/etc.) instead of a raw em/rem value',
  },
];

const PATTERNS = STRICT_MODE ? [...COLOR_PATTERNS, ...LENGTH_PATTERNS] : COLOR_PATTERNS;

// ── CSS-context detection ─────────────────────────────────────────────────────
//
// Only flag matches that sit inside a CSS-looking template literal. Heuristic:
// a template literal is "CSS-y" if it contains both `{` and `:` and either a
// recognisable selector (`@`, `:`, `.`, `[`, an element-like word followed by
// `{`) or `var(--`. This avoids false positives in plain HTML or doc strings.

function extractCssLiterals(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '`') {
      const start = i;
      let depth = 0;
      i += 1;
      while (i < src.length) {
        const c = src[i];
        if (c === '\\') { i += 2; continue; }
        if (c === '$' && src[i + 1] === '{') { depth += 1; i += 2; continue; }
        if (c === '}' && depth > 0) { depth -= 1; i += 1; continue; }
        if (c === '`' && depth === 0) { break; }
        i += 1;
      }
      const literal = src.slice(start + 1, i);
      if (looksLikeCss(literal)) out.push({ start: start + 1, text: literal });
      i += 1;
      continue;
    }
    // Skip comments and string literals so backticks inside them don't confuse us
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i += 2; else i += 1;
      }
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

function looksLikeCss(text) {
  return /[{}]/.test(text)
    && /:/.test(text)
    && (/var\(--/.test(text) || /^\s*[@.:[a-z]/m.test(text));
}

// ── Allowlist parsing ─────────────────────────────────────────────────────────

function parseAllowlistBlocks(src) {
  const blocks = [];
  const re = /\/\*\s*allow-hardcoded-start:\s*([^*]+?)\*\/[\s\S]*?\/\*\s*allow-hardcoded-end\s*\*\//g;
  let m;
  while ((m = re.exec(src))) {
    blocks.push({ start: m.index, end: m.index + m[0].length, reason: m[1].trim() });
  }
  return blocks;
}

function inAllowlistBlock(absIndex, blocks) {
  return blocks.some(b => absIndex >= b.start && absIndex < b.end);
}

function lineHasAllowComment(lineText) {
  return /\/\/\s*allow-hardcoded:/.test(lineText)
      || /\/\*\s*allow-hardcoded:/.test(lineText);
}

// ── File-baseline allowlist (scripts/.hardcoded-allowlist.json) ───────────────

function loadFileAllowlist() {
  const path = join(__dirname, '.hardcoded-allowlist.json');
  try {
    const raw = readFileSync(path, 'utf8');
    const json = JSON.parse(raw);
    if (!Array.isArray(json)) return [];
    // Each entry: { file, value, reason }. Track remaining matches per entry.
    return json.map(e => ({ ...e, used: 0 }));
  } catch {
    return [];
  }
}

function consumeAllowlistEntry(allowlist, relFile, value) {
  for (const e of allowlist) {
    if (e.file === relFile && e.value === value && e.used < 1) {
      e.used += 1;
      return true;
    }
  }
  return false;
}

// ── Reporting ─────────────────────────────────────────────────────────────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

let violations = 0;
const seen = new Map(); // file → count
const fileAllowlist = loadFileAllowlist();

for (const scanDir of SCAN_DIRS) {
  const abs = join(ROOT, scanDir);
  try { statSync(abs); } catch { continue; }
  for (const file of walk(abs)) {
    const src = readFileSync(file, 'utf8');
    const literals = extractCssLiterals(src);
    const allowBlocks = parseAllowlistBlocks(src);
    const relFile = file.slice(ROOT.length + 1);

    for (const lit of literals) {
      for (const pat of PATTERNS) {
        pat.re.lastIndex = 0;
        let m;
        while ((m = pat.re.exec(lit.text))) {
          if (pat.test && !pat.test(m)) continue;
          const absIndex = lit.start + m.index;
          if (inAllowlistBlock(absIndex, allowBlocks)) continue;
          const lineText = lineTextAt(src, absIndex);
          if (lineHasAllowComment(lineText)) continue;
          if (consumeAllowlistEntry(fileAllowlist, relFile, m[0])) continue;
          const line = lineNumberFromOffset(src, absIndex);
          console.log(`${relFile}:${line}  [${pat.name}]  '${m[0]}' — ${pat.suggest}`);
          violations += 1;
          seen.set(relFile, (seen.get(relFile) || 0) + 1);
        }
      }
    }
  }
}

// Warn about stale allowlist entries (they no longer match anything)
const stale = fileAllowlist.filter(e => e.used === 0);
if (stale.length > 0) {
  console.log('');
  console.log(`Stale allowlist entries (${stale.length}) — pattern no longer present, please remove from scripts/.hardcoded-allowlist.json:`);
  for (const e of stale) console.log(`  ${e.file}: ${e.value}`);
}

if (violations === 0) {
  console.log('check-no-hardcoded: OK — no hardcoded values found in component CSS');
  process.exit(0);
}

console.log('');
console.log(`check-no-hardcoded: ${violations} violation(s) across ${seen.size} file(s)`);
console.log('Allowlist: add `// allow-hardcoded: <reason>` on the line, or wrap the block with');
console.log('           `/* allow-hardcoded-start: <reason> */ ... /* allow-hardcoded-end */`.');
process.exit(CI_MODE ? 1 : 0);
