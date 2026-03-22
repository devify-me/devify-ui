/**
 * <dvfy-text-reveal> — CSS scroll-driven per-word text reveal
 *
 * Words fade/slide into view as the user scrolls, using CSS
 * animation-timeline: view() with staggered animation-delay.
 * Falls back to IntersectionObserver on unsupported browsers.
 *
 * @element dvfy-text-reveal
 *
 * @attr {string} direction - Reveal direction: up | down | fade (default: "up")
 *
 * @slot - Text content to reveal word-by-word
 *
 * @cssprop {time} --dvfy-reveal-stagger - Delay increment between words (default: 0.05s)
 * @cssprop {color} --dvfy-reveal-color - Text color override
 *
 * @example
 * <dvfy-text-reveal>
 *   The quick brown fox jumps over the lazy dog.
 * </dvfy-text-reveal>
 *
 * @example
 * <dvfy-text-reveal direction="fade">
 *   Words fade in one by one as you scroll.
 * </dvfy-text-reveal>
 */

const STYLES = `
dvfy-text-reveal {
  display: block;
  color: var(--dvfy-reveal-color, var(--dvfy-text-primary, inherit));
  font-family: var(--dvfy-font-sans);
}

dvfy-text-reveal .dvfy-reveal-word {
  display: inline;
  white-space: pre-wrap;
}

/* ── Scroll-driven path (Chrome 115+, Safari 18+) ── */
@supports (animation-timeline: view()) {
  dvfy-text-reveal[data-scroll] .dvfy-reveal-word {
    opacity: 0;
    animation-name: dvfy-reveal-word-up;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
    animation-delay: calc(var(--_i, 0) * var(--dvfy-reveal-stagger, 0.05s));
    animation-duration: auto;
  }

  dvfy-text-reveal[data-scroll][direction="down"] .dvfy-reveal-word {
    animation-name: dvfy-reveal-word-down;
  }

  dvfy-text-reveal[data-scroll][direction="fade"] .dvfy-reveal-word {
    animation-name: dvfy-reveal-word-fade;
  }
}

/* ── IntersectionObserver fallback ── */
dvfy-text-reveal[data-io] .dvfy-reveal-word {
  opacity: 0;
  transition:
    opacity 0.5s ease-out calc(var(--_i, 0) * var(--dvfy-reveal-stagger, 0.05s)),
    transform 0.5s ease-out calc(var(--_i, 0) * var(--dvfy-reveal-stagger, 0.05s));
  transform: translateY(0.5em);
}

dvfy-text-reveal[data-io][direction="down"] .dvfy-reveal-word {
  transform: translateY(-0.5em);
}

dvfy-text-reveal[data-io][direction="fade"] .dvfy-reveal-word {
  transform: none;
}

dvfy-text-reveal[data-io][data-visible] .dvfy-reveal-word {
  opacity: 1;
  transform: none;
}

/* ── Keyframes ── */
@keyframes dvfy-reveal-word-up {
  from { opacity: 0; transform: translateY(0.5em); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes dvfy-reveal-word-down {
  from { opacity: 0; transform: translateY(-0.5em); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes dvfy-reveal-word-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Reduced-motion: show all words immediately ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-text-reveal .dvfy-reveal-word {
    animation: none !important;
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
    this.#initAnimation();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  static get observedAttributes() {
    return ['direction'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.isConnected || oldVal === newVal) return;
    const container = this.querySelector('.dvfy-reveal-content');
    if (container) this.#render();
  }

  /**
   * Splits text content into word spans, preserving whitespace tokens between words.
   * Inline elements (e.g. <em>, <strong>) are walked recursively; each text node
   * is tokenised so punctuation stays attached to the preceding word.
   */
  #render() {
    const rawNodes = [...this.childNodes];
    const tokens = [];

    for (const node of rawNodes) {
      this.#tokenise(node, tokens);
    }

    if (tokens.length === 0) return;

    // Remove all existing children safely
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }

    let wordIndex = 0;
    const wrapper = document.createElement('span');
    wrapper.className = 'dvfy-reveal-content';
    wrapper.setAttribute('aria-hidden', 'true');

    for (const token of tokens) {
      if (token.type === 'space') {
        wrapper.appendChild(document.createTextNode(token.text));
      } else if (token.type === 'word') {
        const span = document.createElement('span');
        span.className = 'dvfy-reveal-word';
        span.style.setProperty('--_i', wordIndex++);
        span.textContent = token.text;
        wrapper.appendChild(span);
      } else if (token.type === 'element') {
        const span = document.createElement('span');
        span.className = 'dvfy-reveal-word';
        span.style.setProperty('--_i', wordIndex++);
        span.appendChild(token.node.cloneNode(true));
        wrapper.appendChild(span);
      }
    }

    // Accessible screen-reader text
    const srText = document.createElement('span');
    srText.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    srText.textContent = tokens.map(t => t.text ?? '').join('');

    this.appendChild(srText);
    this.appendChild(wrapper);
  }

  /**
   * Recursively tokenise a DOM node into {type, text/node} tokens.
   * Text nodes are split on whitespace boundaries; element nodes are kept whole.
   */
  #tokenise(node, tokens) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      for (const part of parts) {
        if (part === '') continue;
        if (/^\s+$/.test(part)) {
          tokens.push({ type: 'space', text: part });
        } else {
          tokens.push({ type: 'word', text: part });
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      tokens.push({ type: 'element', node });
    }
  }

  #initAnimation() {
    if (CSS.supports('animation-timeline', 'view()')) {
      this.setAttribute('data-scroll', '');
    } else {
      this.setAttribute('data-io', '');
      this.#observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.setAttribute('data-visible', '');
            this.#observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      this.#observer.observe(this);
    }
  }
}

customElements.define('dvfy-text-reveal', DvfyTextReveal);
