/**
 * <dvfy-tabs> — Tabbed content
 *
 * Attributes:
 *   active: tab index (default: 0)
 *
 * Usage:
 *   <dvfy-tabs active="0">
 *     <dvfy-tab label="General">General content</dvfy-tab>
 *     <dvfy-tab label="Settings">Settings content</dvfy-tab>
 *   </dvfy-tabs>
 */

const TABS_STYLES = `
dvfy-tabs {
  display: flex;
  flex-direction: column;
  font-family: var(--dvfy-font-sans);
}
dvfy-tabs .dvfy-tabs__list {
  display: flex;
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
  gap: 0;
}
dvfy-tabs .dvfy-tabs__trigger {
  padding: var(--dvfy-space-2-5) var(--dvfy-space-4);
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  margin-bottom: -1px;
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
  outline: none;
}
dvfy-tabs .dvfy-tabs__trigger:hover { color: var(--dvfy-text-primary); }
dvfy-tabs .dvfy-tabs__trigger[aria-selected="true"] {
  color: var(--dvfy-text-primary);
  border-bottom-color: var(--dvfy-primary-bg);
}
dvfy-tabs .dvfy-tabs__trigger:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: calc(-1 * var(--dvfy-ring-width));
  border-radius: var(--dvfy-radius-sm);
}
dvfy-tab {
  display: none;
  padding: var(--dvfy-space-4) 0;
}
dvfy-tab[active] { display: block; }
`;

/**
 * Tabbed content container with keyboard navigation.
 *
 * @element dvfy-tabs
 *
 * @attr {number} active - Active tab index (default: 0)
 *
 * @slot - <dvfy-tab label="..."> elements as tab panels
 *
 * @cssprop {color} --dvfy-primary-bg - Active tab underline color
 * @cssprop {color} --dvfy-text-muted - Inactive tab text color
 * @cssprop {color} --dvfy-border-default - Tab list border color
 *
 * @example
 * <dvfy-tabs active="0">
 *   <dvfy-tab label="Overview">Overview content here</dvfy-tab>
 *   <dvfy-tab label="Details">Detailed information</dvfy-tab>
 *   <dvfy-tab label="History">Change history</dvfy-tab>
 * </dvfy-tabs>
 */
class DvfyTabs extends HTMLElement {
  static #styled = false;
  #list = null;

  connectedCallback() {
    if (!DvfyTabs.#styled) {
      const s = document.createElement('style');
      s.textContent = TABS_STYLES;
      document.head.appendChild(s);
      DvfyTabs.#styled = true;
    }
    this.#build();
  }

  disconnectedCallback() {
    this.#list?.removeEventListener('keydown', this.#onKey);
  }

  static get observedAttributes() { return ['active']; }

  attributeChangedCallback(name) {
    if (name === 'active' && this.isConnected) this.#activate(this.#activeIndex);
  }

  get #activeIndex() {
    return parseInt(this.getAttribute('active') || '0', 10);
  }

  get #tabs() {
    return Array.from(this.querySelectorAll(':scope > dvfy-tab'));
  }

  #build() {
    this.#list = document.createElement('div');
    this.#list.className = 'dvfy-tabs__list';
    this.#list.setAttribute('role', 'tablist');

    this.#tabs.forEach((tab, i) => {
      const btn = document.createElement('button');
      btn.className = 'dvfy-tabs__trigger';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('tabindex', i === this.#activeIndex ? '0' : '-1');
      btn.textContent = tab.getAttribute('label') || `Tab ${i + 1}`;
      btn.addEventListener('click', () => {
        this.setAttribute('active', String(i));
      });
      this.#list.appendChild(btn);
    });

    this.insertBefore(this.#list, this.firstChild);
    this.#list.addEventListener('keydown', this.#onKey);
    this.#activate(this.#activeIndex);
  }

  #activate(idx) {
    const tabs = this.#tabs;
    const triggers = this.#list ? Array.from(this.#list.querySelectorAll('.dvfy-tabs__trigger')) : [];
    tabs.forEach((tab, i) => {
      if (i === idx) {
        tab.setAttribute('active', '');
      } else {
        tab.removeAttribute('active');
      }
    });
    triggers.forEach((btn, i) => {
      btn.setAttribute('aria-selected', String(i === idx));
      btn.setAttribute('tabindex', i === idx ? '0' : '-1');
    });
  }

  #onKey = (e) => {
    const triggers = Array.from(this.#list.querySelectorAll('.dvfy-tabs__trigger'));
    const current = triggers.indexOf(document.activeElement);
    if (current < 0) return;
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % triggers.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + triggers.length) % triggers.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = triggers.length - 1;
    else return;
    e.preventDefault();
    this.setAttribute('active', String(next));
    triggers[next].focus();
  };
}

/**
 * Individual tab panel within a dvfy-tabs container.
 *
 * @element dvfy-tab
 *
 * @attr {string} label - Tab button text
 */
class DvfyTab extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'tabpanel');
  }
  static get observedAttributes() { return ['label']; }
}

customElements.define('dvfy-tabs', DvfyTabs);
customElements.define('dvfy-tab', DvfyTab);
