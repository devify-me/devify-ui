/**
 * <dvfy-button> — Button component
 *
 * Attributes:
 *   variant:  default | subtle | outline | ghost | danger (default: "default")
 *   size:     sm | md | lg (default: "md")
 *   disabled: boolean
 *   loading:  boolean
 *   type:     button | submit | reset (default: "button")
 *
 * Usage:
 *   <dvfy-button variant="primary" size="lg">Save</dvfy-button>
 *   <dvfy-button variant="danger" loading>Deleting...</dvfy-button>
 *   <dvfy-button variant="outline" hx-get="/api/data">Load</dvfy-button>
 */

const STYLES = `
dvfy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
  font-weight: var(--dvfy-weight-medium);
  line-height: var(--dvfy-leading-tight);
  border: var(--dvfy-border-1) solid transparent;
  cursor: pointer;
  transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

/* Sizes */
dvfy-button[size="sm"] { padding: var(--dvfy-space-1-5) var(--dvfy-space-3); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
dvfy-button:not([size]), dvfy-button[size="md"] { padding: var(--dvfy-space-2) var(--dvfy-space-4); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-lg); }
dvfy-button[size="lg"] { padding: var(--dvfy-space-2-5) var(--dvfy-space-5); font-size: var(--dvfy-text-base); border-radius: var(--dvfy-radius-lg); }

/* Default variant — high specificity to resist overrides */
dvfy-button:not([variant]), dvfy-button[variant="default"] {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text);
  border-color: var(--dvfy-primary-bg);
}
dvfy-button:not([variant]):hover:not([disabled]):not([loading]),
dvfy-button[variant="default"]:hover:not([disabled]):not([loading]) {
  background: var(--dvfy-primary-bg-hover) !important;
  border-color: var(--dvfy-primary-bg-hover) !important;
}
dvfy-button:not([variant]):active:not([disabled]):not([loading]),
dvfy-button[variant="default"]:active:not([disabled]):not([loading]) {
  background: var(--dvfy-primary-bg-active) !important;
}

/* Subtle */
dvfy-button[variant="subtle"] {
  background: var(--dvfy-primary-bg-subtle);
  color: var(--dvfy-text-link);
  border-color: transparent;
}
dvfy-button[variant="subtle"]:hover:not([disabled]):not([loading]) { background: var(--dvfy-hover-bg); }

/* Outline */
dvfy-button[variant="outline"] {
  background: transparent;
  color: var(--dvfy-text-primary);
  border-color: var(--dvfy-border-default);
}
dvfy-button[variant="outline"]:hover:not([disabled]):not([loading]) { background: var(--dvfy-hover-bg); border-color: var(--dvfy-border-strong); }

/* Ghost */
dvfy-button[variant="ghost"] {
  background: transparent;
  color: var(--dvfy-text-secondary);
  border-color: transparent;
}
dvfy-button[variant="ghost"]:hover:not([disabled]):not([loading]) { background: var(--dvfy-hover-bg); color: var(--dvfy-text-primary); }

/* Danger */
dvfy-button[variant="danger"] {
  background: var(--dvfy-danger-bg);
  color: var(--dvfy-neutral-0);
  border-color: var(--dvfy-danger-bg);
}
dvfy-button[variant="danger"]:hover:not([disabled]):not([loading]) { opacity: 0.9; }

/* States */
dvfy-button:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-button[disabled] {
  background: var(--dvfy-disabled-bg);
  color: var(--dvfy-text-muted);
  border-color: var(--dvfy-border-default);
  cursor: not-allowed;
  pointer-events: none;
}
dvfy-button[loading] {
  position: relative;
  color: transparent;
  pointer-events: none;
}
dvfy-button[loading]::after {
  content: '';
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--dvfy-radius-round);
  animation: dvfy-spin 0.6s linear infinite;
  color: var(--dvfy-text-muted);
}
@keyframes dvfy-spin { to { transform: rotate(360deg); } }
`;

class DvfyButton extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyButton.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyButton.#styled = true;
    }

    if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    if (!this.getAttribute('tabindex') && !this.hasAttribute('disabled')) {
      this.setAttribute('tabindex', '0');
    }

    this.addEventListener('keydown', this.#onKey);
  }

  #onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  };

  static get observedAttributes() { return ['disabled']; }

  attributeChangedCallback(name, _, val) {
    if (name === 'disabled') {
      this.setAttribute('tabindex', val !== null ? '-1' : '0');
    }
  }
}

customElements.define('dvfy-button', DvfyButton);
