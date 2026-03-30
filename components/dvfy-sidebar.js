import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-sidebar> — Side navigation
 *
 * Attributes:
 *   collapsed:   boolean — compact mode
 *   width:       expanded width (default: "16rem")
 *   collapsible: boolean — show collapse toggle
 *
 * Usage:
 *   <dvfy-sidebar collapsible>
 *     <dvfy-sidebar-section label="Main">
 *       <a href="/">Dashboard</a>
 *       <a href="/tasks">Tasks</a>
 *     </dvfy-sidebar-section>
 *     <dvfy-sidebar-section label="Settings">
 *       <a href="/config">Config</a>
 *     </dvfy-sidebar-section>
 *   </dvfy-sidebar>
 */

const STYLES = `
dvfy-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--dvfy-surface-muted);
  border-right: var(--dvfy-border-1) solid var(--dvfy-border-default);
  font-family: var(--dvfy-font-sans);
  transition: width var(--dvfy-duration-normal) var(--dvfy-ease-out);
  overflow: hidden;
  flex-shrink: 0;
}
dvfy-sidebar:not([collapsed]) { width: var(--dvfy-sidebar-width, 16rem); }
dvfy-sidebar[collapsed] { width: 3.5rem; }

dvfy-sidebar .dvfy-sidebar__toggle {
  display: none;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  margin: var(--dvfy-space-2);
  background: none;
  border: none;
  border-radius: var(--dvfy-radius-md);
  cursor: pointer;
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-lg);
}
dvfy-sidebar[collapsible] .dvfy-sidebar__toggle { display: inline-flex; }
dvfy-sidebar .dvfy-sidebar__toggle:hover { background: var(--dvfy-hover-bg); color: var(--dvfy-text-primary); }
dvfy-sidebar .dvfy-sidebar__toggle:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

dvfy-sidebar .dvfy-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--dvfy-space-2);
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1);
}

dvfy-sidebar-section {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-0-5);
}
dvfy-sidebar-section .dvfy-sidebar__section-label {
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--dvfy-space-2) var(--dvfy-space-2-5) var(--dvfy-space-1);
  white-space: nowrap;
  overflow: hidden;
}
dvfy-sidebar[collapsed] dvfy-sidebar-section .dvfy-sidebar__section-label { display: none; }

dvfy-sidebar a, dvfy-sidebar .dvfy-sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2-5);
  padding: var(--dvfy-space-2) var(--dvfy-space-2-5);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-secondary);
  text-decoration: none;
  border-radius: var(--dvfy-radius-md);
  transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  white-space: nowrap;
  overflow: hidden;
}
dvfy-sidebar a:hover { background: var(--dvfy-hover-bg); color: var(--dvfy-text-primary); }
dvfy-sidebar a[data-active] {
  background: var(--dvfy-active-bg);
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-medium);
}
dvfy-sidebar a:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
`;

/**
 * Side navigation with collapsible compact mode and automatic active link highlighting.
 *
 * @element dvfy-sidebar
 *
 * @attr {boolean} collapsed - Compact icon-only mode
 * @attr {string} width - Expanded width (default: "16rem")
 * @attr {boolean} collapsible - Show collapse toggle button
 *
 * @slot - Navigation sections as <dvfy-sidebar-section> elements
 *
 * @cssprop {color} --dvfy-surface-secondary - Sidebar background
 * @cssprop {color} --dvfy-active-bg - Active link background
 * @cssprop {color} --dvfy-hover-bg - Link hover background
 */
class DvfySidebar extends HTMLElement {
  #toggle = null;

  connectedCallback() {
    injectStyles('dvfy-sidebar', STYLES);
    this.setAttribute('role', 'navigation');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Sidebar');
    }
    const w = this.getAttribute('width');
    if (w) this.style.setProperty('--dvfy-sidebar-width', w);
    this.#build();
    this.#highlightActive();
  }

  disconnectedCallback() {
    if (this.#toggle) {
      this.#toggle.removeEventListener('click', this.#onToggle);
    }
  }

  static get observedAttributes() { return ['collapsed', 'collapsible', 'width']; }

  attributeChangedCallback(name, _, val) {
    if (name === 'width' && val) this.style.setProperty('--dvfy-sidebar-width', val);
  }

  #build() {
    const children = Array.from(this.childNodes);

    // Toggle button
    this.#toggle = document.createElement('button');
    this.#toggle.className = 'dvfy-sidebar__toggle';
    this.#toggle.setAttribute('aria-label', 'Toggle sidebar');
    this.#toggle.setAttribute('aria-expanded', String(!this.hasAttribute('collapsed')));
    this.#toggle.textContent = '\u2261';
    this.#toggle.addEventListener('click', this.#onToggle);

    // Nav wrapper
    const nav = document.createElement('nav');
    nav.className = 'dvfy-sidebar__nav';
    for (const child of children) nav.appendChild(child);

    this.appendChild(this.#toggle);
    this.appendChild(nav);
  }

  #onToggle = () => {
    const collapsed = this.hasAttribute('collapsed');
    if (collapsed) this.removeAttribute('collapsed');
    else this.setAttribute('collapsed', '');
    if (this.#toggle) {
      this.#toggle.setAttribute('aria-expanded', String(collapsed));
    }
  };

  #highlightActive() {
    const path = window.location.pathname;
    this.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href && (href === path || (href !== '/' && path.startsWith(href)))) {
        a.setAttribute('data-active', '');
      } else {
        a.removeAttribute('data-active');
      }
    });
  }
}

/**
 * Sidebar section with label heading.
 *
 * @element dvfy-sidebar-section
 *
 * @attr {string} label - Section heading text (hidden when sidebar is collapsed)
 *
 * @slot - Navigation links as <a> elements
 */
class DvfySidebarSection extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label');
    if (label) {
      const lbl = document.createElement('div');
      lbl.className = 'dvfy-sidebar__section-label';
      lbl.textContent = label;
      this.insertBefore(lbl, this.firstChild);
    }
  }

  static get observedAttributes() { return ['label']; }

  attributeChangedCallback(name, _, val) {
    if (name === 'label') {
      const el = this.querySelector('.dvfy-sidebar__section-label');
      if (el) el.textContent = val || '';
    }
  }
}

customElements.define('dvfy-sidebar', DvfySidebar);
customElements.define('dvfy-sidebar-section', DvfySidebarSection);
