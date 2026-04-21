import { injectStyles } from '../utils/styles.js';
import './dvfy-tree-node.js';

const STYLES = `
dvfy-tree-view {
  display: block;
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm, 0.875rem);
  user-select: none;
  outline: none;
}

/* ── Focus ── */
dvfy-tree-view:focus-visible .dvfy-tree__row[data-focused] {
  outline: var(--dvfy-ring-width, 2px) solid var(--dvfy-ring-color, #0ea5e9);
  outline-offset: -2px;
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
  #focusedNode = null;
  /** @type {Map<string, Set<Element>>} lowercase label → matching nodes */
  #nodeMap = new Map();
  /** @type {Map<string, Element>} href → node */
  #hrefMap = new Map();
  /** @type {Set<Element>} all tree-node elements */
  #allNodes = new Set();
  #observer = null;

  connectedCallback() {
    injectStyles('dvfy-tree-view', STYLES);

    this.setAttribute('role', 'tree');
    this.setAttribute('aria-label', this.getAttribute('aria-label') || 'Tree navigation');
    this.setAttribute('tabindex', '0');

    this.addEventListener('keydown', this.#onKeydown);
    this.addEventListener('click', this.#onClick);

    // Build initial cache after child nodes are ready
    requestAnimationFrame(() => this.#buildNodeCache());

    // Invalidate cache on subtree changes (nodes added/removed)
    this.#observer = new MutationObserver(() => this.#invalidateCache());
    this.#observer.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKeydown);
    this.removeEventListener('click', this.#onClick);
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }

  /** Build lookup caches from current tree nodes */
  #buildNodeCache() {
    this.#nodeMap.clear();
    this.#hrefMap.clear();
    this.#allNodes.clear();

    const nodes = this.querySelectorAll('dvfy-tree-node');
    for (const node of nodes) {
      this.#allNodes.add(node);

      const label = (node.getAttribute('label') || '').toLowerCase();
      if (label) {
        let set = this.#nodeMap.get(label);
        if (!set) {
          set = new Set();
          this.#nodeMap.set(label, set);
        }
        set.add(node);
      }

      const href = node.getAttribute('href');
      if (href) {
        this.#hrefMap.set(href, node);
      }
    }
  }

  /** Mark caches dirty and rebuild */
  #invalidateCache() {
    this.#buildNodeCache();
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
    this.querySelectorAll('dvfy-tree-node[selected]').forEach((n) => {
      n.removeAttribute('selected');
      n.removeAttribute('aria-selected');
    });
    node.setAttribute('selected', '');
    node.setAttribute('aria-selected', 'true');

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

    if (!q) {
      this.clearFilter();
      return;
    }

    // First pass: mark all cached nodes hidden
    for (const node of this.#allNodes) {
      node.setAttribute('data-hidden', '');
    }

    // Second pass: find matching nodes via cached map and show them + ancestors
    for (const [label, nodes] of this.#nodeMap) {
      if (!label.includes(q)) continue;
      for (const node of nodes) {
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
    }
  }

  /** Clear filter and restore all nodes */
  clearFilter() {
    for (const node of this.#allNodes) {
      node.removeAttribute('data-hidden');
    }
  }

  /**
   * Select a node by href, highlighting it and expanding parents.
   * @param {string} href
   */
  selectByHref(href) {
    for (const node of this.#allNodes) {
      node.removeAttribute('selected');
      node.removeAttribute('aria-selected');
    }
    if (!href) return;
    const node = this.#hrefMap.get(href);
    if (!node) return;
    node.setAttribute('selected', '');
    node.setAttribute('aria-selected', 'true');
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

customElements.define('dvfy-tree-view', DvfyTreeView);
