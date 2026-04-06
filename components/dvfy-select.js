import { labelPositionCSS } from '../utils/label-position.js';
import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-select> — Enhanced select with search, validation state, and help text
 *
 * Attributes:
 *   label:       label text
 *   name:        form field name
 *   placeholder: placeholder text
 *   error:       error message (deprecated: use state="error" + slot)
 *   state:       validation state: error | warning | success
 *   help:        help text
 *   required:    boolean
 *   disabled:    boolean
 *   searchable:  boolean — enables filter input
 *   size:        xs | sm | md | lg | xl (default: "md")
 *   label-position: top | right | bottom | left (default: "top")
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
 * <dvfy-select label="Country" name="country" state="error">
 *   <option value="us">United States</option>
 *   <span slot="error-message">Please select a country</span>
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
  background: var(--dvfy-elevation-lg-bg);
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

/* State: error */
dvfy-select[error] .dvfy-select__trigger { border-color: var(--dvfy-input-error); }
dvfy-select[state="error"] .dvfy-select__trigger { border-color: var(--dvfy-input-error); }
dvfy-select[state="error"] .dvfy-select__trigger:focus-visible {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-input-error) 25%, transparent);
}

/* State: warning */
dvfy-select[state="warning"] .dvfy-select__trigger { border-color: var(--dvfy-warning-border); }
dvfy-select[state="warning"] .dvfy-select__trigger:focus-visible {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-warning-border) 25%, transparent);
}

/* State: success */
dvfy-select[state="success"] .dvfy-select__trigger { border-color: var(--dvfy-success-border); }
dvfy-select[state="success"] .dvfy-select__trigger:focus-visible {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-success-border) 25%, transparent);
}

/* Message text colors */
dvfy-select .dvfy-select__error-msg {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-danger-text);
}
dvfy-select .dvfy-select__warning-msg {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-warning-text);
}
dvfy-select .dvfy-select__success-msg {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-success-text);
}
dvfy-select .dvfy-select__error {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-danger-text);
}
dvfy-select .dvfy-select__help {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

/* Hide slot source elements from visual display */
dvfy-select [slot] { display: none; }

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
dvfy-select[error] .dvfy-select__native { border-color: var(--dvfy-input-error); }
dvfy-select[state="error"] .dvfy-select__native { border-color: var(--dvfy-input-error); }
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

${labelPositionCSS('dvfy-select', { layout: 'field', label: '.dvfy-select__label', content: ['.dvfy-select__custom', '.dvfy-select__native'], messages: ['.dvfy-select__error', '.dvfy-select__help', '.dvfy-select__error-msg', '.dvfy-select__warning-msg', '.dvfy-select__success-msg'] })}
`;

/**
 * Enhanced select dropdown with search, keyboard navigation, validation states, and native mobile fallback.
 *
 * @element dvfy-select
 *
 * @attr {string} label - Label text
 * @attr {string} name - Form field name
 * @attr {string} placeholder - Placeholder text (default: "Select...")
 * @attr {string} error - Error message (deprecated: use state="error" + slot; enables error styling)
 * @attr {string} state - Validation state: error | warning | success
 * @attr {string} help - Help text shown below select
 * @attr {boolean} required - Mark field as required
 * @attr {boolean} disabled - Disable interaction
 * @attr {boolean} searchable - Enable filter input in dropdown
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "top")
 *
 * @slot - <option> elements defining available choices
 * @slot error-message - Error message text (displayed when state="error")
 * @slot warning-message - Warning message text (displayed when state="warning")
 * @slot success-message - Success message text (displayed when state="success")
 *
 * @event {CustomEvent} change - Selection changed, detail: { value }
 *
 * @cssprop {color} --dvfy-surface-raised - Dropdown background
 * @cssprop {color} --dvfy-hover-bg - Option hover background
 * @cssprop {color} --dvfy-active-bg - Selected option background
 */
class DvfySelect extends HTMLElement {
  #options = [];
  #value = '';
  #open = false;
  #focusedIndex = -1;
  #built = false;
  #id = null;
  #slottedChildren = [];

  connectedCallback() {
    injectStyles('dvfy-select', STYLES);

    // Generate ID for aria attributes
    this.#id = this.getAttribute('name') || `dvfy-select-${Math.random().toString(36).slice(2, 8)}`;

    // Preserve slotted message children before clearing
    this.#slottedChildren = Array.from(this.children).filter(el => el.hasAttribute('slot'));

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
    this.#built = true;

    // Bound handler for outside click (added/removed with open/close)
    this._onDocClick = (e) => {
      if (!this.contains(e.target)) this.#close();
    };
  }

  disconnectedCallback() {
    // Clean up in case dropdown is open when removed
    document.removeEventListener('click', this._onDocClick);
    this.#built = false;
  }

  static get observedAttributes() { return ['error', 'help', 'disabled', 'label', 'placeholder', 'required', 'label-position', 'size', 'searchable', 'value', 'state']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.#built) return;

    switch (name) {
      case 'error':
      case 'help':
      case 'state':
        this.#patchMessage();
        break;
      case 'disabled':
        this.#patchDisabled();
        break;
      case 'label':
        this.#patchLabel();
        break;
      case 'placeholder':
        this.#patchPlaceholder();
        break;
      case 'required':
        this.#patchRequired();
        break;
      case 'label-position':
      case 'size':
        // These are CSS-driven via attribute selectors — no DOM patching needed
        break;
      case 'value':
        if (newVal !== this.#value) {
          this.#value = newVal || '';
          this.#patchValue();
        }
        break;
      case 'searchable':
        // Structural change — rebuild
        this.textContent = '';
        this.#buildUI();
        break;
    }
  }

  get value() { return this.#value; }
  set value(v) {
    this.#value = v;
    if (this.#built) {
      this.#patchValue();
    }
  }

  #buildUI() {
    const label = this.getAttribute('label');
    const placeholder = this.getAttribute('placeholder') || 'Select...';
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

    // Re-attach slotted children before appending messages
    this.#slottedChildren.forEach(el => this.appendChild(el));

    // Messages
    this.#appendMessages();
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

    // Forward keydown events from dropdown to main handler
    dropdown.addEventListener('keydown', e => this.#onKeydown(e));

    return dropdown;
  }

  /* ── Granular patch helpers ── */

  #patchMessage() {
    const trigger = this.querySelector('.dvfy-select__trigger');
    const error = this.getAttribute('error');
    const state = this.getAttribute('state');
    const help = this.getAttribute('help');
    const errorText = this.querySelector('[slot="error-message"]')?.textContent?.trim();
    const warningText = this.querySelector('[slot="warning-message"]')?.textContent?.trim();
    const successText = this.querySelector('[slot="success-message"]')?.textContent?.trim();

    // Remove existing message elements
    this.querySelector('.dvfy-select__error-msg')?.remove();
    this.querySelector('.dvfy-select__warning-msg')?.remove();
    this.querySelector('.dvfy-select__success-msg')?.remove();
    this.querySelector('.dvfy-select__error')?.remove();
    this.querySelector('.dvfy-select__help')?.remove();

    // Legacy error attribute takes precedence
    if (error) {
      const errEl = document.createElement('span');
      errEl.className = 'dvfy-select__error-msg';
      errEl.role = 'alert';
      errEl.textContent = error;
      errEl.id = `${this.#id}-error`;
      this.appendChild(errEl);
      if (trigger) trigger.setAttribute('aria-invalid', 'true');
    }
    // State: error
    else if (state === 'error' && errorText) {
      const errEl = document.createElement('span');
      errEl.className = 'dvfy-select__error-msg';
      errEl.role = 'alert';
      errEl.textContent = errorText;
      errEl.id = `${this.#id}-error`;
      this.appendChild(errEl);
      if (trigger) trigger.setAttribute('aria-invalid', 'true');
    }
    // State: warning
    else if (state === 'warning' && warningText) {
      const warnEl = document.createElement('span');
      warnEl.className = 'dvfy-select__warning-msg';
      warnEl.role = 'status';
      warnEl.textContent = warningText;
      warnEl.id = `${this.#id}-warning`;
      this.appendChild(warnEl);
      if (trigger) trigger.setAttribute('aria-invalid', 'false');
    }
    // State: success
    else if (state === 'success' && successText) {
      const succEl = document.createElement('span');
      succEl.className = 'dvfy-select__success-msg';
      succEl.role = 'status';
      succEl.textContent = successText;
      succEl.id = `${this.#id}-success`;
      this.appendChild(succEl);
      if (trigger) trigger.setAttribute('aria-invalid', 'false');
    }
    // Default: no state
    else {
      if (trigger) trigger.setAttribute('aria-invalid', 'false');
    }

    // Help text
    if (help) {
      const helpEl = document.createElement('span');
      helpEl.className = 'dvfy-select__help';
      helpEl.textContent = help;
      helpEl.id = `${this.#id}-help`;
      this.appendChild(helpEl);
    }
  }

  #appendMessages() {
    this.#patchMessage();
  }

  #patchDisabled() {
    const disabled = this.hasAttribute('disabled');
    const trigger = this.querySelector('.dvfy-select__trigger');
    const native = this.querySelector('.dvfy-select__native');
    if (trigger) {
      trigger.disabled = disabled;
      trigger.setAttribute('aria-disabled', String(disabled));
    }
    if (native) native.disabled = disabled;
    if (disabled && this.#open) this.#close();
  }

  #patchLabel() {
    const label = this.getAttribute('label');
    const existing = this.querySelector('.dvfy-select__label');
    if (!label) {
      existing?.remove();
      return;
    }
    if (existing) {
      // Preserve req indicator
      const req = existing.querySelector('.dvfy-select__req');
      existing.textContent = label;
      if (req) existing.appendChild(req);
    } else {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-select__label';
      lbl.textContent = label;
      if (this.hasAttribute('required')) {
        const req = document.createElement('span');
        req.className = 'dvfy-select__req';
        req.textContent = '*';
        req.setAttribute('aria-hidden', 'true');
        lbl.appendChild(req);
      }
      this.prepend(lbl);
    }
  }

  #patchPlaceholder() {
    const placeholder = this.getAttribute('placeholder') || 'Select...';
    // Update trigger text only if no value is selected
    if (!this.#value) {
      const triggerText = this.querySelector('.dvfy-select__trigger > span:first-child');
      if (triggerText) triggerText.textContent = placeholder;
    }
    // Update native placeholder option
    const nativePlaceholder = this.querySelector('.dvfy-select__native option[disabled]');
    if (nativePlaceholder) nativePlaceholder.textContent = placeholder;
  }

  #patchRequired() {
    const required = this.hasAttribute('required');
    const native = this.querySelector('.dvfy-select__native');
    if (native) native.required = required;

    const lbl = this.querySelector('.dvfy-select__label');
    if (!lbl) return;
    const existingReq = lbl.querySelector('.dvfy-select__req');
    if (required && !existingReq) {
      const req = document.createElement('span');
      req.className = 'dvfy-select__req';
      req.textContent = '*';
      req.setAttribute('aria-hidden', 'true');
      lbl.appendChild(req);
    } else if (!required && existingReq) {
      existingReq.remove();
    }
  }

  #patchValue() {
    const placeholder = this.getAttribute('placeholder') || 'Select...';
    const selectedOpt = this.#options.find(o => o.value === this.#value);

    // Update trigger text
    const triggerText = this.querySelector('.dvfy-select__trigger > span:first-child');
    if (triggerText) {
      triggerText.textContent = selectedOpt ? selectedOpt.label : placeholder;
      triggerText.classList.toggle('dvfy-select__trigger--placeholder', !selectedOpt);
    }

    // Update native select
    const native = this.querySelector('.dvfy-select__native');
    if (native) native.value = this.#value || '';

    // Update selected class and aria-selected on option items
    const items = this.querySelectorAll('.dvfy-select__option');
    for (const item of items) {
      const isSelected = item.getAttribute('data-value') === this.#value;
      item.classList.toggle('dvfy-select--selected', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    }
  }

  /* ── Dropdown open/close ── */

  #openDropdown() {
    this.#open = true;
    const trigger = this.querySelector('.dvfy-select__trigger');
    const dropdown = this.querySelector('.dvfy-select__dropdown');
    if (trigger) {
      trigger.classList.add('dvfy-select--open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    if (dropdown) dropdown.classList.add('dvfy-select__dropdown--open');

    // Attach outside-click listener only while open
    document.addEventListener('click', this._onDocClick);

    const search = this.querySelector('.dvfy-select__search');
    if (search) {
      search.value = '';
      this.#filter('');
      setTimeout(() => search.focus(), 0);
    } else {
      // No search — keep focus on trigger for keyboard nav
      trigger?.focus();
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

    // Remove outside-click listener when closed
    document.removeEventListener('click', this._onDocClick);
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
      item.setAttribute('aria-selected', 'false');
    }
    items[clamped]?.classList.add('dvfy-select--focused');
    items[clamped]?.setAttribute('aria-selected', 'true');
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
