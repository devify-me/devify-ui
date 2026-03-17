/**
 * catalog/tokens.js — Token showcase renderers
 *
 * Reads live computed values via getComputedStyle for accuracy with active theme.
 */
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
    section.setAttribute('title', family);
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
        navigator.clipboard.writeText(`var(${prop})`);
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
function renderTypography(mainEl, meta) {
  for (const [groupName, tokens] of Object.entries(meta.tokens)) {
    const section = document.createElement('dvfy-section');
    section.setAttribute('title', groupName);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    for (const token of tokens) {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: baseline; gap: var(--dvfy-space-4); padding: var(--dvfy-space-2) 0; border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);';

      const name = document.createElement('code');
      name.textContent = token.name;
      name.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); min-width: 14rem; cursor: pointer;';
      name.title = `Click to copy: var(${token.name})`;
      name.addEventListener('click', () => {
        navigator.clipboard.writeText(`var(${token.name})`);
        name.textContent = 'Copied!';
        setTimeout(() => { name.textContent = token.name; }, 1500);
      });
      row.appendChild(name);

      const sample = document.createElement('span');
      sample.style.cssText = 'flex: 1; color: var(--dvfy-text-primary);';
      const computed = getToken(token.name);

      if (token.type === 'font') {
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
      navigator.clipboard.writeText(`var(${token.name})`);
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
    section.setAttribute('title', groupName);
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
          navigator.clipboard.writeText(`var(${token.name})`);
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
          navigator.clipboard.writeText(`var(${token.name})`);
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
      navigator.clipboard.writeText(`var(${token.name})`);
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
    section.setAttribute('title', groupName);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    const table = createTable(['Token', 'Value']);
    for (const token of tokens) {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.style.cssText = 'font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer;';
      tdName.textContent = token.name;
      tdName.addEventListener('click', () => {
        navigator.clipboard.writeText(`var(${token.name})`);
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
    section.setAttribute('title', groupName);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    const table = createTable(['Token', 'Value']);
    for (const token of tokens) {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.style.cssText = 'font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer;';
      tdName.textContent = token.name;
      tdName.addEventListener('click', () => {
        navigator.clipboard.writeText(`var(${token.name})`);
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
