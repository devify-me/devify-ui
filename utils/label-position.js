/**
 * Shared label-position CSS generator for form components.
 *
 * Two layout families:
 *
 * **Field** (input, select, textarea, date-picker, slider) —
 *   label sits beside a content area with optional help/error below.
 *   Left/right uses `flex-direction: row; flex-wrap: wrap`.
 *
 * **Inline** (checkbox, switch, radio) —
 *   label and control sit side-by-side; positions flip via order/column.
 *
 * @param {string} tag — custom element tag, e.g. "dvfy-input"
 * @param {object} opts
 * @param {"field"|"inline"} opts.layout — which family
 * @param {string} opts.label — BEM child selector for the label, e.g. ".dvfy-input__label"
 * @param {string[]} [opts.content] — field layout: BEM selectors for the main content area(s)
 * @param {string[]} [opts.messages] — field layout: BEM selectors for help/error below content
 * @returns {string} CSS rules
 */
export function labelPositionCSS(tag, opts) {
  if (opts.layout === 'inline') return inlineCSS(tag, opts);
  return fieldCSS(tag, opts);
}

/* ── Field layout (input, select, textarea, date-picker, slider) ── */
function fieldCSS(tag, { label, content = [], messages = [] }) {
  const msgBottom = messages.map(m => `${tag}[label-position="bottom"] ${m} { order: 2; }`).join('\n');
  const contentLeft = content.map(c => `${tag}[label-position="left"] ${c} { flex: 1; min-width: 0; }`).join('\n');
  const msgLeft = messages.length
    ? `${messages.map(m => `${tag}[label-position="left"] ${m}`).join(',\n')} { width: 100%; }`
    : '';
  const contentRight = content.map(c => `${tag}[label-position="right"] ${c} { flex: 1; min-width: 0; }`).join('\n');
  const msgRight = messages.length
    ? `${messages.map(m => `${tag}[label-position="right"] ${m}`).join(',\n')} { width: 100%; order: 2; }`
    : '';

  return `
/* Label position: bottom */
${tag}[label-position="bottom"] ${label} { order: 1; }
${msgBottom}

/* Label position: left */
${tag}[label-position="left"] { flex-direction: row; flex-wrap: wrap; align-items: center; }
${tag}[label-position="left"] ${label} { flex-shrink: 0; width: var(--dvfy-label-width, auto); }
${contentLeft}
${msgLeft}

/* Label position: right */
${tag}[label-position="right"] { flex-direction: row; flex-wrap: wrap; align-items: center; }
${tag}[label-position="right"] ${label} { order: 1; flex-shrink: 0; width: var(--dvfy-label-width, auto); }
${contentRight}
${msgRight}`;
}

/* ── Inline layout (checkbox, switch, radio) ── */
function inlineCSS(tag, { label }) {
  return `
/* Label position: left */
${tag}[label-position="left"] ${label} { order: -1; }

/* Label position: top */
${tag}[label-position="top"] { flex-direction: column; align-items: center; }
${tag}[label-position="top"] ${label} { order: -1; }

/* Label position: bottom */
${tag}[label-position="bottom"] { flex-direction: column; align-items: center; }`;
}
