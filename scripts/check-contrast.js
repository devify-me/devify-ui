#!/usr/bin/env node
/**
 * WCAG Contrast Ratio Checker for @devify/ui themes
 *
 * Validates text/background token pairs meet WCAG AA (4.5:1 for normal text).
 * Exempt tokens (WCAG 1.4.3 exception — inactive/decorative UI):
 *   --dvfy-text-muted, --dvfy-text-disabled, --dvfy-disabled-text, --dvfy-input-placeholder
 *
 * Usage:
 *   node scripts/check-contrast.js          # audit mode (always exits 0)
 *   node scripts/check-contrast.js --ci     # exit 1 on any failure (for CI)
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CI_MODE = process.argv.includes('--ci');

// ─── WCAG helpers ─────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── CSS parsing ──────────────────────────────────────────────────────────────

/** Parse all --dvfy-* custom properties from a CSS string. */
function parseCssVars(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = {};
  for (const m of stripped.matchAll(/(--dvfy-[\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

/**
 * Extract CSS custom properties that belong to a specific selector block.
 * Handles multi-selector rules like `:root, [data-theme="light"]` and skips @rules.
 */
function extractSelectorVars(css, targetSelector) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const result = {};
  let i = 0;

  while (i < stripped.length) {
    const braceStart = stripped.indexOf('{', i);
    if (braceStart === -1) break;

    const selectorText = stripped.slice(i, braceStart).trim();

    // Skip at-rules (e.g. @media) — they may contain nested blocks
    if (selectorText.startsWith('@')) {
      let depth = 1;
      let j = braceStart + 1;
      while (j < stripped.length && depth > 0) {
        if (stripped[j] === '{') depth++;
        else if (stripped[j] === '}') depth--;
        j++;
      }
      i = j;
      continue;
    }

    const braceEnd = stripped.indexOf('}', braceStart);
    if (braceEnd === -1) break;

    const blockContent = stripped.slice(braceStart + 1, braceEnd);
    const selectors = selectorText.split(',').map(s => s.trim());

    if (selectors.includes(targetSelector)) {
      for (const m of blockContent.matchAll(/(--dvfy-[\w-]+)\s*:\s*([^;]+);/g)) {
        result[m[1]] = m[2].trim();
      }
    }

    i = braceEnd + 1;
  }

  return result;
}

/** Resolve a CSS custom property value to a hex color. Returns null if not resolvable. */
function resolveToHex(value, vars, depth = 0) {
  if (depth > 10 || !value) return null;
  value = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  const m = value.match(/^var\((--dvfy-[\w-]+)\)$/);
  if (!m) return null;
  const ref = m[1];
  return vars[ref] ? resolveToHex(vars[ref], vars, depth + 1) : null;
}

// ─── Token pairs to validate ──────────────────────────────────────────────────
// [text token, background token, min contrast ratio, description]
const PAIRS = [
  // Surface text
  ['--dvfy-text-primary',    '--dvfy-surface-page',   4.5, 'primary text on page'],
  ['--dvfy-text-secondary',  '--dvfy-surface-page',   4.5, 'secondary text on page'],
  ['--dvfy-text-link',       '--dvfy-surface-page',   4.5, 'link on page'],
  ['--dvfy-text-link-hover', '--dvfy-surface-page',   4.5, 'link hover on page'],
  // Interactive components
  ['--dvfy-primary-text',    '--dvfy-primary-bg',     4.5, 'primary button text'],
  ['--dvfy-accent-text',     '--dvfy-surface-page',   4.5, 'accent text on page'],
  // Status text on page surface
  ['--dvfy-success-text',    '--dvfy-surface-page',   4.5, 'success text on page'],
  ['--dvfy-warning-text',    '--dvfy-surface-page',   4.5, 'warning text on page'],
  ['--dvfy-danger-text',     '--dvfy-surface-page',   4.5, 'danger text on page'],
  ['--dvfy-info-text',       '--dvfy-surface-page',   4.5, 'info text on page'],
  // Foreground on solid status backgrounds (badges, alerts, toasts)
  ['--dvfy-on-success',      '--dvfy-success-bg',     4.5, 'text on success badge'],
  ['--dvfy-on-warning',      '--dvfy-warning-bg',     4.5, 'text on warning badge'],
  ['--dvfy-on-danger',       '--dvfy-danger-bg',      4.5, 'text on danger badge'],
  ['--dvfy-on-info',         '--dvfy-info-bg',        4.5, 'text on info badge'],
  // Input text on input background
  ['--dvfy-text-primary',    '--dvfy-input-bg',       4.5, 'text in input'],
];

// Tokens exempt from the WCAG AA requirement per WCAG 1.4.3:
//   "text that is part of an inactive user interface component" (disabled)
//   or purely decorative text (muted, placeholders).
const EXEMPT_TOKENS = new Set([
  '--dvfy-text-muted',
  '--dvfy-text-disabled',
  '--dvfy-disabled-text',
  '--dvfy-input-placeholder',
]);

// ─── Theme definitions ────────────────────────────────────────────────────────

function loadThemes() {
  const primitivesCss = readFileSync(join(ROOT, 'tokens/colors.css'), 'utf8');
  const lightCss      = readFileSync(join(ROOT, 'tokens/themes/light.css'), 'utf8');
  const darkCss       = readFileSync(join(ROOT, 'tokens/themes/dark.css'), 'utf8');
  const cyanCss       = readFileSync(join(ROOT, 'tokens/themes/devify-cyan.css'), 'utf8');
  const pinkCss       = readFileSync(join(ROOT, 'tokens/themes/devify-pink.css'), 'utf8');

  const primitives    = parseCssVars(primitivesCss);
  const lightVars     = extractSelectorVars(lightCss, ':root');
  const darkVars      = extractSelectorVars(darkCss, '[data-theme="dark"]');
  const cyanVars      = extractSelectorVars(cyanCss, '[data-theme="devify-cyan"]');
  const cyanDarkVars  = extractSelectorVars(cyanCss, '[data-theme="devify-cyan-dark"]');
  const pinkVars      = extractSelectorVars(pinkCss, '[data-theme="devify-pink"]');
  const pinkDarkVars  = extractSelectorVars(pinkCss, '[data-theme="devify-pink-dark"]');

  // Merge strategy: primitives (:root) → light semantic base → theme overrides.
  // Partial brand themes (cyan/pink) only override their accent colours;
  // all other tokens cascade from the light base.
  return {
    'light':            { ...primitives, ...lightVars },
    'dark':             { ...primitives, ...lightVars, ...darkVars },
    'devify-cyan':      { ...primitives, ...lightVars, ...cyanVars },
    'devify-cyan-dark': { ...primitives, ...lightVars, ...cyanDarkVars },
    'devify-pink':      { ...primitives, ...lightVars, ...pinkVars },
    'devify-pink-dark': { ...primitives, ...lightVars, ...pinkDarkVars },
  };
}

// ─── Runner ───────────────────────────────────────────────────────────────────

function checkTheme(vars) {
  return PAIRS.map(([textToken, bgToken, minRatio, desc]) => {
    if (EXEMPT_TOKENS.has(textToken) || EXEMPT_TOKENS.has(bgToken)) {
      return { pass: 'exempt', textToken, bgToken, desc };
    }
    const textHex = resolveToHex(vars[textToken], vars);
    const bgHex   = resolveToHex(vars[bgToken],   vars);
    if (!textHex || !bgHex) {
      return { pass: null, textToken, bgToken, desc, note: 'unresolvable' };
    }
    const ratio = contrastRatio(textHex, bgHex);
    return { pass: ratio >= minRatio, textToken, bgToken, desc, textHex, bgHex, ratio, minRatio };
  });
}

function fmt(r) { return r != null ? `${r.toFixed(2)}:1` : 'n/a'; }

function run() {
  const themes = loadThemes();
  let totalFail = 0;
  let totalPass = 0;

  for (const [name, vars] of Object.entries(themes)) {
    const results = checkTheme(vars);
    const fails   = results.filter(r => r.pass === false);
    const passes  = results.filter(r => r.pass === true);

    totalFail += fails.length;
    totalPass += passes.length;

    const icon = fails.length === 0 ? '✓' : '✗';
    console.log(`\n${icon} [${name}] — ${passes.length} pass, ${fails.length} fail`);

    for (const r of results) {
      if (r.pass === 'exempt') continue; // don't clutter output
      if (r.pass === null) {
        console.log(`  SKIP  ${r.textToken} / ${r.bgToken} — ${r.note}`);
      } else if (r.pass) {
        console.log(`  PASS  ${fmt(r.ratio).padEnd(9)} ${r.desc}  (${r.textHex} on ${r.bgHex})`);
      } else {
        console.log(`  FAIL  ${fmt(r.ratio).padEnd(9)} ${r.desc}  (${r.textHex} on ${r.bgHex}) — need ≥${r.minRatio}:1`);
      }
    }
  }

  console.log(`\n${'─'.repeat(62)}`);
  console.log(`Total: ${totalPass} pass, ${totalFail} fail`);

  if (totalFail > 0) {
    console.log(`\n⚠  WCAG AA failures found. Fix the token values listed above.`);
    if (CI_MODE) process.exit(1);
  } else {
    console.log(`\n✓  All checked pairs meet WCAG AA (≥4.5:1).`);
  }
}

run();
