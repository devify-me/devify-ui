import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-scroll-progress> — CSS scroll-driven reading progress bar
 *
 * Renders a thin bar fixed at the top (or bottom) of the viewport that fills
 * as the user scrolls. Zero JavaScript — pure CSS animation-timeline: scroll().
 *
 * Supported in Chromium 115+ and Safari 18+.
 * Graceful fallback: bar stays hidden in unsupported browsers.
 *
 * Attributes:
 *   position: top | bottom (default: "top")
 *
 * CSS custom properties:
 *   --dvfy-scroll-progress-color   Bar fill color  (default: var(--dvfy-primary-bg))
 *   --dvfy-scroll-progress-height  Bar height      (default: 3px)
 *   --dvfy-scroll-progress-z       z-index         (default: 1000)
 *
 * Usage:
 *   <!-- Page-level reading indicator (place once, near <body>) -->
 *   <dvfy-scroll-progress></dvfy-scroll-progress>
 *
 *   <!-- Bottom-mounted variant -->
 *   <dvfy-scroll-progress position="bottom"></dvfy-scroll-progress>
 *
 *   <!-- Custom color + height -->
 *   <dvfy-scroll-progress style="
 *     --dvfy-scroll-progress-color: var(--dvfy-success-bg);
 *     --dvfy-scroll-progress-height: 4px;
 *   "></dvfy-scroll-progress>
 */

const STYLES = `
/* ── scroll-progress bar (no JS; CSS drives everything) ── */
dvfy-scroll-progress {
  display: block;
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  height: var(--dvfy-scroll-progress-height, 3px);
  z-index: var(--dvfy-scroll-progress-z, 1000);
  transform-origin: left;
  pointer-events: none;

  /* Fallback: hidden when animation-timeline unsupported */
  transform: scaleX(0);
}

dvfy-scroll-progress[position="bottom"] {
  inset-block-start: auto;
  inset-block-end: 0;
}

/* ── scroll-driven fill ── */
@supports (animation-timeline: scroll()) {
  @keyframes dvfy-scroll-progress-fill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  dvfy-scroll-progress {
    background: var(--dvfy-scroll-progress-color, var(--dvfy-primary-bg, #0ea5e9));
    animation: dvfy-scroll-progress-fill linear both;
    animation-timeline: scroll(root block);
    animation-range: 0% 100%;
  }
}

/* ── respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-scroll-progress {
    /* Hide — motion is the entire point of this component */
    display: none;
  }
}
`;

/**
 * CSS scroll-driven reading progress bar.
 *
 * @element dvfy-scroll-progress
 *
 * @attr {string} position - Bar position: top | bottom (default: "top")
 *
 * @cssprop {color} --dvfy-scroll-progress-color - Bar fill color
 * @cssprop {length} --dvfy-scroll-progress-height - Bar height (default: 3px)
 * @cssprop {integer} --dvfy-scroll-progress-z - z-index (default: 1000)
 */
class DvfyScrollProgress extends HTMLElement {
  static get observedAttributes() { return ['position']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    // position: CSS attribute selectors handle top/bottom placement reactively.
  }

  connectedCallback() {
    injectStyles('dvfy-scroll-progress', STYLES);
    this.setAttribute('aria-hidden', 'true');
  }
}

customElements.define('dvfy-scroll-progress', DvfyScrollProgress);
