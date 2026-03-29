/**
 * catalog/brand.js — Themes: multi-theme comparison view
 *
 * Shows all available themes side-by-side with a Light/Dark toggle.
 * Each cell is editable via inline color picker. Users can generate
 * new themes from their palette colors. Uses hidden probe elements
 * with data-theme attributes to read computed values simultaneously.
 */
import { SEMANTIC_TOKENS, THEMES } from './data.js';
import { copyToClipboard } from './clipboard.js';
import { hexToOklch } from '../tokens/palette-generator.js';
import { generateTheme, injectThemeStyle, removeThemeStyle } from '../tokens/theme-generator.js';
import { generatePalette, hueToName } from '../tokens/palette-generator.js';
import { getPalette, getCustomThemes, setCustomThemes } from './storage.js';

/** Convert computed color to hex for color picker */
function toHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) return color;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

export function renderThemes(mainEl) {
  let mode = 'light';
  let showDesc = false;
  const probes = new Map();
  const overrides = new Map();

  // Load persisted custom themes
  let customThemes = getCustomThemes() || [];
  for (const ct of customThemes) {
    injectThemeStyle(ct.name, ct);
  }

  // Get saved palette for the generate panel
  const savedPalette = getPalette();

  // ── Header ──
  const heading = document.createElement('h2');
  heading.textContent = 'Themes';
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-1);';
  mainEl.appendChild(heading);

  const desc = document.createElement('p');
  desc.textContent = 'Compare semantic tokens across themes. Toggle Light/Dark to switch mode. Generate new themes from your palette colors.';
  desc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(desc);

  // ── Controls ──
  const controls = document.createElement('div');
  controls.style.cssText = 'display: flex; gap: var(--dvfy-space-2); margin-bottom: var(--dvfy-space-4); align-items: center; flex-wrap: wrap;';

  // Light/Dark toggle
  const modeToggle = document.createElement('div');
  modeToggle.style.cssText = 'display: flex; gap: 2px; padding: var(--dvfy-space-1); background: var(--dvfy-surface-sunken); border-radius: var(--dvfy-radius-md);';

  const lightBtn = createModeBtn('Light');
  const darkBtn = createModeBtn('Dark');
  setModeActive(lightBtn, true);
  setModeActive(darkBtn, false);

  lightBtn.addEventListener('click', () => { mode = 'light'; setModeActive(lightBtn, true); setModeActive(darkBtn, false); rebuildTable(); });
  darkBtn.addEventListener('click', () => { mode = 'dark'; setModeActive(darkBtn, true); setModeActive(lightBtn, false); rebuildTable(); });

  modeToggle.appendChild(lightBtn);
  modeToggle.appendChild(darkBtn);
  controls.appendChild(modeToggle);

  // Description toggle
  const descToggle = document.createElement('dvfy-button');
  descToggle.setAttribute('variant', 'ghost');
  descToggle.setAttribute('size', 'sm');
  descToggle.textContent = 'Show Descriptions';
  descToggle.addEventListener('click', () => {
    showDesc = !showDesc;
    descToggle.textContent = showDesc ? 'Hide Descriptions' : 'Show Descriptions';
    rebuildTable();
  });
  controls.appendChild(descToggle);

  // Export
  const exportBtn = document.createElement('dvfy-button');
  exportBtn.setAttribute('variant', 'primary');
  exportBtn.setAttribute('size', 'sm');
  exportBtn.textContent = 'Export Theme';
  exportBtn.addEventListener('click', () => exportOverrides(exportBtn, overrides));
  controls.appendChild(exportBtn);

  mainEl.appendChild(controls);

  // ── Generate Theme Panel ──
  mainEl.appendChild(buildGeneratePanel(() => rebuildTable()));

  // ── Table container ──
  const tableContainer = document.createElement('div');
  tableContainer.style.cssText = 'overflow-x: auto;';
  mainEl.appendChild(tableContainer);

  // ── Column helpers ──

  function getThemeColumns() {
    const cols = THEMES.map(t => ({ ...t, removable: false }));
    for (const ct of customThemes) {
      cols.push({ value: ct.name, label: ct.label, removable: true });
    }
    // Can't delete the last theme
    if (cols.length <= 1) {
      for (const col of cols) col.removable = false;
    }
    return cols;
  }

  function getThemeAttr(themeName) {
    if (themeName === 'custom') return themeName;
    return mode === 'dark' ? `${themeName}-dark` : themeName;
  }

  function ensureProbes(columns) {
    for (const [, el] of probes) el.remove();
    probes.clear();
    for (const col of columns) {
      if (col.value === 'custom') continue;
      const probe = document.createElement('div');
      probe.style.cssText = 'position: fixed; left: -9999px; top: -9999px; visibility: hidden; pointer-events: none;';
      probe.setAttribute('data-theme', getThemeAttr(col.value));
      document.body.appendChild(probe);
      probes.set(col.value, probe);
    }
  }

  function getTokenValue(themeName, tokenName) {
    if (overrides.has(themeName)) {
      const ov = overrides.get(themeName).get(tokenName);
      if (ov) return ov;
    }
    // Custom themes: look up from stored theme data
    const ct = customThemes.find(t => t.name === themeName);
    if (ct) {
      const modeData = mode === 'dark' ? ct.dark : ct.light;
      if (modeData?.[tokenName]) return modeData[tokenName];
    }
    const probe = probes.get(themeName);
    if (!probe) return '';
    return getComputedStyle(probe).getPropertyValue(tokenName).trim();
  }

  function removeCustomTheme(name) {
    if (customThemes.length <= 1) return; // Must keep at least one theme
    customThemes = customThemes.filter(t => t.name !== name);
    setCustomThemes(customThemes);
    removeThemeStyle(name);
    const switcher = document.querySelector('dvfy-theme-switcher');
    if (switcher) switcher.removeTheme(name);
    rebuildTable();
  }

  // ── Build table ──
  function rebuildTable() {
    tableContainer.textContent = '';
    const columns = getThemeColumns();
    ensureProbes(columns);

    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: var(--dvfy-text-sm);';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const thToken = document.createElement('th');
    thToken.textContent = 'Token';
    thToken.style.cssText = thStyle() + 'min-width: 10rem; text-align: left;';
    headerRow.appendChild(thToken);

    for (const col of columns) {
      const th = document.createElement('th');
      th.style.cssText = thStyle() + 'min-width: 7rem; text-align: center;';

      const thContent = document.createElement('div');
      thContent.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: var(--dvfy-space-1);';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = col.label;
      thContent.appendChild(labelSpan);

      if (col.removable) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '\u00d7';
        removeBtn.title = 'Remove theme';
        removeBtn.style.cssText = 'border: none; background: none; color: var(--dvfy-text-muted); cursor: pointer; font-size: var(--dvfy-text-base); padding: 0; line-height: 1;';
        removeBtn.addEventListener('click', () => removeCustomTheme(col.value));
        thContent.appendChild(removeBtn);
      }

      th.appendChild(thContent);
      headerRow.appendChild(th);
    }

    if (showDesc) {
      const thDesc = document.createElement('th');
      thDesc.textContent = 'Description';
      thDesc.style.cssText = thStyle() + 'min-width: 10rem; text-align: left;';
      headerRow.appendChild(thDesc);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    for (const [group, tokens] of Object.entries(SEMANTIC_TOKENS)) {
      const groupRow = document.createElement('tr');
      const groupCell = document.createElement('td');
      groupCell.colSpan = columns.length + 1 + (showDesc ? 1 : 0);
      groupCell.textContent = group;
      groupCell.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-3); font-weight: var(--dvfy-weight-semibold); font-size: var(--dvfy-text-xs); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider); color: var(--dvfy-text-secondary); background: var(--dvfy-surface-sunken); border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);';
      groupRow.appendChild(groupCell);
      tbody.appendChild(groupRow);

      for (const token of tokens) {
        const tr = document.createElement('tr');

        // Token name
        const tdName = document.createElement('td');
        tdName.textContent = token.name.replace('--dvfy-', '');
        tdName.title = 'Click to copy semantic variable';
        tdName.style.cssText = 'padding: var(--dvfy-space-1) var(--dvfy-space-3); font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer; border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted); white-space: nowrap;';
        tdName.addEventListener('click', () => {
          copyToClipboard(`var(${token.name})`).then(() => {
            tdName.textContent = 'Copied!';
            setTimeout(() => { tdName.textContent = token.name.replace('--dvfy-', ''); }, 1000);
          });
        });
        tr.appendChild(tdName);

        // Theme columns
        for (const col of columns) {
          const td = document.createElement('td');
          td.style.cssText = 'padding: var(--dvfy-space-1) var(--dvfy-space-2); border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted); text-align: center;';

          const computed = getTokenValue(col.value, token.name);

          if (token.type === 'color') {
            td.appendChild(buildThemeCell(col.value, token.name, computed, overrides));
          } else {
            const span = document.createElement('span');
            span.textContent = computed;
            span.style.cssText = 'font-size: var(--dvfy-text-xs); font-family: var(--dvfy-font-mono); color: var(--dvfy-text-muted);';
            td.appendChild(span);
          }

          tr.appendChild(td);
        }

        // Description column
        if (showDesc) {
          const tdDesc = document.createElement('td');
          tdDesc.textContent = token.desc;
          tdDesc.style.cssText = 'padding: var(--dvfy-space-1) var(--dvfy-space-3); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);';
          tr.appendChild(tdDesc);
        }

        tbody.appendChild(tr);
      }
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);
  }

  // ── Generate Theme Panel ──

  /**
   * Build the generate panel with a color picker showing all palette
   * 500-step colors (brand + status + support) with swatch previews.
   */
  function buildGeneratePanel(onGenerate) {
    const panel = document.createElement('div');
    panel.style.cssText = 'margin-bottom: var(--dvfy-space-4); padding: var(--dvfy-space-3); background: var(--dvfy-surface-sunken); border-radius: var(--dvfy-radius-md); display: flex; align-items: end; gap: var(--dvfy-space-3); flex-wrap: wrap;';

    // Generate the palette to get all available colors
    const brandColors = savedPalette?.brandColors || ['#1a56db'];
    const palette = generatePalette({
      brandColors,
      supportCount: savedPalette?.supportCount || 6,
      prefix: '--brand',
    });

    // Collect all palette colors with their 500 step
    const colorOptions = [];
    palette.roles.brand.forEach((b, i) => {
      colorOptions.push({ key: `brand-${i}`, label: b.name, hex: b.scale.get(500), type: 'brand', brandIndex: i });
    });
    for (const [role, data] of Object.entries(palette.roles.status)) {
      colorOptions.push({ key: `status-${role}`, label: role, hex: data.scale.get(500), type: 'status', brandIndex: 0 });
    }
    palette.roles.support.forEach((s, i) => {
      colorOptions.push({ key: `support-${i}`, label: s.name, hex: s.scale.get(500), type: 'support', brandIndex: 0 });
    });

    // Color picker with swatch preview
    const colorWrap = document.createElement('div');
    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Primary color';
    colorLabel.style.cssText = 'display: block; font-size: var(--dvfy-text-xs); font-weight: var(--dvfy-weight-medium); color: var(--dvfy-text-secondary); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider); margin-bottom: var(--dvfy-space-1);';
    colorWrap.appendChild(colorLabel);

    // Custom select container with swatch previews
    const selectContainer = document.createElement('div');
    selectContainer.style.cssText = 'position: relative;';

    const selectedDisplay = document.createElement('button');
    selectedDisplay.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-2); padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-sm); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); background: var(--dvfy-surface-raised); color: var(--dvfy-text-primary); cursor: pointer; min-width: 12rem; font-family: inherit;';

    let selectedIndex = 0;
    function updateSelectedDisplay() {
      selectedDisplay.textContent = '';
      const opt = colorOptions[selectedIndex];
      const swatch = document.createElement('span');
      swatch.style.cssText = `display: inline-block; width: 1rem; height: 1rem; border-radius: var(--dvfy-radius-sm); background: ${opt.hex}; border: var(--dvfy-border-1) solid var(--dvfy-border-muted); flex-shrink: 0;`;
      selectedDisplay.appendChild(swatch);
      const text = document.createElement('span');
      text.textContent = opt.label;
      text.style.cssText = 'flex: 1; text-align: left;';
      selectedDisplay.appendChild(text);
      const arrow = document.createElement('span');
      arrow.textContent = '\u25be';
      arrow.style.cssText = 'color: var(--dvfy-text-muted);';
      selectedDisplay.appendChild(arrow);
    }
    updateSelectedDisplay();

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.style.cssText = 'display: none; position: absolute; top: 100%; left: 0; z-index: 10; min-width: 100%; max-height: 16rem; overflow-y: auto; background: var(--dvfy-surface-raised); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); box-shadow: var(--dvfy-shadow-lg); margin-top: 2px;';

    let currentGroup = '';
    colorOptions.forEach((opt, i) => {
      // Group separator
      if (opt.type !== currentGroup) {
        currentGroup = opt.type;
        const groupLabel = document.createElement('div');
        groupLabel.textContent = opt.type === 'brand' ? 'Brand' : opt.type === 'status' ? 'Status' : 'Support';
        groupLabel.style.cssText = 'padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: 9px; font-weight: var(--dvfy-weight-semibold); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider); color: var(--dvfy-text-muted); background: var(--dvfy-surface-sunken);';
        dropdown.appendChild(groupLabel);
      }

      const item = document.createElement('div');
      item.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-2); padding: var(--dvfy-space-1) var(--dvfy-space-2); cursor: pointer; font-size: var(--dvfy-text-sm);';
      item.addEventListener('mouseenter', () => { item.style.background = 'var(--dvfy-surface-sunken)'; });
      item.addEventListener('mouseleave', () => { item.style.background = ''; });

      const swatch = document.createElement('span');
      swatch.style.cssText = `display: inline-block; width: 1rem; height: 1rem; border-radius: var(--dvfy-radius-sm); background: ${opt.hex}; border: var(--dvfy-border-1) solid var(--dvfy-border-muted); flex-shrink: 0;`;
      item.appendChild(swatch);

      const label = document.createElement('span');
      label.textContent = opt.label;
      item.appendChild(label);

      const hexSpan = document.createElement('span');
      hexSpan.textContent = opt.hex;
      hexSpan.style.cssText = 'font-size: var(--dvfy-text-xs); font-family: var(--dvfy-font-mono); color: var(--dvfy-text-muted); margin-left: auto;';
      item.appendChild(hexSpan);

      item.addEventListener('click', () => {
        selectedIndex = i;
        updateSelectedDisplay();
        dropdown.style.display = 'none';
      });

      dropdown.appendChild(item);
    });

    selectedDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => { dropdown.style.display = 'none'; });

    selectContainer.appendChild(selectedDisplay);
    selectContainer.appendChild(dropdown);
    colorWrap.appendChild(selectContainer);
    panel.appendChild(colorWrap);

    // Theme label
    const labelWrap = document.createElement('div');
    const labelLabel = document.createElement('label');
    labelLabel.textContent = 'Theme name';
    labelLabel.style.cssText = 'display: block; font-size: var(--dvfy-text-xs); font-weight: var(--dvfy-weight-medium); color: var(--dvfy-text-secondary); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider); margin-bottom: var(--dvfy-space-1);';
    labelWrap.appendChild(labelLabel);

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'e.g., "Fintech Blue"';
    labelInput.value = '';
    labelInput.style.cssText = 'padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-sm); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); background: var(--dvfy-surface-raised); color: var(--dvfy-text-primary); width: 12rem;';
    labelWrap.appendChild(labelInput);
    panel.appendChild(labelWrap);

    // Generate button — normal variant (not ghost/outline)
    const genBtn = document.createElement('dvfy-button');
    genBtn.setAttribute('size', 'sm');
    genBtn.textContent = '+ Generate Theme';
    genBtn.addEventListener('click', () => {
      const opt = colorOptions[selectedIndex];
      const themeLabel = labelInput.value.trim() || `${opt.label} Theme`;
      const themeName = `custom-${themeLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

      // Use the selected color's brand index for brand colors,
      // or index 0 for status/support (theme maps primary to chosen color's hue)
      const brandIndex = opt.type === 'brand' ? opt.brandIndex : 0;

      const theme = generateTheme(palette, brandIndex);

      // If user picked a non-brand color (status/support), override primary
      // to use that color's scale instead
      if (opt.type !== 'brand') {
        const chosenScale = opt.type === 'status'
          ? palette.roles.status[opt.label]?.scale
          : palette.roles.support.find(s => s.name === opt.label)?.scale;
        if (chosenScale) {
          // Override primary tokens with the chosen color's scale
          theme.light['--dvfy-primary-bg'] = chosenScale.get(500);
          theme.light['--dvfy-primary-bg-hover'] = chosenScale.get(600);
          theme.light['--dvfy-primary-bg-active'] = chosenScale.get(700);
          theme.light['--dvfy-primary-bg-subtle'] = chosenScale.get(50);
          theme.light['--dvfy-primary-border'] = chosenScale.get(500);
          theme.light['--dvfy-border-focus'] = chosenScale.get(500);
          theme.light['--dvfy-ring-color'] = chosenScale.get(500);
          theme.light['--dvfy-text-link'] = chosenScale.get(600);
          theme.light['--dvfy-text-link-hover'] = chosenScale.get(700);
          theme.dark['--dvfy-primary-bg'] = chosenScale.get(500);
          theme.dark['--dvfy-primary-bg-hover'] = chosenScale.get(400);
          theme.dark['--dvfy-primary-bg-active'] = chosenScale.get(300);
          theme.dark['--dvfy-primary-bg-subtle'] = chosenScale.get(950);
          theme.dark['--dvfy-primary-border'] = chosenScale.get(500);
          theme.dark['--dvfy-border-focus'] = chosenScale.get(400);
          theme.dark['--dvfy-ring-color'] = chosenScale.get(400);
          theme.dark['--dvfy-text-link'] = chosenScale.get(400);
          theme.dark['--dvfy-text-link-hover'] = chosenScale.get(300);
        }
      }

      injectThemeStyle(themeName, theme);

      const entry = { name: themeName, label: themeLabel, brandIndex, ...theme };
      customThemes.push(entry);
      setCustomThemes(customThemes);

      // Add to theme-switcher and activate
      const switcher = document.querySelector('dvfy-theme-switcher');
      if (switcher) {
        switcher.addTheme(themeName, themeLabel);
        switcher.setTheme(themeName);
      }

      labelInput.value = '';
      onGenerate();
    });
    panel.appendChild(genBtn);

    return panel;
  }

  rebuildTable();
}

function buildThemeCell(themeName, tokenName, computedValue, overrides) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-1); justify-content: center;';

  const hex = toHex(computedValue);

  const picker = document.createElement('input');
  picker.type = 'color';
  picker.value = hex;
  picker.title = 'Choose color';
  picker.style.cssText = 'width: 1.5rem; height: 1.5rem; border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: 3px; cursor: pointer; padding: 0; flex-shrink: 0;';
  picker.addEventListener('input', () => {
    if (!overrides.has(themeName)) overrides.set(themeName, new Map());
    overrides.get(themeName).set(tokenName, picker.value);
    hexLabel.textContent = picker.value;
    if (themeName === 'custom' || isActiveTheme(themeName)) {
      document.documentElement.style.setProperty(tokenName, picker.value);
    }
  });

  const hexLabel = document.createElement('span');
  hexLabel.textContent = hex;
  hexLabel.title = 'Click to copy hex code';
  hexLabel.style.cssText = 'font-size: 10px; font-family: var(--dvfy-font-mono); color: var(--dvfy-text-muted); cursor: pointer;';
  hexLabel.addEventListener('click', () => {
    copyToClipboard(hex).then(() => {
      hexLabel.textContent = 'Copied!';
      setTimeout(() => { hexLabel.textContent = hex; }, 1000);
    });
  });

  wrap.appendChild(picker);
  wrap.appendChild(hexLabel);
  return wrap;
}

function isActiveTheme(themeName) {
  const current = document.documentElement.getAttribute('data-theme') || '';
  return current === themeName || current === `${themeName}-dark`;
}

function createModeBtn(label) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = 'border: none; padding: var(--dvfy-space-1) var(--dvfy-space-3); border-radius: var(--dvfy-radius-sm); cursor: pointer; font-size: var(--dvfy-text-sm); font-weight: var(--dvfy-weight-medium); font-family: inherit; transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);';
  return btn;
}

function setModeActive(btn, active) {
  btn.style.background = active ? 'var(--dvfy-primary-bg)' : 'transparent';
  btn.style.color = active ? 'var(--dvfy-primary-text)' : 'var(--dvfy-text-secondary)';
}

function thStyle() {
  return 'padding: var(--dvfy-space-2) var(--dvfy-space-3); background: var(--dvfy-surface-sunken); color: var(--dvfy-text-secondary); font-weight: var(--dvfy-weight-medium); font-size: var(--dvfy-text-xs); text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider);';
}

function exportOverrides(btn, overrides) {
  let total = 0;
  for (const m of overrides.values()) total += m.size;
  if (total === 0) {
    btn.textContent = 'No overrides';
    setTimeout(() => { btn.textContent = 'Export Theme'; }, 2000);
    return;
  }

  // Collect all token names from SEMANTIC_TOKENS
  const allTokens = [];
  for (const [group, tokens] of Object.entries(SEMANTIC_TOKENS)) {
    for (const token of tokens) {
      allTokens.push({ name: token.name, desc: token.desc, group });
    }
  }

  // Read default values from the page's computed styles
  const defaults = new Map();
  const computed = getComputedStyle(document.documentElement);
  for (const { name } of allTokens) {
    defaults.set(name, toHex(computed.getPropertyValue(name).trim()));
  }

  let css = `/*\n * @devify/ui — Custom Theme\n *\n * Generated by the Design System Explorer\n *\n * Usage:\n *   1. Save this file as tokens/themes/my-brand.css\n *   2. Import it after devify.css:\n *      <link rel="stylesheet" href="tokens/themes/my-brand.css">\n *   3. Set the theme on your HTML element:\n *      <html data-theme="my-brand">\n */\n\n`;

  for (const [theme, map] of overrides) {
    if (map.size === 0) continue;
    const selector = theme === 'custom' ? ':root' : `[data-theme="${theme}"]`;

    css += `${selector} {\n`;

    let currentGroup = '';
    for (const { name, desc, group } of allTokens) {
      // Group header
      if (group !== currentGroup) {
        if (currentGroup) css += '\n';
        css += `  /* ── ${group} ── */\n`;
        currentGroup = group;
      }

      const override = map.get(name);
      if (override) {
        css += `  ${name}: ${override};\n`;
      } else {
        const def = defaults.get(name) || '#000000';
        css += `  /* ${name}: ${def}; — ${desc} */\n`;
      }
    }

    css += '}\n\n';
  }

  copyToClipboard(css.trim()).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Export Theme'; }, 2000);
  });
}
