/**
 * <dvfy-input> — Text input with label, error, and help text
 *
 * Attributes:
 *   label, type, name, value, placeholder, error, help, required, disabled, size
 *
 * Features:
 *   Password visibility toggle when type="password"
 *
 * Usage:
 *   <dvfy-input label="Email" type="email" name="email" required></dvfy-input>
 *   <dvfy-input label="Password" type="password" error="Too short"></dvfy-input>
 */

const STYLES = `
dvfy-input {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
}
dvfy-input .dvfy-input__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}
dvfy-input .dvfy-input__required {
  color: var(--dvfy-danger-text);
  margin-left: var(--dvfy-space-0-5);
}
dvfy-input .dvfy-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
dvfy-input .dvfy-input__field {
  width: 100%;
  font-family: inherit;
  color: var(--dvfy-text-primary);
  background: var(--dvfy-input-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-input-border);
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
  outline: none;
  box-sizing: border-box;
}
dvfy-input .dvfy-input__field::placeholder { color: var(--dvfy-input-placeholder); }
dvfy-input .dvfy-input__field:hover { border-color: var(--dvfy-input-border-hover); }
dvfy-input .dvfy-input__field:focus {
  border-color: var(--dvfy-input-border-focus);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}
dvfy-input[size="sm"] .dvfy-input__field { padding: var(--dvfy-space-1-5) var(--dvfy-space-2-5); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
dvfy-input:not([size]) .dvfy-input__field, dvfy-input[size="md"] .dvfy-input__field { padding: var(--dvfy-space-2) var(--dvfy-space-3); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-lg); }
dvfy-input[size="lg"] .dvfy-input__field { padding: var(--dvfy-space-2-5) var(--dvfy-space-3-5); font-size: var(--dvfy-text-base); border-radius: var(--dvfy-radius-lg); }
dvfy-input .dvfy-input__field--has-toggle { padding-right: 3.5rem; }
dvfy-input[error] .dvfy-input__field { border-color: var(--dvfy-input-error); }
dvfy-input[error] .dvfy-input__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-input-error) 25%, transparent);
}
dvfy-input[disabled] .dvfy-input__field { background: var(--dvfy-disabled-bg); color: var(--dvfy-disabled-text); cursor: not-allowed; }
dvfy-input[disabled] .dvfy-input__label { color: var(--dvfy-disabled-text); }
dvfy-input .dvfy-input__help { font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); }
dvfy-input .dvfy-input__error-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-input-error); }

dvfy-input .dvfy-input__toggle,
dvfy-input .dvfy-input__clear {
  position: absolute;
  right: var(--dvfy-space-2);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: var(--dvfy-space-1);
  font-size: var(--dvfy-text-lg);
  line-height: 1;
  color: var(--dvfy-text-muted);
  cursor: pointer;
  user-select: none;
  border-radius: var(--dvfy-radius-sm);
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-input .dvfy-input__toggle:hover,
dvfy-input .dvfy-input__clear:hover {
  color: var(--dvfy-text-primary);
}
dvfy-input .dvfy-input__toggle:focus-visible,
dvfy-input .dvfy-input__clear:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-input .dvfy-input__clear { display: none; }
dvfy-input .dvfy-input__clear--visible { display: block; }
dvfy-input[clearable] .dvfy-input__field { padding-right: 2.5rem; }
`;

/**
 * Text input with label, error/help text, and password visibility toggle.
 *
 * @element dvfy-input
 *
 * @attr {string} label - Label text
 * @attr {string} type - Input type: text | email | password | etc. (default: "text")
 * @attr {string} name - Form field name
 * @attr {string} value - Input value
 * @attr {string} placeholder - Placeholder text
 * @attr {string} error - Error message (enables error styling)
 * @attr {string} help - Help text shown below input
 * @attr {boolean} required - Mark field as required
 * @attr {boolean} disabled - Disable input
 * @attr {string} size - Size: sm | md | lg (default: "md")
 * @attr {boolean} no-preview - Disable password visibility toggle for password inputs
 * @attr {boolean} clearable - Show clear icon when input has a value
 *
 * @cssprop {color} --dvfy-input-bg - Input background
 * @cssprop {color} --dvfy-input-border - Input border color
 * @cssprop {color} --dvfy-input-error - Error border and message color
 */
class DvfyInput extends HTMLElement {
  static #styled = false;
  /** @type {boolean} tracks password visibility state */
  #passwordVisible = false;

  connectedCallback() {
    if (!DvfyInput.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyInput.#styled = true;
    }
    this.#render();
  }

  static get observedAttributes() {
    return ['label', 'type', 'name', 'value', 'placeholder', 'error', 'help', 'required', 'disabled', 'no-preview', 'clearable'];
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    const label = this.getAttribute('label');
    const type = this.getAttribute('type') || 'text';
    const name = this.getAttribute('name') || '';
    const value = this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const error = this.getAttribute('error');
    const help = this.getAttribute('help');
    const required = this.hasAttribute('required');
    const disabled = this.hasAttribute('disabled');
    const id = name || `dvfy-input-${Math.random().toString(36).slice(2, 8)}`;
    const isPassword = type === 'password';

    // Clear existing content
    this.textContent = '';

    // Label
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-input__label';
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      if (required) {
        const star = document.createElement('span');
        star.className = 'dvfy-input__required';
        star.textContent = '*';
        lbl.appendChild(star);
      }
      this.appendChild(lbl);
    }

    // Wrapper for input + toggle
    const wrapper = document.createElement('div');
    wrapper.className = 'dvfy-input__wrapper';

    // Input
    const input = document.createElement('input');
    input.className = 'dvfy-input__field';
    const hasPreview = isPassword && !this.hasAttribute('no-preview');
    if (hasPreview) {
      input.classList.add('dvfy-input__field--has-toggle');
    }
    input.id = id;
    input.type = isPassword && this.#passwordVisible ? 'text' : type;
    input.name = name;
    input.value = value;
    input.placeholder = placeholder;
    if (required) input.required = true;
    if (disabled) input.disabled = true;
    wrapper.appendChild(input);

    // Password toggle with eye SVG icon (only when preview attribute is set)
    if (hasPreview) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'dvfy-input__toggle';
      toggle.setAttribute('aria-label', this.#passwordVisible ? 'Hide password' : 'Show password');
      toggle.setAttribute('tabindex', '-1');

      const setIcon = (visible) => {
        toggle.textContent = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (visible) {
          // Eye open
          path1.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
          svg.appendChild(path1);
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', '12');
          circle.setAttribute('cy', '12');
          circle.setAttribute('r', '3');
          svg.appendChild(circle);
        } else {
          // Eye closed (with slash)
          path1.setAttribute('d', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94');
          svg.appendChild(path1);
          const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path2.setAttribute('d', 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19');
          svg.appendChild(path2);
          const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path3.setAttribute('d', 'M14.12 14.12a3 3 0 1 1-4.24-4.24');
          svg.appendChild(path3);
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '1'); line.setAttribute('y1', '1');
          line.setAttribute('x2', '23'); line.setAttribute('y2', '23');
          svg.appendChild(line);
        }
        toggle.appendChild(svg);
      };

      setIcon(this.#passwordVisible);
      toggle.addEventListener('click', () => {
        this.#passwordVisible = !this.#passwordVisible;
        input.type = this.#passwordVisible ? 'text' : 'password';
        setIcon(this.#passwordVisible);
        toggle.setAttribute('aria-label', this.#passwordVisible ? 'Hide password' : 'Show password');
        input.focus();
      });
      wrapper.appendChild(toggle);
    }

    // Clear button (when clearable attribute is set)
    if (this.hasAttribute('clearable') && !hasPreview) {
      input.classList.add('dvfy-input__field--has-toggle');
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'dvfy-input__clear';
      clearBtn.setAttribute('aria-label', 'Clear input');
      clearBtn.setAttribute('tabindex', '-1');

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', '18'); line1.setAttribute('y1', '6');
      line1.setAttribute('x2', '6');  line1.setAttribute('y2', '18');
      svg.appendChild(line1);
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', '6');  line2.setAttribute('y1', '6');
      line2.setAttribute('x2', '18'); line2.setAttribute('y2', '18');
      svg.appendChild(line2);
      clearBtn.appendChild(svg);

      // Show/hide based on input value
      const updateVisibility = () => {
        clearBtn.classList.toggle('dvfy-input__clear--visible', input.value.length > 0);
      };
      input.addEventListener('input', updateVisibility);
      updateVisibility();

      clearBtn.addEventListener('click', () => {
        input.value = '';
        updateVisibility();
        input.focus();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      wrapper.appendChild(clearBtn);
    }

    this.appendChild(wrapper);

    // Error or help text
    if (error) {
      const err = document.createElement('span');
      err.className = 'dvfy-input__error-msg';
      err.textContent = error;
      this.appendChild(err);
    } else if (help) {
      const hlp = document.createElement('span');
      hlp.className = 'dvfy-input__help';
      hlp.textContent = help;
      this.appendChild(hlp);
    }
  }

  get value() { return this.querySelector('input')?.value ?? ''; }
  set value(v) { const i = this.querySelector('input'); if (i) i.value = v; }
}

customElements.define('dvfy-input', DvfyInput);
