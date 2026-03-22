/**
 * <dvfy-gradient-animate> — CSS @property animated gradient wrapper
 *
 * Uses typed CSS custom properties (`@property` with `syntax: "<color>"`) so
 * the browser can interpolate between gradient color stops frame-by-frame.
 * Previously impossible in pure CSS; now baseline-2025 across all major engines.
 *
 * The animation is entirely CSS-driven: JavaScript only reads attributes and
 * generates the corresponding @keyframes + animation declaration. No JS
 * animation loop, no requestAnimationFrame, no setInterval.
 *
 * @element dvfy-gradient-animate
 *
 * @attr {string} from      - Start color (any valid CSS color, default: #6366f1)
 * @attr {string} to        - End color (any valid CSS color, default: #ec4899)
 * @attr {string} duration  - Animation cycle duration (default: "4s")
 * @attr {string} direction - Gradient axis: diagonal | horizontal | vertical | radial (default: "diagonal")
 *
 * @slot - Content to wrap with the animated gradient background
 *
 * @cssProperty {color} --dvfy-gradient-animate-radius - Border radius applied to the element (default: var(--dvfy-radius-lg))
 *
 * @example
 * <dvfy-gradient-animate from="#6366f1" to="#ec4899" duration="3s" direction="diagonal">
 *   <dvfy-card padded>Gradient animated card</dvfy-card>
 * </dvfy-gradient-animate>
 */

const GLOBAL_STYLES = `
/* Register typed CSS custom properties so the browser can interpolate colors */
@property --_ga-c1 {
  syntax: "<color>";
  inherits: false;
  initial-value: #6366f1;
}
@property --_ga-c2 {
  syntax: "<color>";
  inherits: false;
  initial-value: #ec4899;
}

dvfy-gradient-animate {
  display: block;
  border-radius: var(--dvfy-gradient-animate-radius, var(--dvfy-radius-lg));
  overflow: hidden;
}

/* Pause the animation for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  dvfy-gradient-animate {
    animation-play-state: paused !important;
  }
}
`;

/** Validate that a value is a safe CSS color, preventing CSS injection. */
function safeColor(value, fallback) {
  if (!value) return fallback;
  try {
    // CSS.supports validates the value without executing it
    if (CSS.supports('color', value)) return value;
  } catch (_) { /* noop */ }
  return fallback;
}

let gaCounter = 0;

class DvfyGradientAnimate extends HTMLElement {
  static #globalStyled = false;
  #styleEl = null;
  #uid = ++gaCounter;

  static get observedAttributes() {
    return ['from', 'to', 'duration', 'direction'];
  }

  connectedCallback() {
    if (!DvfyGradientAnimate.#globalStyled) {
      const s = document.createElement('style');
      s.textContent = GLOBAL_STYLES;
      document.head.appendChild(s);
      DvfyGradientAnimate.#globalStyled = true;
    }
    // Stamp the element with its uid so the per-element selector works
    this.dataset.gaId = String(this.#uid);
    this.#applyStyles();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#applyStyles();
  }

  disconnectedCallback() {
    this.#styleEl?.remove();
    this.#styleEl = null;
  }

  #applyStyles() {
    const from     = safeColor(this.getAttribute('from'),      '#6366f1');
    const to       = safeColor(this.getAttribute('to'),        '#ec4899');
    const duration = this.getAttribute('duration') || '4s';
    const direction = this.getAttribute('direction') || 'diagonal';

    const kfName = `ga-anim-${this.#uid}`;
    const selector = `dvfy-gradient-animate[data-ga-id="${this.#uid}"]`;

    let gradient;
    switch (direction) {
      case 'horizontal': gradient = 'linear-gradient(to right, var(--_ga-c1), var(--_ga-c2))';  break;
      case 'vertical':   gradient = 'linear-gradient(to bottom, var(--_ga-c1), var(--_ga-c2))'; break;
      case 'radial':     gradient = 'radial-gradient(circle at center, var(--_ga-c1), var(--_ga-c2))'; break;
      default:           gradient = 'linear-gradient(135deg, var(--_ga-c1), var(--_ga-c2))';    break;
    }

    // Validated colors are injected into the stylesheet; CSS.supports() guards above
    // ensure only syntactically valid CSS color values reach this point.
    const css = `
@keyframes ${kfName} {
  0%, 100% { --_ga-c1: ${from}; --_ga-c2: ${to};   }
  50%       { --_ga-c1: ${to};   --_ga-c2: ${from}; }
}
${selector} {
  background: ${gradient};
  animation: ${kfName} ${duration} ease-in-out infinite;
}
`;

    if (!this.#styleEl) {
      this.#styleEl = document.createElement('style');
      document.head.appendChild(this.#styleEl);
    }
    this.#styleEl.textContent = css;
  }
}

customElements.define('dvfy-gradient-animate', DvfyGradientAnimate);
