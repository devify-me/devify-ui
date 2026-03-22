/**
 * <dvfy-card> — Content card
 *
 * Attributes:
 *   elevated:    boolean — adds shadow
 *   interactive: boolean — hover effect
 *   padded:      boolean — adds padding (default: true)
 *
 * Usage:
 *   <dvfy-card elevated>Content here</dvfy-card>
 *   <dvfy-card interactive padded>Clickable card</dvfy-card>
 */

const STYLES = `
dvfy-card {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
}

/* Padded */
dvfy-card[padded] {
  padding: var(--dvfy-space-5);
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

/**
 * Content card with elevation and interactive variants.
 *
 * @element dvfy-card
 *
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {boolean} interactive - Enable hover effect, cursor pointer, and keyboard activation
 * @attr {boolean} padded - Enable padding
 *
 * @slot - Card content
 *
 * @cssprop {color} --dvfy-surface-raised - Card background
 * @cssprop {color} --dvfy-border-default - Card border color
 * @cssprop {color} --dvfy-shadow-md - Elevated shadow
 *
 * @example
 * <dvfy-card elevated padded>
 *   <h3 style="margin-bottom:0.5rem">Card Title</h3>
 *   <p style="color:var(--dvfy-text-secondary);font-size:var(--dvfy-text-sm)">Card content goes here.</p>
 * </dvfy-card>
 */
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
      this._onKeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      };
      this.addEventListener('keydown', this._onKeydown);
    }
  }

  disconnectedCallback() {
    if (this._onKeydown) this.removeEventListener('keydown', this._onKeydown);
  }

  static get observedAttributes() { return ['interactive']; }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'interactive') {
      if (this.hasAttribute('interactive')) {
        this.setAttribute('tabindex', '0');
        this.setAttribute('role', 'button');
        if (!this._onKeydown) {
          this._onKeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
            }
          };
          this.addEventListener('keydown', this._onKeydown);
        }
      } else {
        this.removeAttribute('tabindex');
        this.removeAttribute('role');
        if (this._onKeydown) {
          this.removeEventListener('keydown', this._onKeydown);
          this._onKeydown = null;
        }
      }
    }
  }
}

customElements.define('dvfy-card', DvfyCard);
