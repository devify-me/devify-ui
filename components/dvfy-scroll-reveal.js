/**
 * <dvfy-scroll-reveal> — scroll-triggered fade-in via CSS view timeline
 *
 * Wraps any content and animates it in as it enters the viewport using
 * CSS scroll-driven animations (animation-timeline: view()). Zero JS
 * for the animation itself; attributes are wired to CSS custom properties.
 *
 * Browser support: Chromium 115+, Safari 18+.
 * Graceful fallback: content is fully visible in unsupported browsers.
 * prefers-reduced-motion: animation is skipped.
 *
 * @element dvfy-scroll-reveal
 *
 * @attr {string} direction - Reveal direction: up | down | left | right (default: "up")
 * @attr {number} duration  - Animation duration in ms (default: 600). With scroll-driven
 *                            animations this controls the entry-phase range span (scaled to
 *                            viewport %). Values ≤ 0 are clamped to 100ms.
 * @attr {number} delay     - Delay before animation starts, in scroll-range % (0–40,
 *                            default: 0). Shifts when in the entry phase the animation begins.
 *
 * @cssprop {length}  --dvfy-reveal-distance  Translate offset at start (default: 1.5rem)
 * @cssprop {string}  --dvfy-reveal-easing    Animation timing function (default: ease-out)
 *
 * @example
 * <dvfy-scroll-reveal>
 *   <p>Fades in from below as it enters the viewport.</p>
 * </dvfy-scroll-reveal>
 *
 * @example
 * <dvfy-scroll-reveal direction="left" duration="800" delay="10">
 *   <div class="card">Slides in from the right.</div>
 * </dvfy-scroll-reveal>
 */

const STYLES = `
/* ── dvfy-scroll-reveal: block wrapper ── */
dvfy-scroll-reveal {
  display: block;
}

/* ── Fallback: always visible without scroll-driven support ── */
@supports not (animation-timeline: view()) {
  dvfy-scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}

/* ── Keyframes for each direction ── */
@keyframes dvfy-reveal-up {
  from { opacity: 0; transform: translateY(var(--dvfy-reveal-distance, 1.5rem)); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes dvfy-reveal-down {
  from { opacity: 0; transform: translateY(calc(-1 * var(--dvfy-reveal-distance, 1.5rem))); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes dvfy-reveal-left {
  from { opacity: 0; transform: translateX(var(--dvfy-reveal-distance, 1.5rem)); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes dvfy-reveal-right {
  from { opacity: 0; transform: translateX(calc(-1 * var(--dvfy-reveal-distance, 1.5rem))); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Scroll-driven reveal ── */
@supports (animation-timeline: view()) {
  dvfy-scroll-reveal {
    animation-fill-mode: both;
    animation-timing-function: var(--dvfy-reveal-easing, ease-out);
    animation-timeline: view();
    /* range-start/end are updated inline by the element's JS */
    animation-range-start: entry var(--_dvfy-reveal-range-start, 0%);
    animation-range-end:   entry var(--_dvfy-reveal-range-end, 60%);
  }

  /* Default direction: up */
  dvfy-scroll-reveal,
  dvfy-scroll-reveal[direction="up"] {
    animation-name: dvfy-reveal-up;
  }

  dvfy-scroll-reveal[direction="down"]  { animation-name: dvfy-reveal-down; }
  dvfy-scroll-reveal[direction="left"]  { animation-name: dvfy-reveal-left; }
  dvfy-scroll-reveal[direction="right"] { animation-name: dvfy-reveal-right; }
}

/* ── Respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-scroll-reveal {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

class DvfyScrollReveal extends HTMLElement {
  static #styled = false;

  static get observedAttributes() {
    return ['duration', 'delay'];
  }

  connectedCallback() {
    if (!DvfyScrollReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyScrollReveal.#styled = true;
    }
    this.#applyRange();
  }

  attributeChangedCallback() {
    this.#applyRange();
  }

  /**
   * Map duration (ms, default 600) and delay (0–40 %, default 0)
   * to animation-range-start / animation-range-end CSS variables.
   *
   * Duration is scaled: 600ms → 60% entry span (÷10), clamped 10–90%.
   * Delay is clamped to 0–40% so start + span always stay within 0–100%.
   */
  #applyRange() {
    const durationMs = Math.max(100, parseFloat(this.getAttribute('duration') ?? '600') || 600);
    const delayPct   = Math.min(40, Math.max(0, parseFloat(this.getAttribute('delay') ?? '0') || 0));

    // Map duration (ms) → span (%). 600ms → 60%, 300ms → 30%, 1200ms → 90% (capped).
    const span  = Math.min(90, Math.max(10, durationMs / 10));
    const start = delayPct;
    const end   = Math.min(100, start + span);

    this.style.setProperty('--_dvfy-reveal-range-start', `${start}%`);
    this.style.setProperty('--_dvfy-reveal-range-end',   `${end}%`);
  }
}

customElements.define('dvfy-scroll-reveal', DvfyScrollReveal);
