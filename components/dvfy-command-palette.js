/**
 * <dvfy-command-palette> — Spotlight search / command palette
 *
 * Modal overlay with search input, keyboard navigation, sections/groups,
 * recent items, and HTMX-friendly server-side search support.
 *
 * Attributes:
 *   open:        boolean — show/hide the palette
 *   placeholder: search input placeholder (default: "Search commands...")
 *   shortcut:    keyboard shortcut to toggle (default: "k")
 *   hotkey-mod:  modifier key: ctrl | meta | alt (default: auto-detect OS)
 *
 * Data model: provide commands as dvfy-cmd-item children or via the items attr (JSON).
 *
 * Usage:
 *   <dvfy-command-palette placeholder="Search...">
 *     <dvfy-cmd-group label="Navigation">
 *       <dvfy-cmd-item value="home" icon="H">Go to Home</dvfy-cmd-item>
 *       <dvfy-cmd-item value="settings" icon="S">Settings</dvfy-cmd-item>
 *     </dvfy-cmd-group>
 *     <dvfy-cmd-group label="Actions">
 *       <dvfy-cmd-item value="new-project">Create Project</dvfy-cmd-item>
 *     </dvfy-cmd-group>
 *   </dvfy-command-palette>
 */

import { injectStyles } from '../utils/styles.js';


const STYLES = `
dvfy-command-palette {
  display: none;
  position: fixed;
  inset: 0;
  z-index: var(--dvfy-z-modal);
  font-family: var(--dvfy-font-sans);
}

dvfy-command-palette[open] {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

dvfy-command-palette .dvfy-cmd__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

dvfy-command-palette .dvfy-cmd__dialog {
  position: relative;
  width: min(90vw, 32rem);
  max-height: 24rem;
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-xl);
  box-shadow: var(--dvfy-shadow-2xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dvfy-cmd-enter var(--dvfy-duration-fast) var(--dvfy-ease-out);
}

@keyframes dvfy-cmd-enter {
  from { opacity: 0; transform: scale(0.95) translateY(-8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

dvfy-command-palette .dvfy-cmd__search {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}

dvfy-command-palette .dvfy-cmd__search-icon {
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-lg);
  flex-shrink: 0;
}

dvfy-command-palette .dvfy-cmd__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--dvfy-text-base);
  color: var(--dvfy-text-primary);
}

dvfy-command-palette .dvfy-cmd__input::placeholder {
  color: var(--dvfy-text-muted);
}

dvfy-command-palette .dvfy-cmd__shortcut {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-0-5);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
}

dvfy-command-palette .dvfy-cmd__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 var(--dvfy-space-1);
  font-family: inherit;
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  background: var(--dvfy-surface-muted);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-sm);
}

dvfy-command-palette .dvfy-cmd__list {
  flex: 1;
  overflow-y: auto;
  padding: var(--dvfy-space-2) 0;
}

dvfy-command-palette .dvfy-cmd__empty {
  text-align: center;
  padding: var(--dvfy-space-6);
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}

/* Groups */
dvfy-cmd-group {
  display: block;
}

dvfy-cmd-group .dvfy-cmd-group__label {
  padding: var(--dvfy-space-2) var(--dvfy-space-4) var(--dvfy-space-1);
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wide);
}

/* Items */
dvfy-cmd-item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  cursor: pointer;
  transition: background var(--dvfy-duration-fastest) var(--dvfy-ease-out);
}

dvfy-cmd-item:hover,
dvfy-cmd-item[data-active] {
  background: var(--dvfy-selected-bg, var(--dvfy-surface-muted));
}

dvfy-cmd-item[data-active] {
  outline: none;
}

dvfy-cmd-item .dvfy-cmd-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-secondary);
  flex-shrink: 0;
}

dvfy-cmd-item .dvfy-cmd-item__text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

dvfy-cmd-item .dvfy-cmd-item__hint {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
}

dvfy-cmd-item[hidden] {
  display: none;
}

/* Footer */
dvfy-command-palette .dvfy-cmd__footer {
  display: flex;
  gap: var(--dvfy-space-4);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

dvfy-command-palette .dvfy-cmd__footer-item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-1);
}
`;

const RECENT_KEY = 'dvfy-cmd-recent';
const MAX_RECENT = 5;

/**
 * Command palette / spotlight search with keyboard navigation.
 *
 * @element dvfy-command-palette
 *
 * @attr {boolean} open - Show/hide the palette
 * @attr {string} placeholder - Search input placeholder (default: "Search commands...")
 * @attr {string} shortcut - Key for keyboard shortcut (default: "k")
 * @attr {string} hotkey-mod - Modifier: ctrl | meta | alt
 *
 * @event {CustomEvent} dvfy-cmd-select - Fires when an item is selected, detail: value, label
 * @event {CustomEvent} dvfy-cmd-open - Fires when palette opens
 * @event {CustomEvent} dvfy-cmd-close - Fires when palette closes
 *
 * @slot - dvfy-cmd-group and dvfy-cmd-item children
 *
 * @cssprop {color} --dvfy-surface-raised - Dialog background
 * @cssprop {color} --dvfy-selected-bg - Active item highlight
 */
class DvfyCommandPalette extends HTMLElement {
  #input = null;
  #list = null;
  #items = [];
  #activeIdx = -1;

  connectedCallback() {
    injectStyles('dvfy-command-palette', STYLES);

    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'true');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Command palette');
    }

    queueMicrotask(() => this.#build());
    document.addEventListener('keydown', this.#onGlobalKey);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.#onGlobalKey);
  }

  static get observedAttributes() { return ['open']; }

  attributeChangedCallback(name) {
    if (name === 'open' && this.isConnected) {
      if (this.hasAttribute('open')) {
        this.#onOpen();
      } else {
        this.#onClose();
      }
    }
  }

  get #mod() {
    const attr = this.getAttribute('hotkey-mod');
    if (attr) return attr;
    return navigator.platform?.includes('Mac') ? 'meta' : 'ctrl';
  }

  get #shortcutKey() { return this.getAttribute('shortcut') || 'k'; }

  #build() {
    // Save user-provided content (groups/items)
    const userContent = Array.from(this.childNodes).filter(
      n => n.nodeType === Node.ELEMENT_NODE &&
        (n.tagName === 'DVFY-CMD-GROUP' || n.tagName === 'DVFY-CMD-ITEM'),
    );

    this.textContent = '';

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'dvfy-cmd__backdrop';
    backdrop.addEventListener('click', () => this.#close());

    // Dialog
    const dialog = document.createElement('div');
    dialog.className = 'dvfy-cmd__dialog';

    // Search bar
    const search = document.createElement('div');
    search.className = 'dvfy-cmd__search';

    const searchIcon = document.createElement('span');
    searchIcon.className = 'dvfy-cmd__search-icon';
    searchIcon.textContent = '\u2315';
    search.appendChild(searchIcon);

    this.#input = document.createElement('input');
    this.#input.className = 'dvfy-cmd__input';
    this.#input.type = 'text';
    this.#input.placeholder = this.getAttribute('placeholder') || 'Search commands...';
    this.#input.setAttribute('autocomplete', 'off');
    this.#input.setAttribute('spellcheck', 'false');
    this.#input.addEventListener('input', () => this.#filter());
    this.#input.addEventListener('keydown', this.#onInputKey);
    search.appendChild(this.#input);

    const shortcutHint = document.createElement('span');
    shortcutHint.className = 'dvfy-cmd__shortcut';
    const esc = document.createElement('kbd');
    esc.className = 'dvfy-cmd__kbd';
    esc.textContent = 'Esc';
    shortcutHint.appendChild(esc);
    search.appendChild(shortcutHint);

    dialog.appendChild(search);

    // List
    this.#list = document.createElement('div');
    this.#list.className = 'dvfy-cmd__list';
    this.#list.setAttribute('role', 'listbox');

    // Restore user content
    for (const el of userContent) {
      this.#list.appendChild(el);
    }

    // Build groups
    this.#initGroups();

    dialog.appendChild(this.#list);

    // Footer hints
    const footer = document.createElement('div');
    footer.className = 'dvfy-cmd__footer';

    for (const [keys, label] of [
      ['\u2191\u2193', 'Navigate'],
      ['\u21B5', 'Select'],
      ['Esc', 'Close'],
    ]) {
      const item = document.createElement('span');
      item.className = 'dvfy-cmd__footer-item';
      const kbd = document.createElement('kbd');
      kbd.className = 'dvfy-cmd__kbd';
      kbd.textContent = keys;
      item.appendChild(kbd);
      item.appendChild(document.createTextNode(` ${label}`));
      footer.appendChild(item);
    }

    dialog.appendChild(footer);

    this.appendChild(backdrop);
    this.appendChild(dialog);
  }

  #initGroups() {
    // Set up groups with labels
    const groups = this.#list.querySelectorAll('dvfy-cmd-group');
    for (const group of groups) {
      if (!group.querySelector('.dvfy-cmd-group__label')) {
        const label = document.createElement('div');
        label.className = 'dvfy-cmd-group__label';
        label.textContent = group.getAttribute('label') || '';
        group.insertBefore(label, group.firstChild);
      }
    }

    // Set up items with icons and click handlers
    const items = this.#list.querySelectorAll('dvfy-cmd-item');
    for (const item of items) {
      if (!item.querySelector('.dvfy-cmd-item__text')) {
        const text = item.textContent.trim();
        item.textContent = '';

        if (item.getAttribute('icon')) {
          const icon = document.createElement('span');
          icon.className = 'dvfy-cmd-item__icon';
          icon.textContent = item.getAttribute('icon');
          item.appendChild(icon);
        }

        const textEl = document.createElement('span');
        textEl.className = 'dvfy-cmd-item__text';
        textEl.textContent = text;
        item.appendChild(textEl);

        if (item.getAttribute('hint')) {
          const hint = document.createElement('span');
          hint.className = 'dvfy-cmd-item__hint';
          hint.textContent = item.getAttribute('hint');
          item.appendChild(hint);
        }
      }

      item.setAttribute('role', 'option');
      item.addEventListener('click', () => this.#selectItem(item));
    }

    this.#refreshItemList();
  }

  #refreshItemList() {
    this.#items = Array.from(this.#list.querySelectorAll('dvfy-cmd-item:not([hidden])'));
  }

  // ── Filtering ──

  #filter() {
    const query = this.#input?.value.toLowerCase().trim() || '';
    const allItems = this.#list.querySelectorAll('dvfy-cmd-item');
    const groups = this.#list.querySelectorAll('dvfy-cmd-group');

    for (const item of allItems) {
      const text = (item.querySelector('.dvfy-cmd-item__text')?.textContent || item.textContent).toLowerCase();
      const value = (item.getAttribute('value') || '').toLowerCase();
      const match = !query || text.includes(query) || value.includes(query);
      item.toggleAttribute('hidden', !match);
    }

    // Hide empty groups
    for (const group of groups) {
      const visibleItems = group.querySelectorAll('dvfy-cmd-item:not([hidden])');
      group.toggleAttribute('hidden', visibleItems.length === 0);
    }

    this.#refreshItemList();
    this.#activeIdx = this.#items.length > 0 ? 0 : -1;
    this.#highlightActive();

    // Show empty state
    const existing = this.#list.querySelector('.dvfy-cmd__empty');
    if (this.#items.length === 0 && query) {
      if (!existing) {
        const empty = document.createElement('div');
        empty.className = 'dvfy-cmd__empty';
        empty.textContent = 'No results found';
        this.#list.appendChild(empty);
      }
    } else if (existing) {
      existing.remove();
    }
  }

  // ── Keyboard navigation ──

  #onGlobalKey = (e) => {
    const modKey = this.#mod === 'meta' ? e.metaKey : e.ctrlKey;
    if (modKey && e.key.toLowerCase() === this.#shortcutKey) {
      e.preventDefault();
      if (this.hasAttribute('open')) this.#close();
      else this.#open();
    }
  };

  #onInputKey = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.#moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.#moveActive(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.#activeIdx >= 0 && this.#items[this.#activeIdx]) {
          this.#selectItem(this.#items[this.#activeIdx]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.#close();
        break;
    }
  };

  #moveActive(delta) {
    if (this.#items.length === 0) return;
    this.#activeIdx = (this.#activeIdx + delta + this.#items.length) % this.#items.length;
    this.#highlightActive();
  }

  #highlightActive() {
    for (const item of this.#items) {
      item.removeAttribute('data-active');
      item.setAttribute('aria-selected', 'false');
    }
    if (this.#activeIdx >= 0 && this.#items[this.#activeIdx]) {
      const active = this.#items[this.#activeIdx];
      active.setAttribute('data-active', '');
      active.setAttribute('aria-selected', 'true');
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  // ── Selection ──

  #selectItem(item) {
    const value = item.getAttribute('value') || '';
    const label = item.querySelector('.dvfy-cmd-item__text')?.textContent || item.textContent.trim();

    // Save to recent
    this.#saveRecent(value, label);

    this.dispatchEvent(new CustomEvent('dvfy-cmd-select', {
      bubbles: true,
      detail: { value, label },
    }));

    this.#close();
  }

  #saveRecent(value, label) {
    // Guard against running in playground preview (no localStorage mutations)
    if (this.closest('dvfy-component-playground')) return;

    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const filtered = recent.filter(r => r.value !== value);
      filtered.unshift({ value, label });
      localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
    } catch {
      // localStorage unavailable
    }
  }

  // ── Open/Close ──

  #open() {
    this.setAttribute('open', '');
  }

  #close() {
    this.removeAttribute('open');
  }

  #onOpen() {
    if (this.#input) {
      this.#input.value = '';
      this.#filter();
      requestAnimationFrame(() => this.#input.focus());
    }
    this.dispatchEvent(new CustomEvent('dvfy-cmd-open', { bubbles: true }));
  }

  #onClose() {
    this.dispatchEvent(new CustomEvent('dvfy-cmd-close', { bubbles: true }));
  }
}

/**
 * Command group with label.
 *
 * @element dvfy-cmd-group
 * @attr {string} label - Group heading text
 * @slot - dvfy-cmd-item children
 */
class DvfyCmdGroup extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'group');
    if (this.getAttribute('label')) {
      this.setAttribute('aria-label', this.getAttribute('label'));
    }
  }
}

/**
 * Single command item.
 *
 * @element dvfy-cmd-item
 * @attr {string} value - Command identifier
 * @attr {string} icon - Icon text or emoji
 * @attr {string} hint - Right-aligned hint text (e.g., keyboard shortcut)
 * @slot - Command label text
 */
class DvfyCmdItem extends HTMLElement {}

customElements.define('dvfy-command-palette', DvfyCommandPalette);
customElements.define('dvfy-cmd-group', DvfyCmdGroup);
customElements.define('dvfy-cmd-item', DvfyCmdItem);
