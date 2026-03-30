import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-stagger-enter> — CSS staggered DOM-enter animations
 *
 * Applies staggered entrance animations to direct children using
 * `@starting-style` and `sibling-index()`. No JavaScript animation logic —
 * pure CSS with per-item stagger delay derived from sibling position.
 *
 * Works on lists, grids, or any group of siblings. Configurable via
 * CSS custom properties or HTML attributes.
 *
 * Browser support:
 *   @starting-style: Chrome 117+, Safari 17.5+, Firefox 129+
 *   sibling-index():  Chrome 130+, Safari 18+
 *   Fallback:         Items appear instantly (no stagger, no fade)
 *   prefers-reduced-motion: respected — all transitions disabled
 *
 * @element dvfy-stagger-enter
 *
 * @attr {string} direction - Slide-in direction: up | down | left | right | none (default: "up")
 * @attr {string} delay     - Per-item stagger delay in seconds (default: "0.08")
 * @attr {string} duration  - Transition duration in seconds (default: "0.4")
 * @attr {string} easing    - CSS easing function (default: "ease")
 * @attr {string} distance  - Slide offset (default: "20px")
 *
 * @cssprop {time}     --dvfy-stagger-delay    Per-item delay increment
 * @cssprop {time}     --dvfy-stagger-duration Transition duration
 * @cssprop {string}   --dvfy-stagger-easing   CSS easing function
 * @cssprop {length}   --dvfy-stagger-distance Slide offset distance
 *
 * @slot - Direct children are stagger-animated on DOM entry
 *
 * @example
 * <dvfy-stagger-enter>
 *   <li>Item one</li>
 *   <li>Item two</li>
 *   <li>Item three</li>
 * </dvfy-stagger-enter>
 *
 * @example
 * <dvfy-stagger-enter direction="left" delay="0.1" duration="0.5">
 *   <div class="card">Card A</div>
 *   <div class="card">Card B</div>
 * </dvfy-stagger-enter>
 */

const STYLES = `
/* ── dvfy-stagger-enter host ── */
dvfy-stagger-enter {
  display: contents;
}

/* ── Stagger: sibling-index() path (Chrome 130+, Safari 18+) ── */
@supports (--x: sibling-index()) {
  dvfy-stagger-enter > * {
    --_delay:    var(--dvfy-stagger-delay, 0.08s);
    --_duration: var(--dvfy-stagger-duration, 0.4s);
    --_easing:   var(--dvfy-stagger-easing, ease);
    --_distance: var(--dvfy-stagger-distance, 20px);

    transition:
      opacity  var(--_duration) var(--_easing),
      translate var(--_duration) var(--_easing);
    transition-delay: calc(var(--_delay) * (sibling-index() - 1));

    @starting-style {
      opacity: 0;
      translate: var(--_stagger-from-x, 0) var(--_stagger-from-y, 0);
    }
  }
}

/* ── @starting-style without sibling-index(): fade only, no stagger ── */
@supports (selector(*)) and (not (--x: sibling-index())) {
  dvfy-stagger-enter > * {
    --_duration: var(--dvfy-stagger-duration, 0.4s);
    --_easing:   var(--dvfy-stagger-easing, ease);

    transition: opacity var(--_duration) var(--_easing);

    @starting-style {
      opacity: 0;
    }
  }
}

/* Direction helpers — set via [data-direction] from JS */
dvfy-stagger-enter[data-direction="up"] > * {
  --_stagger-from-y: var(--dvfy-stagger-distance, 20px);
}
dvfy-stagger-enter[data-direction="down"] > * {
  --_stagger-from-y: calc(-1 * var(--dvfy-stagger-distance, 20px));
}
dvfy-stagger-enter[data-direction="left"] > * {
  --_stagger-from-x: var(--dvfy-stagger-distance, 20px);
}
dvfy-stagger-enter[data-direction="right"] > * {
  --_stagger-from-x: calc(-1 * var(--dvfy-stagger-distance, 20px));
}

/* Reduced-motion: disable all transitions */
@media (prefers-reduced-motion: reduce) {
  dvfy-stagger-enter > * {
    transition: none !important;
  }
}
`;

/**
 * Staggered DOM-enter animation container. Children animate in on mount
 * using @starting-style + sibling-index() — no JS timers.
 */
class DvfyStaggerEnter extends HTMLElement {
  static get observedAttributes() {
    return ['direction', 'delay', 'duration', 'easing', 'distance'];
  }

  connectedCallback() {
    injectStyles('dvfy-stagger-enter', STYLES);
    this.#applyTokens();
    this.#applyDirection();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'direction') this.#applyDirection();
    else this.#applyTokens();
  }

  #applyDirection() {
    const dir = this.getAttribute('direction') ?? 'up';
    if (dir === 'none') {
      this.removeAttribute('data-direction');
    } else {
      this.setAttribute('data-direction', dir);
    }
  }

  #applyTokens() {
    const map = {
      delay:    '--dvfy-stagger-delay',
      duration: '--dvfy-stagger-duration',
      easing:   '--dvfy-stagger-easing',
      distance: '--dvfy-stagger-distance',
    };
    for (const [attr, prop] of Object.entries(map)) {
      const val = this.getAttribute(attr);
      if (val) {
        // Wrap bare numbers in seconds for delay/duration
        const cssVal = (attr === 'delay' || attr === 'duration') && /^\d*\.?\d+$/.test(val)
          ? `${val}s`
          : val;
        this.style.setProperty(prop, cssVal);
      } else {
        this.style.removeProperty(prop);
      }
    }
  }
}

customElements.define('dvfy-stagger-enter', DvfyStaggerEnter);
