/**
 * tokens/palette-generator.js — Programmatic brand palette generator
 *
 * Given 1–5 brand colors, generates:
 *   - Full 50–950 scale for each brand color (named by hue family)
 *   - 4 status color scales (success, warning, danger, info) at canonical hues
 *   - Full 0–1000 scale for neutral (derived from first brand color, desaturated)
 *   - N support colors (for charts/data viz) by filling hue gaps on the OKLCH wheel
 *   - Full 50–950 scale for each support color
 *
 * All math in OKLCH for perceptual uniformity.
 * Output: CSS custom properties as a theme block.
 */

// ── sRGB ↔ Linear sRGB ────────────────────────────────────────────

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

// ── Linear sRGB ↔ Oklab (Björn Ottosson's direct matrices) ───────
// Bypasses XYZ intermediate for exact roundtrip fidelity.

function linearRgbToOklab([r, g, b]) {
  // Linear sRGB → LMS
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  // LMS → Lab (cube root)
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

function oklabToLinearRgb([L, a, b]) {
  // Lab → LMS (cube root)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  // LMS (cube)
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS → linear sRGB
  return [
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

// ── Oklab ↔ OKLCH ─────────────────────────────────────────────────

function oklabToOklch([L, a, b]) {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

function oklchToOklab([L, C, H]) {
  const hRad = (H * Math.PI) / 180;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

// ── Hex ↔ OKLCH (public API) ──────────────────────────────────────

export function hexToOklch(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linear = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const lab = linearRgbToOklab(linear);
  return oklabToOklch(lab);
}

export function oklchToHex([L, C, H]) {
  const lab = oklchToOklab([L, C, H]);
  const [r, g, b] = oklabToLinearRgb(lab);

  const toHex = (v) => {
    const clamped = Math.max(0, Math.min(1, linearToSrgb(v)));
    return Math.round(clamped * 255).toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ── Scale generation ──────────────────────────────────────────────

/**
 * Steps for color scales and neutral scales.
 */
const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const NEUTRAL_STEPS = [0, ...SCALE_STEPS, 1000];

/** Lightness ceiling (lightest tint) and floor (darkest shade) */
const L_CEIL  = 0.97;
const L_FLOOR = 0.17;

/**
 * Relative positions of each step within the light half (50–400)
 * and dark half (600–950), used to distribute lightness proportionally.
 * Values are normalized 0–1 within each half.
 */
const LIGHT_HALF_POS = { 50: 0, 100: 0.1, 200: 0.25, 300: 0.45, 400: 0.72 };
const DARK_HALF_POS  = { 600: 0.22, 700: 0.44, 800: 0.62, 900: 0.78, 950: 1.0 };

/**
 * Chroma multiplier — bell curve peaking around 400-500.
 * Tints and shades are less saturated than mid-tones.
 */
function chromaMultiplier(step) {
  const t = (step - 50) / 900;
  return Math.exp(-((t - 0.4) ** 2) / 0.08);
}

/**
 * Generate a full scale for a given base hex color.
 * The input color IS the 500 step. Lighter steps (50–400) interpolate
 * toward near-white, darker steps (600–950) toward near-black.
 * Returns Map<step, hex>.
 */
export function generateScale(baseHex, { includeEndpoints = false } = {}) {
  const [baseL, baseC, baseH] = hexToOklch(baseHex);
  const steps = includeEndpoints ? NEUTRAL_STEPS : SCALE_STEPS;
  const scale = new Map();

  for (const step of steps) {
    let L, C;

    if (step === 0) {
      L = 0.995; C = 0;
    } else if (step === 1000) {
      L = 0.0; C = 0;
    } else if (step === 500) {
      // Anchor: exact input color
      L = baseL; C = baseC;
    } else if (step < 500) {
      // Light half: interpolate from near-white down to input
      const t = LIGHT_HALF_POS[step];
      L = L_CEIL - t * (L_CEIL - baseL);
      C = baseC * chromaMultiplier(step);
    } else {
      // Dark half: interpolate from input down to near-black
      const t = DARK_HALF_POS[step];
      L = baseL - t * (baseL - L_FLOOR);
      C = baseC * chromaMultiplier(step);
    }

    scale.set(step, oklchToHex([L, C, baseH]));
  }

  return scale;
}

// ── Support color generation ──────────────────────────────────────

/**
 * Normalize angle to [0, 360).
 */
function normalizeAngle(a) {
  return ((a % 360) + 360) % 360;
}

/**
 * Generate N support hues that fill the gaps between existing hues
 * on the OKLCH hue wheel.
 *
 * Strategy:
 *   1. Sort base hues around the wheel
 *   2. Calculate arc gaps between adjacent hues
 *   3. Distribute support hues proportionally into the largest gaps
 *   4. Within each gap, space hues evenly
 *
 * @param {number[]} baseHues - Existing hue angles (0-360)
 * @param {number} count - Number of support hues to generate
 * @returns {number[]} Support hue angles
 */
export function generateSupportHues(baseHues, count) {
  const sorted = [...baseHues].map(normalizeAngle).sort((a, b) => a - b);

  // Calculate gaps (arc between consecutive hues, wrapping around)
  const gaps = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    const end = sorted[(i + 1) % sorted.length];
    const arc = normalizeAngle(end - start) || 360;
    gaps.push({ start, arc, index: i });
  }

  // Sort gaps by size descending
  gaps.sort((a, b) => b.arc - a.arc);

  // Distribute support hues proportionally to gap size
  const totalArc = gaps.reduce((sum, g) => sum + g.arc, 0);
  let remaining = count;
  const allocations = gaps.map((gap) => {
    // Proportional allocation, at least 0
    const share = Math.max(0, Math.round((gap.arc / totalArc) * count));
    return { ...gap, share };
  });

  // Adjust to exactly `count` total
  const totalShares = allocations.reduce((s, a) => s + a.share, 0);
  let diff = count - totalShares;
  for (let i = 0; diff !== 0; i = (i + 1) % allocations.length) {
    if (diff > 0 && allocations[i].arc > 30) { allocations[i].share++; diff--; }
    else if (diff < 0 && allocations[i].share > 0) { allocations[i].share--; diff++; }
  }

  // Place hues evenly within each gap
  const supportHues = [];
  for (const alloc of allocations) {
    for (let i = 1; i <= alloc.share; i++) {
      const hue = normalizeAngle(alloc.start + (alloc.arc * i) / (alloc.share + 1));
      supportHues.push(hue);
    }
  }

  // Sort by hue for consistent ordering
  return supportHues.sort((a, b) => a - b);
}

// ── Status color hues (canonical, perceptually distinct) ─────────

export const STATUS_HUES = {
  success: 145,  // Green
  warning: 70,   // Amber
  danger:  25,   // Red
  info:    230,  // Sky blue
};

const STATUS_DESCRIPTIONS = {
  success: 'Positive outcomes, confirmations, completion',
  warning: 'Caution, attention needed, non-critical issues',
  danger:  'Errors, destructive actions, critical alerts',
  info:    'Neutral information, help text, announcements',
};

// ── Full palette generation ───────────────────────────────────────

/**
 * Assign hue-family names to brand colors. Disambiguates collisions
 * with numeric suffix (brand-blue, brand-blue-2).
 */
function assignBrandNames(brandOklch) {
  const counts = {};
  return brandOklch.map(([, , H]) => {
    const baseName = hueToName(H).toLowerCase();
    counts[baseName] = (counts[baseName] || 0) + 1;
    return counts[baseName] > 1
      ? `brand-${baseName}-${counts[baseName]}`
      : `brand-${baseName}`;
  });
}

/**
 * Generate a complete brand palette.
 *
 * @param {Object} config
 * @param {string[]} config.brandColors - 1–5 hex colors
 * @param {number}   [config.supportCount=8] - Support colors for data viz
 * @param {string}   [config.prefix='--brand'] - CSS custom property prefix
 * @returns {{ roles, css, meta }}
 */
export function generatePalette({
  brandColors,
  supportCount = 8,
  prefix = '--brand',
}) {
  // Parse brand colors to OKLCH
  const brandOklch = brandColors.map(hexToOklch);
  const brandNames = assignBrandNames(brandOklch);
  const brandHues = brandOklch.map(([, , H]) => H);

  // Average L/C across brand colors (anchors status + support)
  const avgL = brandOklch.reduce((s, [L]) => s + L, 0) / brandOklch.length;
  const avgC = brandOklch.reduce((s, [, C]) => s + C, 0) / brandOklch.length;

  // ── Brand color scales ──
  const brand = brandColors.map((hex, i) => {
    const [L, C, H] = brandOklch[i];
    return {
      name: brandNames[i],
      hue: H,
      base: hex,
      scale: generateScale(hex),
      oklch: [L, C, H],
    };
  });

  // ── Status color scales ──
  const status = {};
  const statusHueValues = [];
  for (const [role, hue] of Object.entries(STATUS_HUES)) {
    const baseHex = oklchToHex([avgL, avgC * 0.85, hue]);
    statusHueValues.push(hue);
    status[role] = {
      name: role,
      hue,
      base: baseHex,
      scale: generateScale(baseHex),
      oklch: hexToOklch(baseHex),
      description: STATUS_DESCRIPTIONS[role],
    };
  }

  // ── Neutral scale ──
  const firstHue = brandOklch[0][2];
  const firstC = brandOklch[0][1];
  const neutralBase = oklchToHex([0.5, firstC * 0.08, firstHue]);
  const neutralScale = generateScale(neutralBase, { includeEndpoints: true });

  // ── Support colors ──
  // Occupied hues = brand + status (so supports fill the remaining gaps)
  const occupiedHues = [...brandHues, ...statusHueValues];
  const supportHues = generateSupportHues(occupiedHues, supportCount);

  const support = supportHues.map((hue, i) => {
    const baseHex = oklchToHex([avgL, avgC, hue]);
    return {
      name: `support-${i + 1}`,
      hue,
      base: baseHex,
      scale: generateScale(baseHex),
    };
  });

  // ── CSS output ──
  const lines = [];
  const addScale = (cssKey, scale) => {
    for (const [step, hex] of scale) {
      lines.push(`  ${prefix}-${cssKey}-${step}: ${hex};`);
    }
  };

  for (const b of brand) {
    // CSS key strips "brand-" prefix since the variable prefix handles namespacing
    const cssKey = b.name.replace(/^brand-/, '');
    lines.push(`  /* ── ${b.name} (H: ${b.hue.toFixed(0)}°) ── */`);
    addScale(cssKey, b.scale);
    lines.push('');
  }

  for (const [role, data] of Object.entries(status)) {
    lines.push(`  /* ── ${role} (H: ${data.hue.toFixed(0)}°) ── */`);
    addScale(role, data.scale);
    lines.push('');
  }

  lines.push(`  /* ── neutral (H: ${firstHue.toFixed(0)}°, low chroma) ── */`);
  addScale('neutral', neutralScale);
  lines.push('');

  for (const s of support) {
    lines.push(`  /* ── ${s.name} (H: ${s.hue.toFixed(0)}°) ── */`);
    addScale(s.name, s.scale);
    lines.push('');
  }

  const css = `:root {\n${lines.join('\n')}\n}`;

  return {
    roles: {
      brand,
      status,
      neutral: { base: neutralBase, scale: neutralScale, oklch: hexToOklch(neutralBase) },
      support,
    },
    css,
    meta: {
      brandHues,
      brandNames,
      statusHues: { ...STATUS_HUES },
      supportHues,
      supportCount,
    },
  };
}

// ── Named hue labels (for UI display) ─────────────────────────────

const HUE_NAMES = [
  [20, 'Red'],       [45, 'Orange'],    [75, 'Amber'],
  [105, 'Yellow'],   [140, 'Lime'],     [165, 'Green'],
  [180, 'Teal'],     [200, 'Cyan'],     [230, 'Sky'],
  [260, 'Blue'],     [280, 'Indigo'],   [300, 'Violet'],
  [320, 'Purple'],   [340, 'Fuchsia'],  [360, 'Rose'],
];

/**
 * Get a human-readable name for a hue angle.
 */
export function hueToName(hue) {
  const h = normalizeAngle(hue);
  for (const [boundary, name] of HUE_NAMES) {
    if (h <= boundary) return name;
  }
  return 'Red';
}
