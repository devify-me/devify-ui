const STYLES = `
dvfy-compare-slider {
  display: block;
  position: relative;
  overflow: hidden;
  user-select: none;
  touch-action: none;
  cursor: ew-resize;
  border-radius: var(--dvfy-compare-slider-radius, var(--dvfy-radius-lg, 0.5rem));
}

dvfy-compare-slider:focus-visible {
  outline: 2px solid var(--dvfy-focus-ring, var(--dvfy-accent-brand, #7c3aed));
  outline-offset: 2px;
}

/* Before slot: defines the component height */
dvfy-compare-slider [slot="before"] {
  display: block;
  width: 100%;
  height: auto;
}

/* After slot: fills the absolutely-positioned wrapper */
dvfy-compare-slider [slot="after"] {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dvfy-compare-slider-before-wrap {
  display: block;
  position: relative;
}

.dvfy-compare-slider-after-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Labels */
.dvfy-compare-slider-label {
  position: absolute;
  bottom: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: var(--dvfy-compare-slider-label-bg, rgba(0, 0, 0, 0.5));
  color: #fff;
  font-size: var(--dvfy-text-xs, 0.75rem);
  font-family: var(--dvfy-font-sans, system-ui, sans-serif);
  font-weight: var(--dvfy-weight-medium, 500);
  letter-spacing: 0.03em;
  border-radius: var(--dvfy-radius-sm, 0.25rem);
  pointer-events: none;
  user-select: none;
  line-height: 1.4;
}

.dvfy-compare-slider-label-before { left: 0.75rem; }
.dvfy-compare-slider-label-after  { right: 0.75rem; }

/* Divider line */
.dvfy-compare-slider-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: var(--dvfy-compare-slider-divider-color, rgba(255, 255, 255, 0.9));
  transform: translateX(-50%);
  pointer-events: none;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
  will-change: left;
}

/* Handle circle */
.dvfy-compare-slider-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2.5rem;
  height: 2.5rem;
  background: var(--dvfy-compare-slider-handle-bg, #fff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(255, 255, 255, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  pointer-events: none;
}

dvfy-compare-slider[dragging] .dvfy-compare-slider-handle {
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .dvfy-compare-slider-handle { transition: none; }
}
`;

/** Build the handle SVG using DOM methods (avoids innerHTML) */
function makeHandleSVG() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  // Left arrow: ‹
  const left = document.createElementNS(ns, 'path');
  left.setAttribute('d', 'M6 7L3 10L6 13');
  left.setAttribute('stroke', 'currentColor');
  left.setAttribute('stroke-width', '1.5');
  left.setAttribute('stroke-linecap', 'round');
  left.setAttribute('stroke-linejoin', 'round');

  // Right arrow: ›
  const right = document.createElementNS(ns, 'path');
  right.setAttribute('d', 'M14 7L17 10L14 13');
  right.setAttribute('stroke', 'currentColor');
  right.setAttribute('stroke-width', '1.5');
  right.setAttribute('stroke-linecap', 'round');
  right.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(left);
  svg.appendChild(right);
  return svg;
}

/**
 * <dvfy-compare-slider> — Clip-path image comparison slider
 *
 * Overlay two images (before/after) and reveal via drag using clip-path.
 * Hardware-accelerated — no layout shifts since clip-path doesn't affect layout.
 *
 * Inspired by Emil Kowalski: https://emilkowal.ski/ui/the-magic-of-clip-path
 *
 * Usage:
 *   <dvfy-compare-slider label-before="Before" label-after="After">
 *     <img slot="before" src="before.jpg" alt="Before" />
 *     <img slot="after"  src="after.jpg"  alt="After"  />
 *   </dvfy-compare-slider>
 *
 * Any block element can be used in the slots (not just images).
 *
 * @element dvfy-compare-slider
 *
 * @attr {number} value - Divider position 0–100 (default: 50)
 * @attr {string} label-before - Label overlay on the before panel
 * @attr {string} label-after - Label overlay on the after panel
 *
 * @fires change - Fires on every drag update. detail: { value: number }
 *
 * @slot before - The "before" content (defines height of the component)
 * @slot after  - The "after" content (absolutely fills same area)
 *
 * @cssprop {length} --dvfy-compare-slider-radius - Border radius (default: var(--dvfy-radius-lg))
 * @cssprop {color}  --dvfy-compare-slider-divider-color - Divider line color (default: rgba(255,255,255,0.9))
 * @cssprop {color}  --dvfy-compare-slider-handle-bg - Handle circle background (default: #fff)
 * @cssprop {color}  --dvfy-compare-slider-label-bg - Label background (default: rgba(0,0,0,0.5))
 *
 * @example
 * <dvfy-compare-slider label-before="Before" label-after="After" value="40">
 *   <img slot="before" src="photo-before.jpg" alt="Before" />
 *   <img slot="after"  src="photo-after.jpg"  alt="After"  />
 * </dvfy-compare-slider>
 */
class DvfyCompareSlider extends HTMLElement {
  static #styled = false;

  /** @type {number} Current divider position 0–100 */
  #value = 50;
  /** @type {HTMLElement|null} */
  #afterWrap = null;
  /** @type {HTMLElement|null} */
  #divider = null;

  connectedCallback() {
    if (!DvfyCompareSlider.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCompareSlider.#styled = true;
    }

    this.#build();
    this.#attachInteraction();
  }

  disconnectedCallback() {
    this.removeEventListener('pointerdown', this.#onPointerDown);
    this.removeEventListener('keydown', this.#onKeyDown);
  }

  static get observedAttributes() {
    return ['value', 'label-before', 'label-after'];
  }

  attributeChangedCallback(name, _old, next) {
    if (!this.isConnected) return;
    if (name === 'value') {
      this.#setValue(parseFloat(next) || 0);
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Current divider position (0–100) */
  get value() { return this.#value; }
  set value(v) { this.#setValue(parseFloat(v) || 0); }

  // ─── Private ───────────────────────────────────────────────────────────────

  #build() {
    const beforeEl = this.querySelector('[slot="before"]');
    const afterEl  = this.querySelector('[slot="after"]');
    if (!beforeEl || !afterEl) return;

    // Before wrapper (in-flow — defines component height)
    const beforeWrap = document.createElement('div');
    beforeWrap.className = 'dvfy-compare-slider-before-wrap';
    beforeWrap.appendChild(beforeEl);

    // After wrapper (absolute overlay, clip-path applied here)
    const afterWrap = document.createElement('div');
    afterWrap.className = 'dvfy-compare-slider-after-wrap';
    afterWrap.setAttribute('aria-hidden', 'true');
    afterWrap.appendChild(afterEl);

    // Optional labels
    const labelBefore = this.getAttribute('label-before');
    const labelAfter  = this.getAttribute('label-after');

    if (labelBefore) {
      const span = document.createElement('span');
      span.className = 'dvfy-compare-slider-label dvfy-compare-slider-label-before';
      span.textContent = labelBefore;
      beforeWrap.appendChild(span);
    }
    if (labelAfter) {
      const span = document.createElement('span');
      span.className = 'dvfy-compare-slider-label dvfy-compare-slider-label-after';
      span.textContent = labelAfter;
      afterWrap.appendChild(span);
    }

    // Divider + handle
    const divider = document.createElement('div');
    divider.className = 'dvfy-compare-slider-divider';

    const handle = document.createElement('div');
    handle.className = 'dvfy-compare-slider-handle';
    handle.appendChild(makeHandleSVG());
    divider.appendChild(handle);

    // Rebuild DOM
    this.textContent = '';
    this.appendChild(beforeWrap);
    this.appendChild(afterWrap);
    this.appendChild(divider);

    this.#afterWrap = afterWrap;
    this.#divider   = divider;

    // Apply initial position
    const initial = parseFloat(this.getAttribute('value') ?? '50');
    this.#setValue(isNaN(initial) ? 50 : initial);
  }

  #attachInteraction() {
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'slider');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Image comparison');
    }
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');

    this.addEventListener('pointerdown', this.#onPointerDown);
    this.addEventListener('keydown', this.#onKeyDown);
  }

  #onPointerDown = (e) => {
    this.setPointerCapture(e.pointerId);
    this.toggleAttribute('dragging', true);
    this.#updateFromPointer(e);
    this.addEventListener('pointermove',   this.#onPointerMove);
    this.addEventListener('pointerup',     this.#onPointerUp);
    this.addEventListener('pointercancel', this.#onPointerUp);
  };

  #onPointerMove = (e) => {
    this.#updateFromPointer(e);
  };

  #onPointerUp = (e) => {
    this.releasePointerCapture(e.pointerId);
    this.toggleAttribute('dragging', false);
    this.removeEventListener('pointermove',   this.#onPointerMove);
    this.removeEventListener('pointerup',     this.#onPointerUp);
    this.removeEventListener('pointercancel', this.#onPointerUp);
  };

  #onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 1;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.#setValue(this.#value - step);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.#setValue(this.#value + step);
        break;
      case 'Home':
        e.preventDefault();
        this.#setValue(0);
        break;
      case 'End':
        e.preventDefault();
        this.#setValue(100);
        break;
    }
  };

  #updateFromPointer(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    this.#setValue((x / rect.width) * 100);
  }

  #setValue(raw) {
    const value = Math.max(0, Math.min(100, raw));
    this.#value = value;

    // clip-path: inset(0 0 0 X%) clips X% from left → after image visible from X% onward
    // At value=50: left half shows before, right half shows after ✓
    if (this.#afterWrap) {
      this.#afterWrap.style.clipPath = `inset(0 0 0 ${value}%)`;
    }
    if (this.#divider) {
      this.#divider.style.left = `${value}%`;
    }

    this.setAttribute('aria-valuenow', String(Math.round(value)));

    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      detail: { value },
    }));
  }
}

customElements.define('dvfy-compare-slider', DvfyCompareSlider);
