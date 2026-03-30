const STYLES = `
dvfy-tree-view {
  display: block;
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm, 0.875rem);
  user-select: none;
  outline: none;
}

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

/* ── Focus ── */
dvfy-tree-view:focus-visible .dvfy-tree__row[data-focused] {
  outline: var(--dvfy-ring-width, 2px) solid var(--dvfy-ring-color, #0ea5e9);
  outline-offset: -2px;
}

/* ── Hidden by filter ── */
dvfy-tree-node[data-hidden] {
  display: none;
}
`;

/**
 * Interactive tree view for hierarchical navigation (VS Code file explorer style).
 *
 * @element dvfy-tree-view
 *
 * @event {CustomEvent} select - Fires when a leaf node is activated, detail: { href, label, node }
 *
 * @cssprop {color} --dvfy-hover-bg - Row hover background
 * @cssprop {color} --dvfy-active-bg - Selected row background
 *
 * @example
 * <dvfy-tree-view>
 *   <dvfy-tree-node label="Tokens" expanded>
 *     <dvfy-tree-node label="Colors" href="#tokens/colors"></dvfy-tree-node>
 *     <dvfy-tree-node label="Typography" href="#tokens/typography"></dvfy-tree-node>
 *   </dvfy-tree-node>
 *   <dvfy-tree-node label="Components">
 *     <dvfy-tree-node label="button" href="#components/dvfy-button"></dvfy-tree-node>
 *   </dvfy-tree-node>
 * </dvfy-tree-view>
 */
class DvfyTreeView extends HTMLElement {
  static #styled = false;

  #focusedNode = null;

  connectedCallback() {
    if (!DvfyTreeView.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTreeView.#styled = true;
    }

    this.setAttribute('role', 'tree');
    this.setAttribute('tabindex', '0');

    this.addEventListener('keydown', this.#onKeydown);
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKeydown);
    this.removeEventListener('click', this.#onClick);
  }

  /** Get all visible tree-node elements in DOM order */
  #getVisibleNodes() {
    const nodes = [];
    const walk = (parent) => {
      const children = parent.querySelectorAll(':scope > dvfy-tree-node, :scope > .dvfy-tree__children > dvfy-tree-node');
      for (const node of children) {
        if (node.hasAttribute('data-hidden')) continue;
        nodes.push(node);
        if (node.hasAttribute('expanded') && node.isBranch) {
          walk(node);
        }
      }
    };
    walk(this);
    return nodes;
  }

  #setFocus(node) {
    if (this.#focusedNode) {
      const oldRow = this.#focusedNode.querySelector(':scope > .dvfy-tree__row');
      if (oldRow) oldRow.removeAttribute('data-focused');
    }
    this.#focusedNode = node;
    if (node) {
      const row = node.querySelector(':scope > .dvfy-tree__row');
      if (row) row.setAttribute('data-focused', '');
    }
  }

  #onClick = (e) => {
    const row = e.target.closest('.dvfy-tree__row');
    if (!row) return;
    const node = row.closest('dvfy-tree-node');
    if (!node) return;

    this.#setFocus(node);

    if (node.isBranch) {
      node.toggle();
    } else {
      this.#activateNode(node);
    }
  };

  #activateNode(node) {
    this.querySelectorAll('dvfy-tree-node[selected]').forEach(n => n.removeAttribute('selected'));
    node.setAttribute('selected', '');

    const href = node.getAttribute('href');
    const label = node.getAttribute('label');
    this.dispatchEvent(new CustomEvent('select', {
      bubbles: true,
      detail: { href, label, node },
    }));
  }

  #onKeydown = (e) => {
    const visible = this.#getVisibleNodes();
    if (!visible.length) return;

    const idx = this.#focusedNode ? visible.indexOf(this.#focusedNode) : -1;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = idx < visible.length - 1 ? idx + 1 : 0;
        this.#setFocus(visible[next]);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = idx > 0 ? idx - 1 : visible.length - 1;
        this.#setFocus(visible[prev]);
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (!this.#focusedNode) break;
        if (this.#focusedNode.isBranch) {
          if (!this.#focusedNode.hasAttribute('expanded')) {
            this.#focusedNode.toggle();
          } else {
            const children = this.#getVisibleNodes();
            const childIdx = children.indexOf(this.#focusedNode) + 1;
            if (childIdx < children.length) this.#setFocus(children[childIdx]);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (!this.#focusedNode) break;
        if (this.#focusedNode.isBranch && this.#focusedNode.hasAttribute('expanded')) {
          this.#focusedNode.toggle();
        } else {
          const parent = this.#focusedNode.parentElement?.closest('dvfy-tree-node');
          if (parent) this.#setFocus(parent);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (!this.#focusedNode) break;
        if (this.#focusedNode.isBranch) {
          this.#focusedNode.toggle();
        } else {
          this.#activateNode(this.#focusedNode);
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (visible.length) this.#setFocus(visible[0]);
        break;
      }
      case 'End': {
        e.preventDefault();
        if (visible.length) this.#setFocus(visible[visible.length - 1]);
        break;
      }
    }
  };

  /**
   * Filter nodes by query string. Hides non-matching leaves, auto-expands parents of matches.
   * @param {string} query
   */
  filter(query) {
    const q = (query || '').toLowerCase().trim();
    const allNodes = this.querySelectorAll('dvfy-tree-node');

    if (!q) {
      this.clearFilter();
      return;
    }

    // First pass: mark all hidden
    allNodes.forEach(n => n.setAttribute('data-hidden', ''));

    // Second pass: find matching nodes and show them + ancestors
    allNodes.forEach((node) => {
      const label = (node.getAttribute('label') || '').toLowerCase();
      if (label.includes(q)) {
        node.removeAttribute('data-hidden');
        let parent = node.parentElement?.closest('dvfy-tree-node');
        while (parent) {
          parent.removeAttribute('data-hidden');
          parent.setAttribute('expanded', '');
          const container = parent.querySelector(':scope > .dvfy-tree__children');
          if (container) container.removeAttribute('data-collapsed');
          parent = parent.parentElement?.closest('dvfy-tree-node');
        }
      }
    });
  }

  /** Clear filter and restore all nodes */
  clearFilter() {
    this.querySelectorAll('dvfy-tree-node[data-hidden]').forEach(n => n.removeAttribute('data-hidden'));
  }

  /**
   * Select a node by href, highlighting it and expanding parents.
   * @param {string} href
   */
  selectByHref(href) {
    this.querySelectorAll('dvfy-tree-node[selected]').forEach(n => n.removeAttribute('selected'));
    if (!href) return;
    const node = this.querySelector(`dvfy-tree-node[href="${CSS.escape(href)}"]`);
    if (!node) return;
    node.setAttribute('selected', '');
    let parent = node.parentElement?.closest('dvfy-tree-node');
    while (parent) {
      if (!parent.hasAttribute('expanded')) {
        parent.setAttribute('expanded', '');
        const container = parent.querySelector(':scope > .dvfy-tree__children');
        if (container) container.removeAttribute('data-collapsed');
      }
      parent = parent.parentElement?.closest('dvfy-tree-node');
    }
  }
}

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
      const container = this.querySelector(':scope > .dvfy-tree__children');
      if (container) {
        container.toggleAttribute('data-collapsed', !this.hasAttribute('expanded'));
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
    const container = this.querySelector(':scope > .dvfy-tree__children');
    if (container) {
      container.toggleAttribute('data-collapsed', !this.hasAttribute('expanded'));
    }
    this.dispatchEvent(new CustomEvent('toggle', {
      bubbles: true,
      detail: { expanded: this.hasAttribute('expanded') },
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

    // ── Row ──
    const row = document.createElement('div');
    row.className = 'dvfy-tree__row';
    row.style.paddingLeft = `${depth * 16 + 4}px`;

    if (hasBranch) {
      const chevron = document.createElement('span');
      chevron.className = 'dvfy-tree__chevron';
      chevron.textContent = '\u25B6'; // ▶
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

customElements.define('dvfy-tree-view', DvfyTreeView);
customElements.define('dvfy-tree-node', DvfyTreeNode);
