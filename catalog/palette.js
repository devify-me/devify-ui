/**
 * catalog/palette.js — Brand Identity page (Palette Generator)
 *
 * Single page for defining brand identity:
 *   - Font picker (Brand, Sans, Serif, Mono)
 *   - Dynamic brand color pickers (1–5 colors, named by hue family)
 *   - Auto-generated status colors (success, warning, danger, info)
 *   - Support colors for data viz (fill hue wheel gaps)
 *   - Full 50–950 scales for every color
 *   - "Set as Brand Palette" pushes to Themes page
 */
import { generatePalette, hexToOklch, hueToName, STATUS_HUES } from '../tokens/palette-generator.js';
import { CURATED_FONTS, TOKEN_GROUPS } from './data.js';
import { renderTypography } from './tokens.js';
import { copyToClipboard } from './clipboard.js';
import { getPalette, setPalette, getFonts, setFonts } from './storage.js';
import { setActiveOverrides, applyActiveOverrides } from './brand-state.js';

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const NEUTRAL_STEPS = [0, ...SCALE_STEPS, 1000];

const BRAND_DESCRIPTIONS = [
  'Your main brand color — primary actions, CTAs, key UI elements',
  'Supporting brand color — secondary actions, variety, emphasis',
  'Accent brand color — highlights, badges, decorative elements',
  'Additional brand color — extended palette, illustrations',
  'Additional brand color — extended palette, illustrations',
];

const DEFAULTS = {
  brandColors: ['#1a56db', '#0e9f6e'],
  supportCount: 6,
};

// ── Colors Page (Brand > Colors) ────────────────────────────────────

export function renderColorsPage(mainEl) {
  // Restore persisted state or use defaults
  const saved = getPalette();
  const state = {
    brandColors: saved?.brandColors?.length ? [...saved.brandColors] : [...DEFAULTS.brandColors],
    supportCount: saved?.supportCount ?? DEFAULTS.supportCount,
  };
  let resultArea = null;

  // ── Header ──
  const heading = document.createElement('h2');
  heading.textContent = 'Brand Colors';
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-1);';
  mainEl.appendChild(heading);

  const desc = document.createElement('p');
  desc.textContent = 'Define your brand colors. Status colors are auto-generated via color theory, and support colors fill the hue wheel for charts and data visualization.';
  desc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-6);';
  mainEl.appendChild(desc);

  // ── Brand Colors Section ──
  const colorsSection = document.createElement('div');
  colorsSection.style.cssText = 'margin-bottom: var(--dvfy-space-6);';

  const colorsHeader = document.createElement('div');
  colorsHeader.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--dvfy-space-3);';

  const colorsTitle = document.createElement('h3');
  colorsTitle.textContent = 'Brand Colors';
  colorsTitle.style.cssText = 'font-size: var(--dvfy-text-lg); font-weight: var(--dvfy-weight-semibold); margin: 0;';
  colorsHeader.appendChild(colorsTitle);

  const addBtn = document.createElement('dvfy-button');
  addBtn.setAttribute('variant', 'outline');
  addBtn.setAttribute('size', 'sm');
  addBtn.textContent = '+ Add Color';
  addBtn.addEventListener('click', () => {
    if (state.brandColors.length < 5) {
      const defaults = ['#1a56db', '#0e9f6e', '#ff5a1f', '#9333ea', '#e11d48'];
      state.brandColors.push(defaults[state.brandColors.length] || '#6366f1');
      rebuildColorPickers();
      update();
    }
  });
  colorsHeader.appendChild(addBtn);
  colorsSection.appendChild(colorsHeader);

  const pickersContainer = document.createElement('div');
  colorsSection.appendChild(pickersContainer);
  mainEl.appendChild(colorsSection);

  // ── Support Count ──
  const supportSection = document.createElement('div');
  supportSection.style.cssText = 'margin-bottom: var(--dvfy-space-6); display: flex; align-items: center; gap: var(--dvfy-space-3);';

  const supportLabel = document.createElement('label');
  supportLabel.textContent = 'Support colors for data visualization:';
  supportLabel.style.cssText = 'font-size: var(--dvfy-text-sm); font-weight: var(--dvfy-weight-medium);';
  supportSection.appendChild(supportLabel);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '2';
  slider.max = '14';
  slider.value = String(state.supportCount);
  slider.style.cssText = 'width: 8rem; accent-color: var(--dvfy-primary-bg);';

  const countLabel = document.createElement('span');
  countLabel.textContent = String(state.supportCount);
  countLabel.style.cssText = 'font-size: var(--dvfy-text-sm); font-weight: var(--dvfy-weight-medium); min-width: 1.5rem; text-align: center;';

  slider.addEventListener('input', () => {
    state.supportCount = parseInt(slider.value, 10);
    countLabel.textContent = slider.value;
    update();
  });

  supportSection.appendChild(slider);
  supportSection.appendChild(countLabel);
  mainEl.appendChild(supportSection);

  // ── Result area ──
  resultArea = document.createElement('div');
  mainEl.appendChild(resultArea);

  function rebuildColorPickers() {
    pickersContainer.textContent = '';
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: var(--dvfy-space-4); padding: var(--dvfy-space-4); background: var(--dvfy-surface-sunken); border-radius: var(--dvfy-radius-lg);';

    state.brandColors.forEach((hex, i) => {
      grid.appendChild(buildBrandColorInput(i, hex, state, () => {
        rebuildColorPickers();
        update();
      }, () => update()));
    });

    pickersContainer.appendChild(grid);
    addBtn.style.display = state.brandColors.length >= 5 ? 'none' : '';
  }

  function update() {
    setPalette({ brandColors: state.brandColors, supportCount: state.supportCount });
    const result = generatePalette({
      brandColors: state.brandColors,
      supportCount: state.supportCount,
      prefix: '--brand',
    });
    renderResult(resultArea, result);
  }

  rebuildColorPickers();
  update();
}

// ── Font Section ────────────────────────────────────────────────────

// ── Typography Page (Tokens > Typography) ───────────────────────────
// Font pickers on top, then the standard typography token showcase below.

export function renderTypographyPage(mainEl) {
  // Font pickers on top
  const fontHeading = document.createElement('h2');
  fontHeading.textContent = 'Typography';
  fontHeading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-1);';
  mainEl.appendChild(fontHeading);

  const desc = document.createElement('p');
  desc.textContent = 'Choose your brand fonts, then explore the full token scale below.';
  desc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-6);';
  mainEl.appendChild(desc);

  mainEl.appendChild(buildFontSection());

  // Token reference below (direct renderer, no duplicate heading)
  if (TOKEN_GROUPS.typography) {
    renderTypography(mainEl, TOKEN_GROUPS.typography);
  }
}

function buildFontSection() {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: var(--dvfy-space-6); padding: var(--dvfy-space-4); background: var(--dvfy-surface-sunken); border-radius: var(--dvfy-radius-lg);';

  const title = document.createElement('h3');
  title.textContent = 'Typography';
  title.style.cssText = 'font-size: var(--dvfy-text-lg); font-weight: var(--dvfy-weight-semibold); margin: 0 0 var(--dvfy-space-3);';
  section.appendChild(title);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: var(--dvfy-space-4);';

  const saved = getFonts() || {};
  const fontRoles = [
    { key: 'brand', label: 'Brand / Display', cssVar: '--dvfy-font-brand', category: 'display', fallback: 'sans-serif', current: saved.brand },
    { key: 'sans',  label: 'Sans-serif (UI)', cssVar: '--dvfy-font-sans',  category: 'sans',    fallback: 'system-ui, sans-serif', current: saved.sans },
    { key: 'serif', label: 'Serif (Reading)', cssVar: '--dvfy-font-serif', category: 'serif',   fallback: 'Georgia, serif', current: saved.serif },
    { key: 'mono',  label: 'Monospace (Code)', cssVar: '--dvfy-font-mono', category: 'mono',    fallback: 'monospace', current: saved.mono },
  ];

  for (const role of fontRoles) {
    grid.appendChild(buildFontPicker(role));
  }

  section.appendChild(grid);

  // Preview
  const preview = document.createElement('div');
  preview.id = 'font-preview';
  preview.style.cssText = 'margin-top: var(--dvfy-space-4); padding: var(--dvfy-space-3); background: var(--dvfy-surface-raised); border-radius: var(--dvfy-radius-md); border: var(--dvfy-border-1) solid var(--dvfy-border-muted);';
  updateFontPreview(preview);
  section.appendChild(preview);

  return section;
}

function buildFontPicker({ key, label, cssVar, category, fallback, current }) {
  const wrap = document.createElement('div');

  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.style.cssText = 'display: block; font-size: var(--dvfy-text-xs); font-weight: var(--dvfy-weight-medium); color: var(--dvfy-text-secondary); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider); margin-bottom: var(--dvfy-space-1);';
  wrap.appendChild(lbl);

  const fonts = CURATED_FONTS[category] || [];
  const isCustom = current && !fonts.some(f => f.name === current);

  // Select dropdown for curated fonts
  const select = document.createElement('select');
  select.style.cssText = 'width: 100%; padding: var(--dvfy-space-2); font-size: var(--dvfy-text-sm); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); background: var(--dvfy-surface-raised); color: var(--dvfy-text-primary); font-family: inherit;';

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'System default';
  select.appendChild(defaultOpt);

  for (const font of fonts) {
    const opt = document.createElement('option');
    opt.value = font.name;
    opt.textContent = font.name;
    if (current === font.name) opt.selected = true;
    select.appendChild(opt);
  }

  // Text input with datalist for custom Google Font names
  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.placeholder = 'Or type any Google Font name';
  customInput.value = isCustom ? current : '';
  customInput.style.cssText = 'width: 100%; margin-top: var(--dvfy-space-1); padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); background: var(--dvfy-surface-raised); color: var(--dvfy-text-primary); font-family: inherit;';

  // Datalist for autocomplete from curated fonts
  const listId = `fonts-${key}`;
  const datalist = document.createElement('datalist');
  datalist.id = listId;
  for (const font of fonts) {
    const opt = document.createElement('option');
    opt.value = font.name;
    datalist.appendChild(opt);
  }
  customInput.setAttribute('list', listId);

  function applyFont(fontName) {
    if (fontName) {
      const knownFont = fonts.find(f => f.name === fontName);
      loadGoogleFont(fontName, knownFont?.weights);
      document.documentElement.style.setProperty(cssVar, `"${fontName}", ${fallback}`);
    } else {
      document.documentElement.style.removeProperty(cssVar);
    }
    const currentFonts = getFonts() || {};
    currentFonts[key] = fontName || null;
    setFonts(currentFonts);
    const preview = document.getElementById('font-preview');
    if (preview) updateFontPreview(preview);
  }

  select.addEventListener('change', () => {
    customInput.value = '';
    applyFont(select.value);
  });

  customInput.addEventListener('change', () => {
    const fontName = customInput.value.trim();
    if (fontName) {
      select.value = '';
      applyFont(fontName);
    }
  });

  wrap.appendChild(select);
  wrap.appendChild(customInput);
  wrap.appendChild(datalist);
  return wrap;
}

function updateFontPreview(el) {
  el.textContent = '';
  const lines = [
    { text: 'Brand Display Font', style: 'font-family: var(--dvfy-font-brand); font-size: var(--dvfy-text-xl); font-weight: var(--dvfy-weight-bold);' },
    { text: 'The quick brown fox jumps over the lazy dog', style: 'font-family: var(--dvfy-font-sans); font-size: var(--dvfy-text-base);' },
    { text: 'Elegant serif text for long-form reading', style: 'font-family: var(--dvfy-font-serif); font-size: var(--dvfy-text-base); font-style: italic;' },
  ];
  for (const { text, style } of lines) {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.cssText = `margin: 0 0 var(--dvfy-space-2); ${style}`;
    el.appendChild(p);
  }
  // Code sample
  const code = document.createElement('p');
  code.textContent = 'const code = "monospace";';
  code.style.cssText = 'margin: 0; font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-sm); background: var(--dvfy-surface-sunken); padding: var(--dvfy-space-1) var(--dvfy-space-2); border-radius: var(--dvfy-radius-sm); display: inline-block;';
  el.appendChild(code);
}

/** Inject a Google Fonts <link> if not already loaded */
export function loadGoogleFont(name, weights) {
  const id = `gf-${name.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const weightStr = (weights || [400]).join(';');
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@${weightStr}&display=swap`;
  document.head.appendChild(link);
}

// ── Brand Color Input ───────────────────────────────────────────────

function buildBrandColorInput(index, hex, state, onRemove, onChange) {
  const wrap = document.createElement('div');

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--dvfy-space-1);';

  const lbl = document.createElement('label');
  lbl.textContent = `Color ${index + 1}`;
  lbl.style.cssText = 'font-size: var(--dvfy-text-xs); font-weight: var(--dvfy-weight-medium); color: var(--dvfy-text-secondary); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider);';
  header.appendChild(lbl);

  if (state.brandColors.length > 1) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '\u00d7';
    removeBtn.title = 'Remove color';
    removeBtn.style.cssText = 'border: none; background: none; color: var(--dvfy-text-muted); cursor: pointer; font-size: var(--dvfy-text-lg); padding: 0; line-height: 1;';
    removeBtn.addEventListener('click', () => {
      state.brandColors.splice(index, 1);
      onRemove();
    });
    header.appendChild(removeBtn);
  }

  wrap.appendChild(header);

  const descEl = document.createElement('div');
  descEl.textContent = BRAND_DESCRIPTIONS[index] || BRAND_DESCRIPTIONS[3];
  descEl.style.cssText = 'font-size: 10px; color: var(--dvfy-text-muted); margin-bottom: var(--dvfy-space-2); line-height: 1.3;';
  wrap.appendChild(descEl);

  const row = document.createElement('div');
  row.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-2);';

  const picker = document.createElement('input');
  picker.type = 'color';
  picker.value = hex;
  picker.style.cssText = 'width: 3rem; height: 2.5rem; border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); cursor: pointer; padding: 0;';

  const hexInput = document.createElement('input');
  hexInput.type = 'text';
  hexInput.value = hex;
  hexInput.style.cssText = 'width: 5.5rem; padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); font-family: var(--dvfy-font-mono); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); background: var(--dvfy-surface-raised); color: var(--dvfy-text-primary);';

  const hueLabel = document.createElement('span');
  hueLabel.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); white-space: nowrap;';
  updateHueLabel(hueLabel, hex);

  picker.addEventListener('input', () => {
    hexInput.value = picker.value;
    state.brandColors[index] = picker.value;
    updateHueLabel(hueLabel, picker.value);
    onChange();
  });

  hexInput.addEventListener('change', () => {
    const v = hexInput.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      picker.value = v;
      state.brandColors[index] = v;
      updateHueLabel(hueLabel, v);
      onChange();
    }
  });

  row.appendChild(picker);
  row.appendChild(hexInput);
  row.appendChild(hueLabel);
  wrap.appendChild(row);
  return wrap;
}

function updateHueLabel(el, hex) {
  const [, , h] = hexToOklch(hex);
  el.textContent = `${Math.round(h)}\u00b0 ${hueToName(h)}`;
}

// ── Result Rendering ────────────────────────────────────────────────

function renderResult(container, result) {
  container.textContent = '';

  // Hue wheel
  container.appendChild(buildHueWheel(result));

  // Brand color scales
  const brandHeading = document.createElement('h3');
  brandHeading.textContent = 'Brand Colors';
  brandHeading.style.cssText = 'font-size: var(--dvfy-text-lg); font-weight: var(--dvfy-weight-semibold); margin: 0 0 var(--dvfy-space-3);';
  container.appendChild(brandHeading);

  for (const b of result.roles.brand) {
    container.appendChild(buildScaleSection(
      `${b.name} (${hueToName(b.hue)}, ${Math.round(b.hue)}\u00b0)`,
      b, b.base,
    ));
  }

  // Status colors
  const statusHeading = document.createElement('h3');
  statusHeading.textContent = 'Status Colors';
  statusHeading.style.cssText = 'font-size: var(--dvfy-text-lg); font-weight: var(--dvfy-weight-semibold); margin: var(--dvfy-space-6) 0 var(--dvfy-space-1);';
  container.appendChild(statusHeading);

  const statusDesc = document.createElement('p');
  statusDesc.textContent = 'Auto-generated at canonical hue angles, harmonized with your brand chroma.';
  statusDesc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-3);';
  container.appendChild(statusDesc);

  for (const [role, data] of Object.entries(result.roles.status)) {
    container.appendChild(buildScaleSection(
      `${role} \u2014 ${data.description}`,
      data, data.base,
    ));
  }

  // Neutral
  const neutralHeading = document.createElement('h3');
  neutralHeading.textContent = 'Neutral';
  neutralHeading.style.cssText = 'font-size: var(--dvfy-text-lg); font-weight: var(--dvfy-weight-semibold); margin: var(--dvfy-space-6) 0 var(--dvfy-space-3);';
  container.appendChild(neutralHeading);

  container.appendChild(buildScaleSection('neutral', result.roles.neutral, null, true));

  // Support colors
  if (result.roles.support.length > 0) {
    const supportHeading = document.createElement('h3');
    supportHeading.textContent = `Support Colors (${result.roles.support.length})`;
    supportHeading.style.cssText = 'font-size: var(--dvfy-text-lg); font-weight: var(--dvfy-weight-semibold); margin: var(--dvfy-space-6) 0 var(--dvfy-space-1);';
    container.appendChild(supportHeading);

    const supportDescEl = document.createElement('p');
    supportDescEl.textContent = 'Fill hue wheel gaps for charts, graphs, and data indicators.';
    supportDescEl.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-3);';
    container.appendChild(supportDescEl);

    for (const s of result.roles.support) {
      container.appendChild(buildScaleSection(
        `${s.name} (${hueToName(s.hue)}, ${Math.round(s.hue)}\u00b0)`,
        s, s.base,
      ));
    }
  }

  // Export
  container.appendChild(buildExportSection(result));
}

// ── Scale Section ───────────────────────────────────────────────────

function buildScaleSection(label, roleData, baseHex, isNeutral = false) {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: var(--dvfy-space-4);';

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-2); margin-bottom: var(--dvfy-space-2);';

  if (baseHex) {
    const swatch = document.createElement('span');
    swatch.style.cssText = `display: inline-block; width: 1rem; height: 1rem; border-radius: var(--dvfy-radius-sm); background: ${baseHex}; border: var(--dvfy-border-1) solid var(--dvfy-border-muted);`;
    header.appendChild(swatch);
  }

  const titleEl = document.createElement('span');
  titleEl.textContent = label;
  titleEl.style.cssText = 'font-size: var(--dvfy-text-sm); font-weight: var(--dvfy-weight-semibold);';
  header.appendChild(titleEl);

  section.appendChild(header);

  // Scale bar with hex overlays
  const steps = isNeutral ? NEUTRAL_STEPS : SCALE_STEPS;
  const bar = document.createElement('div');
  bar.style.cssText = 'display: flex; border-radius: var(--dvfy-radius-md); overflow: hidden; border: var(--dvfy-border-1) solid var(--dvfy-border-muted);';

  for (const step of steps) {
    const hex = roleData.scale.get(step);
    const [L] = hexToOklch(hex);

    const cell = document.createElement('div');
    cell.style.cssText = `flex: 1; height: 3.5rem; background: ${hex}; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
    cell.title = `${step}: ${hex} (click to copy)`;

    // Hex overlay with contrast-aware text
    const hexLabel = document.createElement('span');
    hexLabel.textContent = hex;
    hexLabel.style.cssText = `font-size: 7px; font-family: var(--dvfy-font-mono); color: ${L > 0.55 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)'}; pointer-events: none; text-align: center; line-height: 1.2; word-break: break-all;`;
    cell.appendChild(hexLabel);

    cell.addEventListener('click', () => {
      copyToClipboard(hex).then(() => {
        hexLabel.textContent = 'Copied!';
        setTimeout(() => { hexLabel.textContent = hex; }, 800);
      });
    });

    bar.appendChild(cell);
  }
  section.appendChild(bar);

  // Step labels
  const labels = document.createElement('div');
  labels.style.cssText = 'display: flex;';
  for (const step of steps) {
    const lbl = document.createElement('span');
    lbl.textContent = step;
    lbl.style.cssText = 'flex: 1; font-size: 9px; color: var(--dvfy-text-muted); text-align: center; margin-top: 2px;';
    labels.appendChild(lbl);
  }
  section.appendChild(labels);

  return section;
}

// ── Hue Wheel ───────────────────────────────────────────────────────

function buildHueWheel(result) {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: var(--dvfy-space-6); padding: var(--dvfy-space-4); background: var(--dvfy-surface-sunken); border-radius: var(--dvfy-radius-lg);';

  const title = document.createElement('h3');
  title.textContent = 'Hue Distribution';
  title.style.cssText = 'font-size: var(--dvfy-text-sm); font-weight: var(--dvfy-weight-semibold); margin: 0 0 var(--dvfy-space-3); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider); color: var(--dvfy-text-secondary);';
  section.appendChild(title);

  const size = 200;
  const cx = size / 2, cy = size / 2, radius = 80;
  const ns = 'http://www.w3.org/2000/svg';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-6); flex-wrap: wrap;';

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  // Hue ring
  for (let i = 0; i < 360; i += 5) {
    const a1 = (i - 90) * Math.PI / 180;
    const a2 = (i + 5 - 90) * Math.PI / 180;
    const path = document.createElementNS(ns, 'path');
    const x1 = cx + radius * Math.cos(a1), y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2), y2 = cy + radius * Math.sin(a2);
    const ri = radius - 12;
    const x1i = cx + ri * Math.cos(a1), y1i = cy + ri * Math.sin(a1);
    const x2i = cx + ri * Math.cos(a2), y2i = cy + ri * Math.sin(a2);
    path.setAttribute('d', `M${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} L${x2i},${y2i} A${ri},${ri} 0 0,0 ${x1i},${y1i} Z`);
    path.setAttribute('fill', `oklch(0.7 0.15 ${i})`);
    path.setAttribute('opacity', '0.3');
    svg.appendChild(path);
  }

  // Brand hues (large dots)
  result.roles.brand.forEach((b, i) => {
    const a = (b.hue - 90) * Math.PI / 180;
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    plotDot(svg, x, y, 10, b.scale.get(500), `B${i + 1}`, true);
  });

  // Status hues (medium dots)
  for (const [, data] of Object.entries(result.roles.status)) {
    const a = (data.hue - 90) * Math.PI / 180;
    const x = cx + (radius - 6) * Math.cos(a);
    const y = cy + (radius - 6) * Math.sin(a);
    plotDot(svg, x, y, 7, data.scale.get(500), data.name[0].toUpperCase(), false);
  }

  // Support hues (small dots)
  result.roles.support.forEach((s) => {
    const a = (s.hue - 90) * Math.PI / 180;
    const x = cx + (radius - 6) * Math.cos(a);
    const y = cy + (radius - 6) * Math.sin(a);
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', 4);
    dot.setAttribute('fill', s.scale.get(500));
    dot.setAttribute('stroke', 'var(--dvfy-surface-page)');
    dot.setAttribute('stroke-width', 1);
    svg.appendChild(dot);
  });

  wrap.appendChild(svg);

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'display: flex; flex-direction: column; gap: var(--dvfy-space-1);';

  const allItems = [
    ...result.roles.brand.map(b => ({ name: b.name, h: b.hue, type: 'brand', color: b.scale.get(500) })),
    ...Object.entries(result.roles.status).map(([role, d]) => ({ name: role, h: d.hue, type: 'status', color: d.scale.get(500) })),
    ...result.roles.support.map(s => ({ name: s.name, h: s.hue, type: 'support', color: s.scale.get(500) })),
  ].sort((a, b) => a.h - b.h);

  for (const item of allItems) {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-2); font-size: var(--dvfy-text-xs);';

    const dot = document.createElement('span');
    dot.style.cssText = `display: inline-block; width: 0.75rem; height: 0.75rem; border-radius: 50%; background: ${item.color}; border: 1px solid var(--dvfy-border-muted);`;
    row.appendChild(dot);

    const nameEl = document.createElement('span');
    nameEl.textContent = item.name;
    nameEl.style.cssText = item.type === 'brand'
      ? 'font-weight: var(--dvfy-weight-semibold); min-width: 6rem;'
      : item.type === 'status'
        ? 'min-width: 6rem; color: var(--dvfy-text-primary);'
        : 'color: var(--dvfy-text-secondary); min-width: 6rem;';
    row.appendChild(nameEl);

    const hueEl = document.createElement('span');
    hueEl.textContent = `${Math.round(item.h)}\u00b0 ${hueToName(item.h)}`;
    hueEl.style.cssText = 'color: var(--dvfy-text-muted); font-family: var(--dvfy-font-mono);';
    row.appendChild(hueEl);

    legend.appendChild(row);
  }

  wrap.appendChild(legend);
  section.appendChild(wrap);
  return section;
}

function plotDot(svg, x, y, r, fill, label, isBrand) {
  const ns = 'http://www.w3.org/2000/svg';
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
  circle.setAttribute('r', r);
  circle.setAttribute('fill', fill);
  circle.setAttribute('stroke', 'var(--dvfy-surface-page)');
  circle.setAttribute('stroke-width', isBrand ? 2 : 1.5);
  svg.appendChild(circle);

  if (label) {
    const [L] = hexToOklch(fill);
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 1);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('fill', L > 0.55 ? '#000' : '#fff');
    text.setAttribute('font-size', isBrand ? '9' : '7');
    text.setAttribute('font-weight', 'bold');
    text.textContent = label;
    svg.appendChild(text);
  }
}

// ── Export Section ──────────────────────────────────────────────────

function buildExportSection(result) {
  const section = document.createElement('div');
  section.style.cssText = 'margin-top: var(--dvfy-space-6);';

  const actions = document.createElement('div');
  actions.style.cssText = 'display: flex; gap: var(--dvfy-space-2); margin-bottom: var(--dvfy-space-4); flex-wrap: wrap;';

  const copyBtn = document.createElement('dvfy-button');
  copyBtn.setAttribute('variant', 'primary');
  copyBtn.setAttribute('size', 'sm');
  copyBtn.textContent = 'Copy CSS';
  copyBtn.addEventListener('click', () => {
    copyToClipboard(result.css).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy CSS'; }, 2000);
    });
  });
  actions.appendChild(copyBtn);

  const toggleBtn = document.createElement('dvfy-button');
  toggleBtn.setAttribute('variant', 'outline');
  toggleBtn.setAttribute('size', 'sm');
  toggleBtn.textContent = 'Show CSS';
  actions.appendChild(toggleBtn);

  const setBrandBtn = document.createElement('dvfy-button');
  setBrandBtn.setAttribute('variant', 'outline');
  setBrandBtn.setAttribute('size', 'sm');
  setBrandBtn.textContent = 'Set as Brand Palette';
  setBrandBtn.addEventListener('click', () => applyAsBrandPalette(result, setBrandBtn));
  actions.appendChild(setBrandBtn);

  section.appendChild(actions);

  const codeWrap = document.createElement('div');
  codeWrap.style.cssText = 'display: none;';

  const pre = document.createElement('pre');
  pre.style.cssText = 'background: var(--dvfy-surface-sunken); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-md); padding: var(--dvfy-space-4); overflow-x: auto; font-size: var(--dvfy-text-xs); font-family: var(--dvfy-font-mono); max-height: 24rem; color: var(--dvfy-text-primary);';
  pre.textContent = result.css;
  codeWrap.appendChild(pre);
  section.appendChild(codeWrap);

  toggleBtn.addEventListener('click', () => {
    const visible = codeWrap.style.display !== 'none';
    codeWrap.style.display = visible ? 'none' : 'block';
    toggleBtn.textContent = visible ? 'Show CSS' : 'Hide CSS';
  });

  return section;
}

function applyAsBrandPalette(result, btn) {
  const overrides = new Map();
  const brand0 = result.roles.brand[0];

  overrides.set('--dvfy-primary-bg',        brand0.scale.get(500));
  overrides.set('--dvfy-primary-bg-hover',  brand0.scale.get(600));
  overrides.set('--dvfy-primary-bg-active', brand0.scale.get(700));
  overrides.set('--dvfy-primary-bg-subtle', brand0.scale.get(50));
  overrides.set('--dvfy-primary-text',      brand0.scale.get(950));
  overrides.set('--dvfy-primary-border',    brand0.scale.get(500));
  overrides.set('--dvfy-border-focus',      brand0.scale.get(500));
  overrides.set('--dvfy-ring-color',        brand0.scale.get(500));
  overrides.set('--dvfy-selected-bg',       brand0.scale.get(50));
  overrides.set('--dvfy-input-border-focus', brand0.scale.get(500));
  overrides.set('--dvfy-text-link',         brand0.scale.get(700));
  overrides.set('--dvfy-text-link-hover',   brand0.scale.get(800));

  const accentSource = result.roles.brand[1] || brand0;
  overrides.set('--dvfy-accent-bg',        accentSource.scale.get(500));
  overrides.set('--dvfy-accent-bg-hover',  accentSource.scale.get(600));
  overrides.set('--dvfy-accent-bg-subtle', accentSource.scale.get(50));
  overrides.set('--dvfy-accent-text',      accentSource.scale.get(700));
  overrides.set('--dvfy-accent-border',    accentSource.scale.get(200));

  for (const [role, data] of Object.entries(result.roles.status)) {
    overrides.set(`--dvfy-${role}-bg`,        data.scale.get(600));
    overrides.set(`--dvfy-${role}-bg-subtle`, data.scale.get(50));
    overrides.set(`--dvfy-${role}-text`,      data.scale.get(800));
    overrides.set(`--dvfy-${role}-border`,    data.scale.get(200));
  }

  setActiveOverrides(overrides);
  applyActiveOverrides();

  btn.textContent = 'Applied!';
  setTimeout(() => { btn.textContent = 'Set as Brand Palette'; }, 2000);
}
