/**
 * <dvfy-parallax> — Scroll parallax depth effect without WebGL
 *
 * Wraps any content (images, sections, divs) and translates its inner
 * layer at a fraction of the scroll speed, creating convincing depth.
 *
 * The component listens to window scroll (or a custom scroll container)
 * with a passive listener and uses IntersectionObserver to skip updates
 * when off-screen. Respects prefers-reduced-motion.
 *
 * @attr {number} factor - Parallax speed factor (default: 0.3).
 *   Positive: element moves slower than scroll (classic depth).
 *   Negative: element moves opposite to scroll direction.
 *   Range 0.1–0.9 for natural depth; 0 disables translation.
 *
 * @attr {string} scroll-target - CSS selector for a custom scroll
 *   container (default: listens on window scroll).
 *
 * @slot - Content to apply the parallax transform to.
 *
 * @cssprop {length} --dvfy-parallax-overflow - Overflow to clip the
 *   translated layer (default: hidden). Set to visible to allow
 *   content to escape its bounds.
 *
 * @example
 * <!-- Hero image with subtle depth -->
 * <dvfy-parallax factor="0.3">
 *   <img src="hero.jpg" alt="Hero" style="width:100%;height:400px;object-fit:cover">
 * </dvfy-parallax>
 *
 * <!-- Opposite-direction foreground element -->
 * <dvfy-parallax factor="-0.2">
 *   <div class="floating-badge">New</div>
 * </dvfy-parallax>
 *
 * <!-- Custom scroll container -->
 * <dvfy-parallax factor="0.4" scroll-target="#panel">
 *   <img src="bg.jpg" alt="">
 * </dvfy-parallax>
 */

const STYLES = `
dvfy-parallax {
  display: block;
  overflow: var(--dvfy-parallax-overflow, hidden);
  position: relative;
}

dvfy-parallax > .dvfy-parallax-inner {
  will-change: transform;
  /* Slight vertical oversize so the translated content doesn't reveal gaps */
  min-height: calc(100% + 60px);
  margin-block: -30px;
}

@media (prefers-reduced-motion: reduce) {
  dvfy-parallax > .dvfy-parallax-inner {
    transform: none !important;
    will-change: auto;
    margin-block: 0;
    min-height: 100%;
  }
}
`;

class DvfyParallax extends HTMLElement {
  static #styled = false;

  /** @type {IntersectionObserver|null} */
  #io = null;
  #visible = false;
  #reducedMotion = false;
  #inner = null;
  #mqRef = null;

  /** Bound listener refs for cleanup */
  #onScroll = () => this.#update();
  #onMotionChange = (mq) => {
    this.#reducedMotion = mq.matches;
    if (this.#reducedMotion) this.#resetTransform();
  };

  /** The element that scrolls (window or a custom container) */
  #scrollTarget = null;

  static get observedAttributes() {
    return ['factor', 'scroll-target'];
  }

  connectedCallback() {
    if (!DvfyParallax.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyParallax.#styled = true;
    }

    // Wrap existing children in an inner div for transform isolation
    if (!this.#inner) {
      this.#inner = document.createElement('div');
      this.#inner.className = 'dvfy-parallax-inner';
      // Move existing children into the inner wrapper
      while (this.firstChild) {
        this.#inner.appendChild(this.firstChild);
      }
      this.appendChild(this.#inner);
    }

    // Detect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.#reducedMotion = mq.matches;
    mq.addEventListener('change', this.#onMotionChange);
    this.#mqRef = mq;

    this.#setupScrollTarget();
    this.#setupIntersectionObserver();
  }

  disconnectedCallback() {
    this.#teardown();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'scroll-target') {
      this.#teardown(/* keepInner */ true);
      this.#setupScrollTarget();
      this.#setupIntersectionObserver();
    }
    // factor changes take effect on next scroll event automatically
  }

  // ── Private helpers ────────────────────────────────────────────────

  get #factor() {
    const val = parseFloat(this.getAttribute('factor'));
    return Number.isFinite(val) ? val : 0.3;
  }

  #setupScrollTarget() {
    const selector = this.getAttribute('scroll-target');
    if (selector) {
      const el = document.querySelector(selector);
      this.#scrollTarget = el || window;
    } else {
      this.#scrollTarget = window;
    }
    this.#scrollTarget.addEventListener('scroll', this.#onScroll, { passive: true });
  }

  #setupIntersectionObserver() {
    this.#io = new IntersectionObserver(
      (entries) => {
        this.#visible = entries[0].isIntersecting;
        if (this.#visible) this.#update();
      },
      { threshold: 0 }
    );
    this.#io.observe(this);
  }

  #update() {
    if (!this.#visible || this.#reducedMotion || !this.#inner) return;

    const rect = this.getBoundingClientRect();
    // Offset relative to the element's vertical center in the viewport
    const viewH = window.innerHeight;
    const centerOffset = rect.top + rect.height / 2 - viewH / 2;

    const translate = centerOffset * this.#factor;
    this.#inner.style.transform = `translateY(${translate.toFixed(2)}px)`;
  }

  #resetTransform() {
    if (this.#inner) this.#inner.style.transform = '';
  }

  #teardown(keepInner = false) {
    if (this.#scrollTarget) {
      this.#scrollTarget.removeEventListener('scroll', this.#onScroll);
      this.#scrollTarget = null;
    }
    if (this.#io) {
      this.#io.disconnect();
      this.#io = null;
    }
    if (this.#mqRef) {
      this.#mqRef.removeEventListener('change', this.#onMotionChange);
      this.#mqRef = null;
    }
    if (!keepInner) {
      this.#inner = null;
    }
  }
}

customElements.define('dvfy-parallax', DvfyParallax);
