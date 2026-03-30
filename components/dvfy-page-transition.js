const DURATION_MAP = {
  fastest: 'var(--dvfy-duration-fastest)',
  fast:    'var(--dvfy-duration-fast)',
  normal:  'var(--dvfy-duration-normal)',
  slow:    'var(--dvfy-duration-slow)',
  slowest: 'var(--dvfy-duration-slowest)',
};

/** CSS injected once into <head> — keyframes and pseudo-element reset */
const STYLES = `
/* ── dvfy-page-transition: display ── */
dvfy-page-transition {
  display: contents;
}

/* ── Named-element morphing: propagate name to first child ── */
dvfy-page-transition[name] > * {
  view-transition-name: var(--_dvfy-pt-name);
}

/* ── Animation keyframes ── */

/* fade */
@keyframes dvfy-pt-fade-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes dvfy-pt-fade-out { from { opacity: 1; } to { opacity: 0; } }

/* slide-left: new enters from right, old exits to left */
@keyframes dvfy-pt-slide-left-in  { from { transform: translateX(100%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes dvfy-pt-slide-left-out { from { transform: none; opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }

/* slide-right: new enters from left, old exits to right */
@keyframes dvfy-pt-slide-right-in  { from { transform: translateX(-100%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes dvfy-pt-slide-right-out { from { transform: none; opacity: 1; } to { transform: translateX(100%); opacity: 0; } }

/* slide-up: new enters from bottom, old exits to top */
@keyframes dvfy-pt-slide-up-in  { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes dvfy-pt-slide-up-out { from { transform: none; opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }

/* slide-down: new enters from top, old exits to bottom */
@keyframes dvfy-pt-slide-down-in  { from { transform: translateY(-100%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes dvfy-pt-slide-down-out { from { transform: none; opacity: 1; } to { transform: translateY(100%); opacity: 0; } }

/* scale: new zooms in, old zooms out */
@keyframes dvfy-pt-scale-in  { from { transform: scale(0.92); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes dvfy-pt-scale-out { from { transform: none; opacity: 1; } to { transform: scale(1.08); opacity: 0; } }

/* ── Reduced motion: collapse all VTA durations ── */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0ms !important;
  }
}
`;

const ANIMATION_PRESETS = {
  'fade':        { in: 'dvfy-pt-fade-in',        out: 'dvfy-pt-fade-out' },
  'slide-left':  { in: 'dvfy-pt-slide-left-in',  out: 'dvfy-pt-slide-left-out' },
  'slide-right': { in: 'dvfy-pt-slide-right-in', out: 'dvfy-pt-slide-right-out' },
  'slide-up':    { in: 'dvfy-pt-slide-up-in',    out: 'dvfy-pt-slide-up-out' },
  'slide-down':  { in: 'dvfy-pt-slide-down-in',  out: 'dvfy-pt-slide-down-out' },
  'scale':       { in: 'dvfy-pt-scale-in',        out: 'dvfy-pt-scale-out' },
};

/** Build CSS rules for ::view-transition-old/new(root) with the selected preset */
function buildAnimationCSS(animation, duration) {
  const dur  = `var(--dvfy-pt-duration, ${DURATION_MAP[duration] ?? DURATION_MAP.normal})`;
  const ease = `var(--dvfy-pt-easing, var(--dvfy-ease-in-out))`;
  const preset = ANIMATION_PRESETS[animation] ?? ANIMATION_PRESETS.fade;

  return `
::view-transition-old(root) {
  animation: ${dur} ${ease} both ${preset.out};
}
::view-transition-new(root) {
  animation: ${dur} ${ease} both ${preset.in};
}
`;
}

/**
 * <dvfy-page-transition> — View Transitions API wrapper
 *
 * Seamless cross-page (MPA) and in-page (SPA) transitions via the native View
 * Transitions API. MPA mode is zero-JS — just add the element once per page.
 * SPA mode wraps DOM mutations via startTransition(). HTMX integration is
 * automatic when the `htmx` attribute is present.
 *
 * Browser support: Chrome 111+, Edge 111+, Firefox 128+, Safari 18+.
 * Gracefully degrades to instant transitions in older browsers.
 *
 * @element dvfy-page-transition
 *
 * @attr {boolean} mpa - Enable cross-page (MPA) transitions via CSS @view-transition
 * @attr {boolean} htmx - Auto-enable HTMX globalViewTransitions when htmx is detected
 * @attr {string} animation - Preset: fade | slide-left | slide-right | slide-up | slide-down | scale (default: "fade")
 * @attr {string} duration - Speed: fastest | fast | normal | slow | slowest (default: "normal")
 * @attr {string} name - view-transition-name for named element morphing between states
 *
 * @fires transition-start - Fires when a SPA transition begins
 * @fires transition-finish - Fires when a SPA transition completes, detail: { success }
 *
 * @slot - Content to wrap with transitions
 *
 * @cssprop {time} --dvfy-pt-duration - Override transition duration (defaults to duration attr)
 * @cssprop {string} --dvfy-pt-easing - Override transition easing curve
 *
 * @example
 * <!-- MPA cross-page transitions (add once per page, typically near </body>) -->
 * <dvfy-page-transition mpa animation="slide-left"></dvfy-page-transition>
 *
 * <!-- MPA + HTMX: also wraps hx-boost and non-boost HTMX swaps automatically -->
 * <dvfy-page-transition mpa htmx animation="fade"></dvfy-page-transition>
 *
 * <!-- Named element morphing — same name on both pages morphs between them -->
 * <dvfy-page-transition name="hero-image">
 *   <img src="hero.jpg" alt="Hero" />
 * </dvfy-page-transition>
 *
 * <!-- SPA in-page transition via JS API -->
 * <dvfy-page-transition id="main" animation="fade">
 *   <p>Current content</p>
 * </dvfy-page-transition>
 * <script>
 *   const pt = document.querySelector('#main');
 *   pt.startTransition(() => { replaceContentWithTrustedData(pt); });
 * </script>
 */
class DvfyPageTransition extends HTMLElement {
  static #baseStyled = false;
  /** @type {HTMLStyleElement|null} */
  #animStyle = null;
  /** @type {HTMLStyleElement|null} */
  #mpaStyle = null;

  static get observedAttributes() {
    return ['animation', 'duration', 'mpa', 'htmx', 'name'];
  }

  connectedCallback() {
    this.#injectBaseStyles();
    this.#apply();
  }

  disconnectedCallback() {
    this.style.removeProperty('--_dvfy-pt-name');
    this.style.viewTransitionName = '';
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#apply();
  }

  /** Apply all attributes — idempotent */
  #apply() {
    this.#applyName();
    this.#applyMPA();
    this.#applyHtmx();
    this.#applyAnimation();
  }

  /** Apply view-transition-name to this element for named morphing */
  #applyName() {
    const name = this.getAttribute('name');
    if (name) {
      this.style.setProperty('--_dvfy-pt-name', name);
      this.style.viewTransitionName = name;
    } else {
      this.style.removeProperty('--_dvfy-pt-name');
      this.style.viewTransitionName = '';
    }
  }

  /** Inject @view-transition { navigation: auto } for MPA cross-page transitions */
  #applyMPA() {
    const wantsMPA = this.hasAttribute('mpa');

    if (wantsMPA && !this.#mpaStyle) {
      const s = document.createElement('style');
      s.setAttribute('data-dvfy-pt-mpa', '');
      s.textContent = '@view-transition { navigation: auto; }';
      document.head.appendChild(s);
      this.#mpaStyle = s;
    } else if (!wantsMPA && this.#mpaStyle) {
      this.#mpaStyle.remove();
      this.#mpaStyle = null;
    }
  }

  /**
   * Enable HTMX globalViewTransitions when the `htmx` attribute is present.
   * HTMX 1.9+ natively wraps each swap in document.startViewTransition() when
   * htmx.config.globalViewTransitions is true — no custom event handling needed.
   */
  #applyHtmx() {
    if (!this.hasAttribute('htmx')) return;
    if (typeof window.htmx === 'undefined') return;
    window.htmx.config.globalViewTransitions = true;
  }

  /** Inject ::view-transition-old/new animation overrides for the selected preset */
  #applyAnimation() {
    const animation = this.getAttribute('animation') ?? 'fade';
    const duration  = this.getAttribute('duration')  ?? 'normal';

    if (!this.#animStyle) {
      this.#animStyle = document.createElement('style');
      this.#animStyle.setAttribute('data-dvfy-pt-anim', '');
      document.head.appendChild(this.#animStyle);
    }

    this.#animStyle.textContent = buildAnimationCSS(animation, duration);
  }

  /** Inject base keyframe CSS once per document */
  #injectBaseStyles() {
    if (DvfyPageTransition.#baseStyled) return;
    const s = document.createElement('style');
    s.setAttribute('data-dvfy-pt-base', '');
    s.textContent = STYLES;
    document.head.appendChild(s);
    DvfyPageTransition.#baseStyled = true;
  }

  /**
   * Wrap a DOM-update function in a View Transition (SPA mode).
   * Falls back to calling updateFn() directly when View Transitions are not supported.
   *
   * @param {() => void | Promise<void>} updateFn - Synchronous or async DOM mutation
   * @returns {Promise<void>}
   *
   * @example
   * const pt = document.querySelector('dvfy-page-transition');
   * await pt.startTransition(() => {
   *   // Any synchronous DOM mutation
   *   pt.replaceChildren(newNode);
   * });
   */
  async startTransition(updateFn) {
    if (!document.startViewTransition) {
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
      // Transition skipped (another transition started) — not an error
      this.dispatchEvent(new CustomEvent('transition-finish', {
        bubbles: true,
        detail: { success: false },
      }));
    }
  }
}

customElements.define('dvfy-page-transition', DvfyPageTransition);
