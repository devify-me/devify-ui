import { injectStyles } from '../utils/styles.js';

const SUPPORTS_VIEW_TRANSITIONS = typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function';

const STYLES = `
/* ── dvfy-transition-root: display ── */
dvfy-transition-root {
  display: contents;
}

/* ── dvfy-transition-root: ::view-transition pseudo-element defaults ── */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--dvfy-tr-duration, 300ms);
  animation-timing-function: var(--dvfy-tr-easing, ease-out);
}

/* ── Reduced motion: collapse all view transition durations to zero ── */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0ms !important;
  }
}
`;

/**
 * <dvfy-transition-root> — View Transitions API page/element morphing
 *
 * Wraps HTMX navigation in document.startViewTransition() for smooth
 * element-level morphing between pages and states. Hero images, headers,
 * and cards animate seamlessly between routes — zero framework required.
 *
 * Also processes the dvfy-transition-name attribute on any descendant element,
 * mapping it to the CSS view-transition-name property for named element morphing.
 *
 * Attributes:
 *   duration: CSS time value, e.g. "300ms" or "0.3s" (default: "300ms")
 *   easing:   CSS easing function (default: "ease-out")
 *   mpa:      boolean — inject @view-transition { navigation: auto } for cross-document MPA transitions
 *
 * Browser Support:
 *   Chrome 111+, Edge 111+, Firefox 128+, Safari 18+.
 *   Graceful no-op in older browsers (transitions skip, content still swaps).
 *   Respects prefers-reduced-motion (collapses animation to 0ms).
 *
 * Usage (HTMX SPA wrapper):
 *   <dvfy-transition-root duration="300ms" easing="ease-out">
 *     <main id="content" hx-swap-oob="true">...</main>
 *   </dvfy-transition-root>
 *
 * Usage (named element morphing — same name on source + target page morphs between them):
 *   <img dvfy-transition-name="hero" src="thumbnail.jpg" />
 *   <!-- On the next page, same attribute causes the browser to morph between the two -->
 *   <img dvfy-transition-name="hero" src="detail.jpg" />
 *
 * Usage (MPA cross-document transitions):
 *   <dvfy-transition-root mpa animation="slide-left"></dvfy-transition-root>
 *
 * @element dvfy-transition-root
 *
 * @attr {string} duration - CSS time value for transition speed (default: "300ms")
 * @attr {string} easing - CSS easing function (default: "ease-out")
 * @attr {boolean} mpa - Enable @view-transition for cross-document MPA navigation
 *
 * @event {CustomEvent} transition-start - Fires when a view transition begins
 * @event {CustomEvent} transition-finish - Fires when a view transition completes, detail: { success }
 *
 * @slot - Content to wrap; place around HTMX-driven page regions
 *
 * @cssprop {time} --dvfy-tr-duration - Override transition duration
 * @cssprop {string} --dvfy-tr-easing - Override transition easing
 *
 * @example
 * <dvfy-transition-root duration="300ms" easing="ease-out">
 *   <main hx-get="/page" hx-target="this">Page content</main>
 * </dvfy-transition-root>
 */
class DvfyTransitionRoot extends HTMLElement {
  /** @type {HTMLStyleElement|null} Injected for MPA @view-transition rule */
  #mpaStyle = null;
  /** @type {HTMLStyleElement|null} Injected for duration/easing overrides */
  #varStyle = null;
  /** @type {MutationObserver|null} Watches for dvfy-transition-name attribute changes */
  #attrObserver = null;
  /** @type {Function} Bound htmx:beforeSwap handler */
  #onBeforeSwap = null;
  /** @type {Function} Bound htmx:afterSwap handler */
  #onAfterSwap = null;
  /** @type {Function|null} Resolves the current active view transition */
  #resolveTransition = null;
  /** @type {boolean} Cached prefers-reduced-motion state */
  #reducedMotion = false;
  /** @type {MediaQueryList|null} */
  #mql = null;
  #onMotionChange = (e) => { this.#reducedMotion = e.matches; };

  static get observedAttributes() {
    return ['duration', 'easing', 'mpa'];
  }

  connectedCallback() {
    this.#mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.#reducedMotion = this.#mql.matches;
    this.#mql.addEventListener('change', this.#onMotionChange);

    this.#injectBaseStyles();
    this.#apply();
    this.#attachHtmxListeners();
    this.#attachAttrObserver();
    this.#applyTransitionNames();
  }

  disconnectedCallback() {
    if (this.#mql) {
      this.#mql.removeEventListener('change', this.#onMotionChange);
      this.#mql = null;
    }
    this.#detachHtmxListeners();
    if (this.#attrObserver) {
      this.#attrObserver.disconnect();
      this.#attrObserver = null;
    }
    if (this.#mpaStyle) {
      this.#mpaStyle.remove();
      this.#mpaStyle = null;
    }
    if (this.#varStyle) {
      this.#varStyle.remove();
      this.#varStyle = null;
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#apply();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Wrap a DOM-update function in a View Transition (SPA mode).
   * Falls back to calling updateFn() directly when View Transitions are unsupported.
   *
   * @param {() => void | Promise<void>} updateFn - DOM mutation callback
   * @returns {Promise<void>}
   *
   * @example
   * const root = document.querySelector('dvfy-transition-root');
   * await root.startTransition(() => {
   *   document.querySelector('#content').replaceChildren(newNode);
   * });
   */
  async startTransition(updateFn) {
    if (!SUPPORTS_VIEW_TRANSITIONS) {
      await updateFn();
      return;
    }

    this.dispatchEvent(new CustomEvent('transition-start', { bubbles: true }));

    const transition = document.startViewTransition(async () => {
      await updateFn();
    });

    try {
      await transition.finished;
      this.dispatchEvent(new CustomEvent('transition-finish', {
        bubbles: true,
        detail: { success: true },
      }));
    } catch {
      this.dispatchEvent(new CustomEvent('transition-finish', {
        bubbles: true,
        detail: { success: false },
      }));
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /** Apply all attributes — idempotent */
  #apply() {
    this.#applyMPA();
    this.#applyVars();
  }

  /** Inject @view-transition for MPA cross-document transitions */
  #applyMPA() {
    const wantsMPA = this.hasAttribute('mpa');

    if (wantsMPA && !this.#mpaStyle) {
      // Guard against duplicates if multiple transition roots exist
      const existing = document.head.querySelector('[data-dvfy-tr-mpa]');
      if (existing) {
        this.#mpaStyle = /** @type {HTMLStyleElement} */ (existing);
      } else {
        const s = document.createElement('style');
        s.setAttribute('data-dvfy-tr-mpa', '');
        s.textContent = '@view-transition { navigation: auto; }';
        document.head.appendChild(s);
        this.#mpaStyle = s;
      }
    } else if (!wantsMPA && this.#mpaStyle) {
      // Only remove if we own it (no other transition-root may need it)
      const others = document.querySelectorAll('dvfy-transition-root[mpa]');
      if (others.length === 0) {
        this.#mpaStyle.remove();
      }
      this.#mpaStyle = null;
    }
  }

  /** Inject CSS custom property overrides for duration + easing */
  #applyVars() {
    const duration = this.getAttribute('duration') || '300ms';
    const easing   = this.getAttribute('easing')   || 'ease-out';

    if (!this.#varStyle) {
      this.#varStyle = document.createElement('style');
      this.#varStyle.setAttribute('data-dvfy-tr-vars', '');
      document.head.appendChild(this.#varStyle);
    }

    // Set on :root so ::view-transition-* pseudo-elements can inherit them
    const safeDuration = CSS.supports('animation-duration', duration) ? duration : '300ms';
    const safeEasing   = CSS.supports('animation-timing-function', easing) ? easing : 'ease-out';

    this.#varStyle.textContent = `
:root {
  --dvfy-tr-duration: ${safeDuration};
  --dvfy-tr-easing:   ${safeEasing};
}`;
  }

  /**
   * Wire up HTMX lifecycle hooks to wrap swaps in a view transition.
   *
   * Strategy: capture old state in htmx:beforeSwap by calling startViewTransition,
   * then resolve the transition promise in htmx:afterSwap once HTMX has updated the DOM.
   */
  #attachHtmxListeners() {
    if (!SUPPORTS_VIEW_TRANSITIONS) return;

    this.#onBeforeSwap = (/** @type {CustomEvent} */ e) => {
      // Skip if reduced motion — let HTMX swap without a transition
      if (this.#reducedMotion) return;

      // Only wrap swaps targeting elements inside this root (or the root itself)
      const target = e.detail?.target;
      if (!target || (!this.contains(target) && target !== this)) return;

      this.dispatchEvent(new CustomEvent('transition-start', { bubbles: true }));

      // Start the transition: browser captures old-state snapshot here.
      // The promise resolves after htmx:afterSwap fires, at which point
      // the browser captures new-state and begins the animation.
      document.startViewTransition(() => {
        return new Promise((resolve) => {
          this.#resolveTransition = resolve;
        });
      }).finished.then(
        () => this.dispatchEvent(new CustomEvent('transition-finish', {
          bubbles: true, detail: { success: true },
        })),
      ).catch(() => {
        this.dispatchEvent(new CustomEvent('transition-finish', {
          bubbles: true, detail: { success: false },
        }));
      });
    };

    this.#onAfterSwap = () => {
      if (this.#resolveTransition) {
        this.#resolveTransition();
        this.#resolveTransition = null;
        // Re-apply dvfy-transition-name on newly swapped elements
        this.#applyTransitionNames();
      }
    };

    document.addEventListener('htmx:beforeSwap', this.#onBeforeSwap);
    document.addEventListener('htmx:afterSwap',  this.#onAfterSwap);
  }

  #detachHtmxListeners() {
    if (this.#onBeforeSwap) {
      document.removeEventListener('htmx:beforeSwap', this.#onBeforeSwap);
      this.#onBeforeSwap = null;
    }
    if (this.#onAfterSwap) {
      document.removeEventListener('htmx:afterSwap', this.#onAfterSwap);
      this.#onAfterSwap = null;
    }
    // Resolve any dangling transition (prevents a frozen transition if disconnected mid-swap)
    if (this.#resolveTransition) {
      this.#resolveTransition();
      this.#resolveTransition = null;
    }
  }

  /**
   * Watch for dvfy-transition-name attribute additions/changes on any descendant,
   * and set style.viewTransitionName accordingly.
   */
  #attachAttrObserver() {
    this.#attrObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        this.#handleMutation(mutation);
      }
    });

    this.#attrObserver.observe(this, {
      subtree: true,
      childList: true,
      attributeFilter: ['dvfy-transition-name'],
    });
  }

  /**
   * Route a single MutationRecord to the appropriate handler.
   *
   * @param {MutationRecord} mutation
   */
  #handleMutation(mutation) {
    if (mutation.type === 'attributes' &&
        mutation.attributeName === 'dvfy-transition-name') {
      this.#applyTransitionName(/** @type {Element} */ (mutation.target));
      return;
    }
    if (mutation.type !== 'childList') return;
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.#applyTransitionNames(/** @type {Element} */ (node));
      }
    }
  }

  /**
   * Walk all elements within `root` (or this element) and apply view-transition-name
   * from dvfy-transition-name attributes.
   *
   * @param {Element} [root]
   */
  #applyTransitionNames(root = this) {
    for (const el of root.querySelectorAll('[dvfy-transition-name]')) {
      this.#applyTransitionName(el);
    }
    // Also check the root element itself
    if (root !== this && root.hasAttribute?.('dvfy-transition-name')) {
      this.#applyTransitionName(root);
    }
  }

  /**
   * Set CSS view-transition-name on a single element from its dvfy-transition-name attribute.
   *
   * @param {Element} el
   */
  #applyTransitionName(el) {
    const name = el.getAttribute('dvfy-transition-name');
    if (name) {
      /** @type {HTMLElement} */ (el).style.viewTransitionName = name;
    } else {
      /** @type {HTMLElement} */ (el).style.viewTransitionName = '';
    }
  }

  #injectBaseStyles() { injectStyles('dvfy-transition-root', STYLES); }
}

customElements.define('dvfy-transition-root', DvfyTransitionRoot);
