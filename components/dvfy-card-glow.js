import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-card-glow> — Card with mouse-tracked radial gradient glow
 *
 * A radial gradient spotlight follows the cursor across the card, glowing
 * through the border via a ::before pseudo-element. Inspired by the Twitch
 * brand page hover effect (Hyperplexed / codepen.io/Hyperplexed/pen/QWQRGdO).
 *
 * Automatically disabled when prefers-reduced-motion: reduce is active.
 * Cleans up event listeners on disconnect.
 *
 * Attributes:
 *   elevated:    boolean — adds shadow
 *   interactive: boolean — cursor pointer + active scale
 *   padded:      boolean — adds padding
 *
 * CSS Custom Properties:
 *   --glow-color   Glow color (any CSS color / rgba)  (default: rgba(124, 58, 237, 0.2))
 *   --glow-size    Gradient radius                    (default: 60%)
 *
 * Usage:
 *   <dvfy-card-glow padded>Content here</dvfy-card-glow>
 *   <dvfy-card-glow interactive padded style="--glow-color: rgba(99,102,241,0.25)">...</dvfy-card-glow>
 */

const STYLES = `
dvfy-card-glow {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  background-clip: padding-box;
  border: var(--dvfy-border-1, 1px) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  position: relative;
  isolation: isolate;

  --_cg-color: var(--glow-color, rgba(124, 58, 237, 0.2));
  --_cg-size: var(--glow-size, 60%);
  --x: -999px;
  --y: -999px;
}

/* Lift direct children above the ::before overlay */
dvfy-card-glow > * {
  position: relative;
  z-index: 1;
}

/* Padded */
dvfy-card-glow[padded] {
  padding: var(--dvfy-space-5);
}

/* Elevated */
dvfy-card-glow[elevated] {
  box-shadow: var(--dvfy-shadow-md);
  background: var(--dvfy-elevation-md-bg);
}

/* Interactive */
dvfy-card-glow[interactive] {
  cursor: pointer;
  transition: box-shadow var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              transform var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
dvfy-card-glow[interactive]:active {
  transform: scale(0.99);
}
dvfy-card-glow[interactive]:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Glow layer — only on hover-capable devices, respects reduced-motion */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  dvfy-card-glow {
    transition: border-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-card-glow:hover {
    border-color: transparent;
  }

  /* Gradient bleeds through border: inset -1px + border-color transparent on hover
     reveals this layer in the border area as a glowing rim. */
  dvfy-card-glow::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: calc(var(--dvfy-radius-lg) + 1px);
    background: radial-gradient(
      circle var(--_cg-size) at var(--x) var(--y),
      var(--_cg-color),
      transparent 100%
    );
    z-index: -1;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-card-glow:hover::before {
    opacity: 1;
  }
}
`;

/**
 * Card with a mouse-tracked radial gradient glow that bleeds through the border.
 *
 * @element dvfy-card-glow
 *
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {boolean} interactive - Enable cursor pointer and active scale
 * @attr {boolean} padded - Enable padding
 *
 * @slot - Card content
 *
 * @cssprop {color} --glow-color - Glow color (default: rgba(124, 58, 237, 0.2))
 * @cssprop {length|percentage} --glow-size - Gradient radius (default: 60%)
 */
class DvfyCardGlow extends HTMLElement {
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

  #onMouseLeave = () => {
    if (this.#rafId) { cancelAnimationFrame(this.#rafId); this.#rafId = 0; }
    this.style.setProperty('--x', '-999px');
    this.style.setProperty('--y', '-999px');
  };

  connectedCallback() {
    injectStyles('dvfy-card-glow', STYLES);

    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('mouseleave', this.#onMouseLeave);

    if (this.hasAttribute('interactive')) {
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    }
  }

  disconnectedCallback() {
    if (this.#rafId) { cancelAnimationFrame(this.#rafId); this.#rafId = 0; }
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
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

customElements.define('dvfy-card-glow', DvfyCardGlow);
