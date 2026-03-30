/**
 * <dvfy-htmx-form> — Enhanced form with HTMX submission, validation, loading state, success/error feedback.
 *
 * Attributes:
 *   action:           URL to submit to
 *   method:           post | put | patch | delete (default: "post")
 *   target:           CSS selector for response target (default: self)
 *   swap:             HTMX swap strategy (default: "innerHTML")
 *   success-message:  toast message on success
 *   error-message:    toast message on error (default: "Something went wrong")
 *   confirm:          confirmation text (shows modal before submitting)
 *   reset-on-success: boolean — resets form after successful submission
 *
 * Events:
 *   form-success — dispatched after a successful submission
 *   form-error   — dispatched after a failed submission, detail: { errors }
 *
 * Children: form content (inputs, buttons, etc.)
 *
 * Usage with Go templates:
 *   <dvfy-htmx-form
 *     action="/tasks/new"
 *     method="post"
 *     target="#task-list"
 *     swap="beforeend"
 *     success-message="Task created!"
 *     reset-on-success
 *   >
 *     <dvfy-input label="Title" name="title" required></dvfy-input>
 *     <dvfy-select label="Type" name="type">
 *       {{range .TaskTypes}}
 *         <option value="{{.}}">{{.}}</option>
 *       {{end}}
 *     </dvfy-select>
 *     <dvfy-button type="submit">Create Task</dvfy-button>
 *   </dvfy-htmx-form>
 *
 *   <!-- With confirmation dialog -->
 *   <dvfy-htmx-form
 *     action="/tasks/{{.Task.ID}}/complete"
 *     method="post"
 *     confirm="Mark this task as complete?"
 *     success-message="Task completed!"
 *   >
 *     <dvfy-textarea label="Summary" name="summary" required></dvfy-textarea>
 *     <dvfy-button type="submit" variant="primary">Complete</dvfy-button>
 *   </dvfy-htmx-form>
 *
 *   <!-- With CSRF token (auto-detected from <meta name="csrf-token">) -->
 *   <meta name="csrf-token" content="{{.CSRFToken}}">
 */

import { injectStyles } from '../utils/styles.js';


const STYLES = `
dvfy-htmx-form {
  display: block;
  font-family: var(--dvfy-font-sans);
}
dvfy-htmx-form .dvfy-htmx-form__form {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-4);
  position: relative;
}
dvfy-htmx-form .dvfy-htmx-form__overlay {
  display: none;
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--dvfy-surface-page) 60%, transparent);
  border-radius: var(--dvfy-radius-lg);
  z-index: 1;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}
dvfy-htmx-form.dvfy-htmx-form--loading .dvfy-htmx-form__overlay {
  display: flex;
}
dvfy-htmx-form .dvfy-htmx-form__submit-wrap {
  position: relative;
  display: inline-flex;
}
dvfy-htmx-form .dvfy-htmx-form__spinner {
  display: none;
  width: 1rem;
  height: 1rem;
  border-radius: var(--dvfy-radius-round);
  border: 2px solid var(--dvfy-border-default);
  border-top-color: var(--dvfy-primary-bg);
  animation: dvfy-htmx-form-spin 0.7s linear infinite;
  margin-right: var(--dvfy-space-2);
}
dvfy-htmx-form.dvfy-htmx-form--loading .dvfy-htmx-form__spinner {
  display: inline-block;
}
dvfy-htmx-form .dvfy-htmx-form__field-error {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-danger-text);
  margin-top: var(--dvfy-space-1);
}
@keyframes dvfy-htmx-form-spin { to { transform: rotate(360deg); } }
`;

/**
 * Enhanced form with HTMX submission, validation, loading overlay, and toast feedback.
 *
 * @element dvfy-htmx-form
 *
 * @attr {string} action - URL to submit to
 * @attr {string} method - HTTP method: post | put | patch | delete (default: "post")
 * @attr {string} target - CSS selector for response target (default: self)
 * @attr {string} swap - HTMX swap strategy (default: "innerHTML")
 * @attr {string} success-message - Toast message on successful submission
 * @attr {string} error-message - Toast message on error (default: "Something went wrong")
 * @attr {string} confirm - Confirmation text (shows modal before submitting)
 * @attr {boolean} reset-on-success - Reset form after successful submission
 *
 * @fires form-success - Successful submission completed
 * @fires form-error - Submission failed, detail: { errors }
 *
 * @slot - Form content (inputs, buttons, etc.)
 *
 * @cssprop {color} --dvfy-primary-bg - Submit button spinner accent
 * @cssprop {color} --dvfy-danger-text - Field error text color
 */
class DvfyHtmxForm extends HTMLElement {
  #form = null;
  #overlay = null;
  #submitBtn = null;
  #spinner = null;
  #confirmModal = null;

  connectedCallback() {
    injectStyles('dvfy-htmx-form', STYLES);
    this.setAttribute('role', 'form');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Form');
    }
    this.#build();
  }

  disconnectedCallback() {
    if (this.#confirmModal && this.#confirmModal.parentNode) {
      this.#confirmModal.remove();
    }
  }

  #build() {
    const children = Array.from(this.childNodes);

    // Create form element
    this.#form = document.createElement('form');
    this.#form.className = 'dvfy-htmx-form__form';

    const action = this.getAttribute('action');
    const method = (this.getAttribute('method') || 'post').toLowerCase();
    const target = this.getAttribute('target');
    const swap = this.getAttribute('swap') || 'innerHTML';

    // Set hx-* attributes
    if (action) {
      this.#form.setAttribute('hx-' + method, action);
    }
    if (target) {
      this.#form.setAttribute('hx-target', target);
    } else {
      this.#form.setAttribute('hx-target', 'this');
    }
    this.#form.setAttribute('hx-swap', swap);

    // Add CSRF token if available
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = '_csrf';
      hidden.value = csrfMeta.getAttribute('content') || '';
      this.#form.appendChild(hidden);
    }

    // Move children into form
    for (const child of children) {
      this.#form.appendChild(child);
    }

    // Create loading overlay
    this.#overlay = document.createElement('div');
    this.#overlay.className = 'dvfy-htmx-form__overlay';
    this.#form.appendChild(this.#overlay);

    // Find and enhance submit button
    this.#enhanceSubmitButton();

    // Intercept submission if confirm is set
    if (this.hasAttribute('confirm')) {
      this.#form.addEventListener('htmx:confirm', (e) => {
        e.preventDefault();
        this.#showConfirmModal(() => {
          e.detail.issueRequest(true);
        });
      });
    }

    // HTMX event listeners
    this.#form.addEventListener('htmx:beforeRequest', () => this.#setLoading(true));
    this.#form.addEventListener('htmx:afterRequest', e => this.#handleResponse(e));
    this.#form.addEventListener('htmx:responseError', e => this.#handleError(e));

    this.appendChild(this.#form);

    // Process HTMX on the new form if htmx is available
    if (typeof htmx !== 'undefined') {
      htmx.process(this.#form);
    }
  }

  #enhanceSubmitButton() {
    const btn = this.#form.querySelector('[type="submit"]');
    if (!btn) return;
    this.#submitBtn = btn;

    // Wrap the submit button to add spinner
    const wrap = document.createElement('span');
    wrap.className = 'dvfy-htmx-form__submit-wrap';
    wrap.style.display = 'inline-flex';
    wrap.style.alignItems = 'center';

    this.#spinner = document.createElement('span');
    this.#spinner.className = 'dvfy-htmx-form__spinner';

    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(this.#spinner);
    wrap.appendChild(btn);
  }

  #setLoading(loading) {
    if (loading) {
      this.classList.add('dvfy-htmx-form--loading');
      if (this.#submitBtn) this.#submitBtn.disabled = true;
    } else {
      this.classList.remove('dvfy-htmx-form--loading');
      if (this.#submitBtn) this.#submitBtn.disabled = false;
    }
  }

  #handleResponse(e) {
    this.#setLoading(false);

    const xhr = e.detail.xhr;
    if (!xhr) return;

    const isSuccess = xhr.status >= 200 && xhr.status < 300;
    if (isSuccess) {
      this.#handleSuccess();
    } else {
      this.#handleError(e);
    }
  }

  #handleSuccess() {
    const successMsg = this.getAttribute('success-message');
    if (successMsg) {
      this.#showToast(successMsg, 'success');
    }

    if (this.hasAttribute('reset-on-success') && this.#form) {
      this.#form.reset();
    }

    // Clear any field errors
    this.#clearFieldErrors();

    this.dispatchEvent(new CustomEvent('form-success', { bubbles: true }));
  }

  #handleError(e) {
    this.#setLoading(false);

    const errorMsg = this.getAttribute('error-message') || 'Something went wrong';
    let errors = null;

    // Try to parse JSON validation errors from response
    const xhr = e.detail && e.detail.xhr;
    if (xhr && xhr.responseText) {
      try {
        const body = JSON.parse(xhr.responseText);
        if (body.errors && typeof body.errors === 'object') {
          errors = body.errors;
          this.#showFieldErrors(errors);
        }
      } catch (_) {
        // Not JSON, ignore
      }
    }

    this.#showToast(errorMsg, 'danger');
    this.dispatchEvent(new CustomEvent('form-error', { bubbles: true, detail: { errors } }));
  }

  #showFieldErrors(errors) {
    this.#clearFieldErrors();

    for (const [field, message] of Object.entries(errors)) {
      const input = this.#form.querySelector('[name="' + field + '"]');
      if (!input) continue;

      // Find the parent component or the input itself
      const target = input.closest('dvfy-input, dvfy-select, dvfy-textarea') || input;

      const errorEl = document.createElement('div');
      errorEl.className = 'dvfy-htmx-form__field-error';
      errorEl.textContent = String(message);
      errorEl.setAttribute('data-field-error', field);

      target.after(errorEl);

      // Set error attribute on dvfy-input/dvfy-select/dvfy-textarea
      if (target.setAttribute && target.tagName && target.tagName.startsWith('DVFY-')) {
        target.setAttribute('error', String(message));
      }
    }
  }

  #clearFieldErrors() {
    if (!this.#form) return;
    const errors = this.querySelectorAll('.dvfy-htmx-form__field-error');
    for (const el of errors) el.remove();

    // Clear error attributes on dvfy components
    const components = this.#form.querySelectorAll('[error]');
    for (const comp of components) {
      if (comp.tagName && comp.tagName.startsWith('DVFY-')) {
        comp.removeAttribute('error');
      }
    }
  }

  #showToast(message, status) {
    if (typeof window.DvfyToast !== 'undefined') {
      window.DvfyToast.show({ message, status });
    }
  }

  #showConfirmModal(onConfirm) {
    // Remove any existing confirm modal
    if (this.#confirmModal && this.#confirmModal.parentNode) {
      this.#confirmModal.remove();
    }

    const confirmText = this.getAttribute('confirm') || 'Are you sure?';

    this.#confirmModal = document.createElement('dvfy-modal');
    this.#confirmModal.setAttribute('title', 'Confirm');
    this.#confirmModal.setAttribute('size', 'sm');
    this.#confirmModal.setAttribute('required', '');

    const body = document.createElement('div');

    const msg = document.createElement('p');
    msg.style.cssText = 'margin: 0 0 var(--dvfy-space-4) 0; color: var(--dvfy-text-primary); font-size: var(--dvfy-text-sm);';
    msg.textContent = confirmText;
    body.appendChild(msg);

    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: var(--dvfy-space-3); justify-content: flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = [
      'padding: var(--dvfy-space-2) var(--dvfy-space-4)',
      'border: var(--dvfy-border-1) solid var(--dvfy-border-default)',
      'border-radius: var(--dvfy-radius-lg)',
      'background: var(--dvfy-surface-raised)',
      'color: var(--dvfy-text-primary)',
      'font-family: var(--dvfy-font-sans)',
      'font-size: var(--dvfy-text-sm)',
      'cursor: pointer'
    ].join('; ') + ';';
    cancelBtn.addEventListener('click', () => {
      this.#confirmModal.removeAttribute('open');
      setTimeout(() => this.#confirmModal.remove(), 200);
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.style.cssText = [
      'padding: var(--dvfy-space-2) var(--dvfy-space-4)',
      'border: none',
      'border-radius: var(--dvfy-radius-lg)',
      'background: var(--dvfy-primary-bg)',
      'color: var(--dvfy-primary-text, #fff)',
      'font-family: var(--dvfy-font-sans)',
      'font-size: var(--dvfy-text-sm)',
      'cursor: pointer'
    ].join('; ') + ';';
    confirmBtn.addEventListener('click', () => {
      this.#confirmModal.removeAttribute('open');
      setTimeout(() => this.#confirmModal.remove(), 200);
      onConfirm();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    body.appendChild(actions);
    this.#confirmModal.appendChild(body);

    document.body.appendChild(this.#confirmModal);
    this.#confirmModal.setAttribute('open', '');
  }
}

customElements.define('dvfy-htmx-form', DvfyHtmxForm);
