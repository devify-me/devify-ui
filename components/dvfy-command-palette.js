/**
 * <dvfy-command-palette> — Spotlight-style command palette with fuzzy search.
 *
 * Declare commands as child elements; the palette manages its own overlay.
 * Press Ctrl+K / Cmd+K to open, Escape to close.
 *
 * @example
 * <dvfy-command-palette placeholder="Search commands...">
 *   <dvfy-command-group label="Navigation">
 *     <dvfy-command-item value="home" icon="🏠" shortcut="⌘H">Home</dvfy-command-item>
 *     <dvfy-command-item value="settings" icon="⚙️" shortcut="⌘,">Settings</dvfy-command-item>
 *   </dvfy-command-group>
 *   <dvfy-command-group label="Actions">
 *     <dvfy-command-item value="new-file" icon="📄" keywords="create add">New File</dvfy-command-item>
 *   </dvfy-command-group>
 * </dvfy-command-palette>
 */

const STYLES = `
dvfy-command-palette {
  display: none;
  font-family: var(--dvfy-font-sans);
}
dvfy-command-palette[open] {
  display: block;
}
dvfy-command-group,
dvfy-command-item {
  display: none;
}
.dvfy-cp__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: var(--dvfy-z-modal);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  padding-left: var(--dvfy-space-4);
  padding-right: var(--dvfy-space-4);
}
.dvfy-cp__dialog {
  background: var(--dvfy-surface-raised);
  border-radius: var(--dvfy-radius-xl);
  box-shadow: var(--dvfy-shadow-xl);
  width: 100%;
  max-width: 38rem;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
}
.dvfy-cp__search-wrap {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
  flex-shrink: 0;
}
.dvfy-cp__search-icon {
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
}
.dvfy-cp__search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: var(--dvfy-text-base);
  color: var(--dvfy-text-primary);
  font-family: inherit;
  min-width: 0;
}
.dvfy-cp__search-input::placeholder {
  color: var(--dvfy-text-muted);
}
.dvfy-cp__clear {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dvfy-text-muted);
  padding: 0;
  font-size: var(--dvfy-text-base);
  line-height: 1;
  border-radius: var(--dvfy-radius-sm);
}
.dvfy-cp__clear:hover { color: var(--dvfy-text-primary); }
.dvfy-cp__clear[visible] { display: block; }
.dvfy-cp__results {
  overflow-y: auto;
  padding: var(--dvfy-space-2) 0;
  flex: 1;
}
.dvfy-cp__group-label {
  padding: var(--dvfy-space-2) var(--dvfy-space-4) var(--dvfy-space-1);
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  user-select: none;
}
.dvfy-cp__item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  cursor: pointer;
  color: var(--dvfy-text-primary);
}
.dvfy-cp__item:hover {
  background: var(--dvfy-hover-bg);
}
.dvfy-cp__item[aria-selected="true"] {
  background: var(--dvfy-selected-bg);
  color: var(--dvfy-primary-bg);
}
.dvfy-cp__item-icon {
  flex-shrink: 0;
  width: 1.25rem;
  text-align: center;
  font-size: 1em;
  line-height: 1;
}
.dvfy-cp__item-text {
  flex: 1;
  font-size: var(--dvfy-text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dvfy-cp__item-shortcut {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  background: var(--dvfy-surface-sunken);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-sm);
  padding: 0.1rem var(--dvfy-space-2);
  font-family: var(--dvfy-font-mono);
  flex-shrink: 0;
}
.dvfy-cp__item[aria-selected="true"] .dvfy-cp__item-shortcut {
  color: var(--dvfy-primary-bg);
  border-color: var(--dvfy-primary-border);
}
.dvfy-cp__empty {
  padding: var(--dvfy-space-8) var(--dvfy-space-4);
  text-align: center;
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}
.dvfy-cp__footer {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-4);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-default);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
  user-select: none;
}
.dvfy-cp__hint {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-1);
}
.dvfy-cp__kbd {
  background: var(--dvfy-surface-sunken);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-sm);
  padding: 0.1rem 0.35rem;
  font-family: var(--dvfy-font-mono);
  font-size: var(--dvfy-text-xs);
  line-height: 1.5;
}
`;

/** Simple fuzzy match: all query chars must appear in order in target */
function fuzzyMatch(query, target) {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function makeHint(kbdText, labelText) {
  const hint = document.createElement('span');
  hint.className = 'dvfy-cp__hint';
  const kbd = document.createElement('kbd');
  kbd.className = 'dvfy-cp__kbd';
  kbd.textContent = kbdText;
  hint.appendChild(kbd);
  hint.appendChild(document.createTextNode(' ' + labelText));
  return hint;
}

function makeSvgSearchIcon() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'dvfy-cp__search-icon');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');
  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', '8.5');
  circle.setAttribute('cy', '8.5');
  circle.setAttribute('r', '5.5');
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('x1', '12.5');
  line.setAttribute('y1', '12.5');
  line.setAttribute('x2', '17');
  line.setAttribute('y2', '17');
  svg.appendChild(circle);
  svg.appendChild(line);
  return svg;
}

const RECENT_KEY_PREFIX = 'dvfy-cp-recent:';
const DEFAULT_MAX_RECENT = 5;

/**
 * Spotlight-style command palette with fuzzy search, sections, and recent items.
 *
 * @element dvfy-command-palette
 *
 * @attr {boolean} open - Show/hide the palette
 * @attr {string} placeholder - Search input placeholder text (default: "Type a command…")
 * @attr {number} max-recent - Max recent items to remember per palette (default: 5)
 * @attr {string} htmx-src - HTMX endpoint URL for server-side search (optional)
 *
 * @fires select - Fired when a command is selected, detail: { value, label }
 * @fires open - Fired when palette opens
 * @fires close - Fired when palette closes
 *
 * @slot - dvfy-command-group and/or dvfy-command-item children
 *
 * @cssprop {color} --dvfy-surface-raised - Dialog background
 * @cssprop {color} --dvfy-shadow-xl - Dialog shadow
 * @cssprop {color} --dvfy-selected-bg - Selected item background
 * @cssprop {color} --dvfy-primary-bg - Selected item accent color
 */
class DvfyCommandPalette extends HTMLElement {
  static #styled = false;
  #backdrop = null;
  #input = null;
  #results = null;
  #clearBtn = null;
  #items = [];
  #selectedIndex = -1;
  #visibleItems = [];
  #prevFocus = null;

  connectedCallback() {
    if (!DvfyCommandPalette.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCommandPalette.#styled = true;
    }
    document.addEventListener('keydown', this.#onGlobalKey);
    if (this.hasAttribute('open')) this.#build();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.#onGlobalKey);
  }

  static get observedAttributes() { return ['open', 'placeholder']; }

  attributeChangedCallback(name) {
    if (name === 'open') {
      this.hasAttribute('open') ? this.#open() : this.#close();
    }
    if (name === 'placeholder' && this.#input) {
      this.#input.placeholder = this.getAttribute('placeholder') || 'Type a command\u2026';
    }
  }

  /** Scan child dvfy-command-item / dvfy-command-group elements into #items */
  #scanItems() {
    this.#items = [];
    for (const child of this.children) {
      if (child.tagName === 'DVFY-COMMAND-GROUP') {
        const group = child.getAttribute('label') || '';
        for (const item of child.children) {
          if (item.tagName === 'DVFY-COMMAND-ITEM') {
            this.#items.push(this.#parseItem(item, group));
          }
        }
      } else if (child.tagName === 'DVFY-COMMAND-ITEM') {
        this.#items.push(this.#parseItem(child, ''));
      }
    }
  }

  #parseItem(el, defaultGroup) {
    return {
      value: el.getAttribute('value') || '',
      label: el.textContent.trim(),
      icon: el.getAttribute('icon') || '',
      shortcut: el.getAttribute('shortcut') || '',
      keywords: el.getAttribute('keywords') || '',
      group: el.getAttribute('group') || defaultGroup,
    };
  }

  #storageKey() {
    return RECENT_KEY_PREFIX + (this.id || 'default');
  }

  #getRecent() {
    try {
      return JSON.parse(localStorage.getItem(this.#storageKey()) || '[]');
    } catch {
      return [];
    }
  }

  #addRecent(value) {
    const max = parseInt(this.getAttribute('max-recent') || String(DEFAULT_MAX_RECENT), 10);
    let recent = this.#getRecent().filter(v => v !== value);
    recent.unshift(value);
    if (recent.length > max) recent = recent.slice(0, max);
    try {
      localStorage.setItem(this.#storageKey(), JSON.stringify(recent));
    } catch { /* storage unavailable */ }
  }

  #build() {
    if (this.#backdrop) return;

    this.#backdrop = document.createElement('div');
    this.#backdrop.className = 'dvfy-cp__backdrop';
    this.#backdrop.addEventListener('click', e => {
      if (e.target === this.#backdrop) this.removeAttribute('open');
    });

    const dialog = document.createElement('div');
    dialog.className = 'dvfy-cp__dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Command palette');

    // Search row
    const searchWrap = document.createElement('div');
    searchWrap.className = 'dvfy-cp__search-wrap';

    this.#input = document.createElement('input');
    this.#input.type = 'text';
    this.#input.className = 'dvfy-cp__search-input';
    this.#input.placeholder = this.getAttribute('placeholder') || 'Type a command\u2026';
    this.#input.setAttribute('aria-label', 'Search commands');
    this.#input.setAttribute('autocomplete', 'off');
    this.#input.setAttribute('spellcheck', 'false');
    this.#input.setAttribute('aria-controls', 'dvfy-cp-listbox');
    this.#input.setAttribute('aria-autocomplete', 'list');
    this.#input.setAttribute('role', 'combobox');
    this.#input.setAttribute('aria-expanded', 'true');

    // HTMX support: add hx-* attributes when htmx-src is provided
    const htmxSrc = this.getAttribute('htmx-src');
    if (htmxSrc) {
      this.#input.setAttribute('hx-get', htmxSrc);
      this.#input.setAttribute('hx-trigger', 'input changed delay:300ms');
      this.#input.setAttribute('hx-target', '.dvfy-cp__results');
      this.#input.setAttribute('name', 'q');
    }

    this.#clearBtn = document.createElement('button');
    this.#clearBtn.type = 'button';
    this.#clearBtn.className = 'dvfy-cp__clear';
    this.#clearBtn.setAttribute('aria-label', 'Clear search');
    this.#clearBtn.textContent = '\u00d7';
    this.#clearBtn.addEventListener('click', () => {
      this.#input.value = '';
      this.#clearBtn.removeAttribute('visible');
      this.#filter('');
      this.#input.focus();
    });

    this.#input.addEventListener('input', () => {
      const q = this.#input.value;
      if (q) {
        this.#clearBtn.setAttribute('visible', '');
      } else {
        this.#clearBtn.removeAttribute('visible');
      }
      this.#filter(q);
    });
    this.#input.addEventListener('keydown', this.#onInputKey);

    searchWrap.appendChild(makeSvgSearchIcon());
    searchWrap.appendChild(this.#input);
    searchWrap.appendChild(this.#clearBtn);

    // Results list
    this.#results = document.createElement('div');
    this.#results.className = 'dvfy-cp__results';
    this.#results.id = 'dvfy-cp-listbox';
    this.#results.setAttribute('role', 'listbox');

    // Footer hints
    const footer = document.createElement('div');
    footer.className = 'dvfy-cp__footer';
    footer.appendChild(makeHint('\u2191\u2193', 'navigate'));
    footer.appendChild(makeHint('\u21b5', 'select'));
    footer.appendChild(makeHint('Esc', 'close'));

    dialog.appendChild(searchWrap);
    dialog.appendChild(this.#results);
    dialog.appendChild(footer);
    this.#backdrop.appendChild(dialog);
    this.appendChild(this.#backdrop);
  }

  #open() {
    this.#prevFocus = document.activeElement;
    this.#scanItems();
    this.#build();
    this.#input.value = '';
    this.#clearBtn.removeAttribute('visible');
    this.#filter('');
    document.addEventListener('keydown', this.#onKey);
    // Process HTMX bindings if HTMX is loaded
    if (typeof htmx !== 'undefined' && this.getAttribute('htmx-src')) {
      htmx.process(this.#input);
    }
    requestAnimationFrame(() => this.#input?.focus());
    this.dispatchEvent(new Event('open', { bubbles: true }));
  }

  #close() {
    document.removeEventListener('keydown', this.#onKey);
    this.dispatchEvent(new Event('close', { bubbles: true }));
    this.#prevFocus?.focus();
  }

  #filter(query) {
    const recentValues = this.#getRecent();
    const allItems = this.#items;
    this.#selectedIndex = -1;
    this.#visibleItems = [];

    const groupMap = new Map();

    if (!query) {
      // Recent section when no query
      const recentItems = recentValues
        .map(v => allItems.find(i => i.value === v))
        .filter(Boolean);
      if (recentItems.length) {
        groupMap.set('\u2605 Recent', recentItems);
      }
      // All items in their groups
      for (const item of allItems) {
        const g = item.group;
        if (!groupMap.has(g)) groupMap.set(g, []);
        groupMap.get(g).push(item);
      }
    } else {
      // Fuzzy-filtered items
      for (const item of allItems) {
        const target = item.keywords ? item.label + ' ' + item.keywords : item.label;
        if (!fuzzyMatch(query, target)) continue;
        const g = item.group;
        if (!groupMap.has(g)) groupMap.set(g, []);
        groupMap.get(g).push(item);
      }
    }

    this.#renderGroups(groupMap);
  }

  #renderGroups(groupMap) {
    this.#results.replaceChildren();
    this.#visibleItems = [];

    const hasItems = [...groupMap.values()].some(arr => arr.length > 0);
    if (!hasItems) {
      const empty = document.createElement('div');
      empty.className = 'dvfy-cp__empty';
      empty.textContent = 'No commands found.';
      this.#results.appendChild(empty);
      return;
    }

    for (const [groupLabel, items] of groupMap) {
      if (!items.length) continue;

      if (groupLabel) {
        const gl = document.createElement('div');
        gl.className = 'dvfy-cp__group-label';
        gl.textContent = groupLabel;
        this.#results.appendChild(gl);
      }

      for (const item of items) {
        const el = this.#renderItem(item, this.#visibleItems.length);
        this.#visibleItems.push({ el, item });
        this.#results.appendChild(el);
      }
    }
  }

  #renderItem(item, index) {
    const el = document.createElement('div');
    el.className = 'dvfy-cp__item';
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', 'false');
    el.dataset.index = String(index);

    if (item.icon) {
      const icon = document.createElement('span');
      icon.className = 'dvfy-cp__item-icon';
      icon.textContent = item.icon;
      icon.setAttribute('aria-hidden', 'true');
      el.appendChild(icon);
    }

    const text = document.createElement('span');
    text.className = 'dvfy-cp__item-text';
    text.textContent = item.label;
    el.appendChild(text);

    if (item.shortcut) {
      const kbd = document.createElement('kbd');
      kbd.className = 'dvfy-cp__item-shortcut';
      kbd.textContent = item.shortcut;
      el.appendChild(kbd);
    }

    el.addEventListener('click', () => this.#selectItem(item));
    el.addEventListener('mouseenter', () => this.#setSelected(index));

    return el;
  }

  #setSelected(index) {
    const prev = this.#visibleItems[this.#selectedIndex];
    if (prev) prev.el.setAttribute('aria-selected', 'false');
    this.#selectedIndex = index;
    const next = this.#visibleItems[index];
    if (next) {
      next.el.setAttribute('aria-selected', 'true');
      next.el.scrollIntoView({ block: 'nearest' });
    }
  }

  #selectItem(item) {
    this.#addRecent(item.value);
    this.dispatchEvent(new CustomEvent('select', {
      bubbles: true,
      detail: { value: item.value, label: item.label },
    }));
    this.removeAttribute('open');
  }

  #onInputKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = this.#selectedIndex < this.#visibleItems.length - 1
        ? this.#selectedIndex + 1
        : 0;
      this.#setSelected(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = this.#selectedIndex > 0
        ? this.#selectedIndex - 1
        : this.#visibleItems.length - 1;
      this.#setSelected(prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = this.#visibleItems[this.#selectedIndex];
      if (sel) this.#selectItem(sel.item);
    }
  };

  #onKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.removeAttribute('open');
    }
  };

  #onGlobalKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (this.hasAttribute('open')) {
        this.removeAttribute('open');
      } else {
        this.setAttribute('open', '');
      }
    }
  };
}

/**
 * Command group container for dvfy-command-palette.
 *
 * @element dvfy-command-group
 * @attr {string} label - Group header label
 * @slot - dvfy-command-item children
 */
class DvfyCommandGroup extends HTMLElement {}

/**
 * Individual command item for dvfy-command-palette.
 *
 * @element dvfy-command-item
 * @attr {string} value - Command identifier (required)
 * @attr {string} icon - Emoji or text icon displayed left of label
 * @attr {string} shortcut - Keyboard shortcut hint displayed on the right
 * @attr {string} keywords - Extra search terms (space-separated, not displayed)
 * @attr {string} group - Override group name (if not using dvfy-command-group wrapper)
 * @slot - Item label text
 */
class DvfyCommandItem extends HTMLElement {}

customElements.define('dvfy-command-palette', DvfyCommandPalette);
customElements.define('dvfy-command-group', DvfyCommandGroup);
customElements.define('dvfy-command-item', DvfyCommandItem);
