/**
 * <dvfy-spotlight-reveal> — cursor spotlight clip-path image reveal
 *
 * A circular clip-path mask follows the cursor, revealing a hidden layer
 * beneath — useful for before/after comparisons, theme reveals, or
 * interactive image exploration.
 *
 * The base slot is always visible; the default slot is revealed only inside
 * the spotlight circle. Both JS and CSS-custom-property updates run at 60fps
 * with no layout recalculation.
 *
 * @element dvfy-spotlight-reveal
 *
 * @attr {number} size - Spotlight radius in px (default: 150)
 * @attr {string} shape - "circle" | "ellipse" (default: "circle")
 * @attr {boolean} smooth - Enable soft 80ms follow transition
 *
 * @slot - Reveal layer (shown inside the spotlight)
 * @slot base - Base layer (always visible, sets component height)
 *
 * @cssprop {length} --dvfy-spotlight-reveal-size - Spotlight radius (default: 150px)
 * @cssprop {length} --dvfy-spotlight-reveal-rx - Ellipse x-radius
 * @cssprop {length} --dvfy-spotlight-reveal-ry - Ellipse y-radius
 *
 * @example
 * <dvfy-spotlight-reveal size="180">
 *   <img slot="base" src="before.jpg" alt="Before" style="width:100%">
 *   <img src="after.jpg" alt="After" style="width:100%;height:100%;object-fit:cover">
 * </dvfy-spotlight-reveal>
 */

const STYLES = `
dvfy-spotlight-reveal {
  display: block;
  position: relative;
  overflow: hidden;
  font-family: var(--dvfy-font-sans);
  cursor: crosshair;
  --x: -999px;
  --y: -999px;
  --_sr-size: var(--dvfy-spotlight-reveal-size, 150px);
  --_sr-rx: var(--dvfy-spotlight-reveal-rx, var(--_sr-size));
  --_sr-ry: var(--dvfy-spotlight-reveal-ry, var(--_sr-size));
}

/* Base layer — always visible, provides natural height */
dvfy-spotlight-reveal > [slot="base"] {
  display: block;
  width: 100%;
}

/* Reveal layer — clip-path follows cursor, sits above base */
dvfy-spotlight-reveal > :not([slot]) {
  position: absolute;
  inset: 0;
  clip-path: circle(var(--_sr-size) at var(--x) var(--y));
  pointer-events: none;
  will-change: clip-path;
  overflow: hidden;
}

dvfy-spotlight-reveal[shape="ellipse"] > :not([slot]) {
  clip-path: ellipse(var(--_sr-rx) var(--_sr-ry) at var(--x) var(--y));
}

/* Smooth follow transition */
dvfy-spotlight-reveal[smooth] > :not([slot]) {
  transition: clip-path 80ms var(--dvfy-ease-out, ease-out);
}

/* Touch: full reveal toggled by tap */
dvfy-spotlight-reveal[revealed] > :not([slot]) {
  clip-path: circle(200% at center) !important;
  transition: clip-path 0.3s var(--dvfy-ease-out, ease-out) !important;
}

/* Collapsed state after un-tap */
dvfy-spotlight-reveal[revealed="false"] > :not([slot]) {
  clip-path: circle(0% at center) !important;
  transition: clip-path 0.3s var(--dvfy-ease-out, ease-out) !important;
}

@media (prefers-reduced-motion: reduce) {
  dvfy-spotlight-reveal > :not([slot]),
  dvfy-spotlight-reveal[smooth] > :not([slot]) {
    transition: none !important;
  }
}
`;

/**
 * Cursor spotlight clip-path image reveal — moves a circular mask over a
 * layered reveal, showing hidden content only inside the spotlight.
 *
 * @element dvfy-spotlight-reveal
 */
class DvfySpotlightReveal extends HTMLElement {
  static #styled = false;
  static observedAttributes = ['size', 'shape'];

  #touchMoved = false;
  #fullyRevealed = false;

  #onMouseMove = (e) => {
    const rect = this.getBoundingClientRect();
    this.style.setProperty('--x', `${e.clientX - rect.left}px`);
    this.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  #onMouseLeave = () => {
    this.style.setProperty('--x', '-999px');
    this.style.setProperty('--y', '-999px');
  };

  #onTouchStart = (e) => {
    this.#touchMoved = false;
    const touch = e.touches[0];
    const rect = this.getBoundingClientRect();
    this.style.setProperty('--x', `${touch.clientX - rect.left}px`);
    this.style.setProperty('--y', `${touch.clientY - rect.top}px`);
  };

  #onTouchMove = (e) => {
    e.preventDefault();
    this.#touchMoved = true;
    const touch = e.touches[0];
    const rect = this.getBoundingClientRect();
    this.style.setProperty('--x', `${touch.clientX - rect.left}px`);
    this.style.setProperty('--y', `${touch.clientY - rect.top}px`);
  };

  #onTouchEnd = () => {
    if (this.#touchMoved) {
      // Drag ended — hide spotlight
      this.style.setProperty('--x', '-999px');
      this.style.setProperty('--y', '-999px');
    } else {
      // Tap — toggle full reveal
      this.#fullyRevealed = !this.#fullyRevealed;
      if (this.#fullyRevealed) {
        this.setAttribute('revealed', '');
      } else {
        this.setAttribute('revealed', 'false');
        // Remove attribute after transition so CSS class doesn't linger
        setTimeout(() => {
          if (!this.#fullyRevealed) this.removeAttribute('revealed');
        }, 350);
      }
    }
  };

  #syncSize() {
    const size = parseInt(this.getAttribute('size') || '150', 10);
    this.style.setProperty('--_sr-size', `${size}px`);
    this.style.setProperty('--_sr-rx', `${size}px`);
    this.style.setProperty('--_sr-ry', `${Math.round(size * 0.6)}px`);
  }

  connectedCallback() {
    if (!DvfySpotlightReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfySpotlightReveal.#styled = true;
    }

    this.#syncSize();

    if (!this.getAttribute('role')) this.setAttribute('role', 'img');

    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('mouseleave', this.#onMouseLeave);
    this.addEventListener('touchstart', this.#onTouchStart, { passive: true });
    this.addEventListener('touchmove', this.#onTouchMove, { passive: false });
    this.addEventListener('touchend', this.#onTouchEnd);
  }

  disconnectedCallback() {
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
    this.removeEventListener('touchstart', this.#onTouchStart);
    this.removeEventListener('touchmove', this.#onTouchMove);
    this.removeEventListener('touchend', this.#onTouchEnd);
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'size') this.#syncSize();
  }
}

customElements.define('dvfy-spotlight-reveal', DvfySpotlightReveal);
