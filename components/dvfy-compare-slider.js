/**
 * <dvfy-compare-slider> — Before/after image comparison via clip-path
 *
 * Uses `clip-path: inset()` to reveal the "before" layer as the user drags
 * the divider. Hardware-accelerated — no extra DOM nodes beyond the handle.
 * Inspired by Emil Kowalski's "The Magic of Clip Path".
 *
 * Usage:
 *   <dvfy-compare-slider>
 *     <img slot="before" src="before.jpg" alt="Before">
 *     <img slot="after"  src="after.jpg"  alt="After">
 *   </dvfy-compare-slider>
 *
 * @element dvfy-compare-slider
 *
 * @attr {number} value - Divider position as a percentage 0–100 (default: 50)
 *
 * @slot before - The "before" image or content (revealed on the left)
 * @slot after  - The "after" image or content (shown on the right / behind)
 *
 * @event {CustomEvent} change - Fires when position changes, detail: { value }
 *
 * @cssprop {color}  --dvfy-compare-handle-color  - Handle and divider color (default: white)
 * @cssprop {length} --dvfy-compare-divider-width  - Divider line width (default: 2px)
 * @cssprop {length} --dvfy-compare-handle-size    - Handle circle diameter (default: 44px)
 */

const STYLES = `
dvfy-compare-slider {
  display: block;
  position: relative;
  overflow: hidden;
  cursor: col-resize;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  border-radius: var(--dvfy-radius-lg);

  --_handle-color: var(--dvfy-compare-handle-color, #fff);
  --_divider-width: var(--dvfy-compare-divider-width, 2px);
  --_handle-size: var(--dvfy-compare-handle-size, 44px);
  --_pos: 50%;
}

dvfy-compare-slider:focus-visible {
  outline: var(--dvfy-ring-width, 2px) solid var(--dvfy-ring-color, var(--dvfy-primary-bg));
  outline-offset: var(--dvfy-ring-offset, 2px);
}

/* Slot wrappers */
dvfy-compare-slider .dvfy-cs__after,
dvfy-compare-slider .dvfy-cs__before {
  display: block;
  width: 100%;
  height: 100%;
}

dvfy-compare-slider .dvfy-cs__after {
  position: relative;
}

dvfy-compare-slider .dvfy-cs__before {
  position: absolute;
  inset: 0;
  clip-path: inset(0 calc(100% - var(--_pos)) 0 0);
  z-index: 1;
}

/* Slotted images fill the container */
dvfy-compare-slider ::slotted(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}

/* Divider line */
dvfy-compare-slider .dvfy-cs__divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--_pos);
  transform: translateX(-50%);
  width: var(--_divider-width);
  background: var(--_handle-color);
  z-index: 2;
  pointer-events: none;
}

/* Handle */
dvfy-compare-slider .dvfy-cs__handle {
  position: absolute;
  top: 50%;
  left: var(--_pos);
  transform: translate(-50%, -50%);
  width: var(--_handle-size);
  height: var(--_handle-size);
  border-radius: 50%;
  background: var(--_handle-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  z-index: 3;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 80ms ease;
}

dvfy-compare-slider[data-dragging] .dvfy-cs__handle {
  transform: translate(-50%, -50%) scale(1.1);
}

/* Arrow chevrons inside handle */
dvfy-compare-slider .dvfy-cs__handle::before,
dvfy-compare-slider .dvfy-cs__handle::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-style: solid;
}

dvfy-compare-slider .dvfy-cs__handle::before {
  border-width: 5px 7px 5px 0;
  border-color: transparent #666 transparent transparent;
  margin-right: 6px;
}

dvfy-compare-slider .dvfy-cs__handle::after {
  border-width: 5px 0 5px 7px;
  border-color: transparent transparent transparent #666;
  margin-left: -1px;
}
`;

/**
 * Before/after image comparison slider using clip-path inset.
 * Drag the divider (or use arrow keys) to reveal the before image.
 *
 * @element dvfy-compare-slider
 */
class DvfyCompareSlider extends HTMLElement {
  static #styled = false;
  static observedAttributes = ['value'];

  /** Current position 0–100 */
  #pos = 50;

  connectedCallback() {
    if (!DvfyCompareSlider.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCompareSlider.#styled = true;
    }

    // Parse initial value attribute
    const attrVal = parseFloat(this.getAttribute('value'));
    if (!isNaN(attrVal)) {
      this.#pos = Math.min(100, Math.max(0, attrVal));
    }

    this.#render();
    this.#attach();
  }

  disconnectedCallback() {
    this.#detach();
  }

  attributeChangedCallback(name, _old, next) {
    if (name === 'value') {
      const v = parseFloat(next);
      if (!isNaN(v)) {
        this.#pos = Math.min(100, Math.max(0, v));
        this.#applyPos();
      }
    }
  }

  // ── Build DOM ──────────────────────────────────────────────────────────────

  #render() {
    this.setAttribute('role', 'slider');
    this.setAttribute('aria-label', 'Image comparison slider');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    this.setAttribute('tabindex', '0');
    this.#updateAria();

    // After layer (behind)
    const after = document.createElement('div');
    after.className = 'dvfy-cs__after';
    const afterSlot = document.createElement('slot');
    afterSlot.name = 'after';
    after.appendChild(afterSlot);

    // Before layer (on top, clipped)
    const before = document.createElement('div');
    before.className = 'dvfy-cs__before';
    const beforeSlot = document.createElement('slot');
    beforeSlot.name = 'before';
    before.appendChild(beforeSlot);

    // Divider line
    const divider = document.createElement('div');
    divider.className = 'dvfy-cs__divider';
    divider.setAttribute('aria-hidden', 'true');

    // Handle
    const handle = document.createElement('div');
    handle.className = 'dvfy-cs__handle';
    handle.setAttribute('aria-hidden', 'true');

    this.appendChild(after);
    this.appendChild(before);
    this.appendChild(divider);
    this.appendChild(handle);

    this.#applyPos();
  }

  // ── Position ───────────────────────────────────────────────────────────────

  #applyPos() {
    this.style.setProperty('--_pos', `${this.#pos}%`);
    this.#updateAria();
  }

  #updateAria() {
    this.setAttribute('aria-valuenow', String(Math.round(this.#pos)));
    this.setAttribute('aria-valuetext', `${Math.round(this.#pos)}% revealed`);
  }

  #setPos(pct) {
    this.#pos = Math.min(100, Math.max(0, pct));
    this.#applyPos();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      detail: { value: this.#pos },
    }));
  }

  #posFromPointer(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    this.#setPos(x);
  }

  // ── Event handling ─────────────────────────────────────────────────────────

  #onPointerDown = (e) => {
    this.setPointerCapture(e.pointerId);
    this.setAttribute('data-dragging', '');
    this.#posFromPointer(e);
  };

  #onPointerMove = (e) => {
    if (!this.hasPointerCapture(e.pointerId)) return;
    this.#posFromPointer(e);
  };

  #onPointerUp = (e) => {
    if (this.hasPointerCapture(e.pointerId)) {
      this.releasePointerCapture(e.pointerId);
    }
    this.removeAttribute('data-dragging');
  };

  #onKeyDown = (e) => {
    const STEP = e.shiftKey ? 10 : 1;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        this.#setPos(this.#pos - STEP);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        this.#setPos(this.#pos + STEP);
        break;
      case 'Home':
        e.preventDefault();
        this.#setPos(0);
        break;
      case 'End':
        e.preventDefault();
        this.#setPos(100);
        break;
    }
  };

  #attach() {
    this.addEventListener('pointerdown', this.#onPointerDown);
    this.addEventListener('pointermove', this.#onPointerMove);
    this.addEventListener('pointerup', this.#onPointerUp);
    this.addEventListener('pointercancel', this.#onPointerUp);
    this.addEventListener('keydown', this.#onKeyDown);
  }

  #detach() {
    this.removeEventListener('pointerdown', this.#onPointerDown);
    this.removeEventListener('pointermove', this.#onPointerMove);
    this.removeEventListener('pointerup', this.#onPointerUp);
    this.removeEventListener('pointercancel', this.#onPointerUp);
    this.removeEventListener('keydown', this.#onKeyDown);
  }
}

customElements.define('dvfy-compare-slider', DvfyCompareSlider);
