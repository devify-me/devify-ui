import { injectStyles } from '../utils/styles.js';

const STYLES = `
dvfy-tree-node {
  display: block;
}

/* ── Node row ── */
.dvfy-tree__row {
  display: flex;
  align-items: center;
  height: 28px;
  padding-right: var(--dvfy-space-2, 0.5rem);
  cursor: pointer;
  color: var(--dvfy-text-secondary, #666);
  text-decoration: none;
  border-radius: var(--dvfy-radius-sm, 0.25rem);
  transition: background var(--dvfy-duration-fast, 100ms) var(--dvfy-ease-out, ease-out);
  white-space: nowrap;
  overflow: hidden;
}
.dvfy-tree__row:hover {
  background: var(--dvfy-hover-bg, rgba(0,0,0,0.04));
  color: var(--dvfy-text-primary, #222);
}
dvfy-tree-node[selected] > .dvfy-tree__row {
  background: var(--dvfy-active-bg, rgba(0,0,0,0.08));
  color: var(--dvfy-text-primary, #222);
  font-weight: var(--dvfy-weight-medium, 500);
}

/* ── Chevron ── */
.dvfy-tree__chevron {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10px;
  line-height: 1;
  color: var(--dvfy-text-muted, #999);
  transition: transform var(--dvfy-duration-fast, 100ms) var(--dvfy-ease-out, ease-out);
}
dvfy-tree-node[expanded] > .dvfy-tree__row > .dvfy-tree__chevron {
  transform: rotate(90deg);
}
.dvfy-tree__chevron-spacer {
  width: 16px;
  flex-shrink: 0;
}

/* ── Icon ── */
.dvfy-tree__icon {
  margin-right: var(--dvfy-space-1, 0.25rem);
  flex-shrink: 0;
  font-size: var(--dvfy-text-sm, 0.875rem);
  line-height: 1;
}

/* ── Label ── */
.dvfy-tree__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Children container ── */
.dvfy-tree__children {
  position: relative;
  overflow: hidden;
}
.dvfy-tree__children[data-collapsed] {
  display: none;
}

/* ── Indent guides ── */
.dvfy-tree__children::before {
  content: '';
  position: absolute;
  left: calc(var(--dvfy-tree-indent, 0) * 16px + 8px);
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--dvfy-border-muted, rgba(0,0,0,0.1));
}

/* ── Hidden by filter ── */
dvfy-tree-node[data-hidden] {
  display: none;
}
`;

/**
 * A node within a tree view. Can be a branch (has children) or leaf (has href).
 *
 * @element dvfy-tree-node
 *
 * @attr {string} label - Display text
 * @attr {string} href - Link target (makes it a leaf)
 * @attr {boolean} expanded - Branch open state
 * @attr {boolean} selected - Currently active node
 * @attr {string} icon - Optional leading text/emoji
 *
 * @event {CustomEvent} toggle - Fires when expanded/collapsed, detail: { expanded }
 *
 * @slot - Child dvfy-tree-node elements for branch nodes
 */
class DvfyTreeNode extends HTMLElement {
  #built = false;

  connectedCallback() {
    injectStyles('dvfy-tree-node', STYLES);
    if (!this.#built) {
      this.#build();
      this.#built = true;
    }
  }

  static get observedAttributes() {
    return ['label', 'expanded', 'selected', 'icon'];
  }

  attributeChangedCallback(name) {
    if (!this.#built) return;
    if (name === 'expanded') {
      const expanded = this.hasAttribute('expanded');
      if (this.isBranch) this.setAttribute('aria-expanded', String(expanded));
      const container = this.querySelector(':scope > .dvfy-tree__children');
      if (container) {
        container.toggleAttribute('data-collapsed', !expanded);
      }
      return;
    }
    if (name === 'selected') {
      if (this.hasAttribute('selected')) {
        this.setAttribute('aria-selected', 'true');
      } else {
        this.removeAttribute('aria-selected');
      }
      return;
    }
    if (name === 'label') {
      const lbl = this.querySelector(':scope > .dvfy-tree__row .dvfy-tree__label');
      if (lbl) lbl.textContent = this.getAttribute('label') || '';
    }
  }

  /** Whether this node has child nodes (is a branch) */
  get isBranch() {
    return this.querySelector(':scope > .dvfy-tree__children > dvfy-tree-node') !== null ||
           this.querySelector(':scope > dvfy-tree-node') !== null;
  }

  /** Toggle expanded/collapsed state */
  toggle() {
    if (this.hasAttribute('expanded')) {
      this.removeAttribute('expanded');
    } else {
      this.setAttribute('expanded', '');
    }
    const expanded = this.hasAttribute('expanded');
    this.setAttribute('aria-expanded', String(expanded));
    const container = this.querySelector(':scope > .dvfy-tree__children');
    if (container) {
      container.toggleAttribute('data-collapsed', !expanded);
    }
    this.dispatchEvent(new CustomEvent('toggle', {
      bubbles: true,
      detail: { expanded },
    }));
  }

  #getDepth() {
    let depth = 0;
    let parent = this.parentElement?.closest('dvfy-tree-node');
    while (parent) {
      depth++;
      parent = parent.parentElement?.closest('dvfy-tree-node');
    }
    return depth;
  }

  #hasChildNodes() {
    return this.querySelector(':scope > dvfy-tree-node') !== null;
  }

  #build() {
    const label = this.getAttribute('label') || '';
    const icon = this.getAttribute('icon');
    const hasBranch = this.#hasChildNodes();
    const depth = this.#getDepth();

    // Collect child nodes before modifying DOM
    const childNodes = hasBranch
      ? [...this.querySelectorAll(':scope > dvfy-tree-node')]
      : [];

    this.setAttribute('role', 'treeitem');
    this.setAttribute('aria-level', String(depth + 1));
    if (hasBranch) {
      this.setAttribute('aria-expanded', this.hasAttribute('expanded') ? 'true' : 'false');
    }

    // ── Row ──
    const row = document.createElement('div');
    row.className = 'dvfy-tree__row';
    row.style.paddingLeft = `${depth * 16 + 4}px`;

    if (hasBranch) {
      const chevron = document.createElement('span');
      chevron.className = 'dvfy-tree__chevron';
      chevron.textContent = '▶'; // ▶
      row.appendChild(chevron);
    } else {
      const spacer = document.createElement('span');
      spacer.className = 'dvfy-tree__chevron-spacer';
      row.appendChild(spacer);
    }

    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'dvfy-tree__icon';
      iconEl.textContent = icon;
      row.appendChild(iconEl);
    }

    const labelEl = document.createElement('span');
    labelEl.className = 'dvfy-tree__label';
    labelEl.textContent = label;
    row.appendChild(labelEl);

    // Clear and rebuild
    this.textContent = '';
    this.appendChild(row);

    // ── Children container ──
    if (hasBranch) {
      const container = document.createElement('div');
      container.className = 'dvfy-tree__children';
      container.setAttribute('role', 'group');
      container.style.setProperty('--dvfy-tree-indent', depth);
      if (!this.hasAttribute('expanded')) {
        container.setAttribute('data-collapsed', '');
      }
      for (const child of childNodes) {
        container.appendChild(child);
      }
      this.appendChild(container);
    }
  }
}

customElements.define('dvfy-tree-node', DvfyTreeNode);
