import { injectStyles } from '../utils/styles.js';

// Module-level registry of open dropdown instances to avoid document.querySelectorAll
const openDropdowns = new Set();

/**
 * <dvfy-dropdown> — Dropdown menu
 *
 * Attributes:
 *   open:  boolean — menu visibility
 *   align: left | right (default: "left")
 *
 * Usage:
 *   <dvfy-dropdown>
 *     <dvfy-button>Menu</dvfy-button>
 *     <a href="/one">Item One</a>
 *     <a href="/two">Item Two</a>
 *   </dvfy-dropdown>
 */

const STYLES = `
dvfy-dropdown {
  display: inline-block;
  position: relative;
  font-family: var(--dvfy-font-sans);
}
dvfy-dropdown .dvfy-dropdown__menu {
  display: none;
  position: absolute;
  top: 100%;
  margin-top: var(--dvfy-space-1);
  min-width: 10rem;
  background: var(--dvfy-elevation-lg-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  box-shadow: var(--dvfy-shadow-lg);
  padding: var(--dvfy-space-1) 0;
  z-index: var(--dvfy-z-dropdown);
  flex-direction: column;
}
dvfy-dropdown[open] .dvfy-dropdown__menu { display: flex; }
dvfy-dropdown:not([align]), dvfy-dropdown[align="left"] { }
dvfy-dropdown:not([align]) .dvfy-dropdown__menu,
dvfy-dropdown[align="left"] .dvfy-dropdown__menu { left: 0; }
dvfy-dropdown[align="right"] .dvfy-dropdown__menu { right: 0; }
dvfy-dropdown .dvfy-dropdown__item {
  display: block;
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  outline: none;
}
dvfy-dropdown .dvfy-dropdown__item:hover,
dvfy-dropdown .dvfy-dropdown__item[data-active] {
  background: color-mix(in srgb, var(--dvfy-text-primary) 8%, transparent);
  color: var(--dvfy-text-primary);
}
dvfy-dropdown .dvfy-dropdown__item:active {
  background: color-mix(in srgb, var(--dvfy-text-primary) 14%, transparent);
}
dvfy-dropdown .dvfy-dropdown__item[aria-selected="true"] {
  background: var(--dvfy-selected-bg);
  color: var(--dvfy-primary-bg);
  font-weight: var(--dvfy-weight-medium);
}
dvfy-dropdown .dvfy-dropdown__item:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: calc(-1 * var(--dvfy-ring-width));
}
dvfy-dropdown .dvfy-dropdown__item + .dvfy-dropdown__item {
  border-top: var(--dvfy-border-0) solid transparent;
}
`;

/**
 * Dropdown menu with keyboard navigation and click-outside closing.
 *
 * @element dvfy-dropdown
 *
 * @attr {boolean} open - Menu visibility state
 * @attr {string} align - Menu alignment: left | right (default: "left")
 *
 * @slot - First child element is the trigger; remaining children become menu items
 *
 * @cssprop {color} --dvfy-surface-overlay - Menu background
 * @cssprop {color} --dvfy-shadow-lg - Menu shadow
 * @cssprop {color} --dvfy-selected-bg - Selected item background
 *
 * @example
 * <dvfy-dropdown>
 *   <dvfy-button>Actions</dvfy-button>
 *   <a href="/edit">Edit</a>
 *   <a href="/duplicate">Duplicate</a>
 *   <button>Delete</button>
 * </dvfy-dropdown>
 */
class DvfyDropdown extends HTMLElement {
  #menu = null;
  #trigger = null;
  #activeIndex = -1;

  connectedCallback() {
    injectStyles('dvfy-dropdown', STYLES);
    this.#build();
    this.addEventListener('keydown', this.#onKey);
    document.addEventListener('click', this.#onOutside);
  }

  disconnectedCallback() {
    openDropdowns.delete(this);
    this.removeEventListener('keydown', this.#onKey);
    document.removeEventListener('click', this.#onOutside);
  }

  static get observedAttributes() { return ['open', 'align']; }

  attributeChangedCallback(name) {
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        openDropdowns.add(this);
      } else {
        openDropdowns.delete(this);
        if (this.#menu) this.#activeIndex = -1;
      }
    }
  }

  #build() {
    const children = Array.from(this.childNodes);
    // First element child is trigger
    const firstEl = children.find(n => n.nodeType === 1);
    if (!firstEl) return;

    this.#trigger = firstEl;
    this.#trigger.addEventListener('click', this.#toggle);

    this.#menu = document.createElement('div');
    this.#menu.className = 'dvfy-dropdown__menu';
    this.#menu.setAttribute('role', 'menu');

    // Remaining element children become menu items
    const items = children.filter(n => n.nodeType === 1 && n !== firstEl);
    for (const item of items) {
      item.classList.add('dvfy-dropdown__item');
      item.setAttribute('role', 'menuitem');
      if (!item.getAttribute('tabindex')) item.setAttribute('tabindex', '-1');
      this.#menu.appendChild(item);
    }
    this.appendChild(this.#menu);
  }

  get #items() {
    return this.#menu ? Array.from(this.#menu.querySelectorAll('.dvfy-dropdown__item')) : [];
  }

  #toggle = (e) => {
    e.stopPropagation();
    if (this.hasAttribute('open')) {
      this.removeAttribute('open');
    } else {
      // Close all other open dropdowns first
      openDropdowns.forEach((d) => {
        if (d !== this) d.removeAttribute('open');
      });
      this.setAttribute('open', '');
    }
  };

  #close() {
    this.#items.forEach(i => i.removeAttribute('data-active'));
    this.removeAttribute('open');
    this.#activeIndex = -1;
    this.#trigger?.focus();
  }

  #onOutside = (e) => {
    if (this.hasAttribute('open') && !this.contains(e.target)) {
      this.#close();
    }
  };

  #focusItem(idx) {
    const items = this.#items;
    if (!items.length) return;
    items.forEach(i => i.removeAttribute('data-active'));
    this.#activeIndex = ((idx % items.length) + items.length) % items.length;
    items[this.#activeIndex].setAttribute('data-active', '');
    items[this.#activeIndex].focus();
  }

  #onKey = (e) => {
    if (!this.hasAttribute('open')) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.setAttribute('open', '');
        this.#focusItem(0);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.#close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.#focusItem(this.#activeIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.#focusItem(this.#activeIndex - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.#items[this.#activeIndex]?.click();
        this.#close();
        break;
    }
  };
}

customElements.define('dvfy-dropdown', DvfyDropdown);
