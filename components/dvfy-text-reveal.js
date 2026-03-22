/**
 * <dvfy-text-reveal> — Staggered scroll-triggered text animation
 *
 * Words or characters fade+slide into view as the element enters the viewport.
 * Each token gets an index-based transition-delay so they stagger in sequence.
 * An IntersectionObserver triggers the animation; CSS handles the stagger.
 *
 * @element dvfy-text-reveal
 *
 * @attr {string} split - Tokenise by "word" (default) or "char"
 * @attr {string} animation - "fade-up" (default) | "fade" | "slide-left"
 * @attr {number} stagger - Delay increment per token in ms (default: 60)
 * @attr {boolean} once - When present, animate only on first intersection
 *
 * @slot - Text content to animate
 *
 * @cssprop {color} --dvfy-text-reveal-color - Text colour (default: inherit)
 *
 * @example
 * <dvfy-text-reveal>Hello beautiful world</dvfy-text-reveal>
 *
 * @example
 * <dvfy-text-reveal split="char" animation="fade" stagger="40" once>
 *   Fade in, character by character
 * </dvfy-text-reveal>
 */

const STYLES = `
dvfy-text-reveal {
  display: block;
  color: var(--dvfy-text-reveal-color, inherit);
}

dvfy-text-reveal .dvfy-reveal-token {
  display: inline-block;
  opacity: 0;
  will-change: opacity, transform;
  transition:
    opacity  var(--dvfy-duration-normal, 0.4s) var(--dvfy-ease-out, ease-out),
    transform var(--dvfy-duration-normal, 0.4s) var(--dvfy-ease-out, ease-out);
  transition-delay: calc(var(--i, 0) * var(--dvfy-reveal-stagger, 0.06s));
}

/* ── fade-up (default) ── */
dvfy-text-reveal:not([animation]) .dvfy-reveal-token,
dvfy-text-reveal[animation="fade-up"] .dvfy-reveal-token {
  transform: translateY(0.75em);
}

/* ── fade (no translate) ── */
dvfy-text-reveal[animation="fade"] .dvfy-reveal-token {
  transform: none;
}

/* ── slide-left ── */
dvfy-text-reveal[animation="slide-left"] .dvfy-reveal-token {
  transform: translateX(-1em);
}

/* ── visible state ── */
dvfy-text-reveal.dvfy-reveal-visible .dvfy-reveal-token {
  opacity: 1;
  transform: none;
}

/* ── preserve word spacing: add a hair of right margin to word tokens ── */
dvfy-text-reveal[split="word"] .dvfy-reveal-token,
dvfy-text-reveal:not([split]) .dvfy-reveal-token {
  margin-inline-end: 0.25em;
}

/* ── reduced-motion: show immediately, no animation ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-text-reveal .dvfy-reveal-token {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
`;

class DvfyTextReveal extends HTMLElement {
  static #styled = false;
  #observer = null;

  connectedCallback() {
    if (!DvfyTextReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTextReveal.#styled = true;
    }
    this.#render();
    this.#observe();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
  }

  static get observedAttributes() {
    return ['split', 'animation', 'stagger', 'once'];
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'stagger') {
      this.#applyStagger();
    } else {
      // Re-render if split or animation changes
      this.#observer?.disconnect();
      this.#render();
      this.#observe();
    }
  }

  #tokens() {
    const mode = this.getAttribute('split') || 'word';
    const text = this.textContent.trim();
    return mode === 'char' ? [...text] : text.split(/\s+/).filter(Boolean);
  }

  #applyStagger() {
    const ms = parseFloat(this.getAttribute('stagger') ?? 60);
    this.style.setProperty('--dvfy-reveal-stagger', `${ms / 1000}s`);
  }

  #render() {
    const text = this.textContent.trim();
    if (!text) return;

    const mode = this.getAttribute('split') || 'word';
    const tokens = mode === 'char' ? [...text] : text.split(/\s+/).filter(Boolean);

    this.#applyStagger();

    // Screen-reader text (visually hidden)
    const sr = document.createElement('span');
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    sr.textContent = text;
    sr.setAttribute('aria-label', text);

    // Build animated token spans
    const frag = document.createDocumentFragment();
    frag.appendChild(sr);

    const wrapper = document.createElement('span');
    wrapper.setAttribute('aria-hidden', 'true');

    tokens.forEach((token, i) => {
      const span = document.createElement('span');
      span.className = 'dvfy-reveal-token';
      span.style.setProperty('--i', i);
      span.textContent = token;
      wrapper.appendChild(span);
    });

    frag.appendChild(wrapper);

    this.textContent = '';
    this.appendChild(frag);

    // Reset visibility
    this.classList.remove('dvfy-reveal-visible');
  }

  #observe() {
    const once = this.hasAttribute('once');

    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.classList.add('dvfy-reveal-visible');
            if (once) this.#observer.disconnect();
          } else if (!once) {
            this.classList.remove('dvfy-reveal-visible');
          }
        }
      },
      { threshold: 0.1 }
    );

    this.#observer.observe(this);
  }
}

customElements.define('dvfy-text-reveal', DvfyTextReveal);
