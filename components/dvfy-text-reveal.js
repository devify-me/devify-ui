/**
 * <dvfy-text-reveal> — Scroll-triggered text reveal animation
 *
 * Text reveals word-by-word, character-by-character, or line-by-line as the
 * element scrolls into the viewport, with staggered fade+slide transitions —
 * a cinematic reading experience for hero text and feature descriptions.
 *
 * Attributes:
 *   mode:     string — words | chars | lines  (default: "words")
 *   delay:    string — stagger delay per unit (default: "60ms")
 *   duration: string — transition duration    (default: "500ms")
 *   easing:   string — CSS easing function    (default: "ease-out")
 *   distance: string — initial Y offset       (default: "20px")
 *
 * CSS Custom Properties:
 *   --dvfy-text-reveal-delay     Override stagger delay per unit
 *   --dvfy-text-reveal-duration  Override transition duration
 *   --dvfy-text-reveal-easing    Override CSS easing
 *   --dvfy-text-reveal-distance  Override initial translateY distance
 *
 * Browser Support:
 *   IntersectionObserver: all modern browsers.
 *   prefers-reduced-motion: respected — instant reveal, no stagger.
 *
 * Usage:
 *   <dvfy-text-reveal>The quick brown fox jumps over the lazy dog.</dvfy-text-reveal>
 *
 *   <dvfy-text-reveal mode="chars" delay="30ms">
 *     Hello
 *   </dvfy-text-reveal>
 *
 *   <dvfy-text-reveal mode="lines" delay="100ms">
 *     <p>First line of hero text.</p>
 *     <p>Second line with <strong>bold</strong> and <a href="#">links</a>.</p>
 *   </dvfy-text-reveal>
 */

const STYLES = `
dvfy-text-reveal {
  display: block;
}

dvfy-text-reveal .dvfy-reveal-unit {
  display: inline-block;
  opacity: 0;
  transform: translateY(var(--dvfy-text-reveal-distance, 20px));
  transition:
    opacity var(--dvfy-text-reveal-duration, 500ms) var(--dvfy-text-reveal-easing, ease-out)
      calc(var(--_unit-index, 0) * var(--dvfy-text-reveal-delay, 60ms)),
    transform var(--dvfy-text-reveal-duration, 500ms) var(--dvfy-text-reveal-easing, ease-out)
      calc(var(--_unit-index, 0) * var(--dvfy-text-reveal-delay, 60ms));
}

dvfy-text-reveal[data-revealed] .dvfy-reveal-unit {
  opacity: 1;
  transform: translateY(0);
}

/* Lines render as block elements */
dvfy-text-reveal[data-mode="lines"] .dvfy-reveal-unit {
  display: block;
}

/* Reduced motion: instant reveal, no stagger */
@media (prefers-reduced-motion: reduce) {
  dvfy-text-reveal .dvfy-reveal-unit {
    transition-duration: 0.01ms;
    transition-delay: 0ms !important;
  }
}
`;

/**
 * Scroll-triggered staggered text reveal. Supports word, character, and line
 * split modes with configurable delay, duration, and easing.
 *
 * @element dvfy-text-reveal
 *
 * @attr {string} mode - Split mode: words | chars | lines (default: words)
 * @attr {string} delay - Stagger delay per unit, e.g. "60ms" (default: 60ms)
 * @attr {string} duration - Transition duration, e.g. "500ms" (default: 500ms)
 * @attr {string} easing - CSS easing function (default: ease-out)
 * @attr {string} distance - Initial translateY before reveal (default: 20px)
 *
 * @cssprop {time} --dvfy-text-reveal-delay - Per-unit stagger delay
 * @cssprop {time} --dvfy-text-reveal-duration - Transition duration
 * @cssprop {string} --dvfy-text-reveal-easing - CSS easing
 * @cssprop {length} --dvfy-text-reveal-distance - Initial Y offset
 *
 * @example
 * <dvfy-text-reveal mode="words" delay="60ms" easing="ease-out">
 *   The quick brown fox jumps over the lazy dog.
 * </dvfy-text-reveal>
 */
class DvfyTextReveal extends HTMLElement {
  static #styled = false;

  /** @type {Node[]} Snapshot of original child nodes (deep clones) before splitting */
  #originalNodes = [];
  /** @type {IntersectionObserver|null} */
  #observer = null;
  /** @type {boolean} Prevent re-triggering once revealed */
  #revealed = false;

  connectedCallback() {
    if (!DvfyTextReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTextReveal.#styled = true;
    }

    // Snapshot original children as deep clones for re-renders
    this.#originalNodes = [...this.childNodes].map(n => n.cloneNode(true));
    this.#build();
    this.#observe();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  static get observedAttributes() {
    return ['mode', 'delay', 'duration', 'easing', 'distance'];
  }

  attributeChangedCallback() {
    if (!this.isConnected || !this.#originalNodes.length) return;
    // Reset and rebuild on any attribute change
    this.#revealed = false;
    this.removeAttribute('data-revealed');
    // Restore original child nodes from snapshot
    this.replaceChildren(...this.#originalNodes.map(n => n.cloneNode(true)));
    this.#build();
    this.#observer?.disconnect();
    this.#observe();
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  #build() {
    const mode = this.getAttribute('mode') || 'words';
    this.dataset.mode = mode;

    // Apply CSS custom property overrides from attributes
    const delay    = this.getAttribute('delay');
    const duration = this.getAttribute('duration');
    const easing   = this.getAttribute('easing');
    const distance = this.getAttribute('distance');

    if (delay)    this.style.setProperty('--dvfy-text-reveal-delay',    delay);
    if (duration) this.style.setProperty('--dvfy-text-reveal-duration', duration);
    if (easing)   this.style.setProperty('--dvfy-text-reveal-easing',   easing);
    if (distance) this.style.setProperty('--dvfy-text-reveal-distance', distance);

    const indexRef = { i: 0 };

    if (mode === 'lines') {
      this.#splitLines(indexRef);
    } else {
      this.#walkAndSplit(this, mode, indexRef);
    }

    // Expose full text via aria-label so screen readers bypass the spans
    this.setAttribute('aria-label', this.textContent.trim());
    for (const span of this.querySelectorAll('.dvfy-reveal-unit')) {
      span.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Recursively walks the element tree and splits text nodes into per-word or
   * per-character spans, leaving element nodes (bold, links, etc.) intact.
   */
  #walkAndSplit(node, mode, indexRef) {
    const children = [...node.childNodes];
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (!text) continue;

        const frag = document.createDocumentFragment();

        if (mode === 'chars') {
          for (const char of text) {
            if (/\s/.test(char)) {
              // Preserve whitespace as raw text nodes (not animated units)
              frag.appendChild(document.createTextNode(char));
            } else {
              frag.appendChild(this.#makeUnit(char, indexRef.i++));
            }
          }
        } else {
          // words (default): split preserving whitespace tokens
          const parts = text.split(/(\s+)/);
          for (const part of parts) {
            if (!part) continue;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              frag.appendChild(this.#makeUnit(part, indexRef.i++));
            }
          }
        }

        child.parentNode.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Recurse into element children — preserves <strong>, <a>, etc.
        this.#walkAndSplit(child, mode, indexRef);
      }
    }
  }

  /**
   * Lines mode: each direct child element becomes one animated unit.
   * For plain-text content, splits on newline characters.
   */
  #splitLines(indexRef) {
    const children = [...this.childNodes];
    const hasElements = children.some(c => c.nodeType === Node.ELEMENT_NODE);

    if (hasElements) {
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const wrapper = this.#makeUnit('', indexRef.i++);
          child.parentNode.insertBefore(wrapper, child);
          wrapper.appendChild(child);
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
          // Stray text between block elements — animate as a line
          const wrapper = this.#makeUnit(child.textContent.trim(), indexRef.i++);
          child.parentNode.replaceChild(wrapper, child);
        }
      }
    } else {
      // Plain text: split by newline
      const raw = this.textContent;
      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      this.replaceChildren();
      if (lines.length <= 1) {
        this.appendChild(this.#makeUnit(raw.trim(), indexRef.i++));
      } else {
        for (const line of lines) {
          this.appendChild(this.#makeUnit(line, indexRef.i++));
        }
      }
    }
  }

  /** Create a reveal unit span */
  #makeUnit(text, index) {
    const span = document.createElement('span');
    span.className = 'dvfy-reveal-unit';
    span.style.setProperty('--_unit-index', index);
    if (text) span.textContent = text;
    return span;
  }

  #observe() {
    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.#revealed) {
            this.#reveal();
          }
        }
      },
      { rootMargin: '-10% 0px -10% 0px', threshold: 0 },
    );
    this.#observer.observe(this);
  }

  #reveal() {
    this.#revealed = true;
    this.setAttribute('data-revealed', '');
    this.#observer?.disconnect();
    this.#observer = null;
    this.dispatchEvent(new CustomEvent('reveal', { bubbles: true }));
  }
}

customElements.define('dvfy-text-reveal', DvfyTextReveal);
