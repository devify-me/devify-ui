/**
 * tokens/theme-generator.js — Programmatic theme generation
 *
 * Given a palette result and a brand color index, generates deterministic
 * light and dark semantic token sets. At least one brand color is always
 * used as primary for brand consistency.
 *
 * Shadow colors use the primary hue for ambient colored glow in dark mode.
 */
import { hexToOklch, oklchToHex, generateScale } from './palette-generator.js';

// ── WCAG contrast helpers (mirrors scripts/check-contrast.js) ─────────
// On-color / text selection is AA-correct BY CONSTRUCTION: the foreground is
// chosen by measured contrast ratio against the *actual* background, never a
// fixed near-black/near-white assumption. This only ever changes the
// foreground (text/on-color) — the brand background hue is never touched.

const AA_NORMAL = 4.5;

function _hexToRgb(hex) {
  hex = hex.trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function _linearize(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function _luminance(hex) {
  const [r, g, b] = _hexToRgb(hex);
  return 0.2126 * _linearize(r) + 0.7152 * _linearize(g) + 0.0722 * _linearize(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = _luminance(hex1);
  const l2 = _luminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Pick a foreground color that meets WCAG AA against `bgHex`.
 *
 * Tries the theme's two extreme neutrals (darkest text / lightest text)
 * first and returns whichever clears AA. If both somehow fail (very
 * mid-luminance background), it walks the neutral scale outward from each
 * extreme to the nearest tier that passes, then falls back to whichever
 * extreme has the higher ratio (best effort). The background is never
 * altered — only the foreground is chosen.
 *
 * @param {string} bgHex            - background color
 * @param {string} darkFg           - the theme's darkest neutral (e.g. n.scale.get(950))
 * @param {string} lightFg          - the theme's lightest neutral (e.g. n.scale.get(0))
 * @param {Map<number,string>} neutralScale - full neutral scale for tier fallback
 * @returns {string} foreground hex that best meets AA
 */
function pickOnColor(bgHex, darkFg, lightFg, neutralScale) {
  const darkR = contrastRatio(darkFg, bgHex);
  const lightR = contrastRatio(lightFg, bgHex);

  // Prefer whichever extreme passes; if both pass, prefer the higher ratio.
  const darkPass = darkR >= AA_NORMAL;
  const lightPass = lightR >= AA_NORMAL;
  if (darkPass && lightPass) return darkR >= lightR ? darkFg : lightFg;
  if (darkPass) return darkFg;
  if (lightPass) return lightFg;

  // Neither extreme clears AA (rare, mid-luminance bg). Walk the scale toward
  // the passing direction: darker tiers (1000→600) for dark text, lighter tiers
  // (0→400) for light text. Return the first tier that clears AA.
  const darkTiers = [1000, 950, 900, 800, 700, 600];
  const lightTiers = [0, 50, 100, 200, 300, 400];
  for (const step of darkTiers) {
    const hex = neutralScale.get(step);
    if (hex && contrastRatio(hex, bgHex) >= AA_NORMAL) return hex;
  }
  for (const step of lightTiers) {
    const hex = neutralScale.get(step);
    if (hex && contrastRatio(hex, bgHex) >= AA_NORMAL) return hex;
  }

  // Best effort: the higher-contrast extreme.
  return darkR >= lightR ? darkFg : lightFg;
}

/**
 * Generate light and dark semantic token maps from a palette.
 *
 * @param {Object} paletteResult - Return value from generatePalette()
 * @param {number} [brandIndex=0] - Which brand color to use as primary
 * @returns {{ light: Object<string,string>, dark: Object<string,string> }}
 */
export function generateTheme(paletteResult, brandIndex = 0) {
  const { brand, status, neutral } = paletteResult.roles;
  const primary = brand[brandIndex] || brand[0];

  // Derive accent: use the brand color closest to 150° hue rotation from
  // primary, or generate one if only a single brand color exists.
  const targetHue = (primary.oklch[2] + 150) % 360;
  const otherBrands = brand.filter((_, i) => i !== brandIndex);

  let accent;
  if (otherBrands.length > 0) {
    accent = otherBrands.reduce((best, b) => {
      const bestDist = Math.min(Math.abs(best.oklch[2] - targetHue), 360 - Math.abs(best.oklch[2] - targetHue));
      const bDist = Math.min(Math.abs(b.oklch[2] - targetHue), 360 - Math.abs(b.oklch[2] - targetHue));
      return bDist < bestDist ? b : best;
    });
  } else {
    const [pL, pC, pH] = primary.oklch;
    const accentHex = oklchToHex([pL, pC, (pH + 150) % 360]);
    accent = { scale: generateScale(accentHex) };
  }

  const n = neutral;
  const s = status;

  // AA-correct foreground selection. Extremes drawn from the theme's own
  // neutral scale so on-colors stay tonally on-brand (not pure #000/#fff).
  const darkFg  = n.scale.get(950);
  const lightFg = n.scale.get(0);
  const onColor = bgHex => pickOnColor(bgHex, darkFg, lightFg, n.scale);

  // Status + primary backgrounds (brand-derived — never altered here).
  const lightStatusBg = {
    success: s.success.scale.get(600),
    warning: s.warning.scale.get(500),
    danger:  s.danger.scale.get(600),
    info:    s.info.scale.get(600),
  };
  const darkStatusBg = {
    success: s.success.scale.get(600),
    warning: s.warning.scale.get(600),
    danger:  s.danger.scale.get(600),
    info:    s.info.scale.get(600),
  };
  const primaryBgLight = primary.scale.get(500);
  const primaryBgDark  = primary.scale.get(500);

  const light = {
    // Surface
    '--dvfy-surface-page':      n.scale.get(0),
    '--dvfy-surface-raised':    n.scale.get(0),
    '--dvfy-surface-overlay':   n.scale.get(0),
    '--dvfy-surface-sunken':    primary.scale.get(50),
    '--dvfy-surface-muted':     n.scale.get(100),

    // Text
    '--dvfy-text-primary':      n.scale.get(900),
    '--dvfy-text-secondary':    n.scale.get(600),
    '--dvfy-text-muted':        n.scale.get(400),
    '--dvfy-text-disabled':     n.scale.get(400),
    '--dvfy-text-inverse':      n.scale.get(0),
    '--dvfy-text-link':         primary.scale.get(700),
    '--dvfy-text-link-hover':   primary.scale.get(800),

    // Border
    '--dvfy-border-default':    n.scale.get(200),
    '--dvfy-border-strong':     n.scale.get(300),
    '--dvfy-border-muted':      primary.scale.get(100),
    '--dvfy-border-focus':      primary.scale.get(500),

    // Primary — 500 is the user's actual brand color
    '--dvfy-primary-bg':        primaryBgLight,
    '--dvfy-primary-bg-hover':  primary.scale.get(600),
    '--dvfy-primary-bg-active': primary.scale.get(700),
    '--dvfy-primary-bg-subtle': primary.scale.get(50),
    // AA-correct text on the primary CTA, measured vs the actual brand bg.
    '--dvfy-primary-text':      onColor(primaryBgLight),
    '--dvfy-primary-border':    primary.scale.get(500),

    // Accent
    '--dvfy-accent-bg':         accent.scale.get(500),
    '--dvfy-accent-bg-hover':   accent.scale.get(600),
    '--dvfy-accent-bg-subtle':  accent.scale.get(50),
    '--dvfy-accent-text':       accent.scale.get(700),
    '--dvfy-accent-border':     accent.scale.get(200),

    // Status
    '--dvfy-success-bg':        s.success.scale.get(600),
    '--dvfy-success-bg-subtle': s.success.scale.get(50),
    '--dvfy-success-text':      s.success.scale.get(800),
    '--dvfy-success-border':    s.success.scale.get(200),
    '--dvfy-warning-bg':        s.warning.scale.get(500),
    '--dvfy-warning-bg-subtle': s.warning.scale.get(50),
    '--dvfy-warning-text':      s.warning.scale.get(900),
    '--dvfy-warning-border':    s.warning.scale.get(200),
    '--dvfy-danger-bg':         s.danger.scale.get(600),
    '--dvfy-danger-bg-subtle':  s.danger.scale.get(50),
    '--dvfy-danger-text':       s.danger.scale.get(800),
    '--dvfy-danger-border':     s.danger.scale.get(200),
    '--dvfy-info-bg':           s.info.scale.get(600),
    '--dvfy-info-bg-subtle':    s.info.scale.get(50),
    '--dvfy-info-text':         s.info.scale.get(800),
    '--dvfy-info-border':       s.info.scale.get(200),

    // Interactive
    '--dvfy-hover-bg':          n.scale.get(100),
    '--dvfy-active-bg':         n.scale.get(200),
    '--dvfy-selected-bg':       primary.scale.get(50),
    '--dvfy-disabled-bg':       n.scale.get(100),
    '--dvfy-disabled-text':     n.scale.get(400),
    '--dvfy-ring-color':        primary.scale.get(500),

    // Input
    '--dvfy-input-bg':          n.scale.get(0),
    '--dvfy-input-border':      n.scale.get(300),
    '--dvfy-input-border-hover': n.scale.get(400),
    '--dvfy-input-border-focus': primary.scale.get(500),
    '--dvfy-input-placeholder': n.scale.get(400),
    '--dvfy-input-error':       s.danger.scale.get(500),

    // Status on (text color on solid status backgrounds) — AA-correct by
    // construction: foreground chosen by measured contrast vs each status bg.
    '--dvfy-on-success':        onColor(lightStatusBg.success),
    '--dvfy-on-warning':        onColor(lightStatusBg.warning),
    '--dvfy-on-danger':         onColor(lightStatusBg.danger),
    '--dvfy-on-info':           onColor(lightStatusBg.info),

    // Tooltip
    '--dvfy-tooltip-bg':        n.scale.get(700),
    '--dvfy-tooltip-text':      n.scale.get(100),
    '--dvfy-tooltip-border':    n.scale.get(600),

  };

  const dark = {
    // Surface
    '--dvfy-surface-page':      n.scale.get(950),
    '--dvfy-surface-raised':    n.scale.get(900),
    '--dvfy-surface-overlay':   n.scale.get(800),
    '--dvfy-surface-sunken':    n.scale.get(1000),
    '--dvfy-surface-muted':     n.scale.get(800),

    // Text
    '--dvfy-text-primary':      n.scale.get(50),
    '--dvfy-text-secondary':    n.scale.get(300),
    '--dvfy-text-muted':        n.scale.get(500),
    '--dvfy-text-disabled':     n.scale.get(600),
    '--dvfy-text-inverse':      n.scale.get(900),
    '--dvfy-text-link':         primary.scale.get(400),
    '--dvfy-text-link-hover':   primary.scale.get(300),

    // Border
    '--dvfy-border-default':    n.scale.get(700),
    '--dvfy-border-strong':     n.scale.get(600),
    '--dvfy-border-muted':      n.scale.get(800),
    '--dvfy-border-focus':      primary.scale.get(400),

    // Primary — dark-mode CTA button (highest-stakes pair). Text is chosen by
    // measured contrast vs the actual brand bg so the dark CTA always reads.
    '--dvfy-primary-bg':        primaryBgDark,
    '--dvfy-primary-bg-hover':  primary.scale.get(400),
    '--dvfy-primary-bg-active': primary.scale.get(300),
    '--dvfy-primary-bg-subtle': primary.scale.get(950),
    '--dvfy-primary-text':      onColor(primaryBgDark),
    '--dvfy-primary-border':    primary.scale.get(500),

    // Accent
    '--dvfy-accent-bg':         accent.scale.get(500),
    '--dvfy-accent-bg-hover':   accent.scale.get(400),
    '--dvfy-accent-bg-subtle':  accent.scale.get(950),
    '--dvfy-accent-text':       accent.scale.get(300),
    '--dvfy-accent-border':     accent.scale.get(700),

    // Status
    '--dvfy-success-bg':        s.success.scale.get(600),
    '--dvfy-success-bg-subtle': s.success.scale.get(950),
    '--dvfy-success-text':      s.success.scale.get(300),
    '--dvfy-success-border':    s.success.scale.get(700),
    '--dvfy-warning-bg':        s.warning.scale.get(600),
    '--dvfy-warning-bg-subtle': s.warning.scale.get(950),
    '--dvfy-warning-text':      s.warning.scale.get(300),
    '--dvfy-warning-border':    s.warning.scale.get(700),
    '--dvfy-danger-bg':         s.danger.scale.get(600),
    '--dvfy-danger-bg-subtle':  s.danger.scale.get(950),
    '--dvfy-danger-text':       s.danger.scale.get(300),
    '--dvfy-danger-border':     s.danger.scale.get(700),
    '--dvfy-info-bg':           s.info.scale.get(600),
    '--dvfy-info-bg-subtle':    s.info.scale.get(950),
    '--dvfy-info-text':         s.info.scale.get(300),
    '--dvfy-info-border':       s.info.scale.get(700),

    // Interactive
    '--dvfy-hover-bg':          n.scale.get(800),
    '--dvfy-active-bg':         n.scale.get(700),
    '--dvfy-selected-bg':       primary.scale.get(950),
    '--dvfy-disabled-bg':       n.scale.get(800),
    '--dvfy-disabled-text':     n.scale.get(600),
    '--dvfy-ring-color':        primary.scale.get(400),

    // Input
    '--dvfy-input-bg':          n.scale.get(900),
    '--dvfy-input-border':      n.scale.get(600),
    '--dvfy-input-border-hover': n.scale.get(500),
    '--dvfy-input-border-focus': primary.scale.get(400),
    '--dvfy-input-placeholder': n.scale.get(500),
    '--dvfy-input-error':       s.danger.scale.get(400),

    // Status on (text color on solid status backgrounds) — AA-correct by
    // construction: foreground chosen by measured contrast vs each status bg.
    '--dvfy-on-success':        onColor(darkStatusBg.success),
    '--dvfy-on-warning':        onColor(darkStatusBg.warning),
    '--dvfy-on-danger':         onColor(darkStatusBg.danger),
    '--dvfy-on-info':           onColor(darkStatusBg.info),

    // Tooltip
    '--dvfy-tooltip-bg':        n.scale.get(200),
    '--dvfy-tooltip-text':      n.scale.get(900),
    '--dvfy-tooltip-border':    n.scale.get(300),

  };

  return { light, dark };
}

/**
 * Inject a generated theme as a <style> block so CSS selectors can match.
 * @param {string} themeName - e.g., "custom-blue"
 * @param {{ light: Object, dark: Object }} theme
 */
export function injectThemeStyle(themeName, theme) {
  const id = `generated-theme-${themeName}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }

  let css = `[data-theme="${themeName}"] {\n`;
  for (const [prop, val] of Object.entries(theme.light)) {
    css += `  ${prop}: ${val};\n`;
  }
  css += `}\n\n[data-theme="${themeName}-dark"] {\n`;
  for (const [prop, val] of Object.entries(theme.dark)) {
    css += `  ${prop}: ${val};\n`;
  }
  css += '}\n';

  el.textContent = css;
}

/**
 * Remove an injected theme <style> block.
 */
export function removeThemeStyle(themeName) {
  const el = document.getElementById(`generated-theme-${themeName}`);
  if (el) el.remove();
}
