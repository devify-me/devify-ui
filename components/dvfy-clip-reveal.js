/**
 * <dvfy-clip-reveal> — Scroll-triggered clip-path reveal via CSS @property
 *
 * Content sections that reveal themselves on scroll using clip-path animated
 * via typed CSS custom properties (@property). Pure CSS — no JavaScript
 * animation library needed.
 *
 * Uses:
 *   - @property defines a typed <percentage> variable for clip-path inset
 *   - animation-timeline: view(block) binds clip animation to viewport visibility
 *   - animation-range: entry controls when the reveal fires as element enters
 *
 * Browser support: Chrome 115+, Safari 18+ (scroll-driven animations + @property)
 * Fallback: element is fully visible with no animation.
 *
 * @element dvfy-clip-reveal
 *
 * @attr {string} direction - Reveal direction: top | bottom | left | right | diagonal (default: "bottom")
 * @attr {string} duration - Animation duration CSS value e.g. "auto", "0.6s" (default: "auto")
 * @attr {string} range - animation-range value e.g. "entry 0% entry 60%" (default: "entry 0% entry 60%")
 *
 * @slot - Any child content to reveal (images, cards, text blocks, etc.)
 *
 * @cssprop {percentage} --dvfy-clip-amount - Animated clip-path inset percentage (typed @property)
 * @cssprop {time} --dvfy-clip-reveal-duration - Override animation duration
 * @cssprop {string} --dvfy-clip-reveal-range - Override animation-range value
 *
 * @example
 * <dvfy-clip-reveal direction="bottom">
 *   <img src="hero.jpg" alt="Hero image" />
 * </dvfy-clip-reveal>
 *
 * @example
 * <dvfy-clip-reveal direction="left" range="entry 10% entry 70%">
 *   <dvfy-card padded>
 *     <h3>Revealed Card</h3>
 *     <p>Slides in from the left on scroll.</p>
 *   </dvfy-card>
 * </dvfy-clip-reveal>
 */

const STYLES = `
/* ── Typed custom property for interpolatable clip animation ── */
@property --dvfy-clip-amount {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}

@keyframes dvfy-clip-reveal {
  to { --dvfy-clip-amount: 0%; }
}

dvfy-clip-reveal {
  display: block;
}

/* ── Scroll-driven reveal — only when view() timeline is supported ── */
@supports (animation-timeline: view(block)) {
  dvfy-clip-reveal {
    animation-name: dvfy-clip-reveal;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-duration: var(--dvfy-clip-reveal-duration, auto);
    animation-timeline: view(block);
    animation-range: var(--dvfy-clip-reveal-range, entry 0% entry 60%);
  }

  /* direction="bottom" (default): clip from bottom, rises upward */
  dvfy-clip-reveal:not([direction]),
  dvfy-clip-reveal[direction="bottom"] {
    clip-path: inset(0 0 var(--dvfy-clip-amount) 0);
  }

  /* direction="top": clip from top, reveals downward */
  dvfy-clip-reveal[direction="top"] {
    clip-path: inset(var(--dvfy-clip-amount) 0 0 0);
  }

  /* direction="left": clip from left, reveals rightward */
  dvfy-clip-reveal[direction="left"] {
    clip-path: inset(0 0 0 var(--dvfy-clip-amount));
  }

  /* direction="right": clip from right, reveals leftward */
  dvfy-clip-reveal[direction="right"] {
    clip-path: inset(0 var(--dvfy-clip-amount) 0 0);
  }

  /* direction="diagonal": clip from top-left corner outward */
  dvfy-clip-reveal[direction="diagonal"] {
    clip-path: inset(var(--dvfy-clip-amount) var(--dvfy-clip-amount) 0 0);
  }
}

/* ── Respect prefers-reduced-motion: show content instantly ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-clip-reveal {
    animation: none !important;
    clip-path: none !important;
  }
}
`;

class DvfyClipReveal extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyClipReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyClipReveal.#styled = true;
    }
    this.#applyAttrs();
  }

  static get observedAttributes() {
    return ['duration', 'range'];
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.#applyAttrs();
  }

  #applyAttrs() {
    const duration = this.getAttribute('duration');
    const range = this.getAttribute('range');

    if (duration) this.style.setProperty('--dvfy-clip-reveal-duration', duration);
    else this.style.removeProperty('--dvfy-clip-reveal-duration');

    if (range) this.style.setProperty('--dvfy-clip-reveal-range', range);
    else this.style.removeProperty('--dvfy-clip-reveal-range');
  }
}

customElements.define('dvfy-clip-reveal', DvfyClipReveal);
