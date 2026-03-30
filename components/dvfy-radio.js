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

/* Size: xs — 0.75rem input */
dvfy-radio[size="xs"] { gap: var(--dvfy-space-1-5); }
dvfy-radio[size="xs"] .dvfy-radio__input { width: 0.75rem; height: 0.75rem; border-width: var(--dvfy-border-1); }
dvfy-radio[size="xs"] .dvfy-radio__input:checked::after { top: 2px; left: 2px; width: 4px; height: 4px; }
dvfy-radio[size="xs"] .dvfy-radio__label { font-size: var(--dvfy-text-xs); }

/* Size: sm — 0.875rem input */
dvfy-radio[size="sm"] { gap: var(--dvfy-space-1-5); }
dvfy-radio[size="sm"] .dvfy-radio__input { width: 0.875rem; height: 0.875rem; }
dvfy-radio[size="sm"] .dvfy-radio__input:checked::after { top: 2.5px; left: 2.5px; width: 5px; height: 5px; }
dvfy-radio[size="sm"] .dvfy-radio__label { font-size: var(--dvfy-text-xs); }

/* Size: md — 1rem input (default, no overrides needed) */

/* Size: lg — 1.25rem input */
dvfy-radio[size="lg"] { gap: var(--dvfy-space-2-5); }
dvfy-radio[size="lg"] .dvfy-radio__input { width: 1.25rem; height: 1.25rem; }
dvfy-radio[size="lg"] .dvfy-radio__input:checked::after { top: 4px; left: 4px; width: 8px; height: 8px; }
dvfy-radio[size="lg"] .dvfy-radio__label { font-size: var(--dvfy-text-base); }

/* Size: xl — 1.5rem input */
dvfy-radio[size="xl"] { gap: var(--dvfy-space-3); }
dvfy-radio[size="xl"] .dvfy-radio__input { width: 1.5rem; height: 1.5rem; }
dvfy-radio[size="xl"] .dvfy-radio__input:checked::after { top: 5px; left: 5px; width: 10px; height: 10px; }
dvfy-radio[size="xl"] .dvfy-radio__label { font-size: var(--dvfy-text-base); }

/* Label position: left */
dvfy-radio[label-position="left"] .dvfy-radio__label { order: -1; }

/* Label position: top */
dvfy-radio[label-position="top"] { flex-direction: column; align-items: center; }
dvfy-radio[label-position="top"] .dvfy-radio__label { order: -1; }

/* Label position: bottom */
dvfy-radio[label-position="bottom"] { flex-direction: column; align-items: center; }
`;

/**
 * Radio button with label and automatic group management.
 *
 * @element dvfy-radio
 *
 * @attr {boolean} checked - Selected state
 * @attr {boolean} disabled - Disable interaction
 * @attr {string} name - Form field name (groups radios with same name)
 * @attr {string} value - Form field value
 * @attr {string} label - Label text
 * @attr {string} size - Visual size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "right")
 *
 * @event {CustomEvent} change - Selection changed, detail: { value }
 *
 * @cssprop {color} --dvfy-primary-bg - Selected radio dot and border color
 * @cssprop {color} --dvfy-input-border - Unselected border color
 */
class DvfyRadio extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyRadio.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyRadio.#styled = true;
    }
    this.setAttribute('role', 'radio');
    this.#build();
  }

  disconnectedCallback() {}

  static get observedAttributes() { return ['checked', 'disabled', 'label', 'label-position']; }

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
    if (this.hasAttribute('required')) input.required = true;

    input.addEventListener('change', () => this.#handleChange(input));

    this.appendChild(input);

    const label = this.getAttribute('label');
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-radio__label';
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      this.appendChild(lbl);
    }
    this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');
  }

  /** @param {HTMLInputElement} input */
  #handleChange(input) {
    if (!input.checked) return;
    this.#uncheckSiblings(input.name);
    this.setAttribute('checked', '');
    this.setAttribute('aria-checked', 'true');
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /** Uncheck sibling radios sharing the same name group.
   *  @param {string} name */
  #uncheckSiblings(name) {
    if (!name) return;
    for (const r of document.querySelectorAll(`dvfy-radio[name="${name}"]`)) {
      if (r === this) continue;
      r.removeAttribute('checked');
      r.setAttribute('aria-checked', 'false');
    }
  }

  get checked() { return this.querySelector('input')?.checked ?? false; }
  set checked(v) {
    const i = this.querySelector('input');
    if (i) { i.checked = v; i.dispatchEvent(new Event('change')); }
  }
}

customElements.define('dvfy-radio', DvfyRadio);
