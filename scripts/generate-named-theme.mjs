#!/usr/bin/env node
/**
 * generate-named-theme.mjs — Regenerate a named brand theme CSS file.
 *
 * Named brand themes (e.g. renting-ideal) are author-time artifacts:
 * regenerable from a committed brand brief (`tokens/themes/<name>.brand.json`),
 * NEVER hand-edited. This is the same catalog/palette mechanism that produces
 * devify-cyan / devify-pink — generatePalette() -> generateTheme() — just run
 * at author time so the semantic token set ships as a static, read-only file.
 *
 * The emitted CSS carries the FULL semantic layer (concrete hex values, so the
 * theme is self-contained for brand hues that are not in tokens/colors.css),
 * with a distinct `<name>` (light) and `<name>-dark` (dark) selector — never
 * palette-only (integration KB §3: palette-only means light == dark and
 * components fall back to the default brand).
 *
 * Usage:
 *   node scripts/generate-named-theme.mjs renting-ideal
 *   node scripts/generate-named-theme.mjs            # regenerates all *.brand.json
 *
 * Pass --check to verify the committed CSS matches the brief (no write); exits 1
 * on drift. This is the guard that keeps the output regenerable and un-hand-edited.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePalette } from '../tokens/palette-generator.js';
import { generateTheme } from '../tokens/theme-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = join(__dirname, '..', 'tokens', 'themes');

const CHECK = process.argv.includes('--check');
const names = process.argv.slice(2).filter(a => !a.startsWith('--'));

function briefsToBuild() {
  if (names.length) return names.map(n => `${n}.brand.json`);
  return readdirSync(THEMES_DIR).filter(f => f.endsWith('.brand.json'));
}

function emitBlock(selector, map) {
  let out = `[data-theme="${selector}"] {\n`;
  for (const [prop, val] of Object.entries(map)) out += `  ${prop}: ${val};\n`;
  out += '}\n';
  return out;
}

function renderCss(brief) {
  const { name, label, tagline, seed, provenance } = brief;
  const palette = generatePalette(seed);
  const { light, dark } = generateTheme(palette, seed.brandIndex ?? 0);

  const header =
    `/*\n` +
    ` * @devify/ui — ${label} Theme (${name})\n` +
    ` *\n` +
    ` * ${tagline ? `"${label} — ${tagline}".\n * ` : ''}` +
    `Generated, read-only. DO NOT hand-edit.\n` +
    ` * Regenerate: node scripts/generate-named-theme.mjs ${name}\n` +
    ` * Source of truth: tokens/themes/${name}.brand.json (seed ${seed.brandColors.join(', ')}).\n` +
    ` *\n` +
    ` * ${provenance}\n` +
    ` *\n` +
    ` * Activate with data-theme="${name}" (light) or data-theme="${name}-dark" (dark).\n` +
    ` * Full semantic layer (light != dark), self-contained concrete values.\n` +
    ` */\n\n`;

  return `${header}${emitBlock(name, light)}\n${emitBlock(`${name}-dark`, dark)}`;
}

let drift = 0;
for (const briefFile of briefsToBuild()) {
  const briefPath = join(THEMES_DIR, briefFile);
  const brief = JSON.parse(readFileSync(briefPath, 'utf8'));
  const css = renderCss(brief);
  const outPath = join(THEMES_DIR, `${brief.name}.css`);

  if (CHECK) {
    let current = '';
    try { current = readFileSync(outPath, 'utf8'); } catch { /* missing */ }
    if (current !== css) {
      console.error(`DRIFT: ${brief.name}.css is out of date — run: node scripts/generate-named-theme.mjs ${brief.name}`);
      drift += 1;
    } else {
      console.log(`OK: ${brief.name}.css matches brief`);
    }
  } else {
    writeFileSync(outPath, css);
    console.log(`wrote ${brief.name}.css (seed ${brief.seed.brandColors.join(', ')})`);
  }
}

if (CHECK && drift > 0) process.exit(1);
