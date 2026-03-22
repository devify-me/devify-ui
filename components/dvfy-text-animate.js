/**
 * <dvfy-text-animate> — Scroll-driven text animation effects
 *
 * Three animation variants triggered as the element enters the viewport:
 *   - reveal  (default): characters or words fade + slide up with stagger
 *   - write-on: text reveals left-to-right via CSS clip-path scroll animation
 *   - spiral: characters rotate in with a cascading spiral stagger
 *
 * Attributes:
 *   variant:  string  — "reveal" | "write-on" | "spiral" (default: "reveal")
 *   split:    string  — "chars" | "words" (default: "chars")
 *   delay:    number  — Stagger delay between units in ms (default: 40)
 *
 * CSS Custom Properties:
 *   --dvfy-ta-duration     Transition/animation duration (default: 500ms)
 *   --dvfy-ta-stagger      Stagger per unit in ms (default: 40ms — override per-instance via delay attr)
 *   --dvfy-ta-color        Text color (default: inherit)
 *
 * Browser Support:
 *   write-on: Chrome 115+ / Firefox 110+ (animation-timeline: view())
 *   spiral sibling-index() geometry: Chrome 130+, Safari 18+
 *   Firefox fallback: reveal/spiral use IntersectionObserver — fully functional
 *   prefers-reduced-motion: respected — all units jump to final visible state
 *
 * Usage:
 *   <dvfy-text-animate variant="reveal" split="words">Scroll to reveal</dvfy-text-animate>
 *   <dvfy-text-animate variant="write-on">Loading...</dvfy-text-animate>
 *   <dvfy-text-animate variant="spiral" split="chars">Hello World</dvfy-text-animate>
 */

const STYLES = `
dvfy-text-animate {
  display: block;
  color: var(--dvfy-ta-color, inherit);
}

/* ── Screen-reader accessible text ── */
dvfy-text-animate .dvfy-ta-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* ══════════════════════════════════════════
   write-on: clip-path reveal, left-to-right
   Uses animation-timeline: view() — pure CSS
   ══════════════════════════════════════════ */
dvfy-text-animate[variant="write-on"] .dvfy-ta-inner {
  display: block;
}

@supports (animation-timeline: view()) {
  dvfy-text-animate[variant="write-on"] .dvfy-ta-inner {
    clip-path: inset(0 100% 0 0);
    animation: dvfy-ta-writeon linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 40%;
    will-change: clip-path;
  }

  @keyframes dvfy-ta-writeon {
    to { clip-path: inset(0 0% 0 0); }
  }
}

/* ══════════════════════════════════════════
   reveal: units fade + slide up on scroll
   Triggered via IntersectionObserver (data-visible)
   ══════════════════════════════════════════ */
dvfy-text-animate[variant="reveal"] .dvfy-ta-unit,
dvfy-text-animate:not([variant]) .dvfy-ta-unit {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.5em);
  transition:
    opacity var(--dvfy-ta-duration, 0.5s) ease,
    transform var(--dvfy-ta-duration, 0.5s) ease;
  transition-delay: calc(var(--_i) * 1ms * var(--dvfy-ta-stagger, 40));
}

dvfy-text-animate[variant="reveal"][data-visible] .dvfy-ta-unit,
dvfy-text-animate:not([variant])[data-visible] .dvfy-ta-unit {
  opacity: 1;
  transform: translateY(0);
}

/* ══════════════════════════════════════════
   spiral: chars rotate+cascade in on scroll
   JS sets --_i; sibling-index() enhances geometry
   ══════════════════════════════════════════ */
dvfy-text-animate[variant="spiral"] .dvfy-ta-unit {
  display: inline-block;
  opacity: 0;
  transform-origin: center bottom;
  transform: rotate(-180deg) translateY(0.6em) scale(0.2);
  transition:
    opacity var(--dvfy-ta-duration, 0.5s) ease,
    transform var(--dvfy-ta-duration, 0.5s) cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: calc(var(--_i) * 1ms * var(--dvfy-ta-stagger, 50));
}

/* Chrome 130+ / Safari 18+: unique per-char start angle via sibling-index().
   Each char begins at a different point on the lower arc (-90° to -270°),
   so they visibly uncoil from a spiral into their natural text positions. */
@supports (--x: sibling-index()) {
  dvfy-text-animate[variant="spiral"] .dvfy-ta-unit {
    --_n: sibling-count();
    --_j: sibling-index();
    /* Use sibling-index() for delay so stagger is purely CSS */
    transition-delay: calc(var(--_j) * 1ms * var(--dvfy-ta-stagger, 50));
    transform:
      rotate(calc(-90deg - (180deg / var(--_n)) * (var(--_j) - 1)))
      translateY(0.8em)
      scale(0.2);
  }
}

dvfy-text-animate[variant="spiral"][data-visible] .dvfy-ta-unit {
  opacity: 1;
  transform: rotate(0deg) translateY(0) scale(1);
}

/* ══════════════════════════════════════════
   Reduced-motion: skip animation entirely
   ══════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  dvfy-text-animate .dvfy-ta-unit {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  dvfy-text-animate[variant="write-on"] .dvfy-ta-inner {
    clip-path: none !important;
    animation: none !important;
  }
}
`;

/**
 * Scroll-driven text animation — reveal, write-on, and spiral character cascade.
 *
 * @element dvfy-text-animate
 *
 * @attr {string} variant - Animation variant: reveal | write-on | spiral (default: reveal)
 * @attr {string} split - Split unit: chars | words (default: chars)
 * @attr {number} delay - Per-unit stagger delay in ms (default: 40)
 *
 * @event {CustomEvent} animate-start - Fires when the element enters the viewport (reveal/spiral)
 * @event {CustomEvent} animate-end - Fires when all units have finished animating (reveal/spiral)
 *
 * @slot - Text content to animate
 *
 * @cssprop {time} --dvfy-ta-duration - Transition/animation duration (default: 0.5s)
 * @cssprop {number} --dvfy-ta-stagger - Stagger multiplier in ms per unit (default: 40 for reveal, 50 for spiral)
 * @cssprop {color} --dvfy-ta-color - Text color (default: inherit)
 */
class DvfyTextAnimate extends HTMLElement {
  static #styled = false;

  /** @type {string} Original text content captured before rendering */
  #originalText = '';
  /** @type {IntersectionObserver|null} */
  #observer = null;

  connectedCallback() {
    if (!DvfyTextAnimate.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTextAnimate.#styled = true;
    }

    this.#originalText = this.textContent.trim();
    this.#render();
    this.#watch();
  }

  disconnectedCallback() {
    this.#teardownObserver();
  }

  static get observedAttributes() {
    return ['variant', 'split', 'delay'];
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.removeAttribute('data-visible');
    this.#teardownObserver();
    this.#render();
    this.#watch();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  #render() {
    const text = this.#originalText;
    if (!text) return;

    const variant = this.getAttribute('variant') || 'reveal';
    const split = this.getAttribute('split') || 'chars';
    const delay = parseInt(this.getAttribute('delay') || '', 10);

    if (!isNaN(delay)) {
      this.style.setProperty('--dvfy-ta-stagger', delay);
    } else {
      this.style.removeProperty('--dvfy-ta-stagger');
    }

    this.textContent = '';

    // Screen-reader label
    const sr = document.createElement('span');
    sr.className = 'dvfy-ta-sr';
    sr.textContent = text;
    this.appendChild(sr);

    if (variant === 'write-on') {
      // No splitting needed — CSS clip-path reveals the whole block
      const inner = document.createElement('span');
      inner.className = 'dvfy-ta-inner';
      inner.setAttribute('aria-hidden', 'true');
      inner.textContent = text;
      this.appendChild(inner);
      return;
    }

    // Split into chars or words
    const units = split === 'words'
      ? text.split(/(\s+)/)               // preserve whitespace tokens
      : [...text];                         // spread for Unicode-safe char split

    const frag = document.createDocumentFragment();
    let unitIndex = 0;

    for (const unit of units) {
      // Whitespace tokens (from word split) — render as plain text
      if (/^\s+$/.test(unit)) {
        frag.appendChild(document.createTextNode(unit));
        continue;
      }
      // Space chars (from char split) — render as non-breaking space
      if (unit === ' ') {
        frag.appendChild(document.createTextNode('\u00A0'));
        continue;
      }

      const span = document.createElement('span');
      span.className = 'dvfy-ta-unit';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--_i', unitIndex);
      span.textContent = unit;
      frag.appendChild(span);
      unitIndex++;
    }

    this.appendChild(frag);
  }

  #watch() {
    const variant = this.getAttribute('variant') || 'reveal';
    // write-on uses CSS animation-timeline: view() — no JS observer needed
    if (variant === 'write-on') return;

    // Reduced-motion: show immediately without observing
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setAttribute('data-visible', '');
      return;
    }

    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.setAttribute('data-visible', '');
            this.dispatchEvent(new CustomEvent('animate-start', { bubbles: true }));

            // Fire animate-end after the last unit's transition completes
            const units = this.querySelectorAll('.dvfy-ta-unit');
            if (units.length > 0) {
              units[units.length - 1].addEventListener(
                'transitionend',
                () => this.dispatchEvent(new CustomEvent('animate-end', { bubbles: true })),
                { once: true },
              );
            }

            this.#teardownObserver();
            break;
          }
        }
      },
      { threshold: 0.1 },
    );

    this.#observer.observe(this);
  }

  #teardownObserver() {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }
}

customElements.define('dvfy-text-animate', DvfyTextAnimate);
