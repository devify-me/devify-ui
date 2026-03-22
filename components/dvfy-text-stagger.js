/**
 * <dvfy-text-stagger> — Stagger text reveal animation on scroll
 *
 * Words or characters in a text block reveal one-by-one with a cascading
 * fade+slide effect as the element enters the viewport. Uses IntersectionObserver
 * and CSS transitions with `--i` index custom properties for stagger timing.
 *
 * Attributes:
 *   split:     "words" | "chars"  — How to split the text (default: "words")
 *   threshold: number             — IntersectionObserver threshold 0–1 (default: 0.1)
 *   once:      boolean            — Only animate once (default: true; set "once=false" to replay)
 *
 * CSS Custom Properties:
 *   --dvfy-stagger-duration      Transition duration per item   (default: 0.5s)
 *   --dvfy-stagger-delay         Delay multiplier between items (default: 0.06s)
 *   --dvfy-stagger-distance      Vertical slide distance        (default: 0.75em)
 *   --dvfy-stagger-easing        Transition easing function     (default: ease)
 *
 * Browser Support:
 *   All modern browsers. IntersectionObserver required.
 *   prefers-reduced-motion: items appear instantly without animation.
 *
 * Usage:
 *   <dvfy-text-stagger>
 *     Reveal these words one by one on scroll
 *   </dvfy-text-stagger>
 *
 *   <dvfy-text-stagger split="chars" threshold="0.2">
 *     Character by character
 *   </dvfy-text-stagger>
 *
 *   <dvfy-text-stagger once="false" style="--dvfy-stagger-delay: 0.04s;">
 *     Replays each time it re-enters the viewport
 *   </dvfy-text-stagger>
 */

const STYLES = `
dvfy-text-stagger {
  display: block;
}

dvfy-text-stagger .dvfy-stagger-word,
dvfy-text-stagger .dvfy-stagger-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(var(--dvfy-stagger-distance, 0.75em));
  transition:
    opacity var(--dvfy-stagger-duration, 0.5s) var(--dvfy-stagger-easing, ease),
    transform var(--dvfy-stagger-duration, 0.5s) var(--dvfy-stagger-easing, ease);
  transition-delay: calc(var(--i, 0) * var(--dvfy-stagger-delay, 0.06s));
}

dvfy-text-stagger .dvfy-stagger-word.dvfy-stagger-space {
  display: inline;
  opacity: 1;
  transform: none;
  transition: none;
}

dvfy-text-stagger.dvfy-stagger-visible .dvfy-stagger-word,
dvfy-text-stagger.dvfy-stagger-visible .dvfy-stagger-char {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  dvfy-text-stagger .dvfy-stagger-word,
  dvfy-text-stagger .dvfy-stagger-char {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
`;

/**
 * Stagger text reveal animation triggered by IntersectionObserver on scroll.
 *
 * @element dvfy-text-stagger
 *
 * @attr {string} split - How to split text: "words" | "chars" (default: "words")
 * @attr {number} threshold - IntersectionObserver threshold 0–1 (default: 0.1)
 * @attr {boolean} once - Animate only once; omit or set "once=false" to replay (default: true)
 *
 * @slot - Text content to animate
 *
 * @cssprop {time} --dvfy-stagger-duration - Transition duration per item (default: 0.5s)
 * @cssprop {time} --dvfy-stagger-delay - Delay multiplier between items (default: 0.06s)
 * @cssprop {length} --dvfy-stagger-distance - Vertical slide distance (default: 0.75em)
 * @cssprop {string} --dvfy-stagger-easing - Transition easing (default: ease)
 *
 * @example
 * <dvfy-text-stagger>
 *   Reveal these words one by one on scroll
 * </dvfy-text-stagger>
 */
class DvfyTextStagger extends HTMLElement {
  static #styled = false;
  #observer = null;

  static get observedAttributes() {
    return ['split', 'threshold', 'once'];
  }

  connectedCallback() {
    if (!DvfyTextStagger.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTextStagger.#styled = true;
    }
    this.#render();
    this.#observe();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'split') {
      // Re-render if split mode changes
      this.#observer?.disconnect();
      this.#render();
      this.#observe();
    }
    if (name === 'threshold') {
      this.#observer?.disconnect();
      this.#observe();
    }
  }

  get #split() {
    return this.getAttribute('split') === 'chars' ? 'chars' : 'words';
  }

  get #threshold() {
    const val = parseFloat(this.getAttribute('threshold'));
    return isNaN(val) ? 0.1 : Math.max(0, Math.min(1, val));
  }

  get #once() {
    return this.getAttribute('once') !== 'false';
  }

  #render() {
    const text = this.textContent.trim();
    if (!text) return;

    const frag = document.createDocumentFragment();

    // Accessible screen-reader label
    const srText = document.createElement('span');
    srText.style.cssText =
      'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    srText.setAttribute('aria-label', text);
    frag.appendChild(srText);

    const wrapper = document.createElement('span');
    wrapper.setAttribute('aria-hidden', 'true');

    if (this.#split === 'chars') {
      this.#buildChars(text, wrapper);
    } else {
      this.#buildWords(text, wrapper);
    }

    frag.appendChild(wrapper);
    this.textContent = '';
    this.appendChild(frag);
  }

  #buildWords(text, container) {
    const words = text.split(/(\s+)/);
    let index = 0;

    for (const token of words) {
      if (/^\s+$/.test(token)) {
        // Preserve whitespace (non-animated)
        const space = document.createElement('span');
        space.className = 'dvfy-stagger-word dvfy-stagger-space';
        space.textContent = token;
        container.appendChild(space);
      } else if (token.length > 0) {
        const span = document.createElement('span');
        span.className = 'dvfy-stagger-word';
        span.style.setProperty('--i', index);
        span.textContent = token;
        container.appendChild(span);
        index++;
      }
    }
  }

  #buildChars(text, container) {
    let index = 0;

    for (const char of text) {
      if (char === ' ' || char === '\u00A0') {
        const space = document.createElement('span');
        space.textContent = '\u00A0';
        space.style.display = 'inline';
        container.appendChild(space);
      } else {
        const span = document.createElement('span');
        span.className = 'dvfy-stagger-char';
        span.style.setProperty('--i', index);
        span.textContent = char;
        container.appendChild(span);
        index++;
      }
    }
  }

  #observe() {
    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.classList.add('dvfy-stagger-visible');
            if (this.#once) {
              this.#observer.disconnect();
              this.#observer = null;
            }
          } else if (!this.#once) {
            this.classList.remove('dvfy-stagger-visible');
          }
        }
      },
      { threshold: this.#threshold }
    );

    this.#observer.observe(this);
  }
}

customElements.define('dvfy-text-stagger', DvfyTextStagger);
