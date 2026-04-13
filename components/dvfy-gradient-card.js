import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-gradient-card> — Card with cursor-tracking radial gradient hover
 *
 * Attributes:
 *   elevated:    boolean — adds shadow
 *   interactive: boolean — cursor pointer
 *   padded:      boolean — adds padding (default: true)
 *
 * CSS Custom Properties:
 *   --dvfy-gradient-card-color   Gradient highlight color  (default: var(--dvfy-accent-500) at 15% opacity)
 *   --dvfy-gradient-card-size    Gradient radius           (default: 250px)
 *
 * Usage:
 *   <dvfy-gradient-card padded elevated>Content here</dvfy-gradient-card>
 *   <dvfy-gradient-card interactive padded>Clickable card</dvfy-gradient-card>
 */

const STYLES = `
dvfy-gradient-card {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  position: relative;
  overflow: hidden;

  --_gc-color: var(--dvfy-gradient-card-color, rgba(99, 102, 241, 0.15));
  --_gc-size: var(--dvfy-gradient-card-size, 250px);
  --x: 50%;
  --y: 50%;
}

/* Radial gradient overlay — only on hover-capable devices */
@media (hover: hover) {
  dvfy-gradient-card::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0;
    background: radial-gradient(
      circle var(--_gc-size) at var(--x) var(--y),
      var(--_gc-color),
      transparent 100%
    );
    transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-gradient-card:hover::before {
    opacity: 1;
  }
}

/* Padded */
dvfy-gradient-card[padded] {
  padding: var(--dvfy-space-5);
}

/* Elevated */
dvfy-gradient-card[elevated] {
  box-shadow: var(--dvfy-shadow-md);
  background: var(--dvfy-elevation-md-bg);
  border-color: transparent;
}

/* Interactive */
dvfy-gradient-card[interactive] {
  cursor: pointer;
  transition: box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-gradient-card[interactive]:hover {
  box-shadow: var(--dvfy-shadow-lg);
  border-color: var(--dvfy-border-strong);
}
dvfy-gradient-card[interactive]:active {
  transform: scale(0.99);
}

/* Focus */
dvfy-gradient-card[interactive]:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
`;

/**
 * Card with a radial gradient 'light source' that follows the cursor on hover.
 *
 * @element dvfy-gradient-card
 *
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {boolean} interactive - Enable hover effect and cursor pointer
 * @attr {boolean} padded - Enable padding
 *
 * @slot - Card content
 *
 * @cssprop {color} --dvfy-gradient-card-color - Gradient highlight color
 * @cssprop {length} --dvfy-gradient-card-size - Gradient radius (default: 250px)
 */
class DvfyGradientCard extends HTMLElement {
  #rafId = 0;
  #lastX = 0;
  #lastY = 0;

  #onMouseMove = (e) => {
    this.#lastX = e.clientX;
    this.#lastY = e.clientY;
    if (!this.#rafId) {
      this.#rafId = requestAnimationFrame(() => {
        const rect = this.getBoundingClientRect();
        this.style.setProperty('--x', `${this.#lastX - rect.left}px`);
        this.style.setProperty('--y', `${this.#lastY - rect.top}px`);
        this.#rafId = 0;
      });
    }
  };

  connectedCallback() {
    injectStyles('dvfy-gradient-card', STYLES);

    this.addEventListener('mousemove', this.#onMouseMove);

    if (this.hasAttribute('interactive')) {
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    }
  }

  disconnectedCallback() {
    if (this.#rafId) { cancelAnimationFrame(this.#rafId); this.#rafId = 0; }
    this.removeEventListener('mousemove', this.#onMouseMove);
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

customElements.define('dvfy-gradient-card', DvfyGradientCard);
