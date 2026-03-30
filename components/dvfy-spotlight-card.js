/**
 * <dvfy-spotlight-card> — Premium card with dual-layer mouse-tracking spotlight
 *
 * A radial gradient spotlight follows the mouse cursor across the card,
 * illuminating both the border and the inner surface. Inspired by Linear and
 * Twitch brand pages (Hyperplexed / codepen.io/Hyperplexed/pen/MWQeYLW).
 *
 * The effect uses two layers:
 *   ::before — border glow (visible through transparent border area)
 *   ::after  — inner surface spotlight (subtle surface illumination)
 *
 * Attributes:
 *   elevated:    boolean — adds shadow
 *   interactive: boolean — cursor pointer + active scale
 *   padded:      boolean — adds padding
 *
 * CSS Custom Properties:
 *   --dvfy-spotlight-card-size          Spotlight radius             (default: 600px)
 *   --dvfy-spotlight-card-color         Inner surface glow color     (default: rgba(255,255,255,0.04))
 *   --dvfy-spotlight-card-border-color  Border glow color            (default: rgba(255,255,255,0.12))
 *
 * Usage:
 *   <dvfy-spotlight-card padded elevated>Content here</dvfy-spotlight-card>
 *   <dvfy-spotlight-card interactive padded>Clickable card</dvfy-spotlight-card>
 */

import { injectStyles } from '../utils/styles.js';


const STYLES = `
dvfy-spotlight-card {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  background-clip: padding-box;
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  position: relative;
  isolation: isolate;

  --_sc-size: var(--dvfy-spotlight-card-size, 600px);
  --_sc-color: var(--dvfy-spotlight-card-color, rgba(255, 255, 255, 0.04));
  --_sc-border-color: var(--dvfy-spotlight-card-border-color, rgba(255, 255, 255, 0.12));
  --x: -999px;
  --y: -999px;
}

/* Lift direct children above the ::after overlay */
dvfy-spotlight-card > * {
  position: relative;
  z-index: 1;
}

/* Padded */
dvfy-spotlight-card[padded] {
  padding: var(--dvfy-space-5);
}

/* Elevated */
dvfy-spotlight-card[elevated] {
  box-shadow: var(--dvfy-shadow-md);
}

/* Interactive */
dvfy-spotlight-card[interactive] {
  cursor: pointer;
  transition: box-shadow var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              transform var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
dvfy-spotlight-card[interactive]:active {
  transform: scale(0.99);
}
dvfy-spotlight-card[interactive]:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Hover effects — only on pointer devices */
@media (hover: hover) {
  dvfy-spotlight-card {
    transition: border-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-spotlight-card:hover {
    border-color: transparent;
  }

  /* Border glow — sits at inset: -1px behind the card background.
     With background-clip: padding-box and border-color: transparent on hover,
     this gradient becomes visible in the border area as a glowing rim. */
  dvfy-spotlight-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: calc(var(--dvfy-radius-lg) + 1px);
    background: radial-gradient(
      circle var(--_sc-size) at var(--x) var(--y),
      var(--_sc-border-color),
      transparent 40%
    );
    z-index: -1;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  /* Inner surface spotlight — subtle illumination over the card surface */
  dvfy-spotlight-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      circle var(--_sc-size) at var(--x) var(--y),
      var(--_sc-color),
      transparent 40%
    );
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-spotlight-card:hover::before,
  dvfy-spotlight-card:hover::after {
    opacity: 1;
  }
}
`;

/**
 * Premium card with a dual-layer radial gradient spotlight that follows the
 * mouse cursor — a glowing border rim and an inner surface highlight.
 *
 * @element dvfy-spotlight-card
 *
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {boolean} interactive - Enable cursor pointer and active scale
 * @attr {boolean} padded - Enable padding
 *
 * @slot - Card content
 *
 * @cssprop {length} --dvfy-spotlight-card-size - Spotlight radius (default: 600px)
 * @cssprop {color} --dvfy-spotlight-card-color - Inner surface glow color
 * @cssprop {color} --dvfy-spotlight-card-border-color - Border glow color
 */
class DvfySpotlightCard extends HTMLElement {
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
    injectStyles('dvfy-spotlight-card', STYLES);

    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('mouseleave', this.#onMouseLeave);

    if (this.hasAttribute('interactive')) {
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    }
  }

  disconnectedCallback() {
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

customElements.define('dvfy-spotlight-card', DvfySpotlightCard);
