import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-tag> — Interactive tag/chip
 *
 * Attributes:
 *   variant:   default | outline (default: "default")
 *   status:    neutral | success | warning | danger | info (default: "neutral")
 *   removable: boolean — shows X button, dispatches 'remove' event
 *   size:      sm | md (default: "md")
 *
 * Usage:
 *   <dvfy-tag status="success">Active</dvfy-tag>
 *   <dvfy-tag removable status="danger">Error</dvfy-tag>
 */

const STYLES = `
dvfy-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-1);
  font-family: var(--dvfy-font-sans);
  font-weight: var(--dvfy-weight-medium);
  line-height: var(--dvfy-leading-tight);
  white-space: nowrap;
  border: var(--dvfy-border-1) solid transparent;
  vertical-align: middle;
}

/* Size: xs */
dvfy-tag[size="xs"] {
  padding: 0 var(--dvfy-space-1-5);
  font-size: var(--dvfy-text-xs);
  border-radius: var(--dvfy-radius-sm);
}
/* Size: sm */
dvfy-tag[size="sm"] {
  padding: var(--dvfy-space-0-5) var(--dvfy-space-2);
  font-size: var(--dvfy-text-xs);
  border-radius: var(--dvfy-radius-md);
}
/* Size: md (default) */
dvfy-tag:not([size]), dvfy-tag[size="md"] {
  padding: var(--dvfy-space-1) var(--dvfy-space-2-5);
  font-size: var(--dvfy-text-sm);
  border-radius: var(--dvfy-radius-md);
}
/* Size: lg */
dvfy-tag[size="lg"] {
  padding: var(--dvfy-space-1) var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  border-radius: var(--dvfy-radius-lg);
}
/* Size: xl */
dvfy-tag[size="xl"] {
  padding: var(--dvfy-space-1-5) var(--dvfy-space-3-5);
  font-size: var(--dvfy-text-base);
  border-radius: var(--dvfy-radius-lg);
}

/* Neutral */
dvfy-tag:not([status]), dvfy-tag[status="neutral"] {
  background: var(--dvfy-surface-muted);
  color: var(--dvfy-text-secondary);
  border-color: var(--dvfy-border-default);
}

/* Success */
dvfy-tag[status="success"] {
  background: var(--dvfy-success-bg-subtle);
  color: var(--dvfy-success-text);
  border-color: var(--dvfy-success-border);
}

/* Warning */
dvfy-tag[status="warning"] {
  background: var(--dvfy-warning-bg-subtle);
  color: var(--dvfy-warning-text);
  border-color: var(--dvfy-warning-border);
}

/* Danger */
dvfy-tag[status="danger"] {
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-color: var(--dvfy-danger-border);
}

/* Info */
dvfy-tag[status="info"] {
  background: var(--dvfy-info-bg-subtle);
  color: var(--dvfy-info-text);
  border-color: var(--dvfy-info-border);
}

/* Outline variant */
dvfy-tag[variant="outline"] { background: transparent; }

/* Remove button */
dvfy-tag .dvfy-tag__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  margin-left: var(--dvfy-space-0-5);
  border-radius: var(--dvfy-radius-sm);
  opacity: 0.7;
  font-size: inherit;
  line-height: 1;
  transition: opacity var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-tag .dvfy-tag__remove:hover {
  opacity: 1;
}
dvfy-tag .dvfy-tag__remove:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
`;

/**
 * Interactive tag/chip with removable variant.
 *
 * @element dvfy-tag
 *
 * @attr {string} variant - Tag style: default | outline (default: "default")
 * @attr {string} status - Status color: neutral | success | warning | danger | info (default: "neutral")
 * @attr {boolean} removable - Show remove button and dispatch remove event
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 *
 * @event {CustomEvent} remove - Remove button clicked
 *
 * @cssprop {color} --dvfy-success-bg-subtle - Success tag background
 * @cssprop {color} --dvfy-danger-bg-subtle - Danger tag background
 * @cssprop {color} --dvfy-info-bg-subtle - Info tag background
 */
class DvfyTag extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-tag', STYLES);
    this.#render();
    this.#syncTabindex();
    this.#onKeyDown = this.#onKeyDown.bind(this);
    this.addEventListener('keydown', this.#onKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKeyDown);
  }

  static get observedAttributes() { return ['removable']; }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
      this.#syncTabindex();
    }
  }

  #syncTabindex() {
    if (this.hasAttribute('removable')) {
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    } else {
      this.removeAttribute('tabindex');
    }
  }

  #onKeyDown(e) {
    if (!this.hasAttribute('removable')) return;
    if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('remove', { bubbles: true }));
    }
  }

  #render() {
    // Remove existing remove button if any
    const existing = this.querySelector('.dvfy-tag__remove');
    if (existing) existing.remove();

    if (this.hasAttribute('removable')) {
      const btn = document.createElement('button');
      btn.className = 'dvfy-tag__remove';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Remove');
      btn.textContent = '\u00D7';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('remove', { bubbles: true }));
      });
      this.appendChild(btn);
    }
  }
}

customElements.define('dvfy-tag', DvfyTag);
