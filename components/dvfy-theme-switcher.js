import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-theme-switcher> — Theme dropdown + dark/light toggle
 *
 * Reads available themes from <option> children. If only one theme exists,
 * hides the dropdown and shows only the dark/light toggle.
 *
 * Attributes:
 *   default-theme: initial theme name (default: first option's value)
 *   default-mode:  light | dark (default: "light")
 *   variant:       select | dropdown (default: "select")
 *
 * Usage (no themes — light/dark toggle only):
 *   <dvfy-theme-switcher></dvfy-theme-switcher>
 *
 * Usage (with generated themes):
 *   <dvfy-theme-switcher>
 *     <option value="custom-blue">Blue</option>
 *     <option value="custom-green">Green</option>
 *   </dvfy-theme-switcher>
 *
 * Usage (dropdown variant — palette icon button):
 *   <dvfy-theme-switcher variant="dropdown">
 *     <option value="custom-blue">Blue</option>
 *     <option value="custom-green">Green</option>
 *   </dvfy-theme-switcher>
 *
 * Themes can be added dynamically via addTheme(value, label).
 * Note: Themes are added automatically through Theme Token edits
 * (e.g., palette-generator and theme-generator).
 *
 * Theme naming convention:
 *   Light: data-theme="{value}"       e.g. "custom-blue"
 *   Dark:  data-theme="{value}-dark"  e.g. "custom-blue-dark"
 */

const STYLES = `
dvfy-theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
  position: relative;
}

dvfy-theme-switcher dvfy-select {
  flex-shrink: 0;
  container-type: normal;
}
dvfy-theme-switcher dvfy-select .dvfy-select__trigger {
  height: 1.5rem;
  box-sizing: border-box;
  background: var(--dvfy-surface-muted);
}

/* ── Dark/light toggle ── */
dvfy-theme-switcher .dvfy-ts__toggle {
  position: relative;
  width: 2.5rem;
  height: 1.5rem;
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-md);
  cursor: pointer;
  background: var(--dvfy-surface-muted);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
  padding: 0;
  flex-shrink: 0;
}
dvfy-theme-switcher .dvfy-ts__toggle:hover {
  border-color: var(--dvfy-border-strong);
}
dvfy-theme-switcher .dvfy-ts__toggle:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* ── Dropdown variant ── */
dvfy-theme-switcher dvfy-dropdown {
  flex-shrink: 0;
  container-type: normal;
}
dvfy-theme-switcher dvfy-dropdown dvfy-button[icon] {
  color: var(--dvfy-primary-bg);
  background: var(--dvfy-surface-muted);
  height: 1.5rem;
  width: 1.5rem;
  padding: 0;
  box-sizing: border-box;
}
dvfy-theme-switcher dvfy-dropdown .dvfy-dropdown__menu {
  min-width: auto;
}
dvfy-theme-switcher dvfy-dropdown .dvfy-dropdown__item[aria-selected="true"]:hover {
  background: var(--dvfy-selected-bg);
}

/* Round shape */
dvfy-theme-switcher[round] .dvfy-ts__toggle { border-radius: var(--dvfy-radius-full); }
dvfy-theme-switcher[round] .dvfy-ts__thumb { border-radius: var(--dvfy-radius-round); }

dvfy-theme-switcher .dvfy-ts__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: var(--dvfy-radius-sm);
  background: var(--dvfy-surface-raised);
  box-shadow: var(--dvfy-shadow-xs);
  transition: transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  line-height: 1;
  user-select: none;
}
dvfy-theme-switcher[data-mode="dark"] .dvfy-ts__thumb {
  transform: translateX(1rem);
}
dvfy-theme-switcher[data-mode="dark"] .dvfy-ts__toggle {
  background: var(--dvfy-surface-raised);
  border-color: var(--dvfy-border-strong);
}
`;

const PALETTE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`;

/**
 * Theme dropdown and dark/light toggle. Hides dropdown when only one theme is available.
 *
 * @element dvfy-theme-switcher
 *
 * @attr {string} default-theme - Initial theme name (default: first option's value)
 * @attr {string} default-mode - Initial mode: light | dark (default: "light")
 * @attr {string} variant - Selector style: select | dropdown (default: "select")
 * @attr {boolean} round - Use fully rounded track and thumb (pill shape)
 *
 * @slot - <option value="theme-name">Label</option> elements defining available themes
 *
 * @cssprop {color} --dvfy-surface-muted - Toggle track background (light mode)
 * @cssprop {color} --dvfy-surface-raised - Toggle thumb color / track background (dark mode)
 */
class DvfyThemeSwitcher extends HTMLElement {
  #themes = [];
  #currentTheme = '';
  #currentMode = 'light';
  #toggleEl = null;
  #toggleHandler = null;
  #selectEl = null;
  #dropdownEl = null;

  #pendingTheme = null; // Persisted theme waiting for addTheme()
  #connected = false;

  static get observedAttributes() { return ['default-theme', 'default-mode', 'round', 'variant']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.#connected || oldVal === newVal) return;
    if (name === 'default-theme' && newVal) {
      const match = this.#themes.find(t => t.value === newVal);
      if (match) {
        this.#currentTheme = newVal;
        this.#apply();
        this.#build();
      }
    } else if (name === 'default-mode' && (newVal === 'light' || newVal === 'dark')) {
      this.#currentMode = newVal;
      this.#apply();
      this.#build();
    }
    // round is CSS-only, no JS needed
    if (name === 'variant') this.#build();
  }

  connectedCallback() {
    injectStyles('dvfy-theme-switcher', STYLES);

    // Parse theme options from children
    const options = Array.from(this.querySelectorAll('option'));
    this.#themes = options.map(o => ({ value: o.value, label: o.textContent.trim() }));

    this.#currentTheme = this.getAttribute('default-theme') || (this.#themes[0]?.value ?? '');
    // Default mode from system preference
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    this.#currentMode = this.getAttribute('default-mode') || (prefersDark ? 'dark' : 'light');

    // Restore persisted theme choice (even if theme not in list yet)
    try {
      const saved = JSON.parse(localStorage.getItem('dvfy-catalog-theme'));
      if (saved?.theme) {
        if (saved.mode) this.#currentMode = saved.mode;
        const match = this.#themes.find(t => t.value === saved.theme);
        if (match) {
          this.#currentTheme = match.value;
        } else {
          // Theme not loaded yet — will be resolved when addTheme() is called
          this.#pendingTheme = saved.theme;
        }
      }
    } catch { /* ignore parse errors */ }

    this.#build();
    this.#connected = true;
    // Only apply if we have a theme; otherwise wait for addTheme()
    if (this.#currentTheme) {
      this.#apply();
    }
  }

  /**
   * Add a theme dynamically (e.g., from the palette generator).
   * @param {string} value - theme name (used in data-theme attribute)
   * @param {string} label - display label
   */
  addTheme(value, label) {
    if (this.#themes.find(t => t.value === value)) return;
    this.#themes.push({ value, label });

    // If this is the persisted theme we were waiting for, activate it
    if (this.#pendingTheme === value) {
      this.#currentTheme = value;
      this.#pendingTheme = null;
      this.#apply();
    }
    // If no theme was active yet, use the first one added
    if (!this.#currentTheme) {
      this.#currentTheme = value;
      this.#apply();
    }

    this.#build();
  }

  /**
   * Remove a dynamically added theme.
   * @param {string} value - theme name to remove
   */
  removeTheme(value) {
    if (this.#themes.length <= 1) return; // Must keep at least one theme
    this.#themes = this.#themes.filter(t => t.value !== value);
    if (this.#currentTheme === value) {
      this.#currentTheme = this.#themes[0]?.value || '';
      this.#apply();
    }
    this.#build();
  }

  /**
   * Activate a theme programmatically.
   * @param {string} value - theme name
   * @param {string} [mode] - 'light' or 'dark'
   */
  setTheme(value, mode) {
    const match = this.#themes.find(t => t.value === value);
    if (match) {
      this.#currentTheme = value;
      if (mode) this.#currentMode = mode;
      this.#apply();
      this.#build();
    }
  }

  disconnectedCallback() {
    this.#connected = false;
    if (this.#toggleEl && this.#toggleHandler) {
      this.#toggleEl.removeEventListener('click', this.#toggleHandler);
      this.#toggleEl = null;
      this.#toggleHandler = null;
    }
    this.#selectEl = null;
    this.#dropdownEl = null;
  }

  #build() {
    this.textContent = '';
    this.setAttribute('data-mode', this.#currentMode);

    // Theme selector (only if multiple themes)
    if (this.#themes.length > 1) {
      if (this.getAttribute('variant') === 'dropdown') {
        this.#buildDropdown();
      } else {
        this.#buildSelect();
      }
    }

    // Dark/light toggle
    const toggle = document.createElement('button');
    toggle.className = 'dvfy-ts__toggle';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', String(this.#currentMode === 'dark'));
    toggle.setAttribute('aria-label', 'Dark mode');

    const thumb = document.createElement('span');
    thumb.className = 'dvfy-ts__thumb';
    thumb.textContent = this.#currentMode === 'dark' ? '\u{1F319}' : '\u{2600}\uFE0F';
    toggle.appendChild(thumb);

    this.#toggleHandler = () => {
      this.#currentMode = this.#currentMode === 'light' ? 'dark' : 'light';
      this.setAttribute('data-mode', this.#currentMode);
      toggle.setAttribute('aria-checked', String(this.#currentMode === 'dark'));
      thumb.textContent = this.#currentMode === 'dark' ? '\u{1F319}' : '\u{2600}\uFE0F';
      this.#apply();
    };
    toggle.addEventListener('click', this.#toggleHandler);
    this.#toggleEl = toggle;

    this.appendChild(toggle);
  }

  #buildSelect() {
    const sel = document.createElement('dvfy-select');
    sel.setAttribute('aria-label', 'Theme');
    sel.setAttribute('size', 'xs');

    for (const theme of this.#themes) {
      const opt = document.createElement('option');
      opt.value = theme.value;
      opt.textContent = theme.label;
      if (theme.value === this.#currentTheme) opt.setAttribute('selected', '');
      sel.appendChild(opt);
    }

    sel.addEventListener('change', (e) => {
      const value = e.detail?.value;
      if (value) {
        this.#currentTheme = value;
        this.#apply();
      }
    });

    this.#selectEl = sel;
    this.appendChild(sel);
  }

  #buildDropdown() {
    const dd = document.createElement('dvfy-dropdown');
    dd.setAttribute('align', 'right');

    const trigger = document.createElement('dvfy-button');
    trigger.setAttribute('variant', 'outline');
    trigger.setAttribute('icon', '');
    trigger.setAttribute('size', 'xs');
    trigger.setAttribute('aria-label', 'Select theme');
    // PALETTE_SVG is a trusted constant — safe to use innerHTML
    trigger.innerHTML = PALETTE_SVG;
    dd.appendChild(trigger);

    for (const theme of this.#themes) {
      const item = document.createElement('button');
      item.setAttribute('data-value', theme.value);
      item.textContent = theme.label;
      if (theme.value === this.#currentTheme) {
        item.setAttribute('aria-selected', 'true');
      }
      item.addEventListener('click', () => {
        this.#currentTheme = theme.value;
        this.#apply();
        this.#build();
      });
      dd.appendChild(item);
    }

    this.#dropdownEl = dd;
    this.appendChild(dd);
  }

  #apply() {
    if (!this.#currentTheme) return; // No themes loaded yet
    // Skip global theme mutation when rendered inside a playground preview
    if (this.closest('[data-sc-preview]')) return;
    const theme = this.#currentMode === 'dark'
      ? this.#currentTheme + '-dark'
      : this.#currentTheme;
    document.documentElement.setAttribute('data-theme', theme);

    // Persist theme choice
    try {
      localStorage.setItem('dvfy-catalog-theme', JSON.stringify({
        theme: this.#currentTheme,
        mode: this.#currentMode,
      }));
    } catch { /* quota exceeded — silent */ }
  }
}

customElements.define('dvfy-theme-switcher', DvfyThemeSwitcher);
