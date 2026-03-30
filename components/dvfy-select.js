/**
 * <dvfy-select> — Enhanced select with search
 *
 * Attributes:
 *   label:       label text
 *   name:        form field name
 *   placeholder: placeholder text
 *   error:       error message
 *   help:        help text
 *   required:    boolean
 *   disabled:    boolean
 *   searchable:  boolean — enables filter input
 *
 * Children are <option> elements (read on connect).
 * Dispatches 'change' event on selection.
 * Falls back to native select when component width < 768px (container query).
 *
 * Usage:
 *   <dvfy-select label="Country" name="country" searchable>
 *     <option value="us">United States</option>
 *     <option value="ca">Canada</option>
 *   </dvfy-select>
 *
 * @example
 * <dvfy-select label="Country" name="country" searchable>
 *   <option value="us">United States</option>
 *   <option value="ca">Canada</option>
 *   <option value="mx">Mexico</option>
 * </dvfy-select>
 */

const STYLES = `
dvfy-select {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
  width: 100%;
  container-type: inline-size;
  container-name: dvfy-select;
}

dvfy-select .dvfy-select__label {
  display: block;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}

dvfy-select .dvfy-select__label .dvfy-select__req {
  color: var(--dvfy-danger-text);
  margin-left: var(--dvfy-space-0-5);
}

dvfy-select .dvfy-select__custom {
  position: relative;
  width: 100%;
}

dvfy-select .dvfy-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  font-family: inherit;
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  cursor: pointer;
  color: var(--dvfy-text-primary);
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
  box-sizing: border-box;
}
dvfy-select .dvfy-select__trigger:hover { border-color: var(--dvfy-border-strong); }
dvfy-select .dvfy-select__trigger:focus-visible,
dvfy-select .dvfy-select__trigger.dvfy-select--open {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
  border-color: var(--dvfy-ring-color);
}
dvfy-select .dvfy-select__trigger--placeholder { color: var(--dvfy-text-muted); }

dvfy-select .dvfy-select__arrow {
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  margin-left: var(--dvfy-space-2);
  transition: transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-select .dvfy-select--open .dvfy-select__arrow { transform: rotate(180deg); }

dvfy-select .dvfy-select__dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: var(--dvfy-z-dropdown, 100);
  margin-top: var(--dvfy-space-1);
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  box-shadow: var(--dvfy-shadow-lg);
  max-height: 15rem;
  overflow: hidden;
}
dvfy-select .dvfy-select__dropdown--open { display: block; }

dvfy-select .dvfy-select__search {
  display: block;
  width: 100%;
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  font-family: inherit;
  border: none;
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
  outline: none;
  background: transparent;
  color: var(--dvfy-text-primary);
  box-sizing: border-box;
}

dvfy-select .dvfy-select__list {
  max-height: 12rem;
  overflow-y: auto;
  padding: var(--dvfy-space-1) 0;
}

dvfy-select .dvfy-select__option {
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  cursor: pointer;
  color: var(--dvfy-text-primary);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-select .dvfy-select__option:hover,
dvfy-select .dvfy-select__option.dvfy-select--focused {
  background: var(--dvfy-hover-bg);
}
dvfy-select .dvfy-select__option.dvfy-select--selected {
  background: var(--dvfy-active-bg);
  font-weight: var(--dvfy-weight-medium);
}
dvfy-select .dvfy-select__option--hidden { display: none; }

dvfy-select .dvfy-select__empty {
  padding: var(--dvfy-space-3);
  text-align: center;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
}

/* Error state */
dvfy-select[error] .dvfy-select__trigger { border-color: var(--dvfy-danger-border); }
dvfy-select .dvfy-select__error {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-danger-text);
}
dvfy-select .dvfy-select__help {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

/* Disabled */
dvfy-select[disabled] .dvfy-select__trigger {
  background: var(--dvfy-disabled-bg);
  color: var(--dvfy-disabled-text);
  cursor: not-allowed;
  pointer-events: none;
}

/* Native fallback (hidden by default, shown on very narrow containers) */
dvfy-select .dvfy-select__native {
  display: none;
  appearance: none;
  width: 100%;
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  font-family: inherit;
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  box-sizing: border-box;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--dvfy-space-3) center;
  padding-right: var(--dvfy-space-8);
}
dvfy-select .dvfy-select__native option {
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-primary);
}
dvfy-select[error] .dvfy-select__native { border-color: var(--dvfy-danger-border); }
dvfy-select[disabled] .dvfy-select__native {
  background: var(--dvfy-disabled-bg);
  color: var(--dvfy-disabled-text);
  cursor: not-allowed;
}

@container dvfy-select (max-width: 199px) {
  dvfy-select .dvfy-select__custom { display: none !important; }
  dvfy-select .dvfy-select__native { display: block; }
}

/* Size: xs */
dvfy-select[size="xs"] .dvfy-select__trigger { padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border-radius: var(--dvfy-radius-sm); }
dvfy-select[size="xs"] .dvfy-select__label { font-size: var(--dvfy-text-xs); }
dvfy-select[size="xs"] .dvfy-select__native { padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border-radius: var(--dvfy-radius-sm); }
/* Size: sm */
dvfy-select[size="sm"] .dvfy-select__trigger { padding: var(--dvfy-space-1-5) var(--dvfy-space-2-5); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
dvfy-select[size="sm"] .dvfy-select__label { font-size: var(--dvfy-text-xs); }
dvfy-select[size="sm"] .dvfy-select__native { padding: var(--dvfy-space-1-5) var(--dvfy-space-2-5); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
/* Size: md (default) */
/* Size: lg */
dvfy-select[size="lg"] .dvfy-select__trigger { padding: var(--dvfy-space-2-5) var(--dvfy-space-3-5); font-size: var(--dvfy-text-base); }
dvfy-select[size="lg"] .dvfy-select__native { padding: var(--dvfy-space-2-5) var(--dvfy-space-3-5); font-size: var(--dvfy-text-base); }
/* Size: xl */
dvfy-select[size="xl"] .dvfy-select__trigger { padding: var(--dvfy-space-3) var(--dvfy-space-4); font-size: var(--dvfy-text-lg); border-radius: var(--dvfy-radius-xl); }
dvfy-select[size="xl"] .dvfy-select__label { font-size: var(--dvfy-text-base); }
dvfy-select[size="xl"] .dvfy-select__native { padding: var(--dvfy-space-3) var(--dvfy-space-4); font-size: var(--dvfy-text-lg); border-radius: var(--dvfy-radius-xl); }

/* Label position: bottom */
dvfy-select[label-position="bottom"] .dvfy-select__label { order: 1; }
dvfy-select[label-position="bottom"] .dvfy-select__error,
dvfy-select[label-position="bottom"] .dvfy-select__help { order: 2; }

/* Label position: left */
dvfy-select[label-position="left"] { flex-direction: row; flex-wrap: wrap; align-items: center; }
dvfy-select[label-position="left"] .dvfy-select__label { flex-shrink: 0; width: var(--dvfy-label-width, auto); }
dvfy-select[label-position="left"] .dvfy-select__custom,
dvfy-select[label-position="left"] .dvfy-select__native { flex: 1; min-width: 0; }
dvfy-select[label-position="left"] .dvfy-select__error,
dvfy-select[label-position="left"] .dvfy-select__help { width: 100%; }

/* Label position: right */
dvfy-select[label-position="right"] { flex-direction: row; flex-wrap: wrap; align-items: center; }
dvfy-select[label-position="right"] .dvfy-select__label { order: 1; flex-shrink: 0; width: var(--dvfy-label-width, auto); }
dvfy-select[label-position="right"] .dvfy-select__custom,
dvfy-select[label-position="right"] .dvfy-select__native { flex: 1; min-width: 0; }
dvfy-select[label-position="right"] .dvfy-select__error,
dvfy-select[label-position="right"] .dvfy-select__help { width: 100%; order: 2; }
`;

/**
 * Enhanced select dropdown with search, keyboard navigation, and native mobile fallback.
 *
 * @element dvfy-select
 *
 * @attr {string} label - Label text
 * @attr {string} name - Form field name
 * @attr {string} placeholder - Placeholder text (default: "Select...")
 * @attr {string} error - Error message (enables error styling)
 * @attr {string} help - Help text shown below select
 * @attr {boolean} required - Mark field as required
 * @attr {boolean} disabled - Disable interaction
 * @attr {boolean} searchable - Enable filter input in dropdown
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "top")
 *
 * @fires change - Selection changed, detail: { value }
 *
 * @slot - <option> elements defining available choices
 *
 * @cssprop {color} --dvfy-surface-raised - Dropdown background
 * @cssprop {color} --dvfy-hover-bg - Option hover background
 * @cssprop {color} --dvfy-active-bg - Selected option background
 */
class DvfySelect extends HTMLElement {
  static #styled = false;
  #options = [];
  #value = '';
  #open = false;
  #focusedIndex = -1;

  connectedCallback() {
    if (!DvfySelect.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfySelect.#styled = true;
    }

    // Read options from child <option> elements
    this.#options = Array.from(this.querySelectorAll('option')).map(o => ({
      value: o.value,
      label: o.textContent.trim(),
      selected: o.hasAttribute('selected')
    }));

    // Find pre-selected
    const selected = this.#options.find(o => o.selected);
    if (selected) this.#value = selected.value;

    // Clear children and build UI
    this.textContent = '';
    this.#buildUI();

    // Close on outside click
    this._onDocClick = (e) => {
      if (!this.contains(e.target)) this.#close();
    };
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
  }

  static get observedAttributes() { return ['error', 'help', 'disabled', 'label', 'placeholder', 'required', 'label-position', 'size', 'searchable']; }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.textContent = '';
      this.#buildUI();
    }
  }

  get value() { return this.#value; }
  set value(v) {
    this.#value = v;
    if (this.isConnected) {
      this.textContent = '';
      this.#buildUI();
    }
  }

  #buildUI() {
    const label = this.getAttribute('label');
    const placeholder = this.getAttribute('placeholder') || 'Select...';
    const error = this.getAttribute('error');
    const help = this.getAttribute('help');
    const required = this.hasAttribute('required');

    // Label
    if (label) {
      this.appendChild(this.#buildLabel(label, required));
    }

    // Native select (mobile fallback)
    this.appendChild(this.#buildNativeSelect(placeholder));

    // Custom UI wrapper
    const custom = document.createElement('div');
    custom.className = 'dvfy-select__custom';
    custom.appendChild(this.#buildTrigger(placeholder));
    custom.appendChild(this.#buildDropdown());
    this.appendChild(custom);

    // Error / help
    if (error) {
      const errEl = document.createElement('div');
      errEl.className = 'dvfy-select__error';
      errEl.textContent = error;
      this.appendChild(errEl);
    } else if (help) {
      const helpEl = document.createElement('div');
      helpEl.className = 'dvfy-select__help';
      helpEl.textContent = help;
      this.appendChild(helpEl);
    }
  }

  #buildLabel(label, required) {
    const lbl = document.createElement('label');
    lbl.className = 'dvfy-select__label';
    lbl.textContent = label;
    if (required) {
      const req = document.createElement('span');
      req.className = 'dvfy-select__req';
      req.textContent = '*';
      req.setAttribute('aria-hidden', 'true');
      lbl.appendChild(req);
    }
    return lbl;
  }

  #buildNativeSelect(placeholder) {
    const name = this.getAttribute('name');
    const required = this.hasAttribute('required');

    const native = document.createElement('select');
    native.className = 'dvfy-select__native';
    if (name) native.name = name;
    if (required) native.required = true;
    if (this.hasAttribute('disabled')) native.disabled = true;

    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = placeholder;
    placeholderOpt.disabled = true;
    if (!this.#value) placeholderOpt.selected = true;
    native.appendChild(placeholderOpt);

    for (const opt of this.#options) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === this.#value) o.selected = true;
      native.appendChild(o);
    }
    native.addEventListener('change', (e) => {
      e.stopPropagation();
      this.#value = native.value;
      this.dispatchEvent(new CustomEvent('change', { detail: { value: this.#value }, bubbles: true }));
    });
    return native;
  }

  #buildTrigger(placeholder) {
    const trigger = document.createElement('button');
    trigger.className = 'dvfy-select__trigger';
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'listbox');

    const selectedOpt = this.#options.find(o => o.value === this.#value);
    const triggerText = document.createElement('span');
    triggerText.textContent = selectedOpt ? selectedOpt.label : placeholder;
    if (!selectedOpt) triggerText.classList.add('dvfy-select__trigger--placeholder');
    trigger.appendChild(triggerText);

    const arrow = document.createElement('span');
    arrow.className = 'dvfy-select__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '\u25BE';
    trigger.appendChild(arrow);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.#open ? this.#close() : this.#openDropdown();
    });
    trigger.addEventListener('keydown', e => this.#onKeydown(e));
    return trigger;
  }

  #buildDropdown() {
    const searchable = this.hasAttribute('searchable');

    const dropdown = document.createElement('div');
    dropdown.className = 'dvfy-select__dropdown';
    dropdown.setAttribute('role', 'listbox');

    if (searchable) {
      const search = document.createElement('input');
      search.className = 'dvfy-select__search';
      search.setAttribute('type', 'text');
      search.setAttribute('placeholder', 'Search...');
      search.setAttribute('aria-label', 'Search options');
      search.addEventListener('input', () => this.#filter(search.value));
      search.addEventListener('keydown', e => this.#onKeydown(e));
      search.addEventListener('click', e => e.stopPropagation());
      dropdown.appendChild(search);
    }

    const list = document.createElement('div');
    list.className = 'dvfy-select__list';

    for (let i = 0; i < this.#options.length; i++) {
      const opt = this.#options[i];
      const item = document.createElement('div');
      item.className = 'dvfy-select__option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.setAttribute('data-value', opt.value);
      item.setAttribute('data-index', String(i));
      item.textContent = opt.label;
      if (opt.value === this.#value) {
        item.classList.add('dvfy-select--selected');
        item.setAttribute('aria-selected', 'true');
      }
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.#select(opt.value);
      });
      list.appendChild(item);
    }

    const empty = document.createElement('div');
    empty.className = 'dvfy-select__empty';
    empty.textContent = 'No results';
    empty.style.display = 'none';
    list.appendChild(empty);

    dropdown.appendChild(list);
    return dropdown;
  }

  #openDropdown() {
    this.#open = true;
    const trigger = this.querySelector('.dvfy-select__trigger');
    const dropdown = this.querySelector('.dvfy-select__dropdown');
    if (trigger) {
      trigger.classList.add('dvfy-select--open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    if (dropdown) dropdown.classList.add('dvfy-select__dropdown--open');

    const search = this.querySelector('.dvfy-select__search');
    if (search) {
      search.value = '';
      this.#filter('');
      setTimeout(() => search.focus(), 0);
    }

    // Focus selected or first
    const selectedIdx = this.#options.findIndex(o => o.value === this.#value);
    this.#setFocus(selectedIdx >= 0 ? selectedIdx : 0);
  }

  #close() {
    this.#open = false;
    this.#focusedIndex = -1;
    const trigger = this.querySelector('.dvfy-select__trigger');
    const dropdown = this.querySelector('.dvfy-select__dropdown');
    if (trigger) {
      trigger.classList.remove('dvfy-select--open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    if (dropdown) dropdown.classList.remove('dvfy-select__dropdown--open');
  }

  #select(value) {
    this.#value = value;
    this.#close();

    // Update native
    const native = this.querySelector('.dvfy-select__native');
    if (native) native.value = value;

    // Update trigger text
    const opt = this.#options.find(o => o.value === value);
    const triggerText = this.querySelector('.dvfy-select__trigger > span:first-child');
    if (triggerText && opt) {
      triggerText.textContent = opt.label;
      triggerText.classList.remove('dvfy-select__trigger--placeholder');
    }

    // Update selected class and aria-selected
    const items = this.querySelectorAll('.dvfy-select__option');
    for (const item of items) {
      const isSelected = item.getAttribute('data-value') === value;
      item.classList.toggle('dvfy-select--selected', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    }

    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  }

  #filter(query) {
    const lc = query.toLowerCase();
    const items = this.querySelectorAll('.dvfy-select__option');
    let visible = 0;
    for (const item of items) {
      const match = !lc || item.textContent.toLowerCase().includes(lc);
      item.classList.toggle('dvfy-select__option--hidden', !match);
      if (match) visible++;
    }
    const empty = this.querySelector('.dvfy-select__empty');
    if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
  }

  #setFocus(index) {
    const items = Array.from(this.querySelectorAll('.dvfy-select__option:not(.dvfy-select__option--hidden)'));
    if (!items.length) return;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    this.#focusedIndex = clamped;
    for (const item of this.querySelectorAll('.dvfy-select__option')) {
      item.classList.remove('dvfy-select--focused');
    }
    items[clamped]?.classList.add('dvfy-select--focused');
    items[clamped]?.scrollIntoView({ block: 'nearest' });
  }

  #onKeydown(e) {
    if (!this.#open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      this.#openDropdown();
      return;
    }
    if (!this.#open) return;

    const visible = Array.from(this.querySelectorAll('.dvfy-select__option:not(.dvfy-select__option--hidden)'));

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.#setFocus(this.#focusedIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.#setFocus(this.#focusedIndex - 1);
        break;
      case 'Enter': {
        e.preventDefault();
        const focused = visible[this.#focusedIndex];
        if (focused) this.#select(focused.getAttribute('data-value'));
        break;
      }
      case 'Escape':
        e.preventDefault();
        this.#close();
        this.querySelector('.dvfy-select__trigger')?.focus();
        break;
      case 'Tab':
        this.#close();
        break;
    }
  }
}

customElements.define('dvfy-select', DvfySelect);
