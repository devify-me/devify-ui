/**
 * <dvfy-card> — Content card
 *
 * Attributes:
 *   elevated:    boolean — adds shadow
 *   interactive: boolean — hover effect
 *   padded:      boolean — adds padding (default: true)
 *   spotlight:   boolean — cursor-tracking radial gradient spotlight overlay
 *
 * CSS Custom Properties (spotlight mode):
 *   --dvfy-card-spotlight-size          Spotlight radius             (default: 400px)
 *   --dvfy-card-spotlight-color         Inner surface glow color     (default: rgba(255,255,255,0.06))
 *   --dvfy-card-spotlight-border-color  Border glow color            (default: rgba(255,255,255,0.15))
 *
 * Usage:
 *   <dvfy-card elevated>Content here</dvfy-card>
 *   <dvfy-card interactive padded>Clickable card</dvfy-card>
 *   <dvfy-card spotlight padded>Spotlight card</dvfy-card>
 *
 * @example
 * <dvfy-card padded elevated>
 *   <h3>Project Update</h3>
 *   <p>The latest build passed all checks and is ready for review.</p>
 * </dvfy-card>
 */

import { injectStyles } from '../utils/styles.js';


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

/* Spotlight */
dvfy-card[spotlight] {
  position: relative;
  isolation: isolate;
  background-clip: padding-box;

  --_sp-size: var(--dvfy-card-spotlight-size, 400px);
  --_sp-color: var(--dvfy-card-spotlight-color, rgba(255, 255, 255, 0.06));
  --_sp-border-color: var(--dvfy-card-spotlight-border-color, rgba(255, 255, 255, 0.15));
  --x: -999px;
  --y: -999px;
}

/* Lift direct children above the spotlight overlays */
dvfy-card[spotlight] > * {
  position: relative;
  z-index: 1;
}

@media (hover: hover) {
  dvfy-card[spotlight] {
    transition: border-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-card[spotlight]:hover {
    border-color: transparent;
  }

  /* Border glow — sits 1px behind the card, visible when border is transparent */
  dvfy-card[spotlight]::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: calc(var(--dvfy-radius-lg) + 1px);
    background: radial-gradient(
      circle var(--_sp-size) at var(--x) var(--y),
      var(--_sp-border-color),
      transparent 40%
    );
    z-index: -1;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  /* Inner surface spotlight — subtle illumination over the card surface */
  dvfy-card[spotlight]::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      circle var(--_sp-size) at var(--x) var(--y),
      var(--_sp-color),
      transparent 40%
    );
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-card[spotlight]:hover::before,
  dvfy-card[spotlight]:hover::after {
    opacity: 1;
  }
}
`;

/**
 * Content card with elevation, interactive, and spotlight variants.
 *
 * @element dvfy-card
 *
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {boolean} interactive - Enable hover effect and cursor pointer
 * @attr {boolean} padded - Enable padding (default: true)
 * @attr {boolean} spotlight - Enable cursor-tracking radial gradient spotlight overlay
 *
 * @slot - Card content
 *
 * @cssprop {color} --dvfy-surface-raised - Card background
 * @cssprop {color} --dvfy-border-default - Card border color
 * @cssprop {color} --dvfy-shadow-md - Elevated shadow
 * @cssprop {length} --dvfy-card-spotlight-size - Spotlight radius (default: 400px)
 * @cssprop {color} --dvfy-card-spotlight-color - Inner surface glow color
 * @cssprop {color} --dvfy-card-spotlight-border-color - Border glow color
 */
class DvfyCard extends HTMLElement {
  #onMouseMove = (e) => {
    const rect = this.getBoundingClientRect();
    this.style.setProperty('--x', `${e.clientX - rect.left}px`);
    this.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  #onMouseLeave = () => {
    this.style.setProperty('--x', '-999px');
    this.style.setProperty('--y', '-999px');
  };

  connectedCallback() {
    injectStyles('dvfy-card', STYLES);

    if (this.hasAttribute('interactive')) {
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    }

    if (this.hasAttribute('spotlight')) {
      this.addEventListener('mousemove', this.#onMouseMove);
      this.addEventListener('mouseleave', this.#onMouseLeave);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
  }

  static get observedAttributes() { return ['interactive', 'spotlight']; }

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
    if (name === 'spotlight') {
      if (this.hasAttribute('spotlight')) {
        this.addEventListener('mousemove', this.#onMouseMove);
        this.addEventListener('mouseleave', this.#onMouseLeave);
      } else {
        this.removeEventListener('mousemove', this.#onMouseMove);
        this.removeEventListener('mouseleave', this.#onMouseLeave);
      }
    }
  }
}

customElements.define('dvfy-card', DvfyCard);
