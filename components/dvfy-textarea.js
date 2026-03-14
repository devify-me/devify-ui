/**
 * <dvfy-textarea> — Multiline text input with label and auto-resize
 *
 * Attributes:
 *   label, name, value, placeholder, error, help, required, disabled,
 *   rows (default: 3), maxlength
 *
 * Usage:
 *   <dvfy-textarea label="Bio" name="bio" placeholder="Tell us about yourself" maxlength="500"></dvfy-textarea>
 *   <dvfy-textarea label="Notes" rows="5" error="Required field"></dvfy-textarea>
 */

const STYLES = `
dvfy-textarea {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
}
dvfy-textarea .dvfy-textarea__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}
dvfy-textarea .dvfy-textarea__required {
  color: var(--dvfy-danger-text);
  margin-left: var(--dvfy-space-0-5);
}
dvfy-textarea .dvfy-textarea__field {
  width: 100%;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-input-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-input-border);
  border-radius: var(--dvfy-radius-lg);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  resize: none;
  overflow: hidden;
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-textarea .dvfy-textarea__field::placeholder { color: var(--dvfy-input-placeholder); }
dvfy-textarea .dvfy-textarea__field:hover { border-color: var(--dvfy-input-border-hover); }
dvfy-textarea .dvfy-textarea__field:focus {
  border-color: var(--dvfy-input-border-focus);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}
dvfy-textarea[error] .dvfy-textarea__field { border-color: var(--dvfy-input-error); }
dvfy-textarea[error] .dvfy-textarea__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-input-error) 25%, transparent);
}
dvfy-textarea[disabled] .dvfy-textarea__field { background: var(--dvfy-disabled-bg); color: var(--dvfy-disabled-text); cursor: not-allowed; }
dvfy-textarea[disabled] .dvfy-textarea__label { color: var(--dvfy-disabled-text); }

dvfy-textarea .dvfy-textarea__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
dvfy-textarea .dvfy-textarea__help { font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); }
dvfy-textarea .dvfy-textarea__error-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-input-error); }
dvfy-textarea .dvfy-textarea__count {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  margin-left: auto;
}
dvfy-textarea .dvfy-textarea__count[data-over="true"] { color: var(--dvfy-danger-text); }
`;

class DvfyTextarea extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyTextarea.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTextarea.#styled = true;
    }
    this.#render();
  }

  static get observedAttributes() {
    return ['label', 'name', 'value', 'placeholder', 'error', 'help', 'required', 'disabled', 'rows', 'maxlength'];
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    const label = this.getAttribute('label');
    const name = this.getAttribute('name') || '';
    const value = this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const error = this.getAttribute('error');
    const help = this.getAttribute('help');
    const required = this.hasAttribute('required');
    const disabled = this.hasAttribute('disabled');
    const rows = parseInt(this.getAttribute('rows') || '3', 10);
    const maxlength = this.getAttribute('maxlength');
    const id = name || `dvfy-ta-${Math.random().toString(36).slice(2, 8)}`;

    this.textContent = '';

    // Label
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-textarea__label';
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      if (required) {
        const star = document.createElement('span');
        star.className = 'dvfy-textarea__required';
        star.textContent = '*';
        lbl.appendChild(star);
      }
      this.appendChild(lbl);
    }

    // Textarea
    const ta = document.createElement('textarea');
    ta.className = 'dvfy-textarea__field';
    ta.id = id;
    ta.name = name;
    ta.value = value;
    ta.placeholder = placeholder;
    ta.rows = rows;
    if (required) ta.required = true;
    if (disabled) ta.disabled = true;
    if (maxlength) ta.maxLength = parseInt(maxlength, 10);

    ta.addEventListener('input', () => this.#autoResize(ta));

    this.appendChild(ta);

    // Footer (error/help + count)
    const footer = document.createElement('div');
    footer.className = 'dvfy-textarea__footer';

    if (error) {
      const err = document.createElement('span');
      err.className = 'dvfy-textarea__error-msg';
      err.textContent = error;
      footer.appendChild(err);
    } else if (help) {
      const hlp = document.createElement('span');
      hlp.className = 'dvfy-textarea__help';
      hlp.textContent = help;
      footer.appendChild(hlp);
    }

    if (maxlength) {
      const count = document.createElement('span');
      count.className = 'dvfy-textarea__count';
      count.textContent = `${value.length}/${maxlength}`;
      footer.appendChild(count);

      ta.addEventListener('input', () => {
        const len = ta.value.length;
        count.textContent = `${len}/${maxlength}`;
        count.dataset.over = len > parseInt(maxlength, 10) ? 'true' : 'false';
      });
    }

    if (footer.children.length > 0) this.appendChild(footer);

    // Initial auto-resize
    requestAnimationFrame(() => this.#autoResize(ta));
  }

  #autoResize(ta) {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  get value() { return this.querySelector('textarea')?.value ?? ''; }
  set value(v) {
    const ta = this.querySelector('textarea');
    if (ta) { ta.value = v; this.#autoResize(ta); }
  }
}

customElements.define('dvfy-textarea', DvfyTextarea);
