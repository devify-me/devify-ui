/**
 * <dvfy-sticky-header> — CSS scroll-driven shrinking sticky header
 *
 * Sticks to the top of the viewport and smoothly shrinks in height,
 * reduces font size, and gains a shadow as the user scrolls past a
 * configurable threshold. Zero JavaScript scroll listeners — pure CSS
 * scroll-driven animations via animation-timeline: scroll().
 *
 * Supported in Chromium 115+ and Safari 18+.
 * Graceful fallback: header stays at full size in unsupported browsers.
 *
 * @element dvfy-sticky-header
 *
 * @attr {string} label - Accessible label for the header landmark (default: "Site header")
 * @attr {string} full-height - Header height in full (unscrolled) state (default: "80px")
 * @attr {string} compact-height - Header height in compact (scrolled) state (default: "52px")
 * @attr {string} threshold - Scroll distance over which the transition occurs (default: "120px")
 *
 * @slot - Default slot — place logo, nav, and other header content here
 *
 * @cssprop {length} --dvfy-sticky-header-full-height - Full height override (default: attr or 80px)
 * @cssprop {length} --dvfy-sticky-header-compact-height - Compact height override (default: attr or 52px)
 * @cssprop {length} --dvfy-sticky-header-threshold - Transition threshold override (default: attr or 120px)
 * @cssprop {color} --dvfy-sticky-header-bg - Background color (default: var(--dvfy-surface-bg))
 * @cssprop {string} --dvfy-sticky-header-shadow - Shadow applied on scroll (default: var(--dvfy-shadow-2))
 * @cssprop {integer} --dvfy-sticky-header-z - z-index (default: 200)
 *
 * @example
 * <dvfy-sticky-header>
 *   <a href="/" style="font-weight:700;font-size:1.2rem">My App</a>
 *   <nav style="display:flex;gap:1rem">
 *     <a href="/about">About</a>
 *     <a href="/contact">Contact</a>
 *   </nav>
 * </dvfy-sticky-header>
 *
 * @example
 * <!-- Custom sizes -->
 * <dvfy-sticky-header full-height="96px" compact-height="56px" threshold="80px">
 *   <span>Logo</span>
 * </dvfy-sticky-header>
 */

const STYLES = `
/* ── sticky-header base ── */
dvfy-sticky-header {
  display: flex;
  align-items: center;
  position: sticky;
  inset-block-start: 0;
  inset-inline: 0;
  width: 100%;
  z-index: var(--dvfy-sticky-header-z, 200);
  background: var(--dvfy-sticky-header-bg, var(--dvfy-surface-bg, #fff));
  box-sizing: border-box;
  padding-inline: var(--dvfy-space-4, 1rem);

  /* Default height — overridden by attribute-driven custom property */
  height: var(--dvfy-sticky-header-full-height, 80px);
}

/* ── scroll-driven shrink (progressive enhancement) ── */
@supports (animation-timeline: scroll()) {
  @keyframes dvfy-sticky-header-shrink {
    from {
      height:      var(--dvfy-sticky-header-full-height, 80px);
      font-size:   var(--dvfy-sticky-header-font-full, 1rem);
      box-shadow:  none;
    }
    to {
      height:      var(--dvfy-sticky-header-compact-height, 52px);
      font-size:   var(--dvfy-sticky-header-font-compact, 0.875rem);
      box-shadow:  var(--dvfy-sticky-header-shadow, var(--dvfy-shadow-2, 0 2px 8px rgba(0,0,0,.12)));
    }
  }

  dvfy-sticky-header {
    animation: dvfy-sticky-header-shrink linear both;
    animation-timeline: scroll(root block);
    animation-range: 0px var(--dvfy-sticky-header-threshold, 120px);
  }
}

/* ── respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  @supports (animation-timeline: scroll()) {
    dvfy-sticky-header {
      /* Keep compact size + shadow immediately; no animated transition */
      animation: none;
      height:     var(--dvfy-sticky-header-compact-height, 52px);
      box-shadow: var(--dvfy-sticky-header-shadow, var(--dvfy-shadow-2, 0 2px 8px rgba(0,0,0,.12)));
    }
  }
}
`;

class DvfyStickyHeader extends HTMLElement {
  static #styled = false;

  static get observedAttributes() {
    return ['full-height', 'compact-height', 'threshold', 'label'];
  }

  connectedCallback() {
    if (!DvfyStickyHeader.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyStickyHeader.#styled = true;
    }

    if (!this.hasAttribute('role')) this.setAttribute('role', 'banner');
    if (!this.getAttribute('aria-label') && !this.getAttribute('aria-labelledby')) {
      this.setAttribute('aria-label', this.getAttribute('label') || 'Site header');
    }

    this.#applyTokens();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'label') {
      this.setAttribute('aria-label', newVal || 'Site header');
    } else {
      this.#applyTokens();
    }
  }

  #applyTokens() {
    const full    = this.getAttribute('full-height');
    const compact = this.getAttribute('compact-height');
    const thresh  = this.getAttribute('threshold');

    if (full)    this.style.setProperty('--dvfy-sticky-header-full-height',    full);
    if (compact) this.style.setProperty('--dvfy-sticky-header-compact-height', compact);
    if (thresh)  this.style.setProperty('--dvfy-sticky-header-threshold',      thresh);
  }
}

customElements.define('dvfy-sticky-header', DvfyStickyHeader);
