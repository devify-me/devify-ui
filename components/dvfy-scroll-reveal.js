/**
 * <dvfy-scroll-reveal> — CSS scroll-driven clip-path reveal
 *
 * Reveals content via animated clip-path tied to scroll position using
 * animation-timeline: view(block). Zero layout shift, pure CSS.
 * Requires @property for smooth clip-path interpolation.
 *
 * Supported in Chromium 115+ / Safari 18+.
 * Graceful fallback: content fully visible in unsupported browsers.
 *
 * @element dvfy-scroll-reveal
 *
 * @attr {string} shape - Clip shape: inset | circle | ellipse (default: "inset")
 * @attr {string} direction - Reveal direction for inset: bottom | top | left | right (default: "bottom")
 * @attr {string} threshold - Starting clip amount as percentage (default: "15%")
 *
 * @slot - Content to reveal
 *
 * @cssprop {length} --dvfy-scroll-reveal-duration - Animation duration hint for range (default: cover 40%)
 * @cssprop {string} --dvfy-scroll-reveal-easing - Animation easing (default: ease-out)
 *
 * @example
 * <dvfy-scroll-reveal shape="inset" direction="bottom" threshold="15%">
 *   <img src="photo.jpg" />
 * </dvfy-scroll-reveal>
 *
 * @example
 * <dvfy-scroll-reveal shape="circle">
 *   <dvfy-card padded>Revealed with circle wipe</dvfy-card>
 * </dvfy-scroll-reveal>
 */

const STYLES = `
/* ── @property declarations for smooth clip-path interpolation ── */
@property --dvfy-reveal-inset-top {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --dvfy-reveal-inset-right {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --dvfy-reveal-inset-bottom {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --dvfy-reveal-inset-left {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --dvfy-reveal-circle-r {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --dvfy-reveal-ellipse-rx {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@property --dvfy-reveal-ellipse-ry {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

/* ── Base: always show content (fallback for unsupported browsers) ── */
dvfy-scroll-reveal {
  display: block;
}

/* ── Scroll-driven reveal (requires view() support) ── */
@supports (animation-timeline: view()) {

  /* ── inset from bottom (default) ── */
  dvfy-scroll-reveal[shape="inset"][direction="bottom"],
  dvfy-scroll-reveal:not([shape]),
  dvfy-scroll-reveal[shape="inset"]:not([direction]) {
    clip-path: inset(
      var(--dvfy-reveal-inset-top, 0%)
      var(--dvfy-reveal-inset-right, 0%)
      var(--dvfy-reveal-inset-bottom, 0%)
      var(--dvfy-reveal-inset-left, 0%)
    );
    animation: dvfy-reveal-inset-bottom
      var(--dvfy-scroll-reveal-easing, ease-out)
      both;
    animation-timeline: view(block);
    animation-range: entry 0% entry 60%;
  }

  @keyframes dvfy-reveal-inset-bottom {
    from { --dvfy-reveal-inset-bottom: var(--dvfy-scroll-reveal-threshold, 100%); }
    to   { --dvfy-reveal-inset-bottom: 0%; }
  }

  /* ── inset from top ── */
  dvfy-scroll-reveal[shape="inset"][direction="top"] {
    clip-path: inset(
      var(--dvfy-reveal-inset-top, 0%)
      0%
      0%
      0%
    );
    animation: dvfy-reveal-inset-top
      var(--dvfy-scroll-reveal-easing, ease-out)
      both;
    animation-timeline: view(block);
    animation-range: entry 0% entry 60%;
  }

  @keyframes dvfy-reveal-inset-top {
    from { --dvfy-reveal-inset-top: var(--dvfy-scroll-reveal-threshold, 100%); }
    to   { --dvfy-reveal-inset-top: 0%; }
  }

  /* ── inset from left ── */
  dvfy-scroll-reveal[shape="inset"][direction="left"] {
    clip-path: inset(
      0%
      0%
      0%
      var(--dvfy-reveal-inset-left, 0%)
    );
    animation: dvfy-reveal-inset-left
      var(--dvfy-scroll-reveal-easing, ease-out)
      both;
    animation-timeline: view(block);
    animation-range: entry 0% entry 60%;
  }

  @keyframes dvfy-reveal-inset-left {
    from { --dvfy-reveal-inset-left: var(--dvfy-scroll-reveal-threshold, 100%); }
    to   { --dvfy-reveal-inset-left: 0%; }
  }

  /* ── inset from right ── */
  dvfy-scroll-reveal[shape="inset"][direction="right"] {
    clip-path: inset(
      0%
      var(--dvfy-reveal-inset-right, 0%)
      0%
      0%
    );
    animation: dvfy-reveal-inset-right
      var(--dvfy-scroll-reveal-easing, ease-out)
      both;
    animation-timeline: view(block);
    animation-range: entry 0% entry 60%;
  }

  @keyframes dvfy-reveal-inset-right {
    from { --dvfy-reveal-inset-right: var(--dvfy-scroll-reveal-threshold, 100%); }
    to   { --dvfy-reveal-inset-right: 0%; }
  }

  /* ── circle wipe ── */
  dvfy-scroll-reveal[shape="circle"] {
    clip-path: circle(var(--dvfy-reveal-circle-r, 0%) at center);
    animation: dvfy-reveal-circle
      var(--dvfy-scroll-reveal-easing, ease-out)
      both;
    animation-timeline: view(block);
    animation-range: entry 0% entry 60%;
  }

  @keyframes dvfy-reveal-circle {
    from { --dvfy-reveal-circle-r: 0%; }
    to   { --dvfy-reveal-circle-r: 75%; }
  }

  /* ── ellipse wipe ── */
  dvfy-scroll-reveal[shape="ellipse"] {
    clip-path: ellipse(
      var(--dvfy-reveal-ellipse-rx, 0%)
      var(--dvfy-reveal-ellipse-ry, 0%)
      at center
    );
    animation: dvfy-reveal-ellipse
      var(--dvfy-scroll-reveal-easing, ease-out)
      both;
    animation-timeline: view(block);
    animation-range: entry 0% entry 60%;
  }

  @keyframes dvfy-reveal-ellipse {
    from {
      --dvfy-reveal-ellipse-rx: 0%;
      --dvfy-reveal-ellipse-ry: 0%;
    }
    to {
      --dvfy-reveal-ellipse-rx: 55%;
      --dvfy-reveal-ellipse-ry: 60%;
    }
  }
}

/* ── respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-scroll-reveal {
    animation: none !important;
    clip-path: none !important;
  }
}
`;

/**
 * CSS scroll-driven clip-path reveal component.
 *
 * @element dvfy-scroll-reveal
 *
 * @attr {string} shape - Clip shape: inset | circle | ellipse (default: "inset")
 * @attr {string} direction - Reveal direction (inset only): bottom | top | left | right (default: "bottom")
 * @attr {string} threshold - Starting clip percentage (default: "15%")
 */
class DvfyScrollReveal extends HTMLElement {
  static #styled = false;

  static get observedAttributes() {
    return ['threshold'];
  }

  connectedCallback() {
    if (!DvfyScrollReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyScrollReveal.#styled = true;
    }
    this.#applyThreshold();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'threshold' && oldVal !== newVal) {
      this.#applyThreshold();
    }
  }

  #applyThreshold() {
    const threshold = this.getAttribute('threshold') || '15%';
    // Validate: must be a CSS percentage or leave as-is
    this.style.setProperty('--dvfy-scroll-reveal-threshold', threshold);
  }
}

customElements.define('dvfy-scroll-reveal', DvfyScrollReveal);
