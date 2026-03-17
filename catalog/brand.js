/**
 * catalog/brand.js — Live-editable brand settings sandbox
 *
 * Renders semantic tokens organized by role with live color pickers,
 * reset, and theme export functionality.
 */
import { SEMANTIC_TOKENS } from './data.js';

/** Track overrides for export */
const overrides = new Map();

export function renderBrandSettings(mainEl) {
  overrides.clear();

  // Title
  const heading = document.createElement('h2');
  heading.textContent = 'Brand Settings';
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-1);';
  mainEl.appendChild(heading);

  const desc = document.createElement('p');
  desc.textContent = 'Edit semantic tokens live. Changes apply immediately to the entire page. Export your customizations as a theme CSS block.';
  desc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(desc);

  // Top actions
  const actions = document.createElement('div');
  actions.style.cssText = 'display: flex; gap: var(--dvfy-space-2); margin-bottom: var(--dvfy-space-6);';

  const resetAllBtn = document.createElement('dvfy-button');
  resetAllBtn.setAttribute('variant', 'outline');
  resetAllBtn.setAttribute('size', 'sm');
  resetAllBtn.textContent = 'Reset All';
  resetAllBtn.addEventListener('click', () => {
    for (const tokens of Object.values(SEMANTIC_TOKENS)) {
      for (const token of tokens) {
        document.documentElement.style.removeProperty(token.name);
      }
    }
    overrides.clear();
    // Re-render to update computed values
    mainEl.textContent = '';
    renderBrandSettings(mainEl);
  });
  actions.appendChild(resetAllBtn);

  const exportBtn = document.createElement('dvfy-button');
  exportBtn.setAttribute('variant', 'primary');
  exportBtn.setAttribute('size', 'sm');
  exportBtn.textContent = 'Export Theme';
  exportBtn.addEventListener('click', () => exportTheme(exportBtn));
  actions.appendChild(exportBtn);

  mainEl.appendChild(actions);

  // Token sections
  for (const [group, tokens] of Object.entries(SEMANTIC_TOKENS)) {
    const section = document.createElement('dvfy-section');
    section.setAttribute('title', group);
    section.style.marginBottom = 'var(--dvfy-space-4)';

    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse; margin-bottom: var(--dvfy-space-2);';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const h of ['Token', 'Editor', 'Current', 'Description']) {
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
    for (const token of tokens) {
      tbody.appendChild(buildTokenRow(token));
    }
    table.appendChild(tbody);
    section.appendChild(table);

    // Reset section button
    const resetBtn = document.createElement('dvfy-button');
    resetBtn.setAttribute('variant', 'ghost');
    resetBtn.setAttribute('size', 'sm');
    resetBtn.textContent = `Reset ${group}`;
    resetBtn.addEventListener('click', () => {
      for (const token of tokens) {
        document.documentElement.style.removeProperty(token.name);
        overrides.delete(token.name);
      }
      // Update the rows in this section
      const rows = tbody.querySelectorAll('tr');
      rows.forEach((tr, i) => {
        const computed = getComputedValue(tokens[i].name);
        const currentCell = tr.querySelector('[data-current]');
        if (currentCell) currentCell.textContent = computed;
        const input = tr.querySelector('input');
        if (input && tokens[i].type === 'color') input.value = toHex(computed);
      });
    });
    section.appendChild(resetBtn);

    mainEl.appendChild(section);
  }
}

function buildTokenRow(token) {
  const tr = document.createElement('tr');

  // Token name
  const tdName = document.createElement('td');
  tdName.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-3); font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-link); cursor: pointer; border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);';
  tdName.textContent = token.name;
  tdName.addEventListener('click', () => {
    navigator.clipboard.writeText(`var(${token.name})`);
    tdName.textContent = 'Copied!';
    setTimeout(() => { tdName.textContent = token.name; }, 1500);
  });
  tr.appendChild(tdName);

  // Editor
  const tdEditor = document.createElement('td');
  tdEditor.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-3); border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);';

  const computed = getComputedValue(token.name);

  if (token.type === 'color') {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = toHex(computed);
    input.style.cssText = 'width: 2.5rem; height: 2rem; border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); cursor: pointer; padding: 0;';
    input.addEventListener('input', () => {
      document.documentElement.style.setProperty(token.name, input.value);
      overrides.set(token.name, input.value);
      const currentCell = tr.querySelector('[data-current]');
      if (currentCell) currentCell.textContent = input.value;
    });
    tdEditor.appendChild(input);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = computed;
    input.style.cssText = 'width: 10rem; padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); font-family: var(--dvfy-font-mono); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-sm); background: var(--dvfy-surface-raised); color: var(--dvfy-text-primary);';
    input.addEventListener('change', () => {
      document.documentElement.style.setProperty(token.name, input.value);
      overrides.set(token.name, input.value);
      const currentCell = tr.querySelector('[data-current]');
      if (currentCell) currentCell.textContent = input.value;
    });
    tdEditor.appendChild(input);
  }
  tr.appendChild(tdEditor);

  // Current value
  const tdCurrent = document.createElement('td');
  tdCurrent.setAttribute('data-current', '');
  tdCurrent.textContent = computed;
  tdCurrent.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-3); font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);';
  tr.appendChild(tdCurrent);

  // Description
  const tdDesc = document.createElement('td');
  tdDesc.textContent = token.desc;
  tdDesc.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-3); font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary); border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);';
  tr.appendChild(tdDesc);

  return tr;
}

function exportTheme(btn) {
  if (overrides.size === 0) {
    btn.textContent = 'No changes to export';
    setTimeout(() => { btn.textContent = 'Export Theme'; }, 2000);
    return;
  }

  let css = '[data-theme="custom"] {\n';
  for (const [name, value] of overrides) {
    css += `  ${name}: ${value};\n`;
  }
  css += '}';

  navigator.clipboard.writeText(css).then(() => {
    btn.textContent = 'Copied to clipboard!';
    setTimeout(() => { btn.textContent = 'Export Theme'; }, 2000);
  });
}

function getComputedValue(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Best-effort conversion of a computed color to hex for color picker.
 * Handles rgb(), hex, and named colors via a temporary element.
 */
function toHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) return color;

  // Use a canvas for reliable conversion
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  return ctx.fillStyle; // Returns hex
}
