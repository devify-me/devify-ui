/**
 * <dvfy-card-glow> — Card with mouse-tracked radial gradient glow
 *
 * A radial gradient spotlight follows the cursor across the card, creating a
 * dynamic glow that bleeds through the card border. Recreates the Twitch brand
 * page hover effect (Hyperplexed / codepen.io/Hyperplexed/pen/QWQRGdO).
 *
 * The glow color is configurable via `--glow-color`. The effect is suppressed
 * when `prefers-reduced-motion: reduce` is active. Mouse tracking is cleaned
 * up on `mouseleave`.
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
 * @cssprop {length} --dvfy-card-glow-size - Glow radius (default: 300px)
 *
 * @example
 * <dvfy-card-glow padded elevated>
 *   <h3>Hover me</h3>
 *   <p>Watch the glow follow your cursor.</p>
 * </dvfy-card-glow>
 */

const STYLES = `
dvfy-card-glow {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  background-clip: padding-box;
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  position: relative;
  isolation: isolate;

  --_cg-color: var(--glow-color, rgba(124, 58, 237, 0.2));
  --_cg-size: var(--dvfy-card-glow-size, 300px);
  --x: -999px;
  --y: -999px;
}

/* Lift direct children above the pseudo-element overlay */
dvfy-card-glow > * {
  position: relative;
  z-index: 1;
}

dvfy-card-glow[padded] {
  padding: var(--dvfy-space-5);
}

dvfy-card-glow[elevated] {
  box-shadow: var(--dvfy-shadow-md);
}

dvfy-card-glow[interactive] {
  cursor: pointer;
  transition: transform var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
dvfy-card-glow[interactive]:active {
  transform: scale(0.99);
}
dvfy-card-glow[interactive]:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Hover effects — pointer devices only, reduced-motion excluded */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  dvfy-card-glow {
    transition: border-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }

  dvfy-card-glow:hover {
    border-color: transparent;
  }

  /* Glow layer — sits at inset: -1px behind the card background.
     With background-clip: padding-box and border-color: transparent on hover,
     the gradient becomes visible in the border zone as a glowing rim. */
  dvfy-card-glow::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: calc(var(--dvfy-radius-lg) + 1px);
    background: radial-gradient(
      circle var(--_cg-size) at var(--x) var(--y),
      var(--_cg-color),
      transparent 60%
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

class DvfyCardGlow extends HTMLElement {
  static #styled = false;

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
    if (!DvfyCardGlow.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCardGlow.#styled = true;
    }

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

customElements.define('dvfy-card-glow', DvfyCardGlow);
