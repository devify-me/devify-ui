import { injectStyles } from '../utils/styles.js';

const STYLES = `
/* ── Host ── */
dvfy-hamburger {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dvfy-space-1-5);
  --_btn: 2.5rem;
  --_w: 1.375rem;
  --_h: 2.5px;
  --_gap: 5px;
  --_r: 1.5px;
}

/* ── Sizes ── */
dvfy-hamburger[size="xs"] { --_btn: 1.5rem; --_w: 0.875rem; --_h: 2px; --_gap: 3px; --_r: 1px; }
dvfy-hamburger[size="sm"] { --_btn: 2rem; --_w: 1.125rem; --_h: 2px; --_gap: 4px; --_r: 1px; }
dvfy-hamburger[size="lg"] { --_btn: 3rem; --_w: 1.75rem; --_h: 3px; --_gap: 6px; --_r: 2px; }
dvfy-hamburger[size="xl"] { --_btn: 3.5rem; --_w: 2.125rem; --_h: 3.5px; --_gap: 7px; --_r: 2px; }

/* ── Button reset ── */
.dvfy-hb__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--_gap);
  width: var(--_btn);
  height: var(--_btn);
  padding: 0;
  border: none;
  background: var(--dvfy-hamburger-bg, transparent);
  cursor: pointer;
  border-radius: var(--dvfy-radius-md);
  transition: transform var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
.dvfy-hb__btn:focus-visible {
  outline: var(--dvfy-ring-width, 3px) solid var(--dvfy-ring-color, currentColor);
  outline-offset: var(--dvfy-ring-offset, 2px);
}

/* ── Bars ── */
.dvfy-hb__bar {
  display: block;
  width: var(--_w);
  height: var(--_h);
  background: var(--dvfy-hamburger-color, var(--dvfy-primary-bg));
  border-radius: var(--_r);
  transition: transform var(--dvfy-duration-normal) var(--dvfy-ease-out),
              opacity var(--dvfy-duration-normal) var(--dvfy-ease-out);
  transform-origin: center center;
}
.dvfy-hb__bar--mid {
  background: var(--dvfy-hamburger-accent, var(--dvfy-accent-bg));
}

/* ── Label ── */
.dvfy-hb__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}
dvfy-hamburger[size="xs"] .dvfy-hb__label { font-size: var(--dvfy-text-xs); }
dvfy-hamburger[size="sm"] .dvfy-hb__label { font-size: var(--dvfy-text-xs); }
dvfy-hamburger[size="xl"] .dvfy-hb__label { font-size: var(--dvfy-text-base); }

/* ── Label position ── */
dvfy-hamburger[label-position="bottom"] .dvfy-hb__label { order: 1; }
dvfy-hamburger[label-position="left"] { flex-direction: row; align-items: center; }
dvfy-hamburger[label-position="right"] { flex-direction: row; align-items: center; }
dvfy-hamburger[label-position="right"] .dvfy-hb__label { order: 1; }

/* ── Bordered ── */
dvfy-hamburger[bordered] .dvfy-hb__btn {
  border: 2px solid var(--dvfy-hamburger-color, var(--dvfy-primary-bg));
  border-radius: var(--dvfy-radius-lg);
}

/* ── Disabled ── */
dvfy-hamburger[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

/* ── Float ── */
dvfy-hamburger[float] {
  position: absolute;
  z-index: var(--dvfy-z-sticky);
}
dvfy-hamburger[float] .dvfy-hb__btn {
  background: var(--dvfy-hamburger-bg, var(--dvfy-elevation-lg-bg));
  border-radius: var(--dvfy-radius-round);
  box-shadow: var(--dvfy-shadow-lg);
}
dvfy-hamburger[float="top-left"]     { top: var(--dvfy-space-4); left: var(--dvfy-space-4); }
dvfy-hamburger[float="top-right"]    { top: var(--dvfy-space-4); right: var(--dvfy-space-4); }
dvfy-hamburger[float="mid-top"]      { top: var(--dvfy-space-4); left: 50%; translate: -50% 0; }
dvfy-hamburger[float="mid-right"]    { top: 50%; right: var(--dvfy-space-4); translate: 0 -50%; }
dvfy-hamburger[float="mid-bottom"]   { bottom: var(--dvfy-space-4); left: 50%; translate: -50% 0; }
dvfy-hamburger[float="mid-left"]     { top: 50%; left: var(--dvfy-space-4); translate: 0 -50%; }
dvfy-hamburger[float="center"]       { top: 50%; left: 50%; translate: -50% -50%; }
dvfy-hamburger[float="bottom-left"]  { bottom: var(--dvfy-space-4); left: var(--dvfy-space-4); }
dvfy-hamburger[float="bottom-right"] { bottom: var(--dvfy-space-4); right: var(--dvfy-space-4); }

/* ════════════════════════════════════════════════
   Visual states — [data-state="X"] transforms
   The component derives data-state from the public
   API (state | open + animation) and applies the
   end-state transforms here. CSS transitions on the
   bars interpolate smoothly between any two states.
   ════════════════════════════════════════════════ */

/* ── hamburger (default — no transform) ── */
/* All bars are in their resting position. */

/* ── x ── */
dvfy-hamburger[data-state="x"] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(45deg);
}
dvfy-hamburger[data-state="x"] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[data-state="x"] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(-45deg);
}

/* ── direction modifier: rotates the whole button when in any non-resting state ── */
dvfy-hamburger[direction="right"][data-state]:not([data-state="hamburger"]) .dvfy-hb__btn {
  transform: rotate(180deg);
}
dvfy-hamburger[direction="left"][data-state]:not([data-state="hamburger"]) .dvfy-hb__btn {
  transform: rotate(-180deg);
}

/* ── chevron-left (<) ── */
dvfy-hamburger[data-state="chevron-left"] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(-45deg) scaleX(0.6);
  transform-origin: left center;
}
dvfy-hamburger[data-state="chevron-left"] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[data-state="chevron-left"] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(45deg) scaleX(0.6);
  transform-origin: left center;
}

/* ── chevron-right (>) ── */
dvfy-hamburger[data-state="chevron-right"] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(45deg) scaleX(0.6);
  transform-origin: right center;
}
dvfy-hamburger[data-state="chevron-right"] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[data-state="chevron-right"] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(-45deg) scaleX(0.6);
  transform-origin: right center;
}

/* ── minus (−) ── */
dvfy-hamburger[data-state="minus"] .dvfy-hb__bar--top {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[data-state="minus"] .dvfy-hb__bar--bot {
  opacity: 0;
  transform: scaleX(0);
}
`;

/* Valid state values (used for back-compat mapping + validation) */
const VALID_STATES = new Set(['hamburger', 'x', 'chevron-left', 'chevron-right', 'minus']);
/* Legacy animation values that map directly to a state value */
const LEGACY_ANIMATION_TO_STATE = {
  'x': 'x',
  'x-rotate-r': 'x',          // x + direction=right
  'x-rotate-l': 'x',          // x + direction=left
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'minus': 'minus',
};
const LEGACY_ANIMATION_TO_DIRECTION = {
  'x-rotate-r': 'right',
  'x-rotate-l': 'left',
};

/**
 * State-driven animated icon button — a Tier 1 primitive for menu toggles
 * and other binary/multi-state controls.
 *
 * Five visual states (hamburger, x, chevron-left, chevron-right, minus) are
 * driven by the `state` attribute. CSS transitions interpolate between any
 * two states automatically; consumers set the state, the component animates.
 *
 * Composable into nav, header, drawer, sidebar, stepper, and modal components.
 *
 * @element dvfy-hamburger
 *
 * @attr {string} state - Visual state: hamburger | x | chevron-left | chevron-right | minus (default: "hamburger")
 * @attr {string} direction - Optional 180° button rotation flavor: left | right (mirrors legacy x-rotate-l / x-rotate-r)
 * @attr {string} label - Visible text label
 * @attr {string} label-position - top | right | bottom | left
 * @attr {string} animation - DEPRECATED. Use `state` (and optionally `direction`). When `state` is unset, `animation` maps to the open-state target for backwards compat.
 * @attr {string} size - xs | sm | md | lg | xl
 * @attr {boolean} open - DEPRECATED for new code. Convenience toggle: when true (and `state` is unset), maps to state="x" (or whatever `animation` specifies).
 * @attr {boolean} disabled - Disables the button
 * @attr {boolean} bordered - Adds a rounded border
 * @attr {string} float - top-left | top-right | mid-top | mid-right | mid-bottom | mid-left | center | bottom-left | bottom-right
 *
 * @event {CustomEvent} toggle - Fires on click, detail: { open: boolean, state: string }
 *
 * @cssprop {color} --dvfy-hamburger-color - Top and bottom bar + border color (default: var(--dvfy-primary-bg))
 * @cssprop {color} --dvfy-hamburger-accent - Middle bar color (default: var(--dvfy-accent-bg))
 * @cssprop {color} --dvfy-hamburger-bg - Button background (default: transparent)
 *
 * @example
 * <!-- New state-based API -->
 * <dvfy-hamburger state="x"></dvfy-hamburger>
 * <dvfy-hamburger state="chevron-left"></dvfy-hamburger>
 * <dvfy-hamburger state="x" direction="left"></dvfy-hamburger>
 *
 * @example
 * <!-- Legacy open/animation API (still supported) -->
 * <dvfy-hamburger animation="x" size="md" bordered></dvfy-hamburger>
 */
class DvfyHamburger extends HTMLElement {
  static get observedAttributes() { return ['label', 'label-position', 'state', 'animation', 'size', 'open', 'disabled', 'bordered', 'float']; }

  /** @type {HTMLButtonElement} */
  #btn = null;
  #clickHandler = null;
  #keyHandler = null;

  connectedCallback() {
    injectStyles('dvfy-hamburger', STYLES);
    this.#build();
    this.#syncDataState();

    this.#clickHandler = () => this.#toggle();
    this.#keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.#toggle();
      }
    };

    this.#btn.addEventListener('click', this.#clickHandler);
    this.#btn.addEventListener('keydown', this.#keyHandler);
  }

  disconnectedCallback() {
    if (this.#btn) {
      this.#btn.removeEventListener('click', this.#clickHandler);
      this.#btn.removeEventListener('keydown', this.#keyHandler);
    }
  }

  attributeChangedCallback(name) {
    if (!this.#btn) return;
    if (name === 'open' || name === 'state' || name === 'animation') {
      this.#syncDataState();
    } else if (name === 'disabled') {
      this.#btn.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
    } else if (name === 'label') {
      const labelText = this.getAttribute('label');
      let lbl = this.querySelector('.dvfy-hb__label');
      if (labelText) {
        if (!lbl) {
          lbl = document.createElement('span');
          lbl.className = 'dvfy-hb__label';
          this.insertBefore(lbl, this.#btn);
        }
        lbl.textContent = labelText;
      } else if (lbl) {
        lbl.remove();
      }
      this.#btn.setAttribute('aria-label', labelText || 'Toggle menu');
    }
  }

  get open() { return this.hasAttribute('open'); }
  set open(v) { v ? this.setAttribute('open', '') : this.removeAttribute('open'); }

  /**
   * Derive the effective visual state from the public API, in priority order:
   *   1. `state` attr — explicit, takes precedence
   *   2. `open` + `animation` — legacy: animation value is the open-state target
   *   3. `open` alone — defaults to "x"
   *   4. none of the above — "hamburger"
   * The result is mirrored to `data-state` for CSS targeting.
   */
  #syncDataState() {
    const explicit = this.getAttribute('state');
    let next;
    if (explicit && VALID_STATES.has(explicit)) {
      next = explicit;
    } else if (this.open) {
      const anim = this.getAttribute('animation');
      next = (anim && LEGACY_ANIMATION_TO_STATE[anim]) || 'x';
      // Mirror legacy x-rotate-r/l direction onto the public direction attribute
      const dir = LEGACY_ANIMATION_TO_DIRECTION[anim];
      if (dir && !this.hasAttribute('direction')) this.setAttribute('direction', dir);
    } else {
      next = 'hamburger';
    }
    if (this.getAttribute('data-state') !== next) {
      this.setAttribute('data-state', next);
    }
    // Mirror "is the icon in a non-resting state" to aria-expanded so
    // assistive tech sees the toggle correctly regardless of whether the
    // consumer drives `open` or `state`.
    if (this.#btn) {
      this.#btn.setAttribute('aria-expanded', String(next !== 'hamburger'));
    }
  }

  #build() {
    // Idempotent: clear any prior content (e.g. when a parent like dvfy-drawer
    // tears down + re-mounts us via its own #build cycle, our connectedCallback
    // fires again and would otherwise stack stale buttons).
    if (this.#btn && this.#clickHandler) {
      this.#btn.removeEventListener('click', this.#clickHandler);
      this.#btn.removeEventListener('keydown', this.#keyHandler);
    }
    this.textContent = '';

    const labelText = this.getAttribute('label');
    if (labelText) {
      const lbl = document.createElement('span');
      lbl.className = 'dvfy-hb__label';
      lbl.textContent = labelText;
      this.appendChild(lbl);
    }

    this.#btn = document.createElement('button'); // allow-dvfy-pref: dvfy-hamburger IS itself the button primitive
    this.#btn.className = 'dvfy-hb__btn';
    this.#btn.setAttribute('type', 'button');
    this.#btn.setAttribute('aria-label', labelText || 'Toggle menu');
    this.#btn.setAttribute('aria-expanded', String(this.open));
    if (this.hasAttribute('disabled')) {
      this.#btn.setAttribute('aria-disabled', 'true');
    }

    const top = document.createElement('span');
    top.className = 'dvfy-hb__bar dvfy-hb__bar--top';
    const mid = document.createElement('span');
    mid.className = 'dvfy-hb__bar dvfy-hb__bar--mid';
    const bot = document.createElement('span');
    bot.className = 'dvfy-hb__bar dvfy-hb__bar--bot';

    this.#btn.append(top, mid, bot);
    this.appendChild(this.#btn);
  }

  #toggle() {
    if (this.hasAttribute('disabled')) return;
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent('toggle', {
      bubbles: true,
      detail: { open: this.open, state: this.getAttribute('data-state') }
    }));
  }
}

customElements.define('dvfy-hamburger', DvfyHamburger);
