/**
 * <dvfy-scramble-hover> — Evervault-style character scramble text effect
 *
 * Characters scramble through random glyphs and resolve sequentially on hover,
 * creating a high-tech "decryption" aesthetic popularized by Evervault and Hyperplexed.
 *
 * Attributes:
 *   speed:    number  — Scramble iterations per second (default: 30)
 *   duration: number  — Total resolve time in ms (default: 800)
 *   charset:  string  — Characters to scramble through (default: uppercase A-Z + digits)
 *   trigger:  string  — "hover" | "auto" | "visible" (default: "hover")
 *
 * CSS Custom Properties:
 *   --dvfy-scramble-color         Text color during scramble (default: var(--dvfy-accent-brand))
 *   --dvfy-scramble-resolve-color Text color once resolved (default: inherit)
 *
 * Browser Support:
 *   All modern browsers. requestAnimationFrame + IntersectionObserver (visible trigger).
 *   prefers-reduced-motion: skip scramble, show final text immediately.
 *
 * Usage:
 *   <dvfy-scramble-hover>Hello World</dvfy-scramble-hover>
 *
 *   <dvfy-scramble-hover duration="600" trigger="visible">
 *     Decoded on scroll
 *   </dvfy-scramble-hover>
 *
 *   <dvfy-scramble-hover trigger="auto" speed="40">
 *     Auto-plays once
 *   </dvfy-scramble-hover>
 */

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?';

const STYLES = `
dvfy-scramble-hover {
  display: inline;
  cursor: default;
}

dvfy-scramble-hover .dvfy-scramble-char[data-scrambling] {
  color: var(--dvfy-scramble-color, var(--dvfy-accent-brand, #7c3aed));
}

dvfy-scramble-hover .dvfy-scramble-char {
  color: var(--dvfy-scramble-resolve-color, inherit);
  transition: color 0.1s ease;
}
`;

/**
 * Evervault-style character scramble on hover. Characters cycle through random
 * glyphs and resolve sequentially to reveal the original text.
 *
 * @element dvfy-scramble-hover
 *
 * @attr {number} speed - Scramble iterations per second (default: 30)
 * @attr {number} duration - Total resolve time in ms (default: 800)
 * @attr {string} charset - Custom scramble character set
 * @attr {string} trigger - hover | auto | visible (default: hover)
 *
 * @fires scramble-start - Scramble animation begins
 * @fires scramble-end - Scramble animation completes, all characters resolved
 *
 * @slot - Text content to scramble
 *
 * @cssprop {color} --dvfy-scramble-color - Color of unresolved scrambling characters
 * @cssprop {color} --dvfy-scramble-resolve-color - Color of resolved characters
 */
class DvfyScrambleHover extends HTMLElement {
  static #styled = false;

  /** @type {string} Original text extracted from slot */
  #originalText = '';
  /** @type {HTMLSpanElement[]} One span per character */
  #charSpans = [];
  /** @type {number|null} requestAnimationFrame handle */
  #rafId = null;
  /** @type {number|null} setInterval handle for scramble frames */
  #intervalId = null;
  /** @type {number} Frame counter used to schedule resolves */
  #frame = 0;
  /** @type {IntersectionObserver|null} */
  #observer = null;
  /** @type {boolean} Whether the current animation has completed */
  #done = false;
  /** @type {boolean} Cached prefers-reduced-motion state */
  #reducedMotion = false;
  /** @type {MediaQueryList|null} */
  #mql = null;
  #onMotionChange = (e) => { this.#reducedMotion = e.matches; };

  connectedCallback() {
    this.#mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.#reducedMotion = this.#mql.matches;
    this.#mql.addEventListener('change', this.#onMotionChange);
    if (!DvfyScrambleHover.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyScrambleHover.#styled = true;
    }

    this.#originalText = this.textContent.trim();
    if (!this.#originalText) return;

    this.#render();
    this.#attachTrigger();
  }

  disconnectedCallback() {
    this.#stop();
    if (this.#mql) {
      this.#mql.removeEventListener('change', this.#onMotionChange);
      this.#mql = null;
    }
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
    this.removeEventListener('mouseenter', this.#onEnter);
    this.removeEventListener('mouseleave', this.#onLeave);
    this.removeEventListener('focus', this.#onEnter);
    this.removeEventListener('blur', this.#onLeave);
  }

  static get observedAttributes() {
    return ['speed', 'duration', 'charset', 'trigger'];
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
    this.#start();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  #render() {
    const text = this.#originalText;

    // Screen-reader accessible label on the element itself
    this.setAttribute('aria-label', text);

    // Build spans for each character (spaces use &nbsp; for layout)
    const container = document.createDocumentFragment();

    // SR-only span with the actual text
    const srSpan = document.createElement('span');
    srSpan.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    srSpan.textContent = text;
    container.appendChild(srSpan);

    this.#charSpans = [];
    for (const char of text) {
      const span = document.createElement('span');
      span.className = 'dvfy-scramble-char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.dataset.original = char;
      this.#charSpans.push(span);
      container.appendChild(span);
    }

    this.textContent = '';
    this.appendChild(container);
  }

  #attachTrigger() {
    const trigger = this.getAttribute('trigger') || 'hover';

    if (trigger === 'hover') {
      this.addEventListener('mouseenter', this.#onEnter);
      this.addEventListener('mouseleave', this.#onLeave);
      this.addEventListener('focus', this.#onEnter);
      this.addEventListener('blur', this.#onLeave);
    } else if (trigger === 'auto') {
      // Small delay so the element is visible before playing
      requestAnimationFrame(() => this.#start());
    } else if (trigger === 'visible') {
      this.#observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !this.#done) {
              this.#start();
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
    this.removeEventListener('focus', this.#onEnter);
    this.removeEventListener('blur', this.#onLeave);
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }

  #onEnter = () => {
    this.#done = false;
    this.#start();
  };

  #onLeave = () => {
    // Let the current animation finish naturally; don't abruptly stop
  };

  #start() {
    // Respect reduced-motion: skip to final text immediately
    if (this.#reducedMotion) {
      this.#resolve();
      return;
    }

    this.#stop();
    this.#frame = 0;

    const speed = Math.max(1, parseInt(this.getAttribute('speed') || '30', 10));
    const duration = Math.max(100, parseInt(this.getAttribute('duration') || '800', 10));
    const charset = this.getAttribute('charset') || DEFAULT_CHARSET;
    const charCount = this.#charSpans.length;
    const interval = Math.round(1000 / speed);

    // How many frames it takes to resolve all characters
    const totalFrames = Math.round(duration / interval);

    this.dispatchEvent(new CustomEvent('scramble-start', { bubbles: true }));

    this.#intervalId = setInterval(() => {
      this.#frame++;
      const resolvedCount = Math.floor((this.#frame / totalFrames) * charCount);

      for (let i = 0; i < charCount; i++) {
        const span = this.#charSpans[i];
        const original = span.dataset.original;

        if (original === ' ') continue; // Never scramble spaces

        if (i < resolvedCount) {
          // Resolved — show original character, remove scrambling style
          span.textContent = original;
          span.removeAttribute('data-scrambling');
        } else {
          // Still scrambling — show random character
          span.textContent = charset[Math.floor(Math.random() * charset.length)];
          span.dataset.scrambling = '';
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
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.#frame = 0;
  }

  #resolve() {
    for (const span of this.#charSpans) {
      span.textContent = span.dataset.original === ' ' ? '\u00A0' : span.dataset.original;
      span.removeAttribute('data-scrambling');
    }
    this.#done = true;
    this.dispatchEvent(new CustomEvent('scramble-end', { bubbles: true }));
  }
}

customElements.define('dvfy-scramble-hover', DvfyScrambleHover);
