/**
 * <dvfy-image-reveal> — Scroll-driven clip-path image reveal
 *
 * Images reveal themselves as they enter the viewport — a clipping mask
 * shrinks from full to zero using the scroll position. CSS-only using
 * @property for smooth clip-path interpolation + animation-timeline: view().
 *
 * Supported in Chromium 115+ and Safari 18+.
 * Graceful fallback: image is fully visible in unsupported browsers.
 *
 * Technique:
 *   @property --dvfy-clip-pct allows animating inside clip-path().
 *   animation-timeline: view() drives the animation with scroll position.
 *
 * Attributes:
 *   direction: top | bottom | left | right (default: "top")
 *              Direction from which the image is revealed.
 *
 * CSS custom properties:
 *   --dvfy-image-reveal-range-start  animation-range start (default: "entry 0%")
 *   --dvfy-image-reveal-range-end    animation-range end   (default: "entry 60%")
 *
 * Usage:
 *   <dvfy-image-reveal>
 *     <img src="photo.jpg" alt="A landscape">
 *   </dvfy-image-reveal>
 *
 *   <dvfy-image-reveal direction="left">
 *     <figure>
 *       <img src="photo.jpg" alt="A landscape">
 *       <figcaption>Left-reveal example</figcaption>
 *     </figure>
 *   </dvfy-image-reveal>
 *
 * @element dvfy-image-reveal
 *
 * @attr {string} direction - Reveal direction: top | bottom | left | right (default: "top")
 *
 * @slot - img or figure element to reveal
 *
 * @cssprop {string} --dvfy-image-reveal-range-start - animation-range start (default: "entry 0%")
 * @cssprop {string} --dvfy-image-reveal-range-end   - animation-range end   (default: "entry 60%")
 *
 * @example
 * <dvfy-image-reveal direction="bottom">
 *   <img src="photo.jpg" alt="Reveal from bottom">
 * </dvfy-image-reveal>
 */

const STYLES = `
/* ── @property registration — enables animation inside clip-path() ── */
@property --dvfy-clip-pct {
  syntax: "<percentage>";
  initial-value: 100%;
  inherits: false;
}

dvfy-image-reveal {
  display: block;
  overflow: hidden; /* contain the clip */
}

/* ── scroll-driven reveal ── */
@supports (animation-timeline: view()) {
  @keyframes dvfy-reveal-from-top {
    to { --dvfy-clip-pct: 0%; }
  }
  @keyframes dvfy-reveal-from-bottom {
    to { --dvfy-clip-pct: 0%; }
  }
  @keyframes dvfy-reveal-from-left {
    to { --dvfy-clip-pct: 0%; }
  }
  @keyframes dvfy-reveal-from-right {
    to { --dvfy-clip-pct: 0%; }
  }

  /* Default: top */
  dvfy-image-reveal > *,
  dvfy-image-reveal[direction="top"] > * {
    clip-path: inset(var(--dvfy-clip-pct) 0 0 0);
    animation: dvfy-reveal-from-top linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }

  dvfy-image-reveal[direction="bottom"] > * {
    clip-path: inset(0 0 var(--dvfy-clip-pct) 0);
    animation-name: dvfy-reveal-from-bottom;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
    animation-fill-mode: both;
    animation-timing-function: linear;
  }

  dvfy-image-reveal[direction="left"] > * {
    clip-path: inset(0 0 0 var(--dvfy-clip-pct));
    animation-name: dvfy-reveal-from-left;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
    animation-fill-mode: both;
    animation-timing-function: linear;
  }

  dvfy-image-reveal[direction="right"] > * {
    clip-path: inset(0 var(--dvfy-clip-pct) 0 0);
    animation-name: dvfy-reveal-from-right;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
    animation-fill-mode: both;
    animation-timing-function: linear;
  }
}

/* ── respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-image-reveal > * {
    clip-path: none !important;
    animation: none !important;
  }
}
`;

/**
 * Scroll-driven clip-path image reveal using CSS @property + animation-timeline: view().
 *
 * @element dvfy-image-reveal
 *
 * @attr {string} direction - Reveal direction: top | bottom | left | right (default: "top")
 *
 * @slot - img or figure element to reveal
 *
 * @cssprop {string} --dvfy-image-reveal-range-start - animation-range start
 * @cssprop {string} --dvfy-image-reveal-range-end   - animation-range end
 */
class DvfyImageReveal extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyImageReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyImageReveal.#styled = true;
    }
  }
}

customElements.define('dvfy-image-reveal', DvfyImageReveal);
