/**
 * <dvfy-command-palette> — Adaptive command palette with usage-frequency ranking
 *
 * Opens with Ctrl+K / Cmd+K (or programmatically via `.open()`). Tracks how
 * often each command is selected and promotes frequently-used items to the top —
 * an AI-inspired adaptive UX pattern that learns from user behaviour.
 *
 * Usage:
 *   <dvfy-command-palette placeholder="Search commands…" storage-key="my-app">
 *     <dvfy-command id="new-task"    group="Tasks"    icon="✚" label="New Task"         shortcut="N"></dvfy-command>
 *     <dvfy-command id="open-inbox"  group="Navigate" icon="📥" label="Open Inbox"       shortcut="I"></dvfy-command>
 *     <dvfy-command id="run-deploy"  group="Actions"  icon="🚀" label="Deploy to staging"></dvfy-command>
 *   </dvfy-command-palette>
 *
 * Attributes (dvfy-command-palette):
 *   placeholder:  Input placeholder text            (default: "Search commands…")
 *   storage-key:  localStorage namespace             (default: "dvfy-cmd")
 *   open:         boolean — palette visibility
 *
 * Attributes (dvfy-command — child elements):
 *   id:       Unique command identifier (required for frequency tracking)
 *   label:    Display label (required)
 *   group:    Optional section heading
 *   icon:     Optional emoji or glyph shown before the label
 *   shortcut: Optional single-key hint shown on the right
 *   disabled: boolean — item is not selectable
 *
 * Events (dispatched from dvfy-command-palette):
 *   command — CustomEvent, detail: { id, label, group }
 *
 * @element dvfy-command-palette
 *
 * @attr {string} placeholder - Search input placeholder text (default: "Search commands…")
 * @attr {string} storage-key - localStorage namespace for frequency data (default: "dvfy-cmd")
 * @attr {boolean} open - Palette open/closed state
 *
 * @event {CustomEvent} command - Fires when a command is selected, detail: { id, label, group }
 *
 * @slot - dvfy-command child elements define the command list
 *
 * @cssprop {color} --dvfy-surface-overlay - Palette background
 * @cssprop {color} --dvfy-border-default - Palette border
 * @cssprop {shadow} --dvfy-shadow-xl - Palette drop shadow
 * @cssprop {color} --dvfy-primary-bg - Highlighted item accent
 */

const STYLES = `
/* === dvfy-command-palette === */

dvfy-command-palette {
  display: contents;
}

.dvfy-cp__backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--dvfy-bg-default, #000) 60%, transparent);
  z-index: var(--dvfy-z-modal, 500);
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  backdrop-filter: blur(2px);
}

.dvfy-cp__backdrop[data-open] {
  display: flex;
}

.dvfy-cp__panel {
  width: min(560px, calc(100vw - 2rem));
  background: var(--dvfy-surface-overlay);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-xl);
  box-shadow: var(--dvfy-shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  font-family: var(--dvfy-font-sans);
}

.dvfy-cp__search {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-subtle);
}

.dvfy-cp__search-icon {
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
  font-size: var(--dvfy-text-base);
}

.dvfy-cp__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--dvfy-text-base);
  color: var(--dvfy-text-primary);
  font-family: inherit;
  caret-color: var(--dvfy-primary-bg);
}

.dvfy-cp__input::placeholder {
  color: var(--dvfy-text-muted);
}

.dvfy-cp__list {
  overflow-y: auto;
  padding: var(--dvfy-space-1) 0;
  flex: 1;
}

.dvfy-cp__empty {
  padding: var(--dvfy-space-8) var(--dvfy-space-4);
  text-align: center;
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}

.dvfy-cp__group-label {
  padding: var(--dvfy-space-2) var(--dvfy-space-4) var(--dvfy-space-1);
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dvfy-cp__item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  border-radius: 0;
  outline: none;
  user-select: none;
}

.dvfy-cp__item:hover,
.dvfy-cp__item[data-active] {
  background: color-mix(in srgb, var(--dvfy-primary-bg) 8%, transparent);
}

.dvfy-cp__item[data-active] {
  background: color-mix(in srgb, var(--dvfy-primary-bg) 12%, transparent);
}

.dvfy-cp__item[disabled],
.dvfy-cp__item[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
}

.dvfy-cp__item-icon {
  width: 1.25rem;
  text-align: center;
  flex-shrink: 0;
  font-size: var(--dvfy-text-base);
}

.dvfy-cp__item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dvfy-cp__item-shortcut {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  background: color-mix(in srgb, var(--dvfy-text-primary) 8%, transparent);
  border: var(--dvfy-border-1) solid var(--dvfy-border-subtle);
  border-radius: var(--dvfy-radius-sm);
  padding: 0.1em 0.4em;
  font-family: var(--dvfy-font-mono);
  flex-shrink: 0;
}

.dvfy-cp__freq {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-primary-bg);
  opacity: 0.6;
  flex-shrink: 0;
}

.dvfy-cp__footer {
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-subtle);
  display: flex;
  gap: var(--dvfy-space-4);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

.dvfy-cp__footer kbd {
  font-family: var(--dvfy-font-mono);
  background: color-mix(in srgb, var(--dvfy-text-primary) 8%, transparent);
  border: var(--dvfy-border-1) solid var(--dvfy-border-subtle);
  border-radius: var(--dvfy-radius-sm);
  padding: 0.1em 0.35em;
}
`;

/** Helper — build a footer hint span */
function makeHint(keyText, actionText) {
  const span = document.createElement('span');
  const kbd = document.createElement('kbd');
  kbd.textContent = keyText;
  span.appendChild(kbd);
  span.appendChild(document.createTextNode(' ' + actionText));
  return span;
}

/**
 * @element dvfy-command
 * @attr {string} label - Display label (required)
 * @attr {string} group - Section heading
 * @attr {string} icon - Leading icon (emoji/glyph)
 * @attr {string} shortcut - Single-key hint
 * @attr {boolean} disabled - Item is not selectable
 */
class DvfyCommand extends HTMLElement {}
customElements.define('dvfy-command', DvfyCommand);

/**
 * Adaptive command palette with Ctrl/Cmd+K shortcut and
 * localStorage-backed usage-frequency ranking.
 *
 * @element dvfy-command-palette
 */
class DvfyCommandPalette extends HTMLElement {
  static #styled = false;
  #backdrop = null;
  #input = null;
  #list = null;
  #activeIdx = -1;
  #query = '';
  #freqKey = 'dvfy-cmd';

  connectedCallback() {
    if (!DvfyCommandPalette.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCommandPalette.#styled = true;
    }
    this.#freqKey = this.getAttribute('storage-key') ?? 'dvfy-cmd';
    this.#build();
    document.addEventListener('keydown', this.#onGlobalKey);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.#onGlobalKey);
    this.#backdrop?.remove();
  }

  static get observedAttributes() { return ['open', 'storage-key']; }

  attributeChangedCallback(name, _, val) {
    if (name === 'storage-key') {
      this.#freqKey = val ?? 'dvfy-cmd';
    }
    if (name === 'open' && this.#backdrop) {
      if (this.hasAttribute('open')) {
        this.#backdrop.setAttribute('data-open', '');
        this.#input.value = '';
        this.#query = '';
        this.#render();
        requestAnimationFrame(() => this.#input.focus());
      } else {
        this.#backdrop.removeAttribute('data-open');
        this.#activeIdx = -1;
      }
    }
  }

  /** Programmatically open the palette */
  open() { this.setAttribute('open', ''); }

  /** Programmatically close the palette */
  close() { this.removeAttribute('open'); }

  // ── Build DOM ────────────────────────────────────────────────────────────

  #build() {
    this.#backdrop = document.createElement('div');
    this.#backdrop.className = 'dvfy-cp__backdrop';
    this.#backdrop.setAttribute('role', 'dialog');
    this.#backdrop.setAttribute('aria-modal', 'true');
    this.#backdrop.setAttribute('aria-label', 'Command palette');

    const panel = document.createElement('div');
    panel.className = 'dvfy-cp__panel';

    // Search row
    const searchRow = document.createElement('div');
    searchRow.className = 'dvfy-cp__search';

    const icon = document.createElement('span');
    icon.className = 'dvfy-cp__search-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '\u2318'; // ⌘

    this.#input = document.createElement('input');
    this.#input.type = 'search';
    this.#input.className = 'dvfy-cp__input';
    this.#input.setAttribute('autocomplete', 'off');
    this.#input.setAttribute('spellcheck', 'false');
    this.#input.placeholder = this.getAttribute('placeholder') ?? 'Search commands\u2026';
    this.#input.setAttribute('aria-label', 'Search commands');
    this.#input.addEventListener('input', () => {
      this.#query = this.#input.value.trim().toLowerCase();
      this.#activeIdx = -1;
      this.#render();
    });

    searchRow.appendChild(icon);
    searchRow.appendChild(this.#input);

    // Results list
    this.#list = document.createElement('div');
    this.#list.className = 'dvfy-cp__list';
    this.#list.setAttribute('role', 'listbox');

    // Footer hints (built via DOM, no innerHTML)
    const footer = document.createElement('div');
    footer.className = 'dvfy-cp__footer';
    footer.appendChild(makeHint('\u2191\u2193', 'navigate'));
    footer.appendChild(makeHint('\u21B5', 'select'));
    footer.appendChild(makeHint('Esc', 'close'));

    panel.appendChild(searchRow);
    panel.appendChild(this.#list);
    panel.appendChild(footer);
    this.#backdrop.appendChild(panel);
    document.body.appendChild(this.#backdrop);

    // Click backdrop to close
    this.#backdrop.addEventListener('click', (e) => {
      if (e.target === this.#backdrop) this.close();
    });

    this.#render();
  }

  // ── Frequency tracking ────────────────────────────────────────────────────

  #getFreq() {
    try {
      const raw = localStorage.getItem(this.#freqKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      // Validate: must be a plain object with numeric values
      if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const safe = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
          safe[k] = v;
        }
      }
      return safe;
    } catch { return {}; }
  }

  #bumpFreq(id) {
    if (!id) return;
    try {
      const freq = this.#getFreq();
      freq[id] = (freq[id] ?? 0) + 1;
      localStorage.setItem(this.#freqKey, JSON.stringify(freq));
    } catch { /* localStorage unavailable */ }
  }

  // ── Command extraction ────────────────────────────────────────────────────

  #getCommands() {
    return Array.from(this.querySelectorAll('dvfy-command')).map(el => ({
      id:       el.id || el.getAttribute('label') || '',
      label:    el.getAttribute('label') ?? '',
      group:    el.getAttribute('group') ?? '',
      icon:     el.getAttribute('icon') ?? '',
      shortcut: el.getAttribute('shortcut') ?? '',
      disabled: el.hasAttribute('disabled'),
    }));
  }

  // ── Render filtered + ranked results ──────────────────────────────────────

  #render() {
    const freq = this.#getFreq();
    let commands = this.#getCommands();

    // Filter by query
    if (this.#query) {
      const q = this.#query;
      commands = commands.filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
      );
    }

    // Sort: disabled last, then by frequency desc, then alpha
    commands.sort((a, b) => {
      if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
      const fa = freq[a.id] ?? 0;
      const fb = freq[b.id] ?? 0;
      if (fb !== fa) return fb - fa;
      return a.label.localeCompare(b.label);
    });

    this.#list.replaceChildren();

    if (!commands.length) {
      const empty = document.createElement('div');
      empty.className = 'dvfy-cp__empty';
      empty.textContent = 'No results';
      this.#list.appendChild(empty);
      return;
    }

    // Group into sections
    const groups = new Map();
    for (const cmd of commands) {
      const g = cmd.group || '';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(cmd);
    }

    const itemEls = [];

    for (const [group, items] of groups) {
      if (group) {
        const gl = document.createElement('div');
        gl.className = 'dvfy-cp__group-label';
        gl.setAttribute('aria-hidden', 'true');
        gl.textContent = group;
        this.#list.appendChild(gl);
      }

      for (const cmd of items) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dvfy-cp__item';
        btn.setAttribute('role', 'option');
        btn.setAttribute('data-id', cmd.id);
        if (cmd.disabled) {
          btn.setAttribute('aria-disabled', 'true');
          btn.setAttribute('disabled', '');
        }

        if (cmd.icon) {
          const ic = document.createElement('span');
          ic.className = 'dvfy-cp__item-icon';
          ic.setAttribute('aria-hidden', 'true');
          ic.textContent = cmd.icon;
          btn.appendChild(ic);
        }

        const lbl = document.createElement('span');
        lbl.className = 'dvfy-cp__item-label';
        lbl.textContent = cmd.label;
        btn.appendChild(lbl);

        const f = freq[cmd.id] ?? 0;
        if (f > 0 && !this.#query) {
          const fb = document.createElement('span');
          fb.className = 'dvfy-cp__freq';
          fb.setAttribute('aria-label', `used ${f} time${f !== 1 ? 's' : ''}`);
          fb.textContent = `\xd7${f}`;
          btn.appendChild(fb);
        }

        if (cmd.shortcut) {
          const sk = document.createElement('kbd');
          sk.className = 'dvfy-cp__item-shortcut';
          sk.setAttribute('aria-label', `shortcut: ${cmd.shortcut}`);
          sk.textContent = cmd.shortcut;
          btn.appendChild(sk);
        }

        if (!cmd.disabled) {
          btn.addEventListener('click', () => this.#select(cmd));
          btn.addEventListener('mouseenter', () => {
            itemEls.forEach(el => el.removeAttribute('data-active'));
            this.#activeIdx = itemEls.indexOf(btn);
            btn.setAttribute('data-active', '');
          });
        }

        this.#list.appendChild(btn);
        if (!cmd.disabled) itemEls.push(btn);
      }
    }

    // Store selectable items for keyboard nav
    this.#list._items = itemEls;
    if (this.#activeIdx >= 0 && itemEls[this.#activeIdx]) {
      itemEls[this.#activeIdx].setAttribute('data-active', '');
    }
  }

  // ── Select ────────────────────────────────────────────────────────────────

  #select(cmd) {
    this.#bumpFreq(cmd.id);
    this.dispatchEvent(new CustomEvent('command', {
      bubbles: true,
      composed: false,
      detail: { id: cmd.id, label: cmd.label, group: cmd.group },
    }));
    this.close();
  }

  // ── Keyboard handling ─────────────────────────────────────────────────────

  #onGlobalKey = (e) => {
    // Ctrl+K / Cmd+K to open
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.hasAttribute('open') ? this.close() : this.open();
      return;
    }

    if (!this.hasAttribute('open')) return;

    const items = this.#list?._items ?? [];

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.#moveFocus(items, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.#moveFocus(items, -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.#activeIdx >= 0 && items[this.#activeIdx]) {
          items[this.#activeIdx].click();
        }
        break;
    }
  };

  #moveFocus(items, dir) {
    if (!items.length) return;
    items.forEach(el => el.removeAttribute('data-active'));
    this.#activeIdx = ((this.#activeIdx + dir + items.length) % items.length);
    const el = items[this.#activeIdx];
    el.setAttribute('data-active', '');
    el.scrollIntoView({ block: 'nearest' });
  }
}

customElements.define('dvfy-command-palette', DvfyCommandPalette);
