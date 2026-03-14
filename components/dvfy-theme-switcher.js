/**
 * <dvfy-theme-switcher> — Theme dropdown + dark/light toggle
 *
 * Reads available themes from <option> children. If only one theme exists,
 * hides the dropdown and shows only the dark/light toggle.
 *
 * Attributes:
 *   default-theme: initial theme name (default: first option's value)
 *   default-mode:  light | dark (default: "light")
 *
 * Usage:
 *   <dvfy-theme-switcher>
 *     <option value="devify-cyan">Cyan</option>
 *     <option value="devify-pink">Pink</option>
 *   </dvfy-theme-switcher>
 *
 * Theme naming convention:
 *   Light: data-theme="{value}"       e.g. "devify-cyan"
 *   Dark:  data-theme="{value}-dark"  e.g. "devify-cyan-dark"
 *
 * Single theme (dropdown hidden):
 *   <dvfy-theme-switcher>
 *     <option value="devify-cyan">Cyan</option>
 *   </dvfy-theme-switcher>
 */

const STYLES = `
dvfy-theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
}

dvfy-theme-switcher .dvfy-ts__select {
  appearance: none;
  background: transparent;
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-md);
  padding: var(--dvfy-space-1) var(--dvfy-space-6) var(--dvfy-space-1) var(--dvfy-space-2);
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--dvfy-space-1-5) center;
}
dvfy-theme-switcher .dvfy-ts__select:hover {
  border-color: var(--dvfy-border-strong);
}
dvfy-theme-switcher .dvfy-ts__select:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

dvfy-theme-switcher .dvfy-ts__toggle {
  position: relative;
  width: 2.5rem;
  height: 1.5rem;
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-full);
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

dvfy-theme-switcher .dvfy-ts__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: var(--dvfy-radius-round);
  background: var(--dvfy-neutral-0);
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
  background: var(--dvfy-neutral-800);
}
dvfy-theme-switcher[data-mode="dark"] .dvfy-ts__toggle {
  background: var(--dvfy-indigo-950);
  border-color: var(--dvfy-neutral-600);
}
`;

class DvfyThemeSwitcher extends HTMLElement {
  static #styled = false;
  #themes = [];
  #currentTheme = '';
  #currentMode = 'light';

  connectedCallback() {
    if (!DvfyThemeSwitcher.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyThemeSwitcher.#styled = true;
    }

    // Parse theme options from children
    const options = Array.from(this.querySelectorAll('option'));
    this.#themes = options.map(o => ({ value: o.value, label: o.textContent.trim() }));

    if (this.#themes.length === 0) {
      this.#themes = [{ value: 'light', label: 'Default' }];
    }

    this.#currentTheme = this.getAttribute('default-theme') || this.#themes[0].value;
    this.#currentMode = this.getAttribute('default-mode') || 'light';

    // Detect current mode from existing data-theme
    const existing = document.documentElement.getAttribute('data-theme');
    if (existing) {
      if (existing.endsWith('-dark')) {
        this.#currentMode = 'dark';
        const base = existing.replace(/-dark$/, '');
        const match = this.#themes.find(t => t.value === base);
        if (match) this.#currentTheme = match.value;
      } else {
        this.#currentMode = 'light';
        const match = this.#themes.find(t => t.value === existing);
        if (match) this.#currentTheme = match.value;
      }
    }

    this.#build();
    this.#apply();
  }

  #build() {
    this.textContent = '';
    this.setAttribute('data-mode', this.#currentMode);

    // Theme dropdown (only if multiple themes)
    if (this.#themes.length > 1) {
      const select = document.createElement('select');
      select.className = 'dvfy-ts__select';
      select.setAttribute('aria-label', 'Theme');

      for (const theme of this.#themes) {
        const opt = document.createElement('option');
        opt.value = theme.value;
        opt.textContent = theme.label;
        if (theme.value === this.#currentTheme) opt.selected = true;
        select.appendChild(opt);
      }

      select.addEventListener('change', () => {
        this.#currentTheme = select.value;
        this.#apply();
      });

      this.appendChild(select);
    }

    // Dark/light toggle
    const toggle = document.createElement('button');
    toggle.className = 'dvfy-ts__toggle';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', String(this.#currentMode === 'dark'));
    toggle.setAttribute('aria-label', 'Dark mode');

    const thumb = document.createElement('span');
    thumb.className = 'dvfy-ts__thumb';
    thumb.textContent = this.#currentMode === 'dark' ? '\u{1F319}' : '\u{2600}';
    toggle.appendChild(thumb);

    toggle.addEventListener('click', () => {
      this.#currentMode = this.#currentMode === 'light' ? 'dark' : 'light';
      this.setAttribute('data-mode', this.#currentMode);
      toggle.setAttribute('aria-checked', String(this.#currentMode === 'dark'));
      thumb.textContent = this.#currentMode === 'dark' ? '\u{1F319}' : '\u{2600}';
      this.#apply();
    });

    this.appendChild(toggle);
  }

  #apply() {
    const theme = this.#currentMode === 'dark'
      ? this.#currentTheme + '-dark'
      : this.#currentTheme;
    document.documentElement.setAttribute('data-theme', theme);
  }
}

customElements.define('dvfy-theme-switcher', DvfyThemeSwitcher);
