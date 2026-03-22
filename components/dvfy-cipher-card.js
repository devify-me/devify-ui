/**
 * <dvfy-cipher-card> — Evervault-style cursor-reveal cipher card
 *
 * Card content continuously scrambles through random characters. A radial mask
 * follows the cursor, revealing the real text in a halo around the pointer —
 * a "decryption" visual inspired by Hyperplexed / Evervault.
 *
 * Two overlapping layers share the same character positions:
 *   1. Scrambled layer — always visible, all chars cycling through random glyphs
 *   2. Reveal layer    — real text, masked to the cursor halo only
 *
 * Attributes:
 *   padded:   boolean — add inner padding
 *   elevated: boolean — add shadow
 *   speed:    number  — scramble frames per second (default: 20)
 *   charset:  string  — characters to cycle through (default: A-Z a-z 0-9 symbols)
 *   radius:   number  — reveal halo radius in px (default: 140)
 *
 * CSS Custom Properties:
 *   --dvfy-cipher-card-scramble-color  Scrambled text color  (default: --dvfy-text-muted)
 *   --dvfy-cipher-card-radius          Halo reveal radius    (default: 140px)
 *
 * Usage:
 *   <dvfy-cipher-card padded elevated>Secret Feature Name</dvfy-cipher-card>
 *
 *   <dvfy-cipher-card padded speed="30" radius="180">
 *     Hover to decode this message
 *   </dvfy-cipher-card>
 */

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!?<>/\\|[]{}';

const STYLES = `
dvfy-cipher-card {
  display: block;
  font-family: var(--dvfy-font-mono, monospace);
  background: var(--dvfy-surface-raised);
  background-clip: padding-box;
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  user-select: none;

  --_cc-x: -999px;
  --_cc-y: -999px;
  --_cc-radius: var(--dvfy-cipher-card-radius, 140px);
  --_cc-scramble-color: var(--dvfy-cipher-card-scramble-color, var(--dvfy-text-muted, rgba(255,255,255,0.25)));
}

dvfy-cipher-card[elevated] {
  box-shadow: var(--dvfy-shadow-md);
}

.dvfy-cipher-layer {
  display: block;
}

dvfy-cipher-card[padded] .dvfy-cipher-layer {
  padding: var(--dvfy-space-5);
}

/* Bottom layer: scrambling characters, always visible */
.dvfy-cipher-scrambled {
  color: var(--_cc-scramble-color);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Top layer: real text, masked to the cursor halo */
.dvfy-cipher-reveal {
  position: absolute;
  inset: 0;
  color: var(--dvfy-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(
    circle var(--_cc-radius) at var(--_cc-x) var(--_cc-y),
    black 30%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--_cc-radius) at var(--_cc-x) var(--_cc-y),
    black 30%,
    transparent 100%
  );
}

dvfy-cipher-card[padded] .dvfy-cipher-reveal {
  padding: var(--dvfy-space-5);
}
`;

/**
 * Evervault-style card: text scrambles continuously and a radial cursor mask
 * reveals the real content in a halo around the pointer.
 *
 * @element dvfy-cipher-card
 *
 * @attr {boolean} padded - Add inner padding
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {number} speed - Scramble frames per second (default: 20)
 * @attr {string} charset - Custom scramble character set
 * @attr {number} radius - Reveal halo radius in pixels (default: 140)
 *
 * @slot - Text content to cipher-scramble
 *
 * @cssprop {color} --dvfy-cipher-card-scramble-color - Color of scrambled characters
 * @cssprop {length} --dvfy-cipher-card-radius - Cursor reveal halo radius
 */
class DvfyCipherCard extends HTMLElement {
  static #styled = false;

  /** @type {string} Original text */
  #text = '';
  /** @type {HTMLSpanElement[]} Spans in the scrambled layer */
  #scrambledSpans = [];
  /** @type {number|null} setInterval handle */
  #intervalId = null;

  connectedCallback() {
    if (!DvfyCipherCard.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCipherCard.#styled = true;
    }

    this.#text = this.textContent.trim();
    if (!this.#text) return;

    this.#render();
    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('mouseleave', this.#onMouseLeave);
    this.#startScramble();
  }

  disconnectedCallback() {
    this.#stopScramble();
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
  }

  static get observedAttributes() {
    return ['speed', 'charset', 'radius'];
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'speed') {
      this.#stopScramble();
      this.#startScramble();
    } else if (name === 'radius') {
      this.style.setProperty('--_cc-radius', `${this.getAttribute('radius') || 140}px`);
    }
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  #render() {
    const text = this.#text;

    this.setAttribute('aria-label', text);

    // Scrambled layer — chars will be replaced by JS
    const scrambledLayer = document.createElement('div');
    scrambledLayer.className = 'dvfy-cipher-layer dvfy-cipher-scrambled';
    scrambledLayer.setAttribute('aria-hidden', 'true');

    this.#scrambledSpans = [];
    for (const char of text) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : (char === '\n' ? '\n' : char);
      span.dataset.original = char;
      this.#scrambledSpans.push(span);
      scrambledLayer.appendChild(span);
    }

    // Reveal layer — always shows real text, masked to cursor halo
    const revealLayer = document.createElement('div');
    revealLayer.className = 'dvfy-cipher-layer dvfy-cipher-reveal';
    revealLayer.setAttribute('aria-hidden', 'true');
    revealLayer.textContent = text;

    this.textContent = '';
    this.appendChild(scrambledLayer);
    this.appendChild(revealLayer);

    // Apply radius attribute if set
    const radius = this.getAttribute('radius');
    if (radius) this.style.setProperty('--_cc-radius', `${radius}px`);
  }

  #onMouseMove = (e) => {
    const rect = this.getBoundingClientRect();
    this.style.setProperty('--_cc-x', `${e.clientX - rect.left}px`);
    this.style.setProperty('--_cc-y', `${e.clientY - rect.top}px`);
  };

  #onMouseLeave = () => {
    this.style.setProperty('--_cc-x', '-999px');
    this.style.setProperty('--_cc-y', '-999px');
  };

  #startScramble() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const speed = Math.max(1, parseInt(this.getAttribute('speed') || '20', 10));
    const charset = this.getAttribute('charset') || DEFAULT_CHARSET;
    const interval = Math.round(1000 / speed);

    this.#intervalId = setInterval(() => {
      for (const span of this.#scrambledSpans) {
        const original = span.dataset.original;
        if (original === ' ' || original === '\n') continue;
        span.textContent = charset[Math.floor(Math.random() * charset.length)];
      }
    }, interval);
  }

  #stopScramble() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }
}

customElements.define('dvfy-cipher-card', DvfyCipherCard);
