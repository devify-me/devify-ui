/**
 * <dvfy-alert> — Alert/notification banner
 *
 * Attributes:
 *   status:      info | success | warning | danger (default: "info")
 *   dismissible: boolean — show close button
 *   title:       alert title text
 *
 * Usage:
 *   <dvfy-alert status="success" title="Saved">Your changes have been saved.</dvfy-alert>
 *   <dvfy-alert status="danger" dismissible title="Error">Something went wrong.</dvfy-alert>
 */

const STYLES = `
dvfy-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border: var(--dvfy-border-1) solid transparent;
  border-radius: var(--dvfy-radius-lg);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  line-height: var(--dvfy-leading-normal);
}

/* Status icons via ::before on the icon span */
dvfy-alert .dvfy-alert__icon {
  flex-shrink: 0;
  font-size: var(--dvfy-text-lg);
  line-height: 1;
  margin-top: var(--dvfy-space-0-5);
}

dvfy-alert .dvfy-alert__body { flex: 1; min-width: 0; }
dvfy-alert .dvfy-alert__title {
  font-weight: var(--dvfy-weight-semibold);
  margin-bottom: var(--dvfy-space-1);
}
dvfy-alert .dvfy-alert__content { color: inherit; opacity: 0.9; }

dvfy-alert .dvfy-alert__close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--dvfy-space-1);
  border-radius: var(--dvfy-radius-sm);
  color: inherit;
  opacity: 0.6;
  font-size: var(--dvfy-text-lg);
  line-height: 1;
  transition: opacity var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-alert .dvfy-alert__close:hover { opacity: 1; }
dvfy-alert .dvfy-alert__close:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Info (default) — subtle bg with readable dark text */
dvfy-alert:not([status]), dvfy-alert[status="info"] {
  background: var(--dvfy-info-bg-subtle);
  color: var(--dvfy-info-text);
  border-color: var(--dvfy-info-border);
}

/* Success */
dvfy-alert[status="success"] {
  background: var(--dvfy-success-bg-subtle);
  color: var(--dvfy-success-text);
  border-color: var(--dvfy-success-border);
}

/* Warning */
dvfy-alert[status="warning"] {
  background: var(--dvfy-warning-bg-subtle);
  color: var(--dvfy-warning-text);
  border-color: var(--dvfy-warning-border);
}

/* Danger */
dvfy-alert[status="danger"] {
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-color: var(--dvfy-danger-border);
}

dvfy-alert[hidden] { display: none; }
`;

const STATUS_ICONS = {
  info: '\u24D8',     // circled i
  success: '\u2713',  // check mark
  warning: '\u26A0',  // warning sign
  danger: '\u2716',   // heavy x
};

class DvfyAlert extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyAlert.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyAlert.#styled = true;
    }
    this.setAttribute('role', 'alert');
    this.#build();
  }

  static get observedAttributes() { return ['status', 'title', 'dismissible']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#build();
  }

  #build() {
    // Capture light DOM content before clearing
    const content = this._contentCache ?? this.textContent.trim();
    this._contentCache = content;
    this.textContent = '';

    const status = this.getAttribute('status') || 'info';
    const title = this.getAttribute('title');

    // Icon
    const icon = document.createElement('span');
    icon.className = 'dvfy-alert__icon';
    icon.textContent = STATUS_ICONS[status] || STATUS_ICONS.info;
    icon.setAttribute('aria-hidden', 'true');
    this.appendChild(icon);

    // Body
    const body = document.createElement('div');
    body.className = 'dvfy-alert__body';

    if (title) {
      const t = document.createElement('div');
      t.className = 'dvfy-alert__title';
      t.textContent = title;
      body.appendChild(t);
    }

    if (content) {
      const c = document.createElement('div');
      c.className = 'dvfy-alert__content';
      c.textContent = content;
      body.appendChild(c);
    }

    this.appendChild(body);

    // Dismiss button
    if (this.hasAttribute('dismissible')) {
      const btn = document.createElement('button');
      btn.className = 'dvfy-alert__close';
      btn.setAttribute('aria-label', 'Dismiss');
      btn.textContent = '\u00D7'; // multiplication sign (x)
      btn.addEventListener('click', () => this.remove());
      this.appendChild(btn);
    }
  }
}

customElements.define('dvfy-alert', DvfyAlert);
