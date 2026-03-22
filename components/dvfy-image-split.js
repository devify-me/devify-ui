/**
 * <dvfy-image-split> — 4-corner clip-path image split hover effect
 *
 * The image is divided into four quadrants via clip-path. On hover each
 * quadrant slides outward to reveal the underlying content slot.
 *
 * Technique:
 *   Four absolutely-positioned divs each carry the same background-image
 *   but are clipped to one corner quadrant. Hovering the component
 *   translates each div away from centre, exposing the reveal layer below.
 *
 * Attributes:
 *   src:      string  — Image URL (required)
 *   alt:      string  — Accessible label for the image (default: "")
 *   distance: number  — How far quadrants travel as a percentage (default: 15)
 *   duration: number  — Transition time in ms (default: 500)
 *   easing:   string  — CSS easing function (default: cubic-bezier(0.4,0,0.2,1))
 *
 * CSS Custom Properties:
 *   --dvfy-image-split-distance  Quadrant travel distance (default: 15%)
 *   --dvfy-image-split-duration  Transition duration     (default: 500ms)
 *   --dvfy-image-split-easing    Transition easing       (default: cubic-bezier(0.4,0,0.2,1))
 *   --dvfy-image-split-ratio     Aspect ratio            (default: 16/9)
 *
 * Usage:
 *   <dvfy-image-split src="/hero.jpg" alt="Mountain view">
 *     <div style="padding:2rem;color:#fff">Revealed content</div>
 *   </dvfy-image-split>
 */

const STYLES = `
dvfy-image-split {
  display: block;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  aspect-ratio: var(--dvfy-image-split-ratio, 16/9);

  --_dist: var(--dvfy-image-split-distance, 15%);
  --_dur: var(--dvfy-image-split-duration, 500ms);
  --_ease: var(--dvfy-image-split-easing, cubic-bezier(0.4, 0, 0.2, 1));
}

/* Reveal layer — child content sits below the quadrant panels */
.dvfy-is__reveal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

/* Each quadrant panel */
.dvfy-is__panel {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  will-change: transform;
  transition:
    transform var(--_dur) var(--_ease),
    opacity var(--_dur) var(--_ease);
}

.dvfy-is__tl { clip-path: polygon(0 0, 50% 0, 50% 50%, 0 50%); }
.dvfy-is__tr { clip-path: polygon(50% 0, 100% 0, 100% 50%, 50% 50%); }
.dvfy-is__bl { clip-path: polygon(0 50%, 50% 50%, 50% 100%, 0 100%); }
.dvfy-is__br { clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%); }

/* Hover — slide each quadrant outward */
@media (hover: hover) {
  dvfy-image-split:hover .dvfy-is__tl {
    transform: translate(calc(-1 * var(--_dist)), calc(-1 * var(--_dist)));
  }
  dvfy-image-split:hover .dvfy-is__tr {
    transform: translate(var(--_dist), calc(-1 * var(--_dist)));
  }
  dvfy-image-split:hover .dvfy-is__bl {
    transform: translate(calc(-1 * var(--_dist)), var(--_dist));
  }
  dvfy-image-split:hover .dvfy-is__br {
    transform: translate(var(--_dist), var(--_dist));
  }
}

/* Focus-visible keyboard trigger */
dvfy-image-split[data-open] .dvfy-is__tl {
  transform: translate(calc(-1 * var(--_dist)), calc(-1 * var(--_dist)));
}
dvfy-image-split[data-open] .dvfy-is__tr {
  transform: translate(var(--_dist), calc(-1 * var(--_dist)));
}
dvfy-image-split[data-open] .dvfy-is__bl {
  transform: translate(calc(-1 * var(--_dist)), var(--_dist));
}
dvfy-image-split[data-open] .dvfy-is__br {
  transform: translate(var(--_dist), var(--_dist));
}

/* Reduced motion — fade instead of translate */
@media (prefers-reduced-motion: reduce) {
  .dvfy-is__panel {
    transition: opacity var(--_dur) var(--_ease);
    transform: none !important;
  }
  dvfy-image-split:hover .dvfy-is__panel,
  dvfy-image-split[data-open] .dvfy-is__panel {
    opacity: 0;
  }
}
`;

/**
 * 4-corner clip-path image split hover effect. Four image quadrants slide
 * outward on hover to reveal underlying content.
 *
 * @element dvfy-image-split
 *
 * @attr {string} src - Image URL
 * @attr {string} alt - Accessible label for the image
 * @attr {number} distance - Quadrant travel distance as a percentage (default: 15)
 * @attr {number} duration - Transition duration in ms (default: 500)
 * @attr {string} easing - CSS easing function
 *
 * @slot - Reveal content shown when the image splits open
 *
 * @cssprop {string} --dvfy-image-split-distance - Quadrant travel distance (default: 15%)
 * @cssprop {time} --dvfy-image-split-duration - Transition duration (default: 500ms)
 * @cssprop {string} --dvfy-image-split-easing - Transition easing
 * @cssprop {string} --dvfy-image-split-ratio - Aspect ratio (default: 16/9)
 */
class DvfyImageSplit extends HTMLElement {
  static #styled = false;

  /** @type {HTMLDivElement[]} The four quadrant panel elements */
  #panels = [];
  /** @type {HTMLDivElement|null} */
  #reveal = null;

  static get observedAttributes() {
    return ['src', 'distance', 'duration', 'easing'];
  }

  connectedCallback() {
    if (!DvfyImageSplit.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyImageSplit.#styled = true;
    }

    this.#render();
    this.#syncProps();

    // Keyboard support — toggle open/close via Enter or Space
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'img');
    this.#syncAria();

    this.addEventListener('keydown', this.#onKeydown);
    this.addEventListener('blur', this.#onBlur);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKeydown);
    this.removeEventListener('blur', this.#onBlur);
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'src') {
      this.#updateSrc();
    } else if (name === 'distance' || name === 'duration' || name === 'easing') {
      this.#syncProps();
    }
    if (name === 'src' || name === 'alt') {
      this.#syncAria();
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  #render() {
    // Move existing children into the reveal layer
    const reveal = document.createElement('div');
    reveal.className = 'dvfy-is__reveal';
    reveal.setAttribute('aria-hidden', 'true');

    while (this.firstChild) {
      reveal.appendChild(this.firstChild);
    }
    this.#reveal = reveal;
    this.appendChild(reveal);

    // Inject the four quadrant panels
    const quadrants = ['tl', 'tr', 'bl', 'br'];
    this.#panels = quadrants.map(q => {
      const div = document.createElement('div');
      div.className = `dvfy-is__panel dvfy-is__${q}`;
      this.appendChild(div);
      return div;
    });

    this.#updateSrc();
  }

  #updateSrc() {
    const src = this.getAttribute('src') || '';
    const url = src ? `url(${JSON.stringify(src)})` : 'none';
    for (const panel of this.#panels) {
      panel.style.backgroundImage = url;
    }
  }

  #syncProps() {
    const distance = this.getAttribute('distance');
    const duration = this.getAttribute('duration');
    const easing = this.getAttribute('easing');

    if (distance) this.style.setProperty('--_dist', `${parseFloat(distance)}%`);
    else this.style.removeProperty('--_dist');

    if (duration) this.style.setProperty('--_dur', `${parseInt(duration, 10)}ms`);
    else this.style.removeProperty('--_dur');

    if (easing) this.style.setProperty('--_ease', easing);
    else this.style.removeProperty('--_ease');
  }

  #syncAria() {
    const alt = this.getAttribute('alt') || '';
    this.setAttribute('aria-label', alt);
  }

  #onKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleAttribute('data-open');
    } else if (e.key === 'Escape') {
      this.removeAttribute('data-open');
    }
  };

  #onBlur = () => {
    this.removeAttribute('data-open');
  };
}

customElements.define('dvfy-image-split', DvfyImageSplit);
