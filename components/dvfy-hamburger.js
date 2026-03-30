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
   Animation variants — [open] state transforms
   ════════════════════════════════════════════════ */

/* ── 1. x (default) ── */
dvfy-hamburger:not([animation])[open] .dvfy-hb__bar--top,
dvfy-hamburger[animation="x"][open] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(45deg);
}
dvfy-hamburger:not([animation])[open] .dvfy-hb__bar--mid,
dvfy-hamburger[animation="x"][open] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger:not([animation])[open] .dvfy-hb__bar--bot,
dvfy-hamburger[animation="x"][open] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(-45deg);
}

/* ── 2. x-rotate-r (X with clockwise rotation) ── */
dvfy-hamburger[animation="x-rotate-r"][open] .dvfy-hb__btn {
  transform: rotate(180deg);
}
dvfy-hamburger[animation="x-rotate-r"][open] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(45deg);
}
dvfy-hamburger[animation="x-rotate-r"][open] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[animation="x-rotate-r"][open] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(-45deg);
}

/* ── 3. x-rotate-l (X with counter-clockwise rotation) ── */
dvfy-hamburger[animation="x-rotate-l"][open] .dvfy-hb__btn {
  transform: rotate(-180deg);
}
dvfy-hamburger[animation="x-rotate-l"][open] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(45deg);
}
dvfy-hamburger[animation="x-rotate-l"][open] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[animation="x-rotate-l"][open] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(-45deg);
}

/* ── 4. chevron-left (<) ── */
dvfy-hamburger[animation="chevron-left"][open] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(-45deg) scaleX(0.6);
  transform-origin: left center;
}
dvfy-hamburger[animation="chevron-left"][open] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[animation="chevron-left"][open] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(45deg) scaleX(0.6);
  transform-origin: left center;
}

/* ── 5. chevron-right (>) ── */
dvfy-hamburger[animation="chevron-right"][open] .dvfy-hb__bar--top {
  transform: translateY(calc(var(--_gap) + var(--_h))) rotate(45deg) scaleX(0.6);
  transform-origin: right center;
}
dvfy-hamburger[animation="chevron-right"][open] .dvfy-hb__bar--mid {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[animation="chevron-right"][open] .dvfy-hb__bar--bot {
  transform: translateY(calc(-1 * (var(--_gap) + var(--_h)))) rotate(-45deg) scaleX(0.6);
  transform-origin: right center;
}

/* ── 6. minus ── */
dvfy-hamburger[animation="minus"][open] .dvfy-hb__bar--top {
  opacity: 0;
  transform: scaleX(0);
}
dvfy-hamburger[animation="minus"][open] .dvfy-hb__bar--bot {
  opacity: 0;
  transform: scaleX(0);
}
`;

/**
 * Animated hamburger icon button — a Tier 1 primitive for menu toggles.
 *
 * Six animation variants transform three bars into different shapes on toggle.
 * Composable into nav, header, and sidebar components.
 *
 * @element dvfy-hamburger
 *
 * @attr {string} label - Visible text label
 * @attr {string} label-position - top | right | bottom | left
 * @attr {string} animation - x | x-rotate-r | x-rotate-l | chevron-left | chevron-right | minus
 * @attr {string} size - xs | sm | md | lg | xl
 * @attr {boolean} open - Toggle state (reflected)
 * @attr {boolean} disabled - Disables the button
 * @attr {boolean} bordered - Adds a rounded border
 * @attr {string} float - top-left | top-right | mid-top | mid-right | mid-bottom | mid-left | center | bottom-left | bottom-right
 *
 * @event {CustomEvent} toggle - Fires when toggled, detail: { open: boolean }
 *
 * @cssprop {color} --dvfy-hamburger-color - Top and bottom bar + border color (default: var(--dvfy-primary-bg))
 * @cssprop {color} --dvfy-hamburger-accent - Middle bar color (default: var(--dvfy-accent-bg))
 * @cssprop {color} --dvfy-hamburger-bg - Button background (default: transparent)
 *
 * @example
 * <dvfy-hamburger animation="x" size="md" bordered></dvfy-hamburger>
 */
class DvfyHamburger extends HTMLElement {
  static get observedAttributes() { return ['label', 'label-position', 'animation', 'size', 'open', 'disabled', 'bordered', 'float']; }

  /** @type {HTMLButtonElement} */
  #btn = null;
  #clickHandler = null;
  #keyHandler = null;

  connectedCallback() {
    injectStyles('dvfy-hamburger', STYLES);
    this.#build();

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
    if (name === 'open') {
      this.#btn.setAttribute('aria-expanded', String(this.open));
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

  #build() {
    const labelText = this.getAttribute('label');
    if (labelText) {
      const lbl = document.createElement('span');
      lbl.className = 'dvfy-hb__label';
      lbl.textContent = labelText;
      this.appendChild(lbl);
    }

    this.#btn = document.createElement('button');
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
      detail: { open: this.open }
    }));
  }
}

customElements.define('dvfy-hamburger', DvfyHamburger);
