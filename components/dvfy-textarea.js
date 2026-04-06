import { labelPositionCSS } from '../utils/label-position.js';
import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-textarea> — Multiline text input with label, validation state, and auto-resize
 *
 * Attributes:
 *   label, name, value, placeholder, error, state, help, required, disabled,
 *   rows (default: 3), maxlength
 *
 * Features:
 *   Validation state (error | warning | success) with message slots
 *
 * Usage:
 *   <dvfy-textarea label="Bio" name="bio" placeholder="Tell us about yourself" maxlength="500"></dvfy-textarea>
 *   <dvfy-textarea label="Notes" rows="5" error="Required field"></dvfy-textarea>
 *   <dvfy-textarea label="Bio" state="error"><span slot="error-message">This field is required</span></dvfy-textarea>
 */

const STYLES = `
dvfy-textarea {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  width: 100%;
  font-family: var(--dvfy-font-sans);
  container-type: inline-size;
  container-name: dvfy-textarea;
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

/* State: error */
dvfy-textarea[state="error"] .dvfy-textarea__field { border-color: var(--dvfy-input-error); }
dvfy-textarea[state="error"] .dvfy-textarea__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-input-error) 25%, transparent);
}

/* State: warning */
dvfy-textarea[state="warning"] .dvfy-textarea__field { border-color: var(--dvfy-warning-border); }
dvfy-textarea[state="warning"] .dvfy-textarea__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-warning-border) 25%, transparent);
}

/* State: success */
dvfy-textarea[state="success"] .dvfy-textarea__field { border-color: var(--dvfy-success-border); }
dvfy-textarea[state="success"] .dvfy-textarea__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-success-border) 25%, transparent);
}

/* Message text colors */
dvfy-textarea .dvfy-textarea__warning-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-warning-text); }
dvfy-textarea .dvfy-textarea__success-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-success-text); }

/* Hide slot source elements from visual display */
dvfy-textarea [slot] { display: none; }

/* Size: xs */
dvfy-textarea[size="xs"] .dvfy-textarea__field { padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border-radius: var(--dvfy-radius-sm); }
dvfy-textarea[size="xs"] .dvfy-textarea__label { font-size: var(--dvfy-text-xs); }
/* Size: sm */
dvfy-textarea[size="sm"] .dvfy-textarea__field { padding: var(--dvfy-space-1-5) var(--dvfy-space-2-5); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
dvfy-textarea[size="sm"] .dvfy-textarea__label { font-size: var(--dvfy-text-xs); }
/* Size: md (default) */
/* Size: lg */
dvfy-textarea[size="lg"] .dvfy-textarea__field { padding: var(--dvfy-space-2-5) var(--dvfy-space-3-5); font-size: var(--dvfy-text-base); }
/* Size: xl */
dvfy-textarea[size="xl"] .dvfy-textarea__field { padding: var(--dvfy-space-3) var(--dvfy-space-4); font-size: var(--dvfy-text-lg); border-radius: var(--dvfy-radius-xl); }
dvfy-textarea[size="xl"] .dvfy-textarea__label { font-size: var(--dvfy-text-base); }

${labelPositionCSS('dvfy-textarea', { layout: 'field', label: '.dvfy-textarea__label', content: ['.dvfy-textarea__field'], messages: ['.dvfy-textarea__footer', '.dvfy-textarea__help', '.dvfy-textarea__error-msg', '.dvfy-textarea__warning-msg', '.dvfy-textarea__success-msg'] })}
`;

/**
 * Multiline text input with auto-resize, validation state, and character count.
 *
 * @element dvfy-textarea
 *
 * @attr {string} label - Label text
 * @attr {string} name - Form field name
 * @attr {string} value - Initial value
 * @attr {string} placeholder - Placeholder text
 * @attr {string} error - Error message (deprecated: use state="error" + slot; enables error styling)
 * @attr {string} state - Validation state: error | warning | success
 * @attr {string} help - Help text shown below textarea
 * @attr {boolean} required - Mark field as required
 * @attr {boolean} disabled - Disable input
 * @attr {number} rows - Initial row count (default: 3)
 * @attr {number} maxlength - Maximum character count (shows counter)
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "top")
 *
 * @slot error-message - Error message text (displayed when state="error")
 * @slot warning-message - Warning message text (displayed when state="warning")
 * @slot success-message - Success message text (displayed when state="success")
 *
 * @cssprop {color} --dvfy-input-bg - Textarea background
 * @cssprop {color} --dvfy-input-border - Textarea border color
 * @cssprop {color} --dvfy-input-error - Error border and message color
 *
 * @example
 * <dvfy-textarea label="Bio" state="error">
 *   <span slot="error-message">This field is required</span>
 * </dvfy-textarea>
 *
 * @example
 * <dvfy-textarea label="Notes" state="success">
 *   <span slot="success-message">Saved successfully</span>
 * </dvfy-textarea>
 */
class DvfyTextarea extends HTMLElement {
  #id = null;

  connectedCallback() {
    injectStyles('dvfy-textarea', STYLES);
    this.#id = this.getAttribute('name') || `dvfy-ta-${Math.random().toString(36).slice(2, 8)}`;
    this.#build();
  }

  disconnectedCallback() {}

  static get observedAttributes() {
    return ['label', 'name', 'value', 'placeholder', 'error', 'state', 'help', 'required', 'disabled', 'rows', 'maxlength', 'label-position'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;
    const ta = this.querySelector('.dvfy-textarea__field');
    if (!ta) return;

    // maxlength changes footer structure — rebuild with focus preservation
    if (name === 'maxlength') {
      this.#rebuildPreservingFocus();
      return;
    }

    switch (name) {
      case 'label':
      case 'required':
        this.#patchLabel();
        if (name === 'required') ta.required = this.hasAttribute('required');
        break;
      case 'name':
        ta.name = newValue || '';
        break;
      case 'value':
        if (document.activeElement !== ta) {
          ta.value = newValue || '';
          this.#autoResize(ta);
        }
        break;
      case 'placeholder':
        ta.placeholder = newValue || '';
        break;
      case 'disabled':
        ta.disabled = this.hasAttribute('disabled');
        break;
      case 'rows':
        ta.rows = parseInt(newValue || '3', 10);
        this.#autoResize(ta);
        break;
      case 'error':
      case 'state':
      case 'help':
        this.#patchMessages(ta);
        break;
      case 'label-position':
        break; // CSS-only
    }
  }

  #build() {
    // BEFORE: Save slotted children with slot attributes (error-message, warning-message, success-message)
    const slottedChildren = Array.from(this.children).filter(el => el.hasAttribute('slot'));

    this.textContent = '';
    const id = this.#id;
    const maxlength = this.getAttribute('maxlength');

    // Label
    this.#appendLabel();

    // Textarea
    const ta = document.createElement('textarea');
    ta.className = 'dvfy-textarea__field';
    ta.id = id;
    ta.name = this.getAttribute('name') || '';
    ta.value = this.getAttribute('value') || '';
    ta.placeholder = this.getAttribute('placeholder') || '';
    ta.rows = parseInt(this.getAttribute('rows') || '3', 10);
    if (this.hasAttribute('required')) ta.required = true;
    if (this.hasAttribute('disabled')) ta.disabled = true;
    if (maxlength) ta.maxLength = parseInt(maxlength, 10);
    this.#setAriaOnTextarea(ta);
    ta.addEventListener('input', () => this.#autoResize(ta));
    this.appendChild(ta);

    // Footer
    this.#buildFooter(ta, maxlength);

    // AFTER: Re-attach slotted children before #appendMessages so it can read their text
    slottedChildren.forEach(el => this.appendChild(el));
    this.#appendMessages(ta);

    requestAnimationFrame(() => this.#autoResize(ta));
  }

  #appendLabel() {
    const label = this.getAttribute('label');
    if (!label) return;
    const lbl = document.createElement('label');
    lbl.className = 'dvfy-textarea__label';
    lbl.setAttribute('for', this.#id);
    lbl.textContent = label;
    if (this.hasAttribute('required')) {
      const star = document.createElement('span');
      star.className = 'dvfy-textarea__required';
      star.textContent = '*';
      lbl.appendChild(star);
    }
    this.insertBefore(lbl, this.firstChild);
  }

  #patchLabel() {
    const label = this.getAttribute('label');
    let lbl = this.querySelector('.dvfy-textarea__label');
    if (label) {
      if (!lbl) {
        this.#appendLabel();
        return;
      }
      lbl.textContent = label;
      if (this.hasAttribute('required')) {
        const star = document.createElement('span');
        star.className = 'dvfy-textarea__required';
        star.textContent = '*';
        lbl.appendChild(star);
      }
    } else if (lbl) {
      lbl.remove();
    }
  }

  #setAriaOnTextarea(ta) {
    const error = this.getAttribute('error');
    const state = this.getAttribute('state');
    const help = this.getAttribute('help');
    ta.removeAttribute('aria-invalid');
    ta.removeAttribute('aria-describedby');
    if (error || state === 'error') {
      ta.setAttribute('aria-invalid', 'true');
      ta.setAttribute('aria-describedby', `${this.#id}-error`);
    } else if (state === 'warning') {
      ta.setAttribute('aria-describedby', `${this.#id}-warning`);
    } else if (state === 'success') {
      ta.setAttribute('aria-describedby', `${this.#id}-success`);
    } else if (help) {
      ta.setAttribute('aria-describedby', `${this.#id}-help`);
    }
  }

  #buildFooter(ta, maxlength) {
    const error = this.getAttribute('error');
    const help = this.getAttribute('help');
    if (!error && !help && !maxlength) return;

    const footer = document.createElement('div');
    footer.className = 'dvfy-textarea__footer';

    if (error) {
      const err = document.createElement('span');
      err.className = 'dvfy-textarea__error-msg';
      err.id = `${this.#id}-error`;
      err.setAttribute('role', 'alert');
      err.textContent = error;
      footer.appendChild(err);
    } else if (help) {
      const hlp = document.createElement('span');
      hlp.className = 'dvfy-textarea__help';
      hlp.id = `${this.#id}-help`;
      hlp.textContent = help;
      footer.appendChild(hlp);
    }

    if (maxlength) {
      const count = document.createElement('span');
      count.className = 'dvfy-textarea__count';
      const val = ta.value;
      count.textContent = `${val.length}/${maxlength}`;
      count.dataset.over = val.length > parseInt(maxlength, 10) ? 'true' : 'false';
      footer.appendChild(count);
      ta.addEventListener('input', () => {
        const len = ta.value.length;
        count.textContent = `${len}/${maxlength}`;
        count.dataset.over = len > parseInt(maxlength, 10) ? 'true' : 'false';
      });
    }

    this.appendChild(footer);
  }

  #appendMessages(ta) {
    const error = this.getAttribute('error');
    const state = this.getAttribute('state');
    const help = this.getAttribute('help');

    if (error) {
      // Legacy error attribute: render inline error message
      const err = document.createElement('span');
      err.className = 'dvfy-textarea__error-msg';
      err.id = `${this.#id}-error`;
      err.setAttribute('role', 'alert');
      err.textContent = error;
      this.appendChild(err);
    } else if (state === 'error') {
      const slotEl = this.querySelector('[slot="error-message"]');
      const msg = document.createElement('span');
      msg.className = 'dvfy-textarea__error-msg';
      msg.id = `${this.#id}-error`;
      msg.setAttribute('role', 'alert');
      if (slotEl) msg.textContent = slotEl.textContent;
      this.appendChild(msg);
    } else if (state === 'warning') {
      const slotEl = this.querySelector('[slot="warning-message"]');
      const msg = document.createElement('span');
      msg.className = 'dvfy-textarea__warning-msg';
      msg.id = `${this.#id}-warning`;
      msg.role = 'status';
      if (slotEl) msg.textContent = slotEl.textContent;
      this.appendChild(msg);
    } else if (state === 'success') {
      const slotEl = this.querySelector('[slot="success-message"]');
      const msg = document.createElement('span');
      msg.className = 'dvfy-textarea__success-msg';
      msg.id = `${this.#id}-success`;
      msg.role = 'status';
      if (slotEl) msg.textContent = slotEl.textContent;
      this.appendChild(msg);
    } else if (help) {
      const hlp = document.createElement('span');
      hlp.className = 'dvfy-textarea__help';
      hlp.id = `${this.#id}-help`;
      hlp.textContent = help;
      this.appendChild(hlp);
    }
  }

  #patchMessages(ta) {
    this.querySelector('.dvfy-textarea__error-msg')?.remove();
    this.querySelector('.dvfy-textarea__warning-msg')?.remove();
    this.querySelector('.dvfy-textarea__success-msg')?.remove();
    this.querySelector('.dvfy-textarea__help')?.remove();
    this.#setAriaOnTextarea(ta);
    this.#appendMessages(ta);
  }

  #rebuildPreservingFocus() {
    const ta = this.querySelector('.dvfy-textarea__field');
    const hasFocus = ta && document.activeElement === ta;
    const selStart = ta?.selectionStart;
    const selEnd = ta?.selectionEnd;
    const curValue = ta?.value;
    this.#build();
    if (hasFocus) {
      const newTa = this.querySelector('.dvfy-textarea__field');
      if (newTa) {
        newTa.value = curValue;
        newTa.focus();
        try { newTa.setSelectionRange(selStart, selEnd); } catch {}
      }
    }
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
