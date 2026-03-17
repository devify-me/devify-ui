/**
 * <dvfy-checkbox> — Checkbox with label
 *
 * Attributes:
 *   checked:       boolean
 *   disabled:      boolean
 *   indeterminate: boolean
 *   name:          form field name
 *   value:         form field value (default: "on")
 *   label:         label text
 *
 * Usage:
 *   <dvfy-checkbox label="Accept terms" name="terms" required></dvfy-checkbox>
 *   <dvfy-checkbox label="Select all" indeterminate></dvfy-checkbox>
 */

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
`;

/**
 * Checkbox input with label and indeterminate state support.
 *
 * @element dvfy-checkbox
 *
 * @attr {boolean} checked - Checked state
 * @attr {boolean} disabled - Disable interaction
 * @attr {boolean} indeterminate - Show indeterminate (dash) state
 * @attr {string} name - Form field name
 * @attr {string} value - Form field value (default: "on")
 * @attr {string} label - Label text
 *
 * @fires change - Checkbox state changed
 *
 * @cssprop {color} --dvfy-primary-bg - Checked/indeterminate background
 * @cssprop {color} --dvfy-input-border - Unchecked border color
 */
class DvfyCheckbox extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyCheckbox.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCheckbox.#styled = true;
    }
    this.#build();
  }

  static get observedAttributes() { return ['checked', 'disabled', 'indeterminate', 'label']; }

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
    if (this.hasAttribute('checked')) input.checked = true;
    if (this.hasAttribute('disabled')) input.disabled = true;
    if (this.hasAttribute('indeterminate')) input.indeterminate = true;

    input.addEventListener('change', () => {
      if (input.checked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });

    this.appendChild(input);

    const label = this.getAttribute('label');
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-checkbox__label';
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      this.appendChild(lbl);
    }
  }

  get checked() { return this.querySelector('input')?.checked ?? false; }
  set checked(v) {
    const i = this.querySelector('input');
    if (i) i.checked = v;
    v ? this.setAttribute('checked', '') : this.removeAttribute('checked');
  }

  get indeterminate() { return this.querySelector('input')?.indeterminate ?? false; }
  set indeterminate(v) {
    const i = this.querySelector('input');
    if (i) i.indeterminate = v;
    v ? this.setAttribute('indeterminate', '') : this.removeAttribute('indeterminate');
  }
}

customElements.define('dvfy-checkbox', DvfyCheckbox);
