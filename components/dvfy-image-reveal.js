/**
 * <dvfy-image-reveal> — clip-path scroll reveal animation
 *
 * Wraps any `<img>` or media element and animates it into view using
 * `clip-path: inset()` as the element enters the viewport. Uses
 * `animation-timeline: view()` in modern browsers; falls back to
 * IntersectionObserver + class toggle for broader support.
 *
 * @attr {string} direction - Reveal direction: top | bottom | left | right (default: "top")
 * @attr {string} duration  - Animation duration CSS value (default: "0.6s")
 * @attr {string} easing    - Animation easing CSS value (default: "ease")
 *
 * @slot - The image or media element to reveal
 *
 * @cssprop {time}            --dvfy-reveal-duration  - Animation duration (default: 0.6s)
 * @cssprop {easing-function} --dvfy-reveal-easing    - Animation easing (default: ease)
 *
 * @example
 * <dvfy-image-reveal>
 *   <img src="photo.jpg" alt="A photo" />
 * </dvfy-image-reveal>
 *
 * @example
 * <dvfy-image-reveal direction="left" duration="0.8s" easing="cubic-bezier(0.4,0,0.2,1)">
 *   <img src="photo.jpg" alt="A photo" />
 * </dvfy-image-reveal>
 */

const STYLES = `
/* ── image-reveal host ── */
dvfy-image-reveal {
  display: block;
  overflow: hidden;
}

/* ── CSS view()-driven reveal (Chromium 115+, Safari 18+) ── */
@supports (animation-timeline: view()) {
  @keyframes dvfy-reveal-from-top {
    from { clip-path: inset(100% 0 0 0); }
    to   { clip-path: inset(0% 0 0 0); }
  }

  @keyframes dvfy-reveal-from-bottom {
    from { clip-path: inset(0 0 100% 0); }
    to   { clip-path: inset(0 0 0% 0); }
  }

  @keyframes dvfy-reveal-from-left {
    from { clip-path: inset(0 0 0 100%); }
    to   { clip-path: inset(0 0 0 0%); }
  }

  @keyframes dvfy-reveal-from-right {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0% 0 0); }
  }

  dvfy-image-reveal[data-view] {
    animation-name: dvfy-reveal-from-top;
    animation-duration: auto;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }

  dvfy-image-reveal[data-view][direction="bottom"] {
    animation-name: dvfy-reveal-from-bottom;
  }

  dvfy-image-reveal[data-view][direction="left"] {
    animation-name: dvfy-reveal-from-left;
  }

  dvfy-image-reveal[data-view][direction="right"] {
    animation-name: dvfy-reveal-from-right;
  }
}

/* ── IntersectionObserver fallback (Firefox, older Safari) ── */
@supports not (animation-timeline: view()) {
  dvfy-image-reveal {
    clip-path: inset(100% 0 0 0);
    transition:
      clip-path var(--dvfy-reveal-duration, 0.6s) var(--dvfy-reveal-easing, ease);
  }

  dvfy-image-reveal[direction="bottom"] {
    clip-path: inset(0 0 100% 0);
  }

  dvfy-image-reveal[direction="left"] {
    clip-path: inset(0 0 0 100%);
  }

  dvfy-image-reveal[direction="right"] {
    clip-path: inset(0 100% 0 0);
  }

  dvfy-image-reveal[data-revealed] {
    clip-path: inset(0% 0 0 0%) !important;
  }
}

/* ── respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-image-reveal,
  dvfy-image-reveal[data-view] {
    animation: none !important;
    clip-path: none !important;
    transition: none !important;
  }
}
`;

class DvfyImageReveal extends HTMLElement {
  static #styled = false;
  #observer = null;

  static get observedAttributes() {
    return ['direction', 'duration', 'easing'];
  }

  connectedCallback() {
    if (!DvfyImageReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyImageReveal.#styled = true;
    }
    this.#applyTokens();
    this.#initReveal();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.#applyTokens();
  }

  #applyTokens() {
    const duration = this.getAttribute('duration');
    const easing = this.getAttribute('easing');
    if (duration) this.style.setProperty('--dvfy-reveal-duration', duration);
    else this.style.removeProperty('--dvfy-reveal-duration');
    if (easing) this.style.setProperty('--dvfy-reveal-easing', easing);
    else this.style.removeProperty('--dvfy-reveal-easing');
  }

  #initReveal() {
    if (CSS.supports('animation-timeline', 'view()')) {
      // Modern path: CSS does everything
      this.setAttribute('data-view', '');
    } else {
      // Fallback: IntersectionObserver triggers transition
      this.#observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.setAttribute('data-revealed', '');
              this.#observer.disconnect();
              this.#observer = null;
            }
          }
        },
        { threshold: 0.1 }
      );
      this.#observer.observe(this);
    }
  }
}

customElements.define('dvfy-image-reveal', DvfyImageReveal);
