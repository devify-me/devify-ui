import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-description-list> — Key-value display
 *
 * Structured key-value display component for detail views (user profiles,
 * settings pages, metadata). Wraps semantic dl/dt/dd elements.
 *
 * Attributes:
 *   layout:  stacked | horizontal | grid (default: "stacked")
 *   columns: 1 | 2 | 3 (default: "1", only for grid layout)
 *   divider: boolean — show dividers between items
 *   striped: boolean — alternate row backgrounds
 *
 * Usage:
 *   <dvfy-description-list layout="horizontal" divider>
 *     <dvfy-dl-item label="Name">Jane Smith</dvfy-dl-item>
 *     <dvfy-dl-item label="Email">jane@example.com</dvfy-dl-item>
 *     <dvfy-dl-item label="Role">Admin</dvfy-dl-item>
 *   </dvfy-description-list>
 */

const STYLES = `
dvfy-description-list {
  display: block;
  font-family: var(--dvfy-font-sans);
  container-type: inline-size;
}

dvfy-description-list .dvfy-dl__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

/* ── Items ── */
dvfy-dl-item {
  display: flex;
  padding: var(--dvfy-space-2-5) 0;
}

/* Stacked layout (default) — label above value */
dvfy-description-list:not([layout]) dvfy-dl-item,
dvfy-description-list[layout="stacked"] dvfy-dl-item {
  flex-direction: column;
  gap: var(--dvfy-space-1);
}

/* Horizontal layout — label left, value right */
dvfy-description-list[layout="horizontal"] dvfy-dl-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--dvfy-space-4);
}

/* Grid layout — multi-column */
dvfy-description-list[layout="grid"] .dvfy-dl__list {
  display: grid;
  gap: var(--dvfy-space-4);
}

dvfy-description-list[layout="grid"]:not([columns]) .dvfy-dl__list,
dvfy-description-list[layout="grid"][columns="1"] .dvfy-dl__list {
  grid-template-columns: 1fr;
}

dvfy-description-list[layout="grid"][columns="2"] .dvfy-dl__list {
  grid-template-columns: repeat(2, 1fr);
}

dvfy-description-list[layout="grid"][columns="3"] .dvfy-dl__list {
  grid-template-columns: repeat(3, 1fr);
}

@container (max-width: 30rem) {
  dvfy-description-list[layout="grid"][columns="2"] .dvfy-dl__list,
  dvfy-description-list[layout="grid"][columns="3"] .dvfy-dl__list {
    grid-template-columns: 1fr;
  }
  dvfy-description-list[layout="horizontal"] dvfy-dl-item {
    flex-direction: column;
    gap: var(--dvfy-space-1);
  }
}

dvfy-description-list[layout="grid"] dvfy-dl-item {
  flex-direction: column;
  gap: var(--dvfy-space-1);
}

/* Dividers */
dvfy-description-list[divider] dvfy-dl-item {
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}

dvfy-description-list[divider] dvfy-dl-item:last-child {
  border-bottom: none;
}

dvfy-description-list[divider][layout="grid"] dvfy-dl-item {
  border-bottom: none;
  padding-bottom: var(--dvfy-space-3);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}

/* Striped */
dvfy-description-list[striped] dvfy-dl-item:nth-child(odd) {
  background: var(--dvfy-surface-muted);
  padding-left: var(--dvfy-space-3);
  padding-right: var(--dvfy-space-3);
  border-radius: var(--dvfy-radius-sm);
}

/* Label */
dvfy-dl-item .dvfy-dl-item__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
}

dvfy-description-list[layout="horizontal"] dvfy-dl-item .dvfy-dl-item__label {
  min-width: 8rem;
}

/* Value */
dvfy-dl-item .dvfy-dl-item__value {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
}

dvfy-description-list[layout="horizontal"] dvfy-dl-item .dvfy-dl-item__value {
  text-align: right;
}
`;

/**
 * Key-value description list for detail views.
 *
 * @element dvfy-description-list
 *
 * @attr {string} layout - Layout mode: stacked | horizontal | grid (default: "stacked")
 * @attr {string} columns - Grid columns: 1 | 2 | 3 (default: "1")
 * @attr {boolean} divider - Show dividers between items
 * @attr {boolean} striped - Alternate row backgrounds
 *
 * @slot - dvfy-dl-item children
 *
 * @cssprop {color} --dvfy-text-muted - Label color
 * @cssprop {color} --dvfy-text-primary - Value color
 * @cssprop {color} --dvfy-border-muted - Divider color
 * @cssprop {color} --dvfy-surface-muted - Striped row background
 */
class DvfyDescriptionList extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-description-list', STYLES);
    this.setAttribute('role', 'list');
    queueMicrotask(() => this.#render());
  }

  static get observedAttributes() { return ['layout', 'columns']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    // Wrap children in a dl if not already wrapped
    if (!this.querySelector('.dvfy-dl__list')) {
      const dl = document.createElement('dl');
      dl.className = 'dvfy-dl__list';
      dl.setAttribute('role', 'none');

      // Move all dvfy-dl-item children into the dl
      const items = Array.from(this.querySelectorAll(':scope > dvfy-dl-item'));
      for (const item of items) {
        dl.appendChild(item);
      }

      this.appendChild(dl);
    }
  }
}

/**
 * Single item in a description list.
 *
 * @element dvfy-dl-item
 *
 * @attr {string} label - The key/label text
 *
 * @slot - The value content
 */
class DvfyDlItem extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'listitem');
    queueMicrotask(() => this.#render());
  }

  static get observedAttributes() { return ['label']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    // Only build structure once
    if (this.querySelector('.dvfy-dl-item__label')) {
      // Update label text
      const labelEl = this.querySelector('.dvfy-dl-item__label');
      labelEl.textContent = this.getAttribute('label') || '';
      return;
    }

    const label = this.getAttribute('label') || '';

    // Collect existing child nodes (the value content) before modifying
    const children = Array.from(this.childNodes);

    const dt = document.createElement('dt');
    dt.className = 'dvfy-dl-item__label';
    dt.textContent = label;

    const dd = document.createElement('dd');
    dd.className = 'dvfy-dl-item__value';
    dd.style.margin = '0';

    // Move existing children into the dd value wrapper
    for (const child of children) {
      dd.appendChild(child);
    }

    this.appendChild(dt);
    this.appendChild(dd);
  }
}

customElements.define('dvfy-description-list', DvfyDescriptionList);
customElements.define('dvfy-dl-item', DvfyDlItem);
