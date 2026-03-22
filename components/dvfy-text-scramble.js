/**
 * <dvfy-text-scramble> — Evervault-style character scramble with gradient-reveal wave
 *
 * Characters scramble through random glyphs and resolve sequentially left-to-right.
 * A CSS gradient sweep (via background-clip: text) creates a visible "decryption wave"
 * as characters resolve — distinct from dvfy-scramble-hover's per-character coloring.
 *
 * Popularized by Hyperplexed recreating the Evervault website effect.
 * Ref: https://codepen.io/Hyperplexed/pen/VwqLQbo
 *
 * @element dvfy-text-scramble
 *
 * @attr {number} speed - Scramble frames per second (default: 25)
 * @attr {number} duration - Total resolve duration in ms (default: 1000)
 * @attr {string} charset - Characters to scramble through (default: A-Z + digits + symbols)
 * @attr {string} trigger - hover | click | auto | visible (default: hover)
 * @attr {number} delay - Delay before scramble starts in ms (default: 0)
 *
 * @fires scramble-start - Dispatched when scramble animation begins
 * @fires scramble-end - Dispatched when all characters have resolved
 *
 * @slot - Text content to scramble
 *
 * @cssprop {color} --dvfy-ts-scramble-color - Color of unresolved scrambling chars (default: var(--dvfy-accent-brand))
 * @cssprop {color} --dvfy-ts-resolve-color - Color of resolved chars (default: currentColor)
 * @cssprop {length} --dvfy-ts-wave-width - Width of the gradient transition zone (default: 30%)
 *
 * @example
 * <dvfy-text-scramble>Hello World</dvfy-text-scramble>
 *
 * @example
 * <dvfy-text-scramble trigger="click" duration="600" charset="01">
 *   Binary reveal
 * </dvfy-text-scramble>
 *
 * @example
 * <dvfy-text-scramble trigger="visible" delay="200">
 *   Decoded on scroll
 * </dvfy-text-scramble>
 */

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?';

const STYLES = `
dvfy-text-scramble {
  display: inline;
  cursor: default;
}

dvfy-text-scramble .dvfy-ts-chars {
  display: inline;
  background: linear-gradient(
    to right,
    var(--dvfy-ts-resolve-color, currentColor) var(--_dvfy-ts-p, 0%),
    var(--dvfy-ts-scramble-color, var(--dvfy-accent-brand, #7c3aed))
      calc(var(--_dvfy-ts-p, 0%) + var(--dvfy-ts-wave-width, 30%))
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

dvfy-text-scramble .dvfy-ts-chars[data-resolved] {
  background: none;
  -webkit-text-fill-color: unset;
}

@media (prefers-reduced-motion: reduce) {
  dvfy-text-scramble .dvfy-ts-chars {
    background: none;
    -webkit-text-fill-color: unset;
  }
}
`;

class DvfyTextScramble extends HTMLElement {
  static #styled = false;

  /** @type {string} Original text extracted from slot */
  #originalText = '';
  /** @type {HTMLSpanElement[]} One span per visible character */
  #charSpans = [];
  /** @type {HTMLElement|null} Wrapper for visible (scrambling) chars */
  #charsEl = null;
  /** @type {number|null} setInterval handle */
  #intervalId = null;
  /** @type {number|null} setTimeout handle for delay */
  #delayId = null;
  /** @type {number} Current frame counter */
  #frame = 0;
  /** @type {IntersectionObserver|null} */
  #observer = null;
  /** @type {boolean} Whether animation has fully resolved */
  #done = false;

  connectedCallback() {
    if (!DvfyTextScramble.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTextScramble.#styled = true;
    }

    this.#originalText = this.textContent.trim();
    if (!this.#originalText) return;

    this.#render();
    this.#attachTrigger();
  }

  disconnectedCallback() {
    this.#stop();
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
    this.removeEventListener('mouseenter', this.#onEnter);
    this.removeEventListener('mouseleave', this.#onLeave);
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('focus', this.#onEnter);
    this.removeEventListener('blur', this.#onLeave);
  }

  static get observedAttributes() {
    return ['speed', 'duration', 'charset', 'trigger', 'delay'];
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'trigger') {
      this.#detachTrigger();
      this.#attachTrigger();
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Start scramble animation programmatically */
  play() {
    this.#done = false;
    this.#scheduleStart();
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  #render() {
    const text = this.#originalText;

    // SR-only element for screen readers (always shows original text)
    const srSpan = document.createElement('span');
    srSpan.style.cssText =
      'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    srSpan.textContent = text;
    srSpan.setAttribute('aria-hidden', 'false');

    // Visible chars wrapper — gradient is applied here
    this.#charsEl = document.createElement('span');
    this.#charsEl.className = 'dvfy-ts-chars';
    this.#charsEl.setAttribute('aria-hidden', 'true');

    this.#charSpans = [];
    for (const char of text) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.dataset.original = char;
      this.#charSpans.push(span);
      this.#charsEl.appendChild(span);
    }

    // Start resolved (gradient covers full width = resolved state)
    this.#charsEl.style.setProperty('--_dvfy-ts-p', '100%');
    this.#charsEl.dataset.resolved = '';

    this.textContent = '';
    this.appendChild(srSpan);
    this.appendChild(this.#charsEl);
  }

  #attachTrigger() {
    const trigger = this.getAttribute('trigger') || 'hover';

    if (trigger === 'hover') {
      this.addEventListener('mouseenter', this.#onEnter);
      this.addEventListener('mouseleave', this.#onLeave);
      this.addEventListener('focus', this.#onEnter);
      this.addEventListener('blur', this.#onLeave);
    } else if (trigger === 'click') {
      this.addEventListener('click', this.#onClick);
      this.style.cursor = 'pointer';
    } else if (trigger === 'auto') {
      requestAnimationFrame(() => this.#scheduleStart());
    } else if (trigger === 'visible') {
      this.#observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !this.#done) {
              this.#scheduleStart();
              this.#observer.disconnect();
              this.#observer = null;
            }
          }
        },
        { rootMargin: '-10% 0px -10% 0px' },
      );
      this.#observer.observe(this);
    }
  }

  #detachTrigger() {
    this.removeEventListener('mouseenter', this.#onEnter);
    this.removeEventListener('mouseleave', this.#onLeave);
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('focus', this.#onEnter);
    this.removeEventListener('blur', this.#onLeave);
    this.style.cursor = '';
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }

  #onEnter = () => {
    this.#done = false;
    this.#scheduleStart();
  };

  #onLeave = () => {
    // Let animation finish naturally
  };

  #onClick = () => {
    if (this.#done || this.#intervalId === null) {
      this.#done = false;
      this.#scheduleStart();
    }
  };

  #scheduleStart() {
    const delay = Math.max(0, parseInt(this.getAttribute('delay') || '0', 10));
    if (delay > 0) {
      if (this.#delayId !== null) clearTimeout(this.#delayId);
      this.#delayId = setTimeout(() => {
        this.#delayId = null;
        this.#start();
      }, delay);
    } else {
      this.#start();
    }
  }

  #start() {
    // Respect reduced-motion: resolve immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.#resolve();
      return;
    }

    this.#stop();
    this.#frame = 0;

    // Reset to scrambled state
    if (this.#charsEl) {
      this.#charsEl.style.setProperty('--_dvfy-ts-p', '0%');
      this.#charsEl.removeAttribute('data-resolved');
    }

    const speed = Math.max(1, parseInt(this.getAttribute('speed') || '25', 10));
    const duration = Math.max(100, parseInt(this.getAttribute('duration') || '1000', 10));
    const charset = this.getAttribute('charset') || DEFAULT_CHARSET;
    const charCount = this.#charSpans.length;
    const interval = Math.round(1000 / speed);
    const totalFrames = Math.round(duration / interval);

    this.dispatchEvent(new CustomEvent('scramble-start', { bubbles: true }));

    this.#intervalId = setInterval(() => {
      this.#frame++;
      const progress = Math.min(this.#frame / totalFrames, 1);
      const resolvedCount = Math.floor(progress * charCount);

      // Update gradient sweep position
      const pct = Math.round(progress * 100);
      this.#charsEl?.style.setProperty('--_dvfy-ts-p', `${pct}%`);

      for (let i = 0; i < charCount; i++) {
        const span = this.#charSpans[i];
        const original = span.dataset.original;

        if (original === ' ') continue;

        if (i < resolvedCount) {
          span.textContent = original;
        } else {
          span.textContent = charset[Math.floor(Math.random() * charset.length)];
        }
      }

      if (this.#frame >= totalFrames) {
        this.#stop();
        this.#resolve();
      }
    }, interval);
  }

  #stop() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    if (this.#delayId !== null) {
      clearTimeout(this.#delayId);
      this.#delayId = null;
    }
    this.#frame = 0;
  }

  #resolve() {
    for (const span of this.#charSpans) {
      span.textContent = span.dataset.original === ' ' ? '\u00A0' : span.dataset.original;
    }
    if (this.#charsEl) {
      this.#charsEl.style.setProperty('--_dvfy-ts-p', '100%');
      this.#charsEl.dataset.resolved = '';
    }
    this.#done = true;
    this.dispatchEvent(new CustomEvent('scramble-end', { bubbles: true }));
  }
}

customElements.define('dvfy-text-scramble', DvfyTextScramble);
