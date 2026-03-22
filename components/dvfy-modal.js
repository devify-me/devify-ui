/**
 * <dvfy-modal> — Modal dialog
 *
 * Attributes:
 *   open:  boolean
 *   title: header text
 *   size:  sm | md | lg (default: "md")
 *
 * Usage:
 *   <dvfy-modal title="Confirm" size="sm">
 *     <p>Are you sure?</p>
 *   </dvfy-modal>
 */

const STYLES = `
dvfy-modal {
  display: none;
  font-family: var(--dvfy-font-sans);
}
dvfy-modal[open] {
  display: block;
}
dvfy-modal .dvfy-modal__backdrop {
  position: fixed;
  inset: 0;
  background: var(--dvfy-backdrop-bg, rgba(0, 0, 0, 0.75));
  z-index: var(--dvfy-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--dvfy-space-4);
}
dvfy-modal .dvfy-modal__dialog {
  background: var(--dvfy-surface-raised);
  border-radius: var(--dvfy-radius-xl);
  box-shadow: var(--dvfy-shadow-xl);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  width: 100%;
}
dvfy-modal[size="xs"] .dvfy-modal__dialog { max-width: 20rem; }
dvfy-modal[size="sm"] .dvfy-modal__dialog { max-width: 24rem; }
dvfy-modal:not([size]) .dvfy-modal__dialog,
dvfy-modal[size="md"] .dvfy-modal__dialog { max-width: 32rem; }
dvfy-modal[size="lg"] .dvfy-modal__dialog { max-width: 48rem; }
dvfy-modal[size="xl"] .dvfy-modal__dialog { max-width: 64rem; }
dvfy-modal .dvfy-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dvfy-space-4) var(--dvfy-space-5);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
}
dvfy-modal .dvfy-modal__title {
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
  margin: 0;
}
dvfy-modal .dvfy-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  border-radius: var(--dvfy-radius-md);
  cursor: pointer;
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-lg);
}
dvfy-modal .dvfy-modal__close:hover { background: var(--dvfy-hover-bg); color: var(--dvfy-text-primary); }
dvfy-modal .dvfy-modal__close:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-modal .dvfy-modal__body {
  padding: var(--dvfy-space-5);
  overflow-y: auto;
  flex: 1;
}
`;

/**
 * Modal dialog with backdrop, focus trap, and keyboard support.
 *
 * @element dvfy-modal
 *
 * @attr {boolean} open - Show/hide the modal
 * @attr {string} title - Header title text
 * @attr {string} size - Dialog size: xs | sm | md | lg | xl (default: "md")
 * @attr {boolean} required - Prevent dismissal via backdrop click or Escape key
 *
 * @fires close - Modal closed
 *
 * @slot - Modal body content
 *
 * @cssprop {color} --dvfy-surface-raised - Dialog background
 * @cssprop {color} --dvfy-shadow-xl - Dialog shadow
 * @cssprop {color} --dvfy-backdrop-bg - Backdrop overlay color (default: rgba(0,0,0,0.75))
 *
 * @example
 * <dvfy-modal title="Confirm action" size="sm">
 *   <p>Are you sure you want to continue?</p>
 * </dvfy-modal>
 */
class DvfyModal extends HTMLElement {
  static #styled = false;
  #backdrop = null;
  #dialog = null;
  #prevFocus = null;

  connectedCallback() {
    if (!DvfyModal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyModal.#styled = true;
    }
    if (this.hasAttribute('open')) this.#build();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.#onKey);
  }

  static get observedAttributes() { return ['open', 'title', 'required']; }

  attributeChangedCallback(name) {
    if (name === 'open') {
      this.hasAttribute('open') ? this.#open() : this.#close();
    }
    if (name === 'title') {
      const t = this.querySelector('.dvfy-modal__title');
      if (t) t.textContent = this.getAttribute('title') || '';
    }
  }

  #build() {
    if (this.#backdrop) return;

    // Collect children before building
    const content = Array.from(this.childNodes).filter(n => !n.classList?.contains('dvfy-modal__backdrop'));

    this.#backdrop = document.createElement('div');
    this.#backdrop.className = 'dvfy-modal__backdrop';
    this.#backdrop.addEventListener('click', (e) => {
      if (e.target === this.#backdrop && !this.hasAttribute('required')) {
        this.removeAttribute('open');
      }
    });

    this.#dialog = document.createElement('div');
    this.#dialog.className = 'dvfy-modal__dialog';
    this.#dialog.setAttribute('role', 'dialog');
    this.#dialog.setAttribute('aria-modal', 'true');

    // Header
    const header = document.createElement('div');
    header.className = 'dvfy-modal__header';
    const titleId = `dvfy-modal-title-${Math.random().toString(36).slice(2, 8)}`;
    const title = document.createElement('h2');
    title.className = 'dvfy-modal__title';
    title.id = titleId;
    title.textContent = this.getAttribute('title') || '';
    this.#dialog.setAttribute('aria-labelledby', titleId);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'dvfy-modal__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => this.removeAttribute('open'));
    header.appendChild(title);
    // Hide close button when required (non-dismissible)
    if (!this.hasAttribute('required')) {
      header.appendChild(closeBtn);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'dvfy-modal__body';
    for (const child of content) body.appendChild(child);

    this.#dialog.appendChild(header);
    this.#dialog.appendChild(body);
    this.#backdrop.appendChild(this.#dialog);
    this.appendChild(this.#backdrop);
  }

  #open() {
    this.#prevFocus = document.activeElement;
    this.#build();
    document.addEventListener('keydown', this.#onKey);
    // Focus first focusable or close button
    const focusable = this.#dialog?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
  }

  #close() {
    document.removeEventListener('keydown', this.#onKey);
    this.dispatchEvent(new Event('close', { bubbles: true }));
    this.#prevFocus?.focus();
  }

  #onKey = (e) => {
    if (e.key === 'Escape' && !this.hasAttribute('required')) {
      e.preventDefault();
      this.removeAttribute('open');
      return;
    }
    // Focus trap
    if (e.key === 'Tab' && this.#dialog) {
      const focusable = this.#dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
}

customElements.define('dvfy-modal', DvfyModal);
