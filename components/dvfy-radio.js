/**
 * <dvfy-radio> — Radio button with label
 *
 * Attributes:
 *   checked:  boolean
 *   disabled: boolean
 *   name:     form field name (groups radios)
 *   value:    form field value
 *   label:    label text
 *
 * Usage:
 *   <dvfy-radio name="plan" value="free" label="Free" checked></dvfy-radio>
 *   <dvfy-radio name="plan" value="pro" label="Pro"></dvfy-radio>
 */

const STYLES = `
dvfy-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
  cursor: pointer;
  user-select: none;
}
dvfy-radio[disabled] { cursor: not-allowed; opacity: 0.5; }

dvfy-radio .dvfy-radio__input {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border: var(--dvfy-border-2) solid var(--dvfy-input-border);
  border-radius: var(--dvfy-radius-round);
  background: var(--dvfy-input-bg);
  cursor: inherit;
  transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  position: relative;
}
dvfy-radio .dvfy-radio__input:hover:not(:disabled) {
  border-color: var(--dvfy-input-border-hover);
}
dvfy-radio .dvfy-radio__input:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-radio .dvfy-radio__input:checked {
  border-color: var(--dvfy-primary-bg);
}
dvfy-radio .dvfy-radio__input:checked::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 6px;
  height: 6px;
  border-radius: var(--dvfy-radius-round);
  background: var(--dvfy-primary-bg);
}
dvfy-radio .dvfy-radio__input:disabled {
  background: var(--dvfy-disabled-bg);
  border-color: var(--dvfy-border-default);
}

dvfy-radio .dvfy-radio__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-normal);
  color: var(--dvfy-text-primary);
  line-height: var(--dvfy-leading-tight);
}
dvfy-radio[disabled] .dvfy-radio__label { color: var(--dvfy-disabled-text); }
`;

class DvfyRadio extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyRadio.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyRadio.#styled = true;
    }
    this.#build();
  }

  static get observedAttributes() { return ['checked', 'disabled', 'label']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#build();
  }

  #build() {
    this.textContent = '';
    const id = `dvfy-radio-${Math.random().toString(36).slice(2, 8)}`;

    const input = document.createElement('input');
    input.type = 'radio';
    input.className = 'dvfy-radio__input';
    input.id = id;
    input.name = this.getAttribute('name') || '';
    input.value = this.getAttribute('value') || '';
    if (this.hasAttribute('checked')) input.checked = true;
    if (this.hasAttribute('disabled')) input.disabled = true;

    input.addEventListener('change', () => {
      if (input.checked) {
        // Uncheck siblings in the same name group
        const name = input.name;
        if (name) {
          document.querySelectorAll(`dvfy-radio[name="${name}"]`).forEach(r => {
            if (r !== this) r.removeAttribute('checked');
          });
        }
        this.setAttribute('checked', '');
        this.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    this.appendChild(input);

    const label = this.getAttribute('label');
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-radio__label';
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      this.appendChild(lbl);
    }
  }

  get checked() { return this.querySelector('input')?.checked ?? false; }
  set checked(v) {
    const i = this.querySelector('input');
    if (i) { i.checked = v; i.dispatchEvent(new Event('change')); }
  }
}

customElements.define('dvfy-radio', DvfyRadio);
