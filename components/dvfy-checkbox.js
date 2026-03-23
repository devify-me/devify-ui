const STYLES = `
dvfy-checkbox {
  display: inline-flex;
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
  border: solid var(--dvfy-neutral-0);
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
  background: var(--dvfy-neutral-0);
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

/* Label position: left */
dvfy-checkbox[label-position="left"] .dvfy-checkbox__label { order: -1; }

/* Label position: top */
dvfy-checkbox[label-position="top"] { flex-direction: column; align-items: center; }
dvfy-checkbox[label-position="top"] .dvfy-checkbox__label { order: -1; }

/* Label position: bottom */
dvfy-checkbox[label-position="bottom"] { flex-direction: column; align-items: center; }
`;

/**
 * Checkbox input with label, tri-state cycling, and size variants.
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
 *
 * @fires {CustomEvent} change - Checkbox state changed, detail: { checked, indeterminate }
 *
 * @cssprop {color} --dvfy-primary-bg - Checked/indeterminate background
 * @cssprop {color} --dvfy-input-border - Unchecked border color
 *
 * @example
 * <dvfy-checkbox label="Accept terms" name="terms"></dvfy-checkbox>
 * <dvfy-checkbox label="Select all" indeterminate></dvfy-checkbox>
 * <dvfy-checkbox label="Large option" size="lg" checked></dvfy-checkbox>
 */
class DvfyCheckbox extends HTMLElement {
  static #styled = false;
  #tristate = false;
  #state = 'unchecked'; // 'unchecked' | 'checked' | 'indeterminate'

  connectedCallback() {
    if (!DvfyCheckbox.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCheckbox.#styled = true;
    }
    // Determine tri-state mode before first build
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
  }

  static get observedAttributes() { return ['checked', 'disabled', 'indeterminate', 'label', 'size', 'label-position']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#build();
  }

  #build() {
    this.textContent = '';
    const id = this.getAttribute('name') || `dvfy-cb-${Math.random().toString(36).slice(2, 8)}`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'dvfy-checkbox__input';
    input.id = id;
    input.name = this.getAttribute('name') || '';
    input.value = this.getAttribute('value') || 'on';
    if (this.hasAttribute('disabled')) input.disabled = true;
    if (this.hasAttribute('required')) input.required = true;

    // Sync native input to internal state
    this.#syncInput(input);

    if (this.#tristate) {
      input.addEventListener('click', (e) => {
        e.preventDefault();
        if (input.disabled) return;
        // Cycle: indeterminate → checked → unchecked → indeterminate
        if (this.#state === 'indeterminate') {
          this.#state = 'checked';
        } else if (this.#state === 'checked') {
          this.#state = 'unchecked';
        } else {
          this.#state = 'indeterminate';
        }
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
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      this.appendChild(lbl);
    }
    this.#syncAttributes();
  }

  #syncInput(input) {
    input.checked = this.#state === 'checked';
    input.indeterminate = this.#state === 'indeterminate';
  }

  #syncAttributes() {
    if (this.#state === 'checked') {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    if (this.#state === 'indeterminate') {
      this.setAttribute('indeterminate', '');
    } else {
      this.removeAttribute('indeterminate');
    }
    const ariaVal = this.#state === 'indeterminate' ? 'mixed'
      : this.#state === 'checked' ? 'true' : 'false';
    this.setAttribute('aria-checked', ariaVal);
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
