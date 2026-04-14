/**
 * catalog/tokens.js — Token showcase renderers
 *
 * Reads live computed values via getComputedStyle for accuracy with active theme.
 */
import { copyToClipboard, copyWithReset } from './clipboard.js';
import { TOKEN_GROUPS } from './data.js';

const cs = () => getComputedStyle(document.documentElement);

function getToken(name) {
  return cs().getPropertyValue(name).trim();
}

export function renderTokenView(mainEl, group) {
  const meta = TOKEN_GROUPS[group];
  if (!meta) {
    mainEl.textContent = `Unknown token group: ${group}`;
    return;
  }

  const heading = document.createElement('h2');
  heading.textContent = meta.label;
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-1);';
  mainEl.appendChild(heading);

  const desc = document.createElement('p');
  desc.textContent = meta.description;
  desc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-6);';
  mainEl.appendChild(desc);

  switch (group) {
    case 'colors':    renderColors(mainEl, meta); break;
    case 'typography': renderTypography(mainEl, meta); break;
    case 'spacing':   renderSpacing(mainEl, meta); break;
    case 'borders':   renderBorders(mainEl, meta); break;
    case 'elevation': renderElevation(mainEl, meta); break;
    case 'animation': renderAnimation(mainEl, meta); break;
    case 'layout':    renderTable(mainEl, meta); break;
  }
}

/* ── Colors ── */
function renderColors(mainEl, meta) {
  for (const [family, info] of Object.entries(meta.families)) {
    const section = document.createElement('dvfy-section');
    section.setAttribute('label', family);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr)); gap: var(--dvfy-space-2);';

    for (const step of info.steps) {
      const prop = `${info.prefix}-${step}`;
      const swatch = document.createElement('div');
      swatch.style.cssText = 'text-align: center;';

      const colorBox = document.createElement('div');
      colorBox.style.cssText = `
        width: 100%; aspect-ratio: 1; border-radius: var(--dvfy-radius-lg);
        background: var(${prop}); border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
        margin-bottom: var(--dvfy-space-1);
      `;
      swatch.appendChild(colorBox);

      const label = document.createElement('div');
      label.style.cssText = 'font-size: var(--dvfy-text-xs); font-weight: var(--dvfy-weight-medium); color: var(--dvfy-text-primary);';
      label.textContent = step;
      swatch.appendChild(label);

      const hex = document.createElement('div');
      hex.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); font-family: var(--dvfy-font-mono);';
      hex.textContent = getToken(prop);
      swatch.appendChild(hex);

      // Click to copy token name
      swatch.style.cursor = 'pointer';
      swatch.title = `Click to copy: var(${prop})`;
      swatch.addEventListener('click', () => {
        copyToClipboard(`var(${prop})`);
        label.textContent = 'Copied!';
        setTimeout(() => { label.textContent = step; }, 1500);
      });

      grid.appendChild(swatch);
    }

    section.appendChild(grid);
    mainEl.appendChild(section);
  }
}

/* ── Typography ── */
export function renderTypography(mainEl, meta) {
  for (const [groupName, tokens] of Object.entries(meta.tokens)) {
    const section = document.createElement('dvfy-section');
    section.setAttribute('label', groupName);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    for (const token of tokens) {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: baseline; gap: var(--dvfy-space-4); padding: var(--dvfy-space-2) 0; border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);';

      const name = document.createElement('code');
      const displayName = token.type === 'preset' ? `--dvfy-type-${token.name}-*` : token.name;
      const copyText = token.type === 'preset' ? `--dvfy-type-${token.name}` : `var(${token.name})`;
      name.textContent = displayName;
      name.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); min-width: 14rem; cursor: pointer;';
      name.title = `Click to copy: ${copyText}`;
      name.addEventListener('click', () => {
        copyToClipboard(copyText);
        name.textContent = 'Copied!';
        setTimeout(() => { name.textContent = displayName; }, 1500);
      });
      row.appendChild(name);

      const sample = document.createElement('span');
      sample.style.cssText = 'flex: 1; color: var(--dvfy-text-primary);';
      const computed = getToken(token.name);

      if (token.type === 'preset') {
        const prefix = `--dvfy-type-${token.name}`;
        sample.textContent = token.name === 'code'
          ? 'const theme = generatePalette(brand);'
          : token.name === 'quote'
          ? '\u201CDesign is not just what it looks like. Design is how it works.\u201D'
          : token.name === 'overline'
          ? 'SECTION LABEL'
          : 'The quick brown fox jumps over the lazy dog';
        sample.style.fontFamily = `var(${prefix}-family)`;
        sample.style.fontSize = `var(${prefix}-size)`;
        sample.style.fontWeight = `var(${prefix}-weight)`;
        sample.style.lineHeight = `var(${prefix}-leading)`;
        sample.style.letterSpacing = `var(${prefix}-tracking)`;
        if (token.name === 'overline') sample.style.textTransform = 'uppercase';
      } else if (token.type === 'font') {
        sample.textContent = 'The quick brown fox jumps over the lazy dog';
        sample.style.fontFamily = `var(${token.name})`;
      } else if (token.type === 'size') {
        sample.textContent = 'Aa';
        sample.style.fontSize = `var(${token.name})`;
      } else if (token.type === 'weight') {
        sample.textContent = 'The quick brown fox';
        sample.style.fontWeight = `var(${token.name})`;
      } else {
        sample.textContent = computed;
        sample.style.cssText += 'font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-sm);';
      }
      row.appendChild(sample);

      const val = document.createElement('span');
      val.textContent = token.desc;
      val.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); min-width: 8rem; text-align: right;';
      row.appendChild(val);

      section.appendChild(row);
    }
    mainEl.appendChild(section);
  }
}

/* ── Spacing ── */
function renderSpacing(mainEl, meta) {
  for (const token of meta.tokens) {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-3); padding: var(--dvfy-space-1-5) 0;';

    const name = document.createElement('code');
    name.textContent = token.name;
    name.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); min-width: 12rem; cursor: pointer;';
    name.title = `Click to copy: var(${token.name})`;
    name.addEventListener('click', () => {
      copyToClipboard(`var(${token.name})`);
      name.textContent = 'Copied!';
      setTimeout(() => { name.textContent = token.name; }, 1500);
    });
    row.appendChild(name);

    const bar = document.createElement('div');
    bar.style.cssText = `
      height: var(--dvfy-space-4);
      width: var(${token.name});
      background: var(--dvfy-primary-bg);
      border-radius: var(--dvfy-radius-sm);
      min-width: 2px;
      transition: width var(--dvfy-duration-fast) var(--dvfy-ease-out);
    `;
    row.appendChild(bar);

    const val = document.createElement('span');
    val.textContent = token.desc;
    val.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); white-space: nowrap;';
    row.appendChild(val);

    mainEl.appendChild(row);
  }
}

/* ── Borders ── */
function renderBorders(mainEl, meta) {
  for (const [groupName, tokens] of Object.entries(meta.tokens)) {
    const section = document.createElement('dvfy-section');
    section.setAttribute('label', groupName);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    if (groupName === 'Border Radius') {
      const grid = document.createElement('div');
      grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr)); gap: var(--dvfy-space-4);';

      for (const token of tokens) {
        const item = document.createElement('div');
        item.style.cssText = 'text-align: center;';

        const box = document.createElement('div');
        box.style.cssText = `
          width: 4rem; height: 4rem; margin: 0 auto var(--dvfy-space-2);
          background: var(--dvfy-primary-bg-subtle);
          border: var(--dvfy-border-2) solid var(--dvfy-primary-bg);
          border-radius: var(${token.name});
        `;
        item.appendChild(box);

        const name = document.createElement('code');
        name.textContent = token.name.replace('--dvfy-', '');
        name.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer; display: block;';
        name.addEventListener('click', () => {
          copyToClipboard(`var(${token.name})`);
          name.textContent = 'Copied!';
          setTimeout(() => { name.textContent = token.name.replace('--dvfy-', ''); }, 1500);
        });
        item.appendChild(name);

        const desc = document.createElement('div');
        desc.textContent = token.desc;
        desc.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted);';
        item.appendChild(desc);

        grid.appendChild(item);
      }
      section.appendChild(grid);
    } else {
      // Table layout for border widths and focus ring
      const table = createTable(['Token', 'Value', 'Preview']);
      for (const token of tokens) {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.style.cssText = 'font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer;';
        tdName.textContent = token.name;
        tdName.addEventListener('click', () => {
          copyToClipboard(`var(${token.name})`);
          tdName.textContent = 'Copied!';
          setTimeout(() => { tdName.textContent = token.name; }, 1500);
        });
        tr.appendChild(tdName);

        const tdVal = document.createElement('td');
        tdVal.textContent = token.desc;
        tdVal.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary);';
        tr.appendChild(tdVal);

        const tdPreview = document.createElement('td');
        if (groupName === 'Border Width') {
          const line = document.createElement('div');
          line.style.cssText = `width: 4rem; border-top: var(${token.name}) solid var(--dvfy-primary-bg);`;
          tdPreview.appendChild(line);
        }
        tr.appendChild(tdPreview);

        table.querySelector('tbody').appendChild(tr);
      }
      section.appendChild(table);
    }

    mainEl.appendChild(section);
  }
}

/* ── Elevation ── */
function renderElevation(mainEl, meta) {
  // Shadow color swatch
  const colorRow = document.createElement('div');
  colorRow.style.cssText = 'display: flex; align-items: center; gap: var(--dvfy-space-3); margin-bottom: var(--dvfy-space-6); padding: var(--dvfy-space-3); border: var(--dvfy-border-1) solid var(--dvfy-border-default); border-radius: var(--dvfy-radius-md);';

  const swatch = document.createElement('div');
  swatch.style.cssText = 'width: 2.5rem; height: 2.5rem; border-radius: var(--dvfy-radius-md); background: var(--dvfy-shadow-color); flex-shrink: 0;';
  colorRow.appendChild(swatch);

  const colorInfo = document.createElement('div');
  const colorLabel = document.createElement('code');
  colorLabel.textContent = '--dvfy-shadow-color';
  colorLabel.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-link); cursor: pointer; display: block;';
  colorLabel.addEventListener('click', () => {
    copyToClipboard('var(--dvfy-shadow-color)');
    colorLabel.textContent = 'Copied!';
    setTimeout(() => { colorLabel.textContent = '--dvfy-shadow-color'; }, 1500);
  });
  colorInfo.appendChild(colorLabel);

  const colorValue = document.createElement('div');
  colorValue.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); font-family: var(--dvfy-font-mono);';
  colorValue.textContent = getComputedStyle(document.documentElement).getPropertyValue('--dvfy-shadow-color').trim();
  colorInfo.appendChild(colorValue);

  const colorDesc = document.createElement('div');
  colorDesc.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted);';
  colorDesc.textContent = 'Derived from theme primary — tints all shadows';
  colorInfo.appendChild(colorDesc);

  colorRow.appendChild(colorInfo);
  mainEl.appendChild(colorRow);

  // Elevation surface backgrounds
  const surfaceHeading = document.createElement('h3');
  surfaceHeading.textContent = 'Elevation Surfaces';
  surfaceHeading.style.cssText = 'margin: var(--dvfy-space-4) 0 var(--dvfy-space-2); font-size: var(--dvfy-text-base); font-weight: 600;';
  mainEl.appendChild(surfaceHeading);

  const surfaceDesc = document.createElement('p');
  surfaceDesc.textContent = 'Progressively lighter backgrounds per elevation level. Uniform in light mode, differentiated in dark mode.';
  surfaceDesc.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-muted); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(surfaceDesc);

  const surfaceGrid = document.createElement('div');
  surfaceGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); gap: var(--dvfy-space-3); margin-bottom: var(--dvfy-space-8);';

  const levels = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const levelUse = { '2xs': 'Page base', 'xs': 'Subtle UI', 'sm': 'Cards', 'md': 'Raised cards', 'lg': 'Dropdowns', 'xl': 'Modals', '2xl': 'Top layer' };
  for (const lvl of levels) {
    const tile = document.createElement('div');
    const tokenName = `--dvfy-elevation-${lvl}-bg`;
    tile.style.cssText = `
      background: var(${tokenName});
      border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
      border-radius: var(--dvfy-radius-md);
      padding: var(--dvfy-space-4);
      text-align: center;
      min-height: 5rem;
      display: flex; flex-direction: column; justify-content: center; gap: var(--dvfy-space-1);
    `;
    const label = document.createElement('code');
    label.textContent = lvl;
    label.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-link); cursor: pointer;';
    label.addEventListener('click', () => {
      copyToClipboard(`var(${tokenName})`);
      label.textContent = 'Copied!';
      setTimeout(() => { label.textContent = lvl; }, 1500);
    });
    tile.appendChild(label);

    const use = document.createElement('div');
    use.textContent = levelUse[lvl];
    use.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted);';
    tile.appendChild(use);

    surfaceGrid.appendChild(tile);
  }
  mainEl.appendChild(surfaceGrid);

  // Shadow scale heading
  const shadowHeading = document.createElement('h3');
  shadowHeading.textContent = 'Glow Shadows';
  shadowHeading.style.cssText = 'margin: var(--dvfy-space-4) 0 var(--dvfy-space-2); font-size: var(--dvfy-text-base); font-weight: 600;';
  mainEl.appendChild(shadowHeading);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: var(--dvfy-space-6);';

  for (const token of meta.tokens) {
    const card = document.createElement('dvfy-card');
    card.style.cssText = `
      padding: var(--dvfy-space-6); text-align: center;
      box-shadow: var(${token.name});
    `;

    const name = document.createElement('code');
    name.textContent = token.name.replace('--dvfy-', '');
    name.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer; display: block; margin-bottom: var(--dvfy-space-1);';
    name.addEventListener('click', () => {
      copyToClipboard(`var(${token.name})`);
      name.textContent = 'Copied!';
      setTimeout(() => { name.textContent = token.name.replace('--dvfy-', ''); }, 1500);
    });
    card.appendChild(name);

    const desc = document.createElement('div');
    desc.textContent = token.desc;
    desc.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted);';
    card.appendChild(desc);

    grid.appendChild(card);
  }
  mainEl.appendChild(grid);
}

/* ── Animation ── */
function renderAnimation(mainEl, meta) {
  for (const [groupName, tokens] of Object.entries(meta.tokens)) {
    const section = document.createElement('dvfy-section');
    section.setAttribute('label', groupName);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    const table = createTable(['Token', 'Value']);
    for (const token of tokens) {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.style.cssText = 'font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer;';
      tdName.textContent = token.name;
      tdName.addEventListener('click', () => {
        copyToClipboard(`var(${token.name})`);
        tdName.textContent = 'Copied!';
        setTimeout(() => { tdName.textContent = token.name; }, 1500);
      });
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.textContent = token.desc;
      tdVal.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary);';
      tr.appendChild(tdVal);

      table.querySelector('tbody').appendChild(tr);
    }
    section.appendChild(table);
    mainEl.appendChild(section);
  }
}

/* ── Layout (generic table) ── */
function renderTable(mainEl, meta) {
  for (const [groupName, tokens] of Object.entries(meta.tokens)) {
    const section = document.createElement('dvfy-section');
    section.setAttribute('label', groupName);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    const table = createTable(['Token', 'Value']);
    for (const token of tokens) {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.style.cssText = 'font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer;';
      tdName.textContent = token.name;
      tdName.addEventListener('click', () => {
        copyToClipboard(`var(${token.name})`);
        tdName.textContent = 'Copied!';
        setTimeout(() => { tdName.textContent = token.name; }, 1500);
      });
      tr.appendChild(tdName);

      const tdVal = document.createElement('td');
      tdVal.textContent = token.desc;
      tdVal.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary);';
      tr.appendChild(tdVal);

      table.querySelector('tbody').appendChild(tr);
    }
    section.appendChild(table);
    mainEl.appendChild(section);
  }
}

/* ── Helper ── */
function createTable(headers) {
  const table = document.createElement('table');
  table.style.cssText = 'width: 100%; border-collapse: collapse;';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const h of headers) {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.cssText = `
      text-align: left; padding: var(--dvfy-space-2) var(--dvfy-space-3);
      background: var(--dvfy-surface-sunken); color: var(--dvfy-text-secondary);
      font-weight: var(--dvfy-weight-medium); font-size: var(--dvfy-text-xs);
      text-transform: uppercase; letter-spacing: var(--dvfy-tracking-wider);
    `;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  // Row styling
  const style = document.createElement('style');
  style.textContent = `
    .catalog-token-table td {
      padding: var(--dvfy-space-2) var(--dvfy-space-3);
      border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
    }
  `;

  return table;
}
