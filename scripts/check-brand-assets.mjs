#!/usr/bin/env node

/**
 * check-brand-assets.mjs — every visible colour in a brand SVG must be a token.
 *
 * G&P
 *   Goal:    Fail CI when a brand asset paints a colour that is not in
 *            tokens/colors.css.
 *   Purpose: The lockup and mark shipped for months using #fa3aab AND #fa3cac for
 *            the same pink, and #00e1e2 where the token says #00e5e5 (#420). The
 *            drift was invisible — the values differ by 2/255 — and it survived
 *            precisely because nothing compared the art to the palette. A design
 *            system whose own mark disagrees with its tokens has no authority to
 *            enforce `check:tokens` on everyone else.
 *
 * The Devify mark uses LITERAL token values, never var(): it must not re-colour to
 * a consuming project's theme (brand-independence doctrine). So this compares
 * literals against the palette rather than requiring custom properties.
 *
 * Usage:  npm run check:brand-assets [-- --ci]
 */

import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CI = process.argv.includes('--ci');

const ASSETS = [
  'catalog/devify-hz-logo-cyan-pink.svg',
  'catalog/favicon.svg',
];

/**
 * Colours that are structural, not visible: both live inside the <mask> /
 * feColorMatrix machinery of the auto-traced source. Changing them alters how the
 * mesh renders rather than what colour it is — verified by substitution, #420.
 */
const STRUCTURAL = new Map([
  ['#000000', 'mask/feColorMatrix luminance source'],
  ['#040053', 'mask backdrop'],
]);

const norm = h => h.toLowerCase();

/* Palette = every hex literal defined in the primitive colour tokens. */
const paletteCss = readFileSync(join(ROOT, 'tokens', 'colors.css'), 'utf8');
const palette = new Set([...paletteCss.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => norm(m[0])));

if (palette.size === 0) {
  console.error('check-brand-assets: parsed 0 colours from tokens/colors.css — the check would pass vacuously');
  process.exit(1);
}

const failures = [];
let scanned = 0;

for (const rel of ASSETS) {
  const svg = readFileSync(join(ROOT, rel), 'utf8');
  // Only painted colours. `url(#abc123)` clip/mask IDs are not colours and must
  // not be matched — an earlier naive /#[0-9a-f]{6}/ swept up 30 clipPath ids.
  const painted = [...svg.matchAll(/(?:fill|stroke|stop-color|flood-color)="(#[0-9a-fA-F]{3,8})"/g)]
    .map(m => norm(m[1]));

  const counts = painted.reduce((a, c) => a.set(c, (a.get(c) || 0) + 1), new Map());
  scanned += painted.length;

  for (const [hex, n] of counts) {
    if (palette.has(hex) || STRUCTURAL.has(hex)) continue;
    failures.push({ rel, hex, n });
  }
}

if (failures.length === 0) {
  console.log(`check-brand-assets: OK — ${scanned} painted colours across ${ASSETS.length} brand assets, all from tokens/colors.css`);
  process.exit(0);
}

console.error('check-brand-assets: brand asset paints a colour that is not a design token\n');
for (const f of failures) {
  console.error(`  ${f.rel}\n    ${f.hex} (${f.n}×) is not in tokens/colors.css`);
}
console.error(`
The mark must use token values verbatim. Find the nearest token in
tokens/colors.css and use its exact value — or, if the colour is genuinely
structural (inside a mask/filter and not visible), add it to STRUCTURAL in this
script WITH a reason.`);

process.exit(CI ? 1 : 0);
