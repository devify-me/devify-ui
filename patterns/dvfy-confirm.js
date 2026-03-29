/**
 * <dvfy-confirm> — Confirmation modal that intercepts an action.
 *
 * Attributes:
 *   title:        modal title (default: "Are you sure?")
 *   message:      confirmation message
 *   confirm-text: confirm button text (default: "Confirm")
 *   cancel-text:  cancel button text (default: "Cancel")
 *   variant:      confirm button variant — default | danger (default: "default")
 *   action:       URL to call on confirm
 *   method:       HTTP method (default: "post")
 *
 * Events:
 *   confirmed — dispatched when user clicks Confirm
 *   cancelled — dispatched when user clicks Cancel
 *
 * Children: the trigger element (button, link, etc.) that opens the confirmation
 *
 * Usage with Go templates:
 *   <!-- Delete with HTMX action -->
 *   <dvfy-confirm
 *     title="Delete Task"
 *     message="This will permanently delete task '{{.Task.Title}}'. This cannot be undone."
 *     confirm-text="Delete"
 *     cancel-text="Keep"
 *     variant="danger"
 *     action="/tasks/{{.Task.ID}}"
 *     method="delete"
 *   >
 *     <dvfy-button variant="danger" size="sm">Delete Task</dvfy-button>
 *   </dvfy-confirm>
 *
 *   <!-- Confirmation without action (event-driven) -->
 *   <dvfy-confirm
 *     title="Reset Form"
 *     message="All unsaved changes will be lost."
 *     confirm-text="Reset"
 *   >
 *     <button type="button" class="btn-secondary">Reset</button>
 *   </dvfy-confirm>
 *   <script>
 *     document.querySelector('dvfy-confirm').addEventListener('confirmed', () => {
 *       document.querySelector('form').reset();
 *     });
 *   </script>
 *
 *   <!-- Intercept existing HTMX button (moves hx-* attrs to confirm button) -->
 *   <dvfy-confirm
 *     title="Approve Changes"
 *     message="This will deploy the changes to production."
 *     confirm-text="Approve & Deploy"
 *   >
 *     <button
 *       hx-post="/approvals/{{.Approval.ID}}/decide"
 *       hx-vals='{"decision": "approved"}'
 *       hx-target="#approval-card"
 *     >
 *       Approve
 *     </button>
 *   </dvfy-confirm>
 */

const STYLES = `
dvfy-confirm {
  display: inline-block;
  font-family: var(--dvfy-font-sans);
}
dvfy-confirm .dvfy-confirm__trigger {
  display: inline-block;
}
dvfy-confirm .dvfy-confirm__message {
  margin: 0 0 var(--dvfy-space-5) 0;
  color: var(--dvfy-text-secondary);
  font-size: var(--dvfy-text-sm);
  line-height: var(--dvfy-leading-relaxed, 1.625);
}
dvfy-confirm .dvfy-confirm__actions {
  display: flex;
  gap: var(--dvfy-space-3);
  justify-content: flex-end;
}
dvfy-confirm .dvfy-confirm__btn {
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  border-radius: var(--dvfy-radius-lg);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  cursor: pointer;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
  outline: none;
}
dvfy-confirm .dvfy-confirm__btn:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-confirm .dvfy-confirm__btn--cancel {
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-primary);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
}
dvfy-confirm .dvfy-confirm__btn--cancel:hover {
  background: var(--dvfy-hover-bg);
  border-color: var(--dvfy-border-strong);
}
dvfy-confirm .dvfy-confirm__btn--confirm {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text, #fff);
  border: none;
}
dvfy-confirm .dvfy-confirm__btn--confirm:hover {
  background: var(--dvfy-primary-hover);
}
dvfy-confirm .dvfy-confirm__btn--danger {
  background: var(--dvfy-danger-bg);
  color: var(--dvfy-danger-text);
  border: none;
}
dvfy-confirm .dvfy-confirm__btn--danger:hover {
  background: var(--dvfy-danger-bg);
  filter: brightness(0.9);
}
`;

/** HTMX attributes that can be intercepted from trigger elements */
const HX_ATTRS = [
  'hx-get', 'hx-post', 'hx-put', 'hx-patch', 'hx-delete',
  'hx-target', 'hx-swap', 'hx-vals', 'hx-headers', 'hx-confirm',
  'hx-include', 'hx-select', 'hx-push-url', 'hx-indicator'
];

/**
 * Confirmation modal that intercepts a trigger action. Supports HTMX attribute interception.
 *
 * @element dvfy-confirm
 *
 * @attr {string} title - Modal title (default: "Are you sure?")
 * @attr {string} message - Confirmation message body
 * @attr {string} confirm-text - Confirm button text (default: "Confirm")
 * @attr {string} cancel-text - Cancel button text (default: "Cancel")
 * @attr {string} variant - Confirm button variant: default | danger (default: "default")
 * @attr {string} action - URL to call on confirm
 * @attr {string} method - HTTP method: post | put | patch | delete (default: "post")
 *
 * @fires confirmed - User clicked Confirm
 * @fires cancelled - User clicked Cancel
 *
 * @slot - Trigger element (button, link) that opens the confirmation modal
 *
 * @cssprop {color} --dvfy-primary-bg - Confirm button background (default variant)
 * @cssprop {color} --dvfy-danger-bg - Confirm button background (danger variant)
 */
class DvfyConfirm extends HTMLElement {
  static #styled = false;
  #triggerEl = null;
  #modal = null;
  #interceptedAttrs = new Map();

  connectedCallback() {
    if (!DvfyConfirm.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyConfirm.#styled = true;
    }
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Confirmation action');
    }
    this.#setup();
  }

  disconnectedCallback() {
    if (this.#modal && this.#modal.parentNode) {
      this.#modal.remove();
    }
  }

  #setup() {
    // Find the trigger element (first element child)
    this.#triggerEl = this.firstElementChild;
    if (!this.#triggerEl) return;

    // Intercept hx-* attributes from the trigger: remove them so the trigger
    // does not fire HTMX requests directly, and store them for the confirm button
    for (const attr of HX_ATTRS) {
      if (this.#triggerEl.hasAttribute(attr)) {
        this.#interceptedAttrs.set(attr, this.#triggerEl.getAttribute(attr));
        this.#triggerEl.removeAttribute(attr);
      }
    }

    // Re-process the trigger element so HTMX drops its bindings
    if (typeof htmx !== 'undefined' && this.#interceptedAttrs.size > 0) {
      htmx.process(this.#triggerEl);
    }

    // Intercept clicks on the trigger
    this.#triggerEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.#showModal();
    });
  }

  #showModal() {
    // Remove any existing modal
    if (this.#modal && this.#modal.parentNode) {
      this.#modal.remove();
    }

    const title = this.getAttribute('title') || 'Are you sure?';
    const message = this.getAttribute('message') || '';
    const confirmText = this.getAttribute('confirm-text') || 'Confirm';
    const cancelText = this.getAttribute('cancel-text') || 'Cancel';
    const variant = this.getAttribute('variant') || 'default';
    const action = this.getAttribute('action');
    const method = (this.getAttribute('method') || 'post').toLowerCase();

    // Create modal
    this.#modal = document.createElement('dvfy-modal');
    this.#modal.setAttribute('title', title);
    this.#modal.setAttribute('size', 'sm');
    this.#modal.setAttribute('required', '');

    const body = document.createElement('div');

    // Message
    if (message) {
      const msgEl = document.createElement('p');
      msgEl.className = 'dvfy-confirm__message';
      msgEl.textContent = message;
      body.appendChild(msgEl);
    }

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'dvfy-confirm__actions';

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'dvfy-confirm__btn dvfy-confirm__btn--cancel';
    cancelBtn.textContent = cancelText;
    cancelBtn.addEventListener('click', () => {
      this.#closeModal();
      this.dispatchEvent(new CustomEvent('cancelled', { bubbles: true }));
    });

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    const btnClass = variant === 'danger'
      ? 'dvfy-confirm__btn dvfy-confirm__btn--danger'
      : 'dvfy-confirm__btn dvfy-confirm__btn--confirm';
    confirmBtn.className = btnClass;
    confirmBtn.textContent = confirmText;

    // Determine how confirm should work:
    // 1. If intercepted hx-* attrs exist, apply them to the confirm button
    // 2. Else if action attribute is set, add hx-{method}={action}
    // 3. Else just dispatch the confirmed event
    let hasHtmxAction = false;

    if (this.#interceptedAttrs.size > 0) {
      for (const [attr, value] of this.#interceptedAttrs) {
        confirmBtn.setAttribute(attr, value);
      }
      hasHtmxAction = true;
    } else if (action) {
      confirmBtn.setAttribute('hx-' + method, action);
      hasHtmxAction = true;
    }

    if (hasHtmxAction && typeof htmx !== 'undefined') {
      // Listen for HTMX completion on the confirm button to close the modal
      confirmBtn.addEventListener('htmx:afterRequest', () => {
        this.#closeModal();
        this.dispatchEvent(new CustomEvent('confirmed', { bubbles: true }));
      });
    }

    confirmBtn.addEventListener('click', () => {
      if (!hasHtmxAction || typeof htmx === 'undefined') {
        this.#closeModal();
        this.dispatchEvent(new CustomEvent('confirmed', { bubbles: true }));
      }
      // If HTMX is handling the request, modal closes in htmx:afterRequest
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    body.appendChild(actions);
    this.#modal.appendChild(body);

    document.body.appendChild(this.#modal);

    // Process HTMX on the confirm button if needed
    if (hasHtmxAction && typeof htmx !== 'undefined') {
      htmx.process(confirmBtn);
    }

    this.#modal.setAttribute('open', '');
  }

  #closeModal() {
    if (this.#modal) {
      this.#modal.removeAttribute('open');
      setTimeout(() => {
        if (this.#modal && this.#modal.parentNode) {
          this.#modal.remove();
        }
      }, 200);
    }
  }
}

customElements.define('dvfy-confirm', DvfyConfirm);
