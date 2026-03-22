/**
 * <dvfy-magnetic-button> — cursor-attracted magnetic hover effect
 *
 * Wraps any child element and applies a subtle magnetic pull toward the cursor
 * on hover, simulating physical attraction. A premium micro-interaction for
 * CTAs and navigation items.
 *
 * The effect tracks cursor offset from the element center and interpolates
 * the element's translate transform toward the cursor each animation frame,
 * creating a spring-like follow. On mouseleave the element snaps back smoothly.
 *
 * Attributes:
 *   intensity: number — Pull strength 0.0–1.0 (default: 0.4)
 *   ease:      number — Lerp factor per frame 0.0–1.0 (default: 0.15)
 *
 * CSS Custom Properties:
 *   --dvfy-magnetic-transition-duration   Return-to-origin transition (default: 0.4s)
 *
 * Browser Support:
 *   All modern browsers. requestAnimationFrame for the lerp loop.
 *   prefers-reduced-motion: disables effect entirely.
 *   Touch devices: effect is skipped (pointer coarse media query).
 *
 * Usage:
 *   <dvfy-magnetic-button intensity="0.4" ease="0.15">
 *     <dvfy-button variant="primary">Get Started</dvfy-button>
 *   </dvfy-magnetic-button>
 */

const STYLES = `
dvfy-magnetic-button {
  display: inline-block;
}

dvfy-magnetic-button > * {
  display: block;
  will-change: transform;
}
`;

/**
 * Cursor-attracted magnetic hover wrapper. Any slotted child element is
 * pulled toward the cursor on hover via interpolated CSS transforms.
 *
 * @element dvfy-magnetic-button
 *
 * @attr {number} intensity - Pull strength 0.0–1.0 (default: 0.4)
 * @attr {number} ease - Lerp factor per frame 0.0–1.0, higher = snappier (default: 0.15)
 *
 * @slot - Child element to apply the magnetic effect to
 *
 * @cssprop {time} --dvfy-magnetic-transition-duration - Return-to-origin transition duration (default: 0.4s)
 */
class DvfyMagneticButton extends HTMLElement {
  static #styled = false;

  /** @type {number} Current interpolated X position */
  #x = 0;
  /** @type {number} Current interpolated Y position */
  #y = 0;
  /** @type {number} Target X position from cursor */
  #targetX = 0;
  /** @type {number} Target Y position from cursor */
  #targetY = 0;
  /** @type {number|null} requestAnimationFrame handle */
  #rafId = null;
  /** @type {boolean} Whether cursor is over element */
  #active = false;
  /** @type {boolean} Motion is reduced or touch device */
  #disabled = false;

  connectedCallback() {
    if (!DvfyMagneticButton.#styled) {
      const sheet = document.createElement('style');
      sheet.textContent = STYLES;
      document.head.appendChild(sheet);
      DvfyMagneticButton.#styled = true;
    }

    this.#checkDisabled();
    if (!this.#disabled) {
      this.addEventListener('mousemove', this.#onMouseMove);
      this.addEventListener('mouseleave', this.#onMouseLeave);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
    this.#stopLoop();
  }

  static get observedAttributes() {
    return ['intensity', 'ease'];
  }

  get #intensity() {
    const v = parseFloat(this.getAttribute('intensity'));
    return isNaN(v) ? 0.4 : Math.max(0, Math.min(1, v));
  }

  get #ease() {
    const v = parseFloat(this.getAttribute('ease'));
    return isNaN(v) ? 0.15 : Math.max(0.01, Math.min(1, v));
  }

  #checkDisabled() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touchDevice = window.matchMedia('(pointer: coarse)').matches;
    this.#disabled = reducedMotion || touchDevice;
  }

  #onMouseMove = (e) => {
    const rect = this.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;

    this.#targetX = offsetX * this.#intensity;
    this.#targetY = offsetY * this.#intensity;

    if (!this.#active) {
      this.#active = true;
      this.#clearReturnTransition();
      this.#startLoop();
    }
  };

  #onMouseLeave = () => {
    this.#active = false;
    this.#targetX = 0;
    this.#targetY = 0;
    // Snap remaining distance instantly via CSS transition on leave
    this.#stopLoop();
    this.#applyReturn();
  };

  #startLoop() {
    const loop = () => {
      const ease = this.#ease;
      this.#x += (this.#targetX - this.#x) * ease;
      this.#y += (this.#targetY - this.#y) * ease;
      this.#applyTransform(this.#x, this.#y);

      if (this.#active) {
        this.#rafId = requestAnimationFrame(loop);
      }
    };
    this.#rafId = requestAnimationFrame(loop);
  }

  #stopLoop() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  #clearReturnTransition() {
    const child = this.firstElementChild;
    if (child) child.style.transition = 'none';
  }

  #applyReturn() {
    const child = this.firstElementChild;
    if (!child) return;
    const duration = getComputedStyle(this).getPropertyValue('--dvfy-magnetic-transition-duration').trim() || '0.4s';
    child.style.transition = `transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    child.style.transform = 'translate(0px, 0px)';
    // Reset internal state after transition
    setTimeout(() => {
      this.#x = 0;
      this.#y = 0;
      if (child.style.transform === 'translate(0px, 0px)') {
        child.style.transform = '';
        child.style.transition = '';
      }
    }, 500);
  }

  #applyTransform(x, y) {
    const child = this.firstElementChild;
    if (child) {
      child.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    }
  }
}

customElements.define('dvfy-magnetic-button', DvfyMagneticButton);
