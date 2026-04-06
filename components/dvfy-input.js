import { labelPositionCSS } from '../utils/label-position.js';
import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-input> — Text input with label, validation state, and help text
 *
 * Attributes:
 *   label, type, name, value, placeholder, error, state, help, required, disabled, size
 *
 * Features:
 *   Password visibility toggle when type="password"
 *   Validation state (error | warning | success) with message slots
 *
 * Usage:
 *   <dvfy-input label="Email" type="email" name="email" required></dvfy-input>
 *   <dvfy-input label="Email" state="error"><span slot="error-message">Invalid email</span></dvfy-input>
 *   <dvfy-input label="Password" type="password" error="Too short"></dvfy-input>
 */

const STYLES = `
dvfy-input {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
  container-type: inline-size;
  container-name: dvfy-input;
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
/* Size: xs */
dvfy-input[size="xs"] .dvfy-input__field { padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border-radius: var(--dvfy-radius-sm); }
dvfy-input[size="xs"] .dvfy-input__label { font-size: var(--dvfy-text-xs); }
/* Size: sm */
dvfy-input[size="sm"] .dvfy-input__field { padding: var(--dvfy-space-1-5) var(--dvfy-space-2-5); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
dvfy-input[size="sm"] .dvfy-input__label { font-size: var(--dvfy-text-xs); }
/* Size: md (default) */
dvfy-input:not([size]) .dvfy-input__field, dvfy-input[size="md"] .dvfy-input__field { padding: var(--dvfy-space-2) var(--dvfy-space-3); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-lg); }
/* Size: lg */
dvfy-input[size="lg"] .dvfy-input__field { padding: var(--dvfy-space-2-5) var(--dvfy-space-3-5); font-size: var(--dvfy-text-base); border-radius: var(--dvfy-radius-lg); }
/* Size: xl */
dvfy-input[size="xl"] .dvfy-input__field { padding: var(--dvfy-space-3) var(--dvfy-space-4); font-size: var(--dvfy-text-lg); border-radius: var(--dvfy-radius-xl); }
dvfy-input[size="xl"] .dvfy-input__label { font-size: var(--dvfy-text-base); }
dvfy-input .dvfy-input__field--has-toggle { padding-right: 3.5rem; }
dvfy-input[error] .dvfy-input__field,
dvfy-input[state="error"] .dvfy-input__field { border-color: var(--dvfy-input-error); }
dvfy-input[error] .dvfy-input__field:focus,
dvfy-input[state="error"] .dvfy-input__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-input-error) 25%, transparent);
}
dvfy-input[state="warning"] .dvfy-input__field { border-color: var(--dvfy-warning-border); }
dvfy-input[state="warning"] .dvfy-input__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-warning-border) 25%, transparent);
}
dvfy-input[state="success"] .dvfy-input__field { border-color: var(--dvfy-success-border); }
dvfy-input[state="success"] .dvfy-input__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-success-border) 25%, transparent);
}
dvfy-input[disabled] .dvfy-input__field { background: var(--dvfy-disabled-bg); color: var(--dvfy-disabled-text); cursor: not-allowed; }
dvfy-input[disabled] .dvfy-input__label { color: var(--dvfy-disabled-text); }
dvfy-input .dvfy-input__help { font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); }
dvfy-input .dvfy-input__error-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-input-error); }
dvfy-input .dvfy-input__warning-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-warning-text); }
dvfy-input .dvfy-input__success-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-success-text); }
dvfy-input [slot] { display: none; }

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

${labelPositionCSS('dvfy-input', { layout: 'field', label: '.dvfy-input__label', content: ['.dvfy-input__wrapper'], messages: ['.dvfy-input__help', '.dvfy-input__error-msg', '.dvfy-input__warning-msg', '.dvfy-input__success-msg'] })}
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
 * @attr {string} error - Error message (deprecated: use state="error" + slot; enables error styling)
 * @attr {string} state - Validation state: error | warning | success
 * @attr {string} help - Help text shown below input
 * @attr {boolean} required - Mark field as required
 * @attr {boolean} disabled - Disable input
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {boolean} no-preview - Disable password visibility toggle for password inputs
 * @attr {boolean} clearable - Show clear icon when input has a value
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "top")
 * @attr {string} pattern - Regex pattern for native HTML form validation
 * @attr {string} title - Tooltip and validation message for pattern mismatch
 *
 * @slot error-message - Child element shown when state="error"
 * @slot warning-message - Child element shown when state="warning"
 * @slot success-message - Child element shown when state="success"
 *
 * @event {CustomEvent} input - Fires on input value change (bubbles from inner input)
 *
 * @cssprop {color} --dvfy-input-bg - Input background
 * @cssprop {color} --dvfy-input-border - Input border color
 * @cssprop {color} --dvfy-input-error - Error border and message color
 *
 * @example
 * <dvfy-input label="Email" type="email" name="email" state="error">
 *   <span slot="error-message">Invalid email format</span>
 * </dvfy-input>
 *
 * @example
 * <dvfy-input label="Username" name="username" state="success">
 *   <span slot="success-message">Username is available</span>
 * </dvfy-input>
 */
class DvfyInput extends HTMLElement {
  /** @type {boolean} tracks password visibility state */
  #passwordVisible = false;
  #id = null;

  connectedCallback() {
    injectStyles('dvfy-input', STYLES);
    this.#id = this.getAttribute('name') || `dvfy-input-${Math.random().toString(36).slice(2, 8)}`;
    this.#build();
  }

  disconnectedCallback() {}

  static get observedAttributes() {
    return ['label', 'type', 'name', 'value', 'placeholder', 'error', 'state', 'help', 'required', 'disabled', 'no-preview', 'clearable', 'label-position', 'pattern', 'title'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;
    const input = this.querySelector('.dvfy-input__field');
    if (!input) return;

    // Structural changes need full rebuild with focus preservation
    if (name === 'type' || name === 'no-preview' || name === 'clearable') {
      this.#rebuildPreservingFocus();
      return;
    }

    switch (name) {
      case 'label':
      case 'required':
        this.#patchLabel();
        if (name === 'required') input.required = this.hasAttribute('required');
        break;
      case 'name':
        input.name = newValue || '';
        break;
      case 'value':
        if (document.activeElement !== input) input.value = newValue || '';
        break;
      case 'placeholder':
        input.placeholder = newValue || '';
        break;
      case 'disabled':
        input.disabled = this.hasAttribute('disabled');
        break;
      case 'error':
      case 'state':
      case 'help':
        this.#patchMessages(input);
        break;
      case 'pattern':
        if (newValue) input.pattern = newValue;
        else input.removeAttribute('pattern');
        break;
      case 'title':
        if (newValue) input.title = newValue;
        else input.removeAttribute('title');
        break;
      case 'label-position':
        break; // CSS-only
    }
  }

  #build() {
    // Preserve Light DOM children with slot attributes (e.g. error-message, warning-message, success-message)
    // These are hidden via CSS ([slot] { display: none }) and used as data sources for rendered messages.
    const slottedChildren = Array.from(this.children).filter(el => el.hasAttribute('slot'));
    this.textContent = '';
    const id = this.#id;
    const type = this.getAttribute('type') || 'text';
    const isPassword = type === 'password';
    const hasPreview = isPassword && !this.hasAttribute('no-preview');

    // Label
    this.#appendLabel();

    // Wrapper for input + toggle
    const wrapper = document.createElement('div');
    wrapper.className = 'dvfy-input__wrapper';

    // Input
    const input = document.createElement('input');
    input.className = 'dvfy-input__field';
    if (hasPreview || this.hasAttribute('clearable')) {
      input.classList.add('dvfy-input__field--has-toggle');
    }
    input.id = id;
    input.type = isPassword && this.#passwordVisible ? 'text' : type;
    input.name = this.getAttribute('name') || '';
    input.value = this.getAttribute('value') || '';
    input.placeholder = this.getAttribute('placeholder') || '';
    if (this.hasAttribute('required')) input.required = true;
    if (this.hasAttribute('disabled')) input.disabled = true;
    if (this.getAttribute('pattern')) input.pattern = this.getAttribute('pattern');
    if (this.getAttribute('title')) input.title = this.getAttribute('title');
    this.#setAriaOnInput(input);
    wrapper.appendChild(input);

    // Password toggle
    if (hasPreview) this.#appendPasswordToggle(wrapper, input);

    // Clear button
    if (this.hasAttribute('clearable') && !hasPreview) this.#appendClearButton(wrapper, input);

    this.appendChild(wrapper);

    // Re-attach slotted children before #appendMessages so it can read their text.
    // They are hidden via CSS ([slot] { display: none }) and serve as data sources.
    slottedChildren.forEach(el => this.appendChild(el));

    // Error or help text
    this.#appendMessages();
  }

  #appendLabel() {
    const label = this.getAttribute('label');
    if (!label) return;
    const lbl = document.createElement('label');
    lbl.className = 'dvfy-input__label';
    lbl.setAttribute('for', this.#id);
    lbl.textContent = label;
    if (this.hasAttribute('required')) {
      const star = document.createElement('span');
      star.className = 'dvfy-input__required';
      star.textContent = '*';
      lbl.appendChild(star);
    }
    this.insertBefore(lbl, this.firstChild);
  }

  #patchLabel() {
    const label = this.getAttribute('label');
    let lbl = this.querySelector('.dvfy-input__label');
    if (label) {
      if (!lbl) {
        this.#appendLabel();
        return;
      }
      lbl.textContent = label;
      if (this.hasAttribute('required')) {
        const star = document.createElement('span');
        star.className = 'dvfy-input__required';
        star.textContent = '*';
        lbl.appendChild(star);
      }
    } else if (lbl) {
      lbl.remove();
    }
  }

  #setAriaOnInput(input) {
    const error = this.getAttribute('error');
    const state = this.getAttribute('state');
    const help = this.getAttribute('help');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    if (error || state === 'error') {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${this.#id}-error`);
    } else if (state === 'warning') {
      input.setAttribute('aria-describedby', `${this.#id}-warning`);
    } else if (state === 'success') {
      input.setAttribute('aria-describedby', `${this.#id}-success`);
    } else if (help) {
      input.setAttribute('aria-describedby', `${this.#id}-help`);
    }
  }

  #appendMessages() {
    const error = this.getAttribute('error');
    const state = this.getAttribute('state');
    const help = this.getAttribute('help');

    if (error) {
      // Legacy error attribute: render inline error message
      const err = document.createElement('span');
      err.className = 'dvfy-input__error-msg';
      err.id = `${this.#id}-error`;
      err.setAttribute('role', 'alert');
      err.textContent = error;
      this.appendChild(err);
    } else if (state === 'error') {
      const slotEl = this.querySelector('[slot="error-message"]');
      const msg = document.createElement('span');
      msg.className = 'dvfy-input__error-msg';
      msg.id = `${this.#id}-error`;
      msg.setAttribute('role', 'alert');
      if (slotEl) msg.textContent = slotEl.textContent;
      this.appendChild(msg);
    } else if (state === 'warning') {
      const slotEl = this.querySelector('[slot="warning-message"]');
      const msg = document.createElement('span');
      msg.className = 'dvfy-input__warning-msg';
      msg.id = `${this.#id}-warning`;
      msg.role = 'status';
      if (slotEl) msg.textContent = slotEl.textContent;
      this.appendChild(msg);
    } else if (state === 'success') {
      const slotEl = this.querySelector('[slot="success-message"]');
      const msg = document.createElement('span');
      msg.className = 'dvfy-input__success-msg';
      msg.id = `${this.#id}-success`;
      msg.role = 'status';
      if (slotEl) msg.textContent = slotEl.textContent;
      this.appendChild(msg);
    } else if (help) {
      const hlp = document.createElement('span');
      hlp.className = 'dvfy-input__help';
      hlp.id = `${this.#id}-help`;
      hlp.textContent = help;
      this.appendChild(hlp);
    }
  }

  #patchMessages(input) {
    this.querySelector('.dvfy-input__error-msg')?.remove();
    this.querySelector('.dvfy-input__warning-msg')?.remove();
    this.querySelector('.dvfy-input__success-msg')?.remove();
    this.querySelector('.dvfy-input__help')?.remove();
    this.#setAriaOnInput(input);
    this.#appendMessages();
  }

  #appendPasswordToggle(wrapper, input) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'dvfy-input__toggle';
    toggle.setAttribute('aria-label', this.#passwordVisible ? 'Hide password' : 'Show password');
    toggle.setAttribute('tabindex', '0');

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
        path1.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
        svg.appendChild(path1);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '3');
        svg.appendChild(circle);
      } else {
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

  #appendClearButton(wrapper, input) {
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

  #rebuildPreservingFocus() {
    const input = this.querySelector('.dvfy-input__field');
    const hasFocus = input && document.activeElement === input;
    const selStart = input?.selectionStart;
    const selEnd = input?.selectionEnd;
    const curValue = input?.value;
    this.#build();
    if (hasFocus) {
      const newInput = this.querySelector('.dvfy-input__field');
      if (newInput) {
        newInput.value = curValue;
        newInput.focus();
        try { newInput.setSelectionRange(selStart, selEnd); } catch {}
      }
    }
  }

  get value() { return this.querySelector('input')?.value ?? ''; }
  set value(v) { const i = this.querySelector('input'); if (i) i.value = v; }
}

customElements.define('dvfy-input', DvfyInput);
