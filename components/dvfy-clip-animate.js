/**
 * <dvfy-clip-animate> — Smooth clip-path animations via @property
 *
 * Uses CSS @property typed custom properties to enable smooth clip-path
 * interpolation. Without typed properties, custom property changes jump
 * discretely — @property unlocks smooth tweening inside keyframes and
 * hover transitions.
 *
 * Shapes: circle (default), inset, polygon (left-to-right wipe).
 * Triggers: scroll — view()-driven reveal; hover — pointer transition.
 *
 * Browser support:
 *   @property:              Chrome 85+, Firefox 128+
 *   animation-timeline view(): Chrome 115+, Safari 18+
 * Graceful fallback: content remains fully visible on unsupported browsers.
 *
 * Attributes:
 *   shape:   circle | inset | polygon  (default: "circle")
 *   trigger: scroll | hover            (default: "scroll")
 *   range:   CSS animation-range value (scroll only; default: "entry 0% cover 60%")
 *   cx:      Circle center X %        (default: "50%")
 *   cy:      Circle center Y %        (default: "50%")
 *
 * CSS Custom Properties:
 *   --dvfy-clip-animate-duration  Hover transition duration  (default: 0.6s)
 *   --dvfy-clip-animate-easing    Hover transition easing    (default: ease)
 *   --dvfy-clip-animate-cx        Circle center X override   (default: 50%)
 *   --dvfy-clip-animate-cy        Circle center Y override   (default: 50%)
 *   --dvfy-clip-animate-radius    Inset border-radius        (default: 0px)
 *
 * Usage:
 *   <!-- Scroll-driven circle reveal (default) -->
 *   <dvfy-clip-animate>
 *     <img src="hero.jpg" alt="Hero image">
 *   </dvfy-clip-animate>
 *
 *   <!-- Hover inset reveal -->
 *   <dvfy-clip-animate trigger="hover" shape="inset">
 *     <img src="card.jpg" alt="Card image">
 *   </dvfy-clip-animate>
 *
 *   <!-- Polygon wipe, custom scroll range -->
 *   <dvfy-clip-animate shape="polygon" range="entry 0% cover 50%">
 *     <div class="banner">...</div>
 *   </dvfy-clip-animate>
 */

const STYLES = `
/* ── Typed custom properties for smooth clip-path interpolation ── */
/* Without @property, these custom properties cannot be interpolated.
   With @property, keyframe and transition interpolation is smooth. */
@property --dvfy-clip-cr {
  syntax: '<percentage>';
  initial-value: 0%;
  inherits: false;
}

@property --dvfy-clip-inset {
  syntax: '<percentage>';
  initial-value: 50%;
  inherits: false;
}

@property --dvfy-clip-poly-x {
  syntax: '<percentage>';
  initial-value: 0%;
  inherits: false;
}

dvfy-clip-animate {
  display: block;
}

/* ════════════════════════════════════════════════════════════════
   SCROLL-DRIVEN REVEAL  (requires animation-timeline: view())
   Content remains unclipped in browsers that don't support this.
   ════════════════════════════════════════════════════════════════ */
@supports (animation-timeline: view()) {

  @keyframes dvfy-clip-circle-reveal {
    from { --dvfy-clip-cr: 0%; }
    to   { --dvfy-clip-cr: 150%; }
  }

  @keyframes dvfy-clip-inset-reveal {
    from { --dvfy-clip-inset: 50%; }
    to   { --dvfy-clip-inset: 0%; }
  }

  @keyframes dvfy-clip-polygon-reveal {
    from { --dvfy-clip-poly-x: 0%; }
    to   { --dvfy-clip-poly-x: 100%; }
  }

  /* Circle — grows from center (or configured cx/cy) */
  dvfy-clip-animate[data-trigger="scroll"][data-shape="circle"] {
    clip-path: circle(var(--dvfy-clip-cr) at var(--dvfy-clip-animate-cx, 50%) var(--dvfy-clip-animate-cy, 50%));
    animation: dvfy-clip-circle-reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 60%;
  }

  /* Inset — shrinks from all edges to full reveal */
  dvfy-clip-animate[data-trigger="scroll"][data-shape="inset"] {
    clip-path: inset(var(--dvfy-clip-inset) round var(--dvfy-clip-animate-radius, 0px));
    animation: dvfy-clip-inset-reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 60%;
  }

  /* Polygon — left-to-right curtain wipe */
  dvfy-clip-animate[data-trigger="scroll"][data-shape="polygon"] {
    clip-path: polygon(0% 0%, var(--dvfy-clip-poly-x) 0%, var(--dvfy-clip-poly-x) 100%, 0% 100%);
    animation: dvfy-clip-polygon-reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 60%;
  }
}

/* ════════════════════════════════════════════════════════════════
   HOVER REVEAL  (requires @property for smooth interpolation)
   Without @property, clip-path is invalid in default state → content
   remains fully visible — acceptable progressive enhancement fallback.
   ════════════════════════════════════════════════════════════════ */

/* Circle — expands from point on :hover / :focus-within */
dvfy-clip-animate[data-trigger="hover"][data-shape="circle"] {
  clip-path: circle(var(--dvfy-clip-cr) at var(--dvfy-clip-animate-cx, 50%) var(--dvfy-clip-animate-cy, 50%));
  transition: --dvfy-clip-cr var(--dvfy-clip-animate-duration, 0.6s) var(--dvfy-clip-animate-easing, ease);
  cursor: pointer;
}

dvfy-clip-animate[data-trigger="hover"][data-shape="circle"]:hover,
dvfy-clip-animate[data-trigger="hover"][data-shape="circle"]:focus-within {
  --dvfy-clip-cr: 150%;
}

/* Inset — shrinks borders in on :hover / :focus-within */
dvfy-clip-animate[data-trigger="hover"][data-shape="inset"] {
  clip-path: inset(var(--dvfy-clip-inset) round var(--dvfy-clip-animate-radius, 0px));
  transition: --dvfy-clip-inset var(--dvfy-clip-animate-duration, 0.6s) var(--dvfy-clip-animate-easing, ease);
  cursor: pointer;
}

dvfy-clip-animate[data-trigger="hover"][data-shape="inset"]:hover,
dvfy-clip-animate[data-trigger="hover"][data-shape="inset"]:focus-within {
  --dvfy-clip-inset: 0%;
}

/* Polygon — wipes in left-to-right on :hover / :focus-within */
dvfy-clip-animate[data-trigger="hover"][data-shape="polygon"] {
  clip-path: polygon(0% 0%, var(--dvfy-clip-poly-x) 0%, var(--dvfy-clip-poly-x) 100%, 0% 100%);
  transition: --dvfy-clip-poly-x var(--dvfy-clip-animate-duration, 0.6s) var(--dvfy-clip-animate-easing, ease);
  cursor: pointer;
}

dvfy-clip-animate[data-trigger="hover"][data-shape="polygon"]:hover,
dvfy-clip-animate[data-trigger="hover"][data-shape="polygon"]:focus-within {
  --dvfy-clip-poly-x: 100%;
}

/* ════════════════════════════════════════════════════════════════
   REDUCED MOTION — reveal immediately, no animation
   ════════════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  /* Scroll trigger: skip straight to revealed state */
  dvfy-clip-animate[data-trigger="scroll"] {
    --dvfy-clip-cr: 150% !important;
    --dvfy-clip-inset: 0% !important;
    --dvfy-clip-poly-x: 100% !important;
    animation: none !important;
  }

  /* Hover trigger: always reveal, disable transition */
  dvfy-clip-animate[data-trigger="hover"] {
    --dvfy-clip-cr: 150%;
    --dvfy-clip-inset: 0%;
    --dvfy-clip-poly-x: 100%;
    transition: none !important;
  }
}
`;

/**
 * Smooth clip-path animations using CSS @property typed custom properties.
 * Supports circle, inset, and polygon clip shapes with scroll-driven or
 * hover-triggered animation.
 *
 * @element dvfy-clip-animate
 *
 * @attr {string} shape - Clip shape: circle | inset | polygon (default: "circle")
 * @attr {string} trigger - Animation trigger: scroll | hover (default: "scroll")
 * @attr {string} range - CSS animation-range for scroll trigger (default: "entry 0% cover 60%")
 * @attr {string} cx - Circle center X percentage (default: "50%")
 * @attr {string} cy - Circle center Y percentage (default: "50%")
 *
 * @slot - Content to animate (image, card, or any block element)
 *
 * @cssprop {time} --dvfy-clip-animate-duration - Hover transition duration (default: 0.6s)
 * @cssprop {string} --dvfy-clip-animate-easing - Hover transition easing (default: ease)
 * @cssprop {percentage} --dvfy-clip-animate-cx - Circle center X (default: 50%)
 * @cssprop {percentage} --dvfy-clip-animate-cy - Circle center Y (default: 50%)
 * @cssprop {length} --dvfy-clip-animate-radius - Inset border-radius (default: 0px)
 *
 * @example
 * <!-- Scroll-driven circle reveal -->
 * <dvfy-clip-animate>
 *   <img src="hero.jpg" alt="Hero">
 * </dvfy-clip-animate>
 *
 * @example
 * <!-- Hover-triggered inset reveal -->
 * <dvfy-clip-animate trigger="hover" shape="inset" style="--dvfy-clip-animate-radius: 8px">
 *   <img src="card.jpg" alt="Card">
 * </dvfy-clip-animate>
 *
 * @example
 * <!-- Polygon wipe with custom scroll range -->
 * <dvfy-clip-animate shape="polygon" range="entry 0% cover 50%">
 *   <div class="banner">Banner content</div>
 * </dvfy-clip-animate>
 */
class DvfyClipAnimate extends HTMLElement {
  static #styled = false;

  static get observedAttributes() {
    return ['shape', 'trigger', 'range', 'cx', 'cy'];
  }

  connectedCallback() {
    if (!DvfyClipAnimate.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyClipAnimate.#styled = true;
    }
    this.#apply();
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.#apply();
  }

  #apply() {
    const shape   = this.getAttribute('shape')   || 'circle';
    const trigger = this.getAttribute('trigger') || 'scroll';

    this.dataset.shape   = shape;
    this.dataset.trigger = trigger;

    // Mirror cx/cy to CSS custom properties so the cascade can override them
    const cx = this.getAttribute('cx');
    const cy = this.getAttribute('cy');
    if (cx) this.style.setProperty('--dvfy-clip-animate-cx', cx);
    else this.style.removeProperty('--dvfy-clip-animate-cx');
    if (cy) this.style.setProperty('--dvfy-clip-animate-cy', cy);
    else this.style.removeProperty('--dvfy-clip-animate-cy');

    // Override animation-range inline so the user's `range` attr takes precedence
    // over the default in the stylesheet. Only relevant for scroll trigger.
    const range = this.getAttribute('range');
    if (trigger === 'scroll' && range) {
      this.style.animationRange = range;
    } else {
      this.style.removeProperty('animation-range');
    }
  }
}

customElements.define('dvfy-clip-animate', DvfyClipAnimate);
