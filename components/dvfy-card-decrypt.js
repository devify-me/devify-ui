/**
 * <dvfy-card-decrypt> — Evervault-style character scramble reveal card
 *
 * On hover, a matrix of scrambled characters appears over the card following
 * the cursor. A radial gradient creates a transparent "window" at the cursor
 * center, surrounded by a ring of scrambling characters, revealing the content
 * beneath. Inspired by the Evervault website interaction.
 *
 * Source: Hyperplexed — https://youtu.be/oIm6qKTtmH4
 *
 * @attr {boolean} padded - Add padding to the card
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {string} charset - Character set to scramble through (default: alphanumeric + symbols)
 * @attr {number} speed - Character refresh rate in Hz (default: 20)
 *
 * @fires decrypt-enter - Fires when hover/scramble begins
 * @fires decrypt-leave - Fires when hover ends and scramble stops
 *
 * @slot - Card content
 *
 * @cssprop {color} --dvfy-card-decrypt-color - Scramble character color
 * @cssprop {length} --dvfy-card-decrypt-size - Spotlight radius (default: 200px)
 *
 * @example
 * <dvfy-card-decrypt padded elevated>
 *   <h3>Secure Content</h3>
 *   <p>Hover to reveal</p>
 * </dvfy-card-decrypt>
 */

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!?';

/** Approximate character cell dimensions (px) at 0.7rem monospace */
const CHAR_W = 8;
const CHAR_H = 11;

const STYLES = `
dvfy-card-decrypt {
  display: block;
  position: relative;
  isolation: isolate;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  overflow: hidden;
  --x: -999px;
  --y: -999px;
}

dvfy-card-decrypt[padded] {
  padding: var(--dvfy-space-5);
}

dvfy-card-decrypt[elevated] {
  box-shadow: var(--dvfy-shadow-md);
}

/* Lift slotted content above the overlay */
dvfy-card-decrypt > *:not(.dvfy-card-decrypt__overlay) {
  position: relative;
  z-index: 1;
}

/* Scramble overlay — fills the entire card surface */
dvfy-card-decrypt .dvfy-card-decrypt__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;

  font-family: 'Courier New', Courier, monospace;
  font-size: 0.7rem;
  line-height: 1.25;
  letter-spacing: 0.05em;
  color: var(--dvfy-card-decrypt-color, var(--dvfy-accent-brand, #7c3aed));
  word-break: break-all;

  /* Dark ring around cursor; transparent center lets content show through */
  background: radial-gradient(
    circle var(--dvfy-card-decrypt-size, 150px) at var(--x) var(--y),
    transparent 35%,
    rgba(0, 0, 0, 0.88) 65%,
    rgba(0, 0, 0, 0.88)
  );

  /* Spotlight mask — overlay only visible near the cursor */
  -webkit-mask-image: radial-gradient(
    circle calc(var(--dvfy-card-decrypt-size, 150px) * 1.6) at var(--x) var(--y),
    #fff 30%,
    transparent 70%
  );
  mask-image: radial-gradient(
    circle calc(var(--dvfy-card-decrypt-size, 150px) * 1.6) at var(--x) var(--y),
    #fff 30%,
    transparent 70%
  );

  opacity: 0;
  transition: opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}

@media (hover: hover) {
  dvfy-card-decrypt[data-hovered] .dvfy-card-decrypt__overlay {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  dvfy-card-decrypt .dvfy-card-decrypt__overlay {
    display: none;
  }
}
`;

class DvfyCardDecrypt extends HTMLElement {
  static #styled = false;

  /** @type {HTMLDivElement|null} */
  #overlay = null;
  /** @type {number|null} */
  #intervalId = null;
  /** @type {number} cached char count to fill the overlay */
  #charCount = 200;
  /** @type {ResizeObserver|null} */
  #resizeObserver = null;

  connectedCallback() {
    if (!DvfyCardDecrypt.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCardDecrypt.#styled = true;
    }

    this.#createOverlay();
    this.#observeSize();
    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('mouseleave', this.#onMouseLeave);
  }

  disconnectedCallback() {
    this.#stopScramble();
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  #createOverlay() {
    this.#overlay = document.createElement('div');
    this.#overlay.className = 'dvfy-card-decrypt__overlay';
    this.#overlay.setAttribute('aria-hidden', 'true');
    this.appendChild(this.#overlay);
    this.#recalcCharCount();
    this.#fillOverlay();
  }

  #observeSize() {
    this.#resizeObserver = new ResizeObserver(() => {
      this.#recalcCharCount();
      if (this.#intervalId !== null) this.#fillOverlay();
    });
    this.#resizeObserver.observe(this);
  }

  #recalcCharCount() {
    const rect = this.getBoundingClientRect();
    const cols = Math.ceil(rect.width / CHAR_W) + 2;
    const rows = Math.ceil(rect.height / CHAR_H) + 2;
    this.#charCount = Math.max(cols * rows, 100);
  }

  #fillOverlay() {
    if (!this.#overlay) return;
    const charset = this.getAttribute('charset') || DEFAULT_CHARSET;
    const len = charset.length;
    const count = this.#charCount;
    let text = '';
    for (let i = 0; i < count; i++) {
      text += charset[Math.floor(Math.random() * len)];
    }
    this.#overlay.textContent = text;
  }

  #startScramble() {
    if (this.#intervalId !== null) return;
    const speed = Math.max(1, parseInt(this.getAttribute('speed') || '20', 10));
    const interval = Math.round(1000 / speed);
    this.#intervalId = setInterval(() => this.#fillOverlay(), interval);
  }

  #stopScramble() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }

  #onMouseMove = (e) => {
    const rect = this.getBoundingClientRect();
    this.style.setProperty('--x', `${e.clientX - rect.left}px`);
    this.style.setProperty('--y', `${e.clientY - rect.top}px`);

    if (!this.hasAttribute('data-hovered')) {
      this.setAttribute('data-hovered', '');
      this.#startScramble();
      this.dispatchEvent(new CustomEvent('decrypt-enter', { bubbles: true }));
    }
  };

  #onMouseLeave = () => {
    this.removeAttribute('data-hovered');
    this.#stopScramble();
    this.style.setProperty('--x', '-999px');
    this.style.setProperty('--y', '-999px');
    this.dispatchEvent(new CustomEvent('decrypt-leave', { bubbles: true }));
  };
}

customElements.define('dvfy-card-decrypt', DvfyCardDecrypt);
