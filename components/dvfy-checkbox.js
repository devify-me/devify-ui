import { labelPositionCSS } from '../utils/label-position.js';
import { appendFormMessages } from '../utils/form-messages.js';
import { injectStyles } from '../utils/styles.js';

const STYLES = `
dvfy-checkbox {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
  cursor: pointer;
  user-select: none;
}
dvfy-checkbox[disabled] { cursor: not-allowed; opacity: 0.5; }

dvfy-checkbox .dvfy-checkbox__input {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border: var(--dvfy-border-2) solid var(--dvfy-input-border);
  border-radius: var(--dvfy-radius-sm);
  background: var(--dvfy-input-bg);
  cursor: inherit;
  transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  position: relative;
}
dvfy-checkbox .dvfy-checkbox__input:hover:not(:disabled) {
  border-color: var(--dvfy-input-border-hover);
}
dvfy-checkbox .dvfy-checkbox__input:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-checkbox .dvfy-checkbox__input:checked {
  background: var(--dvfy-primary-bg);
  border-color: var(--dvfy-primary-bg);
}
dvfy-checkbox .dvfy-checkbox__input:checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0px;
  width: 5px;
  height: 9px;
  border: solid var(--dvfy-text-inverse);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
dvfy-checkbox .dvfy-checkbox__input:indeterminate {
  background: var(--dvfy-primary-bg);
  border-color: var(--dvfy-primary-bg);
}
dvfy-checkbox .dvfy-checkbox__input:indeterminate::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 5px;
  width: 8px;
  height: 2px;
  background: var(--dvfy-text-inverse);
}
dvfy-checkbox .dvfy-checkbox__input:disabled {
  background: var(--dvfy-disabled-bg);
  border-color: var(--dvfy-border-default);
}

dvfy-checkbox .dvfy-checkbox__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-normal);
  color: var(--dvfy-text-primary);
  line-height: var(--dvfy-leading-tight);
}
dvfy-checkbox[disabled] .dvfy-checkbox__label { color: var(--dvfy-disabled-text); }

/* Message styles (shared shape with dvfy-input) */
dvfy-checkbox .dvfy-checkbox__messages {
  flex-basis: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-0-5);
  margin-top: var(--dvfy-space-1);
}
dvfy-checkbox .dvfy-checkbox__messages:empty { display: none; }
dvfy-checkbox .dvfy-checkbox__help-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); }
dvfy-checkbox .dvfy-checkbox__error-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-input-error); }
dvfy-checkbox .dvfy-checkbox__warning-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-warning-text); }
dvfy-checkbox .dvfy-checkbox__success-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-success-text); }

/* State-based input border */
dvfy-checkbox[state="error"] .dvfy-checkbox__input { border-color: var(--dvfy-input-error); }
dvfy-checkbox[state="warning"] .dvfy-checkbox__input { border-color: var(--dvfy-warning-border); }
dvfy-checkbox[state="success"] .dvfy-checkbox__input { border-color: var(--dvfy-success-border); }

/* Size: xs — 0.75rem input */
dvfy-checkbox[size="xs"] { gap: var(--dvfy-space-1-5); }
dvfy-checkbox[size="xs"] .dvfy-checkbox__input { width: 0.75rem; height: 0.75rem; border-width: var(--dvfy-border-1); }
dvfy-checkbox[size="xs"] .dvfy-checkbox__input:checked::after { left: 2px; top: 0px; width: 4px; height: 7px; border-width: 0 1.5px 1.5px 0; }
dvfy-checkbox[size="xs"] .dvfy-checkbox__input:indeterminate::after { left: 1.5px; top: 4px; width: 6px; height: 1.5px; }
dvfy-checkbox[size="xs"] .dvfy-checkbox__label { font-size: var(--dvfy-text-xs); }

/* Size: sm — 0.875rem input */
dvfy-checkbox[size="sm"] { gap: var(--dvfy-space-1-5); }
dvfy-checkbox[size="sm"] .dvfy-checkbox__input { width: 0.875rem; height: 0.875rem; }
dvfy-checkbox[size="sm"] .dvfy-checkbox__input:checked::after { left: 2.5px; top: 0px; width: 4.5px; height: 8px; border-width: 0 1.75px 1.75px 0; }
dvfy-checkbox[size="sm"] .dvfy-checkbox__input:indeterminate::after { left: 1.75px; top: 4.5px; width: 7px; height: 1.75px; }
dvfy-checkbox[size="sm"] .dvfy-checkbox__label { font-size: var(--dvfy-text-xs); }

/* Size: md — 1rem input (default, no overrides needed) */

/* Size: lg — 1.25rem input */
dvfy-checkbox[size="lg"] { gap: var(--dvfy-space-2-5); }
dvfy-checkbox[size="lg"] .dvfy-checkbox__input { width: 1.25rem; height: 1.25rem; }
dvfy-checkbox[size="lg"] .dvfy-checkbox__input:checked::after { left: 4px; top: 0px; width: 6px; height: 11px; border-width: 0 2.5px 2.5px 0; }
dvfy-checkbox[size="lg"] .dvfy-checkbox__input:indeterminate::after { left: 2.5px; top: 6.5px; width: 10px; height: 2.5px; }
dvfy-checkbox[size="lg"] .dvfy-checkbox__label { font-size: var(--dvfy-text-base); }

/* Size: xl — 1.5rem input */
dvfy-checkbox[size="xl"] { gap: var(--dvfy-space-3); }
dvfy-checkbox[size="xl"] .dvfy-checkbox__input { width: 1.5rem; height: 1.5rem; }
dvfy-checkbox[size="xl"] .dvfy-checkbox__input:checked::after { left: 5px; top: 0px; width: 7px; height: 13px; border-width: 0 3px 3px 0; }
dvfy-checkbox[size="xl"] .dvfy-checkbox__input:indeterminate::after { left: 3px; top: 8px; width: 12px; height: 3px; }
dvfy-checkbox[size="xl"] .dvfy-checkbox__label { font-size: var(--dvfy-text-base); }

${labelPositionCSS('dvfy-checkbox', { layout: 'inline', label: '.dvfy-checkbox__label' })}
`;

/**
 * Checkbox input with label, tri-state cycling, size variants, and validation messages.
 *
 * When the `indeterminate` attribute is set at initialization, clicking
 * cycles: indeterminate → checked → unchecked → indeterminate → ...
 * Without `indeterminate`, standard binary toggle applies.
 *
 * @element dvfy-checkbox
 *
 * @attr {boolean} checked - Checked state
 * @attr {boolean} disabled - Disable interaction
 * @attr {boolean} indeterminate - Show indeterminate (dash) state; enables tri-state cycling
 * @attr {string} size - Visual size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} name - Form field name
 * @attr {string} value - Form field value (default: "on")
 * @attr {string} label - Label text
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "right")
 * @attr {string} state - Validation state: error | warning | success
 * @attr {string} error - Error message text (takes precedence over state)
 * @attr {string} warning - Warning message text
 * @attr {string} help - Help text shown below the control
 *
 * @event {CustomEvent} change - Checkbox state changed, detail: { checked, indeterminate }
 *
 * @cssprop {color} --dvfy-primary-bg - Checked/indeterminate background
 * @cssprop {color} --dvfy-input-border - Unchecked border color
 * @cssprop {color} --dvfy-input-error - Error message color
 *
 * @example
 * <dvfy-checkbox label="Accept terms" name="terms"></dvfy-checkbox>
 * <dvfy-checkbox label="Select all" indeterminate></dvfy-checkbox>
 * <dvfy-checkbox label="Large option" size="lg" checked></dvfy-checkbox>
 * <dvfy-checkbox label="Agree" error="You must agree to continue"></dvfy-checkbox>
 */
class DvfyCheckbox extends HTMLElement {
  static #STRUCTURAL = new Set(['indeterminate', 'label']);

  #tristate = false;
  #state = 'unchecked'; // 'unchecked' | 'checked' | 'indeterminate'
  #pendingRender = false;
  #initialized = false;
  #muted = false;
  #id = '';

  connectedCallback() {
    injectStyles('dvfy-checkbox', STYLES);
    this.#tristate = this.hasAttribute('indeterminate');
    if (this.hasAttribute('indeterminate')) {
      this.#state = 'indeterminate';
    } else if (this.hasAttribute('checked')) {
      this.#state = 'checked';
    } else {
      this.#state = 'unchecked';
    }
    this.setAttribute('role', 'checkbox');
    this.#build();
    this.#initialized = true;
  }

  disconnectedCallback() {
    this.textContent = '';
  }

  static get observedAttributes() {
    return ['checked', 'disabled', 'indeterminate', 'label', 'size', 'label-position',
            'error', 'warning', 'help', 'state'];
  }

  #scheduleRender() {
    if (!this.#pendingRender) {
      this.#pendingRender = true;
      queueMicrotask(() => {
        this.#pendingRender = false;
        this.#tristate = this.hasAttribute('indeterminate');
        if (this.hasAttribute('indeterminate')) this.#state = 'indeterminate';
        else if (this.hasAttribute('checked')) this.#state = 'checked';
        else this.#state = 'unchecked';
        this.#build();
        this.#initialized = true;
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;
    if (!this.#initialized) return;
    if (this.#muted) return;

    // Presence toggle on structural attrs requires full rebuild
    if (DvfyCheckbox.#STRUCTURAL.has(name)) {
      const wasPresent = oldValue !== null;
      const isPresent = newValue !== null;
      if (wasPresent !== isPresent) { this.#scheduleRender(); return; }
      // Both present → in-place for label text; indeterminate has no value
      if (name === 'label') { this.#updateLabel(); return; }
    }

    switch (name) {
      case 'checked': this.#updateChecked(); break;
      case 'disabled': this.#updateDisabled(); break;
      case 'error':
      case 'warning':
      case 'help':
      case 'state':
        this.#updateMessages();
        break;
      // size, label-position: CSS-only
    }
  }

  #updateChecked() {
    const input = this.querySelector('.dvfy-checkbox__input');
    if (!input) { this.#scheduleRender(); return; }
    const isChecked = this.hasAttribute('checked');
    if (this.#state === 'indeterminate') return;
    this.#state = isChecked ? 'checked' : 'unchecked';
    this.#syncInput(input);
    this.#syncAria();
  }

  #updateDisabled() {
    const input = this.querySelector('.dvfy-checkbox__input');
    if (!input) { this.#scheduleRender(); return; }
    input.disabled = this.hasAttribute('disabled');
  }

  #updateLabel() {
    const existing = this.querySelector('.dvfy-checkbox__label');
    const newLabel = this.getAttribute('label');
    if (existing && newLabel) existing.textContent = newLabel;
    else this.#scheduleRender();
  }

  #updateMessages() {
    const input = this.querySelector('.dvfy-checkbox__input');
    if (!input) { this.#scheduleRender(); return; }
    this.querySelector('.dvfy-checkbox__messages')?.remove();
    input.removeAttribute('aria-describedby');
    this.#appendMessages(input);
  }

  #appendMessages(input) {
    const error = this.getAttribute('error');
    const warning = this.getAttribute('warning');
    const help = this.getAttribute('help');
    const state = this.getAttribute('state');
    if (!error && !warning && !help && !state) return;

    const container = appendFormMessages(this, 'dvfy-checkbox', input, {
      error, warning, help, state,
    });
    if (container.childElementCount > 0) this.appendChild(container);
  }

  #build() {
    this.textContent = '';
    this.#id = this.getAttribute('name') || `dvfy-cb-${Math.random().toString(36).slice(2, 8)}`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'dvfy-checkbox__input';
    input.id = this.#id;
    input.name = this.getAttribute('name') || '';
    input.value = this.getAttribute('value') || 'on';
    if (this.hasAttribute('disabled')) input.disabled = true;
    if (this.hasAttribute('required')) input.required = true;

    this.#syncInput(input);

    if (this.#tristate) {
      input.addEventListener('click', (e) => {
        e.preventDefault();
        if (input.disabled) return;
        if (this.#state === 'indeterminate') this.#state = 'checked';
        else if (this.#state === 'checked') this.#state = 'unchecked';
        else this.#state = 'indeterminate';
        this.#syncInput(input);
        this.#syncAttributes();
        this.dispatchEvent(new CustomEvent('change', {
          bubbles: true,
          detail: { checked: input.checked, indeterminate: input.indeterminate }
        }));
      });
    } else {
      input.addEventListener('change', () => {
        this.#state = input.checked ? 'checked' : 'unchecked';
        this.#syncAttributes();
        this.dispatchEvent(new CustomEvent('change', {
          bubbles: true,
          detail: { checked: input.checked, indeterminate: false }
        }));
      });
    }

    this.appendChild(input);

    const label = this.getAttribute('label');
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-checkbox__label';
      lbl.setAttribute('for', this.#id);
      lbl.textContent = label;
      this.appendChild(lbl);
    }

    this.#appendMessages(input);
    this.#syncAttributes();
  }

  #syncInput(input) {
    input.checked = this.#state === 'checked';
    input.indeterminate = this.#state === 'indeterminate';
  }

  #syncAria() {
    const ariaVal = this.#state === 'indeterminate' ? 'mixed'
      : this.#state === 'checked' ? 'true' : 'false';
    this.setAttribute('aria-checked', ariaVal);
  }

  #syncAttributes() {
    this.#muted = true;
    try {
      if (this.#state === 'checked') this.setAttribute('checked', '');
      else this.removeAttribute('checked');
      if (this.#state === 'indeterminate') this.setAttribute('indeterminate', '');
      else this.removeAttribute('indeterminate');
    } finally {
      this.#muted = false;
    }
    this.#syncAria();
  }

  get checked() { return this.querySelector('input')?.checked ?? false; }
  set checked(v) {
    this.#state = v ? 'checked' : 'unchecked';
    const i = this.querySelector('input');
    if (i) this.#syncInput(i);
    this.#syncAttributes();
  }

  get indeterminate() { return this.querySelector('input')?.indeterminate ?? false; }
  set indeterminate(v) {
    this.#state = v ? 'indeterminate' : (this.hasAttribute('checked') ? 'checked' : 'unchecked');
    const i = this.querySelector('input');
    if (i) this.#syncInput(i);
    this.#syncAttributes();
  }
}

customElements.define('dvfy-checkbox', DvfyCheckbox);
