import { injectStyles } from '../utils/styles.js';

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

/* Size: xs */
dvfy-badge[size="xs"] {
  padding: 0 var(--dvfy-space-1-5);
  font-size: var(--dvfy-text-xs);
  border-radius: var(--dvfy-radius-sm);
}
/* Size: sm */
dvfy-badge[size="sm"] {
  padding: var(--dvfy-space-0-5) var(--dvfy-space-2);
  font-size: var(--dvfy-text-xs);
  border-radius: var(--dvfy-radius-md);
}
/* Size: md (default) */
dvfy-badge:not([size]), dvfy-badge[size="md"] {
  padding: var(--dvfy-space-0-5) var(--dvfy-space-2-5);
  font-size: var(--dvfy-text-sm);
  border-radius: var(--dvfy-radius-md);
}
/* Size: lg */
dvfy-badge[size="lg"] {
  padding: var(--dvfy-space-1) var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  border-radius: var(--dvfy-radius-lg);
}
/* Size: xl */
dvfy-badge[size="xl"] {
  padding: var(--dvfy-space-1-5) var(--dvfy-space-3-5);
  font-size: var(--dvfy-text-base);
  border-radius: var(--dvfy-radius-lg);
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
  background: var(--dvfy-surface-muted);
  color: var(--dvfy-text-secondary);
  border-color: var(--dvfy-border-default);
}
dvfy-badge:not([status]) .dvfy-badge__dot, dvfy-badge[status="neutral"] .dvfy-badge__dot {
  background: var(--dvfy-text-muted);
}

/* Success — subtle bg, dark text for readability */
dvfy-badge[status="success"] {
  background: var(--dvfy-success-bg-subtle);
  color: var(--dvfy-success-text);
  border-color: var(--dvfy-success-border);
}
dvfy-badge[status="success"] .dvfy-badge__dot { background: var(--dvfy-success-bg); }

/* Warning */
dvfy-badge[status="warning"] {
  background: var(--dvfy-warning-bg-subtle);
  color: var(--dvfy-warning-text);
  border-color: var(--dvfy-warning-border);
}
dvfy-badge[status="warning"] .dvfy-badge__dot { background: var(--dvfy-warning-bg); }

/* Danger */
dvfy-badge[status="danger"] {
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-color: var(--dvfy-danger-border);
}
dvfy-badge[status="danger"] .dvfy-badge__dot { background: var(--dvfy-danger-bg); }

/* Info */
dvfy-badge[status="info"] {
  background: var(--dvfy-info-bg-subtle);
  color: var(--dvfy-info-text);
  border-color: var(--dvfy-info-border);
}
dvfy-badge[status="info"] .dvfy-badge__dot { background: var(--dvfy-info-bg); }

/* Outline variant — transparent bg, keep border */
dvfy-badge[variant="outline"] { background: transparent; }
`;

/**
 * Status badge with dot indicator and outline variant.
 *
 * @element dvfy-badge
 *
 * @attr {string} variant - Badge style: default | outline (default: "default")
 * @attr {string} status - Status color: neutral | success | warning | danger | info (default: "neutral")
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {boolean} dot - Show dot indicator before text
 * @attr {string} aria-label - Accessible label for icon-only badges
 *
 * @cssprop {color} --dvfy-success-bg-subtle - Success status background
 * @cssprop {color} --dvfy-warning-bg-subtle - Warning status background
 * @cssprop {color} --dvfy-danger-bg-subtle - Danger status background
 * @cssprop {color} --dvfy-info-bg-subtle - Info status background
 */
class DvfyBadge extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-badge', STYLES);
    this.setAttribute('role', 'status');
    this.#render();
  }

  static get observedAttributes() { return ['dot', 'aria-label']; }

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
