/**
 * <dvfy-cipher-card> — Hyperplexed-style decryption hover card
 *
 * Randomized ASCII characters fill a radial gradient mask that follows the
 * cursor, creating a "cipher decryption" illusion. Inspired by Evervault
 * (codepen.io/3BIK8/pen/dyQKKMJ) and Hyperplexed (codepen.io/Hyperplexed/pen/MWQeYLW).
 *
 * Technique:
 *   1. JS tracks cursor position within the card via mousemove
 *   2. A CSS radial gradient mask follows the cursor (--x/--y)
 *   3. Random characters fill the cipher overlay; only the area under the
 *      gradient mask is revealed, creating the decryption illusion
 *   4. requestAnimationFrame throttles character regeneration for performance
 *
 * Attributes:
 *   charset:   string  — "ascii" | "hex" | "binary" | custom string  (default: "ascii")
 *   glow-size: number  — Radial gradient radius in px                 (default: 200)
 *   elevated:  boolean — Add box-shadow elevation
 *   padded:    boolean — Add padding
 *   interactive: boolean — Cursor pointer + active scale
 *
 * CSS Custom Properties:
 *   --dvfy-cipher-card-glow-color  Mask reveal color  (default: var(--dvfy-accent-brand))
 *   --dvfy-cipher-card-char-color  Cipher text color  (default: same as glow)
 *   --dvfy-cipher-card-size        Gradient radius override (default: 200px)
 *
 * Usage:
 *   <dvfy-cipher-card padded>
 *     <h3>Feature Title</h3>
 *     <p>Description here</p>
 *   </dvfy-cipher-card>
 *
 *   <dvfy-cipher-card charset="hex" glow-size="250" padded elevated>
 *     Hex cipher card
 *   </dvfy-cipher-card>
 */

const CHARSETS = {
  ascii:  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>[]{}',
  hex:    '0123456789ABCDEF',
  binary: '01',
};

const COLS = 20;
const ROWS = 8;

const STYLES = `
dvfy-cipher-card {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  position: relative;
  overflow: hidden;
  isolation: isolate;

  --_cc-glow: var(--dvfy-cipher-card-glow-color, var(--dvfy-accent-brand, #7c3aed));
  --_cc-size: var(--dvfy-cipher-card-size, 200px);
  --x: -999px;
  --y: -999px;
}

/* Lift slotted content above the cipher overlay */
dvfy-cipher-card > *:not(.dvfy-cc-overlay) {
  position: relative;
  z-index: 1;
}

/* Cipher overlay — sits over the card content, masked to cursor vicinity */
dvfy-cipher-card .dvfy-cc-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;

  display: grid;
  grid-template-columns: repeat(${COLS}, 1fr);
  grid-template-rows: repeat(${ROWS}, 1fr);
  align-items: center;
  justify-items: center;

  /* Radial gradient mask — only characters near the cursor are revealed */
  -webkit-mask-image: radial-gradient(
    circle var(--_cc-size) at var(--x) var(--y),
    black 0%,
    transparent 70%
  );
  mask-image: radial-gradient(
    circle var(--_cc-size) at var(--x) var(--y),
    black 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}

dvfy-cipher-card.dvfy-cc--active .dvfy-cc-overlay {
  opacity: 1;
}

dvfy-cipher-card .dvfy-cc-char {
  font-family: var(--dvfy-font-mono, monospace);
  font-size: 0.65rem;
  font-weight: var(--dvfy-weight-semibold, 600);
  color: var(--dvfy-cipher-card-char-color, var(--_cc-glow));
  line-height: 1;
  user-select: none;
  pointer-events: none;
}

/* Padded */
dvfy-cipher-card[padded] {
  padding: var(--dvfy-space-5);
}

/* Elevated */
dvfy-cipher-card[elevated] {
  box-shadow: var(--dvfy-shadow-md);
}

/* Interactive */
dvfy-cipher-card[interactive] {
  cursor: pointer;
  transition: transform var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              box-shadow var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
dvfy-cipher-card[interactive]:active {
  transform: scale(0.99);
}
dvfy-cipher-card[interactive]:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

@media (prefers-reduced-motion: reduce) {
  dvfy-cipher-card .dvfy-cc-overlay {
    display: none;
  }
}
`;

/**
 * Interactive card with a cipher/decryption hover effect. Randomized characters
 * fill the card and are revealed only under a radial gradient cursor mask.
 *
 * @element dvfy-cipher-card
 *
 * @attr {string} charset - Character set: ascii | hex | binary | custom string (default: ascii)
 * @attr {number} glow-size - Radial mask radius in px (default: 200)
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {boolean} padded - Enable padding
 * @attr {boolean} interactive - Enable cursor pointer and active scale
 *
 * @slot - Card content (always readable, cipher is decorative overlay)
 *
 * @cssprop {color} --dvfy-cipher-card-glow-color - Mask reveal / character color
 * @cssprop {color} --dvfy-cipher-card-char-color - Override character color independently
 * @cssprop {length} --dvfy-cipher-card-size - Radial mask radius override
 */
class DvfyCipherCard extends HTMLElement {
  static #styled = false;

  /** @type {HTMLElement[]} Grid of character spans */
  #chars = [];
  /** @type {HTMLDivElement|null} */
  #overlay = null;
  /** @type {number|null} requestAnimationFrame handle */
  #rafId = null;
  /** @type {boolean} Whether cursor is over the card */
  #hovering = false;

  connectedCallback() {
    if (!DvfyCipherCard.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCipherCard.#styled = true;
    }

    this.#buildOverlay();
    this.#attachEvents();

    if (this.hasAttribute('interactive')) {
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    }
  }

  disconnectedCallback() {
    this.#stopAnimation();
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
    this.removeEventListener('mouseenter', this.#onMouseEnter);
  }

  static get observedAttributes() {
    return ['charset', 'glow-size', 'interactive'];
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'charset') {
      // Charset changes are picked up live in #nextFrame
      return;
    }
    if (name === 'glow-size') {
      const size = parseInt(this.getAttribute('glow-size') || '200', 10);
      this.style.setProperty('--_cc-size', `${size}px`);
      return;
    }
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

  // ─── Private ───────────────────────────────────────────────────────────────

  #buildOverlay() {
    // Remove existing overlay if any (e.g., on reconnect)
    this.#overlay?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'dvfy-cc-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    this.#chars = [];
    const total = COLS * ROWS;
    for (let i = 0; i < total; i++) {
      const span = document.createElement('span');
      span.className = 'dvfy-cc-char';
      span.textContent = ' ';
      overlay.appendChild(span);
      this.#chars.push(span);
    }

    this.appendChild(overlay);
    this.#overlay = overlay;

    // Apply glow-size attr if set
    const glowSize = this.getAttribute('glow-size');
    if (glowSize) {
      const px = parseInt(glowSize, 10);
      if (!isNaN(px)) this.style.setProperty('--_cc-size', `${px}px`);
    }
  }

  #attachEvents() {
    this.addEventListener('mouseenter', this.#onMouseEnter);
    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('mouseleave', this.#onMouseLeave);
  }

  #onMouseEnter = () => {
    this.#hovering = true;
    this.classList.add('dvfy-cc--active');
    this.#startAnimation();
  };

  #onMouseMove = (e) => {
    const rect = this.getBoundingClientRect();
    this.style.setProperty('--x', `${e.clientX - rect.left}px`);
    this.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  #onMouseLeave = () => {
    this.#hovering = false;
    this.classList.remove('dvfy-cc--active');
    this.style.setProperty('--x', '-999px');
    this.style.setProperty('--y', '-999px');
    this.#stopAnimation();
  };

  #startAnimation() {
    if (this.#rafId !== null) return;
    const loop = () => {
      if (!this.#hovering) return;
      this.#nextFrame();
      this.#rafId = requestAnimationFrame(loop);
    };
    this.#rafId = requestAnimationFrame(loop);
  }

  #stopAnimation() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  #nextFrame() {
    const rawCharset = this.getAttribute('charset') || 'ascii';
    const charset = CHARSETS[rawCharset] ?? rawCharset;
    const len = charset.length;

    for (const span of this.#chars) {
      span.textContent = charset[Math.floor(Math.random() * len)];
    }
  }
}

customElements.define('dvfy-cipher-card', DvfyCipherCard);
