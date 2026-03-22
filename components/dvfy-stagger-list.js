/**
 * <dvfy-stagger-list> — CSS sibling-index() staggered entrance animation
 *
 * Wraps child elements and staggers their entrance animation using the CSS 2026
 * `sibling-index()` function — no hardcoded delays, no per-item JavaScript.
 * Triggers when the component scrolls into the viewport via IntersectionObserver.
 *
 * @element dvfy-stagger-list
 *
 * @attr {string} animation - Animation type: fade | slide-up | slide-left | slide-right | zoom (default: slide-up)
 * @attr {string} delay - Base stagger delay per item as CSS time value (default: 0.1s)
 * @attr {string} duration - Animation duration as CSS time value (default: 0.4s)
 * @attr {string} easing - CSS easing function (default: ease)
 * @attr {number} threshold - IntersectionObserver threshold 0–1 (default: 0.1)
 *
 * @cssprop {time} --dvfy-stagger-delay - Per-item stagger delay (overrides delay attr)
 * @cssprop {time} --dvfy-stagger-duration - Animation duration (overrides duration attr)
 * @cssprop {string} --dvfy-stagger-easing - CSS easing (overrides easing attr)
 *
 * @example
 * <dvfy-stagger-list>
 *   <div>Item one</div>
 *   <div>Item two</div>
 *   <div>Item three</div>
 * </dvfy-stagger-list>
 *
 * @example
 * <dvfy-stagger-list animation="zoom" delay="0.08s" duration="0.5s">
 *   <dvfy-card>Card A</dvfy-card>
 *   <dvfy-card>Card B</dvfy-card>
 *   <dvfy-card>Card C</dvfy-card>
 * </dvfy-stagger-list>
 */

const STYLES = `
dvfy-stagger-list {
  display: contents;
}

/* ── Hidden initial state ── */
dvfy-stagger-list > * {
  opacity: 0;
}

/* ── Animation type: slide-up (default) ── */
dvfy-stagger-list[data-animation="slide-up"] > *,
dvfy-stagger-list:not([data-animation]) > * {
  transform: translateY(var(--dvfy-stagger-offset, 24px));
}

/* ── Animation type: slide-left ── */
dvfy-stagger-list[data-animation="slide-left"] > * {
  transform: translateX(calc(-1 * var(--dvfy-stagger-offset, 24px)));
}

/* ── Animation type: slide-right ── */
dvfy-stagger-list[data-animation="slide-right"] > * {
  transform: translateX(var(--dvfy-stagger-offset, 24px));
}

/* ── Animation type: zoom ── */
dvfy-stagger-list[data-animation="zoom"] > * {
  transform: scale(calc(1 - var(--dvfy-stagger-scale-offset, 0.08)));
}

/* ── Animation type: fade (opacity only) ── */
dvfy-stagger-list[data-animation="fade"] > * {
  transform: none;
}

/* ── Transition base ── */
dvfy-stagger-list > * {
  transition:
    opacity var(--dvfy-stagger-duration, 0.4s) var(--dvfy-stagger-easing, ease),
    transform var(--dvfy-stagger-duration, 0.4s) var(--dvfy-stagger-easing, ease);
}

/* ── sibling-index() stagger: Chrome 130+, Safari 18+ ── */
@supports (--x: sibling-index()) {
  dvfy-stagger-list > * {
    transition-delay: calc(var(--dvfy-stagger-delay, 0.1s) * (sibling-index() - 1));
  }
}

/* ── Visible state: items animate in ── */
dvfy-stagger-list[data-visible] > * {
  opacity: 1;
  transform: none;
}

/* ── Reduced-motion: skip transition, show immediately ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-stagger-list > * {
    transition: none !important;
    transition-delay: 0s !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

class DvfyStaggerList extends HTMLElement {
  static #styled = false;
  #observer = null;

  static get observedAttributes() {
    return ['animation', 'delay', 'duration', 'easing', 'threshold'];
  }

  connectedCallback() {
    if (!DvfyStaggerList.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyStaggerList.#styled = true;
    }
    this.setAttribute('role', 'list');
    this.#applyTokens();
    this.#observe();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'animation') {
      this.dataset.animation = this.getAttribute('animation') ?? 'slide-up';
    } else {
      this.#applyTokens();
    }
  }

  #applyTokens() {
    const animation = this.getAttribute('animation') ?? 'slide-up';
    const delay     = this.getAttribute('delay');
    const duration  = this.getAttribute('duration');
    const easing    = this.getAttribute('easing');

    this.dataset.animation = animation;

    if (delay)    this.style.setProperty('--dvfy-stagger-delay', delay);
    else          this.style.removeProperty('--dvfy-stagger-delay');

    if (duration) this.style.setProperty('--dvfy-stagger-duration', duration);
    else          this.style.removeProperty('--dvfy-stagger-duration');

    if (easing)   this.style.setProperty('--dvfy-stagger-easing', easing);
    else          this.style.removeProperty('--dvfy-stagger-easing');
  }

  #observe() {
    const threshold = parseFloat(this.getAttribute('threshold') ?? '0.1');

    this.#observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.setAttribute('data-visible', '');
          this.#observer.disconnect();
          this.#observer = null;
        }
      },
      { threshold }
    );

    this.#observer.observe(this);
  }
}

customElements.define('dvfy-stagger-list', DvfyStaggerList);
