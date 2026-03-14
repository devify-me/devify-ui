/**
 * <dvfy-card> — Content card
 *
 * Attributes:
 *   elevated:    boolean — adds shadow
 *   interactive: boolean — hover effect
 *   padded:      boolean (default: true) — adds padding
 *
 * Usage:
 *   <dvfy-card elevated>Content here</dvfy-card>
 *   <dvfy-card interactive padded>Clickable card</dvfy-card>
 */

const STYLES = `
dvfy-card {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-primary);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
}

/* Padded (default) */
dvfy-card:not([padded="false"]) {
  padding: var(--dvfy-space-5);
}
dvfy-card[padded="false"] {
  padding: 0;
}

/* Elevated */
dvfy-card[elevated] {
  box-shadow: var(--dvfy-shadow-md);
  border-color: transparent;
}

/* Interactive */
dvfy-card[interactive] {
  cursor: pointer;
  transition: box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-card[interactive]:hover {
  box-shadow: var(--dvfy-shadow-lg);
  border-color: var(--dvfy-border-strong);
}
dvfy-card[interactive]:active {
  transform: scale(0.99);
}

/* Focus */
dvfy-card[interactive]:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
`;

class DvfyCard extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyCard.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCard.#styled = true;
    }

    if (this.hasAttribute('interactive')) {
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    }
  }

  static get observedAttributes() { return ['interactive']; }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'interactive') {
      if (this.hasAttribute('interactive')) {
        this.setAttribute('tabindex', '0');
        this.setAttribute('role', 'button');
      } else {
        this.removeAttribute('tabindex');
        this.removeAttribute('role');
      }
    }
  }
}

customElements.define('dvfy-card', DvfyCard);
