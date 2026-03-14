/**
 * <dvfy-badge> — Status badge
 *
 * Attributes:
 *   variant: default | outline (default: "default")
 *   status:  neutral | success | warning | danger | info (default: "neutral")
 *   size:    sm | md (default: "md")
 *   dot:     boolean — show dot indicator
 *
 * Usage:
 *   <dvfy-badge status="success">Active</dvfy-badge>
 *   <dvfy-badge status="danger" variant="outline" dot>Error</dvfy-badge>
 */

const STYLES = `
dvfy-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
  font-weight: var(--dvfy-weight-medium);
  line-height: var(--dvfy-leading-tight);
  white-space: nowrap;
  border: var(--dvfy-border-1) solid transparent;
  vertical-align: middle;
}

/* Sizes */
dvfy-badge[size="sm"], dvfy-badge:not([size]) dvfy-badge[size="sm"] {
  padding: var(--dvfy-space-0-5) var(--dvfy-space-2);
  font-size: var(--dvfy-text-xs);
  border-radius: var(--dvfy-radius-md);
}
dvfy-badge:not([size]), dvfy-badge[size="md"] {
  padding: var(--dvfy-space-0-5) var(--dvfy-space-2-5);
  font-size: var(--dvfy-text-sm);
  border-radius: var(--dvfy-radius-md);
}

/* Dot indicator */
dvfy-badge .dvfy-badge__dot {
  width: 0.5em;
  height: 0.5em;
  border-radius: var(--dvfy-radius-round);
  flex-shrink: 0;
}

/* Neutral — default */
dvfy-badge:not([status]), dvfy-badge[status="neutral"] {
  background: var(--dvfy-surface-secondary);
  color: var(--dvfy-text-secondary);
  border-color: var(--dvfy-border-default);
}
dvfy-badge:not([status]) .dvfy-badge__dot, dvfy-badge[status="neutral"] .dvfy-badge__dot {
  background: var(--dvfy-text-muted);
}

/* Success */
dvfy-badge[status="success"] {
  background: var(--dvfy-success-bg);
  color: var(--dvfy-success-text);
  border-color: var(--dvfy-success-border);
}
dvfy-badge[status="success"] .dvfy-badge__dot { background: var(--dvfy-success-text); }

/* Warning */
dvfy-badge[status="warning"] {
  background: var(--dvfy-warning-bg);
  color: var(--dvfy-warning-text);
  border-color: var(--dvfy-warning-border);
}
dvfy-badge[status="warning"] .dvfy-badge__dot { background: var(--dvfy-warning-text); }

/* Danger */
dvfy-badge[status="danger"] {
  background: var(--dvfy-danger-bg);
  color: var(--dvfy-danger-text);
  border-color: var(--dvfy-danger-border);
}
dvfy-badge[status="danger"] .dvfy-badge__dot { background: var(--dvfy-danger-text); }

/* Info */
dvfy-badge[status="info"] {
  background: var(--dvfy-info-bg);
  color: var(--dvfy-info-text);
  border-color: var(--dvfy-info-border);
}
dvfy-badge[status="info"] .dvfy-badge__dot { background: var(--dvfy-info-text); }

/* Outline variant — transparent bg, keep border */
dvfy-badge[variant="outline"] { background: transparent; }
`;

class DvfyBadge extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyBadge.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyBadge.#styled = true;
    }
    this.#render();
  }

  static get observedAttributes() { return ['dot']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    // Preserve text content
    const text = this.textContent.trim();
    const existingDot = this.querySelector('.dvfy-badge__dot');

    if (this.hasAttribute('dot') && !existingDot) {
      const dot = document.createElement('span');
      dot.className = 'dvfy-badge__dot';
      this.textContent = '';
      this.appendChild(dot);
      this.appendChild(document.createTextNode(text));
    } else if (!this.hasAttribute('dot') && existingDot) {
      existingDot.remove();
    }
  }
}

customElements.define('dvfy-badge', DvfyBadge);
