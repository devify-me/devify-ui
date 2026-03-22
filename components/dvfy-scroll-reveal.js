/**
 * <dvfy-scroll-reveal> — CSS scroll-driven element reveal animation
 *
 * Wraps any content and animates it into view as it enters the viewport using
 * the View Timeline API. Zero JavaScript animation logic — pure CSS
 * `animation-timeline: view()` with configurable direction.
 *
 * Supported in Chromium 115+ and Safari 18+.
 * Graceful fallback: content is fully visible in unsupported browsers.
 *
 * @element dvfy-scroll-reveal
 *
 * @attr {string} animation - Reveal direction: fade-up | fade-down | fade-left | fade-right | clip (default: "fade-up")
 *
 * @cssprop {time} --dvfy-scroll-reveal-duration - Animation duration (default: 0.6s)
 * @cssprop {string} --dvfy-scroll-reveal-easing - Animation easing (default: ease-out)
 * @cssprop {time} --dvfy-scroll-reveal-delay - Animation delay (default: 0s)
 *
 * @example
 * <dvfy-scroll-reveal animation="fade-up">
 *   <dvfy-card padded>Content revealed on scroll</dvfy-card>
 * </dvfy-scroll-reveal>
 */

const STYLES = `
/* ── scroll-reveal wrapper ── */
dvfy-scroll-reveal {
  display: block;
}

/* ── base animation defaults (no-op when timeline unsupported) ── */
@supports (animation-timeline: view()) {
  @keyframes dvfy-reveal-fade-up {
    entry 0%  { opacity: 0; translate: 0 2rem; }
    entry 100% { opacity: 1; translate: 0 0; }
  }

  @keyframes dvfy-reveal-fade-down {
    entry 0%  { opacity: 0; translate: 0 -2rem; }
    entry 100% { opacity: 1; translate: 0 0; }
  }

  @keyframes dvfy-reveal-fade-left {
    entry 0%  { opacity: 0; translate: 2rem 0; }
    entry 100% { opacity: 1; translate: 0 0; }
  }

  @keyframes dvfy-reveal-fade-right {
    entry 0%  { opacity: 0; translate: -2rem 0; }
    entry 100% { opacity: 1; translate: 0 0; }
  }

  @keyframes dvfy-reveal-clip {
    entry 0%  { opacity: 0; clip-path: inset(45% 20% 45% 20% round var(--dvfy-radius-md, 6px)); }
    entry 100% { opacity: 1; clip-path: inset(0% 0% 0% 0% round 0px); }
  }

  dvfy-scroll-reveal {
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
    animation-fill-mode: both;
    animation-duration: var(--dvfy-scroll-reveal-duration, 0.6s);
    animation-timing-function: var(--dvfy-scroll-reveal-easing, ease-out);
    animation-delay: var(--dvfy-scroll-reveal-delay, 0s);
  }

  /* Default: fade-up */
  dvfy-scroll-reveal,
  dvfy-scroll-reveal[animation="fade-up"] {
    animation-name: dvfy-reveal-fade-up;
  }

  dvfy-scroll-reveal[animation="fade-down"] {
    animation-name: dvfy-reveal-fade-down;
  }

  dvfy-scroll-reveal[animation="fade-left"] {
    animation-name: dvfy-reveal-fade-left;
  }

  dvfy-scroll-reveal[animation="fade-right"] {
    animation-name: dvfy-reveal-fade-right;
  }

  dvfy-scroll-reveal[animation="clip"] {
    animation-name: dvfy-reveal-clip;
  }
}

/* ── respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-scroll-reveal {
    animation: none !important;
    opacity: 1 !important;
    translate: none !important;
    clip-path: none !important;
  }
}
`;

class DvfyScrollReveal extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyScrollReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyScrollReveal.#styled = true;
    }
  }
}

customElements.define('dvfy-scroll-reveal', DvfyScrollReveal);
