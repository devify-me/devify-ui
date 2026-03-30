/**
 * <dvfy-slider> — Knob-primitive slider with fill bar and range mode
 *
 * Architecture: knobs are the primitive. The track groove is always visible.
 * Fill bar is shown by default (use `no-fill` to hide). `range` adds a second knob.
 * Native <input type="range"> provides accessibility and form integration;
 * their tracks are invisible — all visuals are dedicated overlay elements.
 *
 * Usage:
 *   <dvfy-slider label="Volume" value="50" show-value></dvfy-slider>
 *   <dvfy-slider label="Volume" value="50" no-fill show-value></dvfy-slider>
 *   <dvfy-slider label="Price" min="0" max="1000" value="200" value-end="800" range show-value></dvfy-slider>
 *   <dvfy-slider label="Rating" min="0" max="10" steps="10" value="5"></dvfy-slider>
 */

const STYLES = `
dvfy-slider {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
  width: 100%;
  --_track-h: 0.625rem;
  --_thumb-d: 1.375rem;
  --_track-radius: var(--dvfy-radius-sm);
}

dvfy-slider .dvfy-slider__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}

dvfy-slider .dvfy-slider__row {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
}

dvfy-slider .dvfy-slider__value {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-secondary);
  text-align: left;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Track wrapper ─────────────────────────────── */
dvfy-slider .dvfy-slider__track-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  height: var(--_thumb-d);
}

/* ── Track groove — always visible ─────────────── */
dvfy-slider .dvfy-slider__track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: var(--_track-h);
  transform: translateY(-50%);
  border-radius: var(--_track-radius);
  background: var(--dvfy-surface-overlay, var(--dvfy-surface-muted));
  box-shadow:
    inset 0 1px 3px hsl(0 0% 0% / 0.25),
    0 1px 0 hsl(0 0% 100% / 0.05);
  border: 1px solid var(--dvfy-border-muted);
  pointer-events: none;
}

/* ── Fill bar — on by default, hide with [no-fill] ─ */
dvfy-slider .dvfy-slider__fill {
  position: absolute;
  top: 50%;
  height: var(--_track-h);
  transform: translateY(-50%);
  border-radius: var(--_track-radius);
  background: var(--dvfy-primary-bg);
  pointer-events: none;
  z-index: 1;
}
dvfy-slider[no-fill] .dvfy-slider__fill { display: none; }

/* ── Native input — transparent track, thumb only ─ */
dvfy-slider input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  background: transparent;
  cursor: pointer;
  margin: 0;
  padding: 0;
  height: var(--_thumb-d);
  position: relative;
  z-index: 2;
}

dvfy-slider input[type="range"]::-webkit-slider-runnable-track {
  height: var(--_track-h);
  background: transparent;
  border: none;
  box-shadow: none;
}
dvfy-slider input[type="range"]::-moz-range-track {
  height: var(--_track-h);
  background: transparent;
  border: none;
  box-shadow: none;
}

/* ── Thumb — WebKit (metallic knob) ─────────────── */
dvfy-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: var(--_thumb-d);
  height: var(--_thumb-d);
  border-radius: var(--dvfy-radius-round);
  background: conic-gradient(
    var(--dvfy-neutral-400),
    var(--dvfy-neutral-200),
    var(--dvfy-neutral-400),
    var(--dvfy-neutral-100),
    var(--dvfy-neutral-400),
    var(--dvfy-neutral-300)
  );
  box-shadow:
    0 1px 3px hsl(0 0% 0% / 0.3),
    0 2px 6px hsl(0 0% 0% / 0.15),
    inset 0 0 0 1.5px hsl(0 0% 100% / 0.15);
  border: none;
  margin-top: calc((var(--_track-h) - var(--_thumb-d)) / 2);
  transition: box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
}

/* ── Thumb — Firefox (metallic knob) ────────────── */
dvfy-slider input[type="range"]::-moz-range-thumb {
  width: var(--_thumb-d);
  height: var(--_thumb-d);
  border-radius: var(--dvfy-radius-round);
  background: conic-gradient(
    var(--dvfy-neutral-400),
    var(--dvfy-neutral-200),
    var(--dvfy-neutral-400),
    var(--dvfy-neutral-100),
    var(--dvfy-neutral-400),
    var(--dvfy-neutral-300)
  );
  box-shadow:
    0 1px 3px hsl(0 0% 0% / 0.3),
    0 2px 6px hsl(0 0% 0% / 0.15),
    inset 0 0 0 1.5px hsl(0 0% 100% / 0.15);
  border: none;
  box-sizing: border-box;
}

/* ── Focus ring ─────────────────────────────────── */
dvfy-slider input[type="range"]:focus-visible::-webkit-slider-thumb {
  box-shadow:
    0 1px 3px hsl(0 0% 0% / 0.3),
    0 2px 6px hsl(0 0% 0% / 0.15),
    inset 0 0 0 1.5px hsl(0 0% 100% / 0.15),
    0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}
dvfy-slider input[type="range"]:focus-visible::-moz-range-thumb {
  box-shadow:
    0 1px 3px hsl(0 0% 0% / 0.3),
    0 2px 6px hsl(0 0% 0% / 0.15),
    inset 0 0 0 1.5px hsl(0 0% 100% / 0.15),
    0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}

/* ── Disabled ───────────────────────────────────── */
dvfy-slider[disabled] { opacity: 0.5; }
dvfy-slider[disabled] input[type="range"] { cursor: not-allowed; pointer-events: none; }
dvfy-slider[disabled] .dvfy-slider__label { color: var(--dvfy-disabled-text); }

/* ── Size: xs ───────────────────────────────────── */
dvfy-slider[size="xs"] { --_track-h: 0.375rem; --_thumb-d: 0.875rem; }
dvfy-slider[size="xs"] .dvfy-slider__label { font-size: var(--dvfy-text-xs); }
dvfy-slider[size="xs"] .dvfy-slider__value { font-size: var(--dvfy-text-xs); }
/* ── Size: sm ───────────────────────────────────── */
dvfy-slider[size="sm"] { --_track-h: 0.5rem; --_thumb-d: 1.125rem; }
dvfy-slider[size="sm"] .dvfy-slider__label { font-size: var(--dvfy-text-xs); }
dvfy-slider[size="sm"] .dvfy-slider__value { font-size: var(--dvfy-text-xs); }
/* ── Size: md (default) ─────────────────────────── */
/* ── Size: lg ───────────────────────────────────── */
dvfy-slider[size="lg"] { --_track-h: 0.875rem; --_thumb-d: 1.625rem; }
dvfy-slider[size="lg"] .dvfy-slider__value { font-size: var(--dvfy-text-base); }
/* ── Size: xl ───────────────────────────────────── */
dvfy-slider[size="xl"] { --_track-h: 1.125rem; --_thumb-d: 1.875rem; }
dvfy-slider[size="xl"] .dvfy-slider__label { font-size: var(--dvfy-text-base); }
dvfy-slider[size="xl"] .dvfy-slider__value { font-size: var(--dvfy-text-base); }

/* ── Variant: oval ──────────────────────────────── */
dvfy-slider[variant="oval"] { --_track-radius: var(--dvfy-radius-round); }

/* ── Label position: bottom ─────────────────────── */
dvfy-slider[label-position="bottom"] .dvfy-slider__label { order: 1; }

/* ── Label position: left ───────────────────────── */
dvfy-slider[label-position="left"] { flex-direction: row; flex-wrap: wrap; align-items: center; }
dvfy-slider[label-position="left"] .dvfy-slider__label { flex-shrink: 0; width: var(--dvfy-label-width, auto); }
dvfy-slider[label-position="left"] .dvfy-slider__row { flex: 1; min-width: 0; }

/* ── Label position: right ──────────────────────── */
dvfy-slider[label-position="right"] { flex-direction: row; flex-wrap: wrap; align-items: center; }
dvfy-slider[label-position="right"] .dvfy-slider__label { order: 1; flex-shrink: 0; width: var(--dvfy-label-width, auto); }
dvfy-slider[label-position="right"] .dvfy-slider__row { flex: 1; min-width: 0; }

/* ── Steps / tick marks ─────────────────────────── */
dvfy-slider .dvfy-slider__steps {
  position: absolute;
  top: 50%;
  left: calc(var(--_thumb-d) / 2);
  right: calc(var(--_thumb-d) / 2);
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 2;
}
dvfy-slider .dvfy-slider__tick {
  width: 2px;
  height: var(--_track-h);
  border-radius: 1px;
  background: var(--dvfy-text-muted, var(--dvfy-border-default));
  opacity: 0.4;
}

/* ── Range mode — stacked inputs ───────────────── */
dvfy-slider[range] input[type="range"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}
dvfy-slider[range] input[type="range"]::-webkit-slider-thumb {
  pointer-events: auto;
  position: relative;
  z-index: 3;
}
dvfy-slider[range] input[type="range"]::-moz-range-thumb {
  pointer-events: auto;
  position: relative;
  z-index: 3;
}
`;

/**
 * Knob-primitive slider with grooved track, optional fill bar, and range mode.
 *
 * @element dvfy-slider
 *
 * @attr {string} label - Label text
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "top")
 * @attr {number} min - Minimum value (default: 0)
 * @attr {number} max - Maximum value (default: 100)
 * @attr {number} step - Step increment (default: 1)
 * @attr {number} value - Current value (or lower bound in range mode)
 * @attr {number} value-end - Upper bound value (only in range mode)
 * @attr {string} name - Form field name
 * @attr {boolean} disabled - Disable interaction
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {boolean} show-value - Show current value next to slider
 * @attr {string} variant - Track shape: default | oval (default: "default")
 * @attr {boolean} no-fill - Hide the fill bar (shown by default)
 * @attr {boolean} range - Enable dual-thumb range mode
 * @attr {number} steps - Number of divisions for tick marks (e.g. 5 = 6 ticks)
 *
 * @fires input - Fires on drag. detail: { value } or { value, valueEnd } in range mode
 * @fires change - Fires on release. detail: { value } or { value, valueEnd } in range mode
 *
 * @cssprop {color} --dvfy-primary-bg - Fill bar color
 * @cssprop {color} --dvfy-surface-overlay - Track groove background
 * @cssprop {color} --dvfy-neutral-100 - Metallic knob highlight
 * @cssprop {color} --dvfy-neutral-400 - Metallic knob shadow
 *
 * @example
 * <dvfy-slider label="Volume" value="50" show-value></dvfy-slider>
 *
 * @example
 * <dvfy-slider label="Knobs Only" value="40" no-fill show-value></dvfy-slider>
 *
 * @example
 * <dvfy-slider label="Price" min="0" max="1000" value="200" value-end="800" range show-value></dvfy-slider>
 *
 * @example
 * <dvfy-slider label="Rating" min="0" max="10" steps="10" value="5" show-value></dvfy-slider>
 */
class DvfySlider extends HTMLElement {
  static #styled = false;

  /** Attributes that require a full DOM rebuild */
  static #STRUCTURAL = new Set(['range', 'show-value', 'steps', 'name']);

  #pendingRender = false;
  #initialized = false;

  connectedCallback() {
    if (!DvfySlider.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfySlider.#styled = true;
    }
    this.#render();
    this.#initialized = true;
  }

  disconnectedCallback() {
    this.#initialized = false;
  }

  static get observedAttributes() {
    return ['label', 'label-position', 'min', 'max', 'step', 'value', 'value-end', 'name', 'disabled', 'size', 'show-value', 'variant', 'no-fill', 'range', 'steps'];
  }

  #scheduleRender() {
    if (!this.#pendingRender) {
      this.#pendingRender = true;
      queueMicrotask(() => { this.#pendingRender = false; this.#render(); this.#initialized = true; });
    }
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;

    // Before first render completes, coalesce everything
    if (!this.#initialized) return;

    // Structural changes require full rebuild (coalesced)
    if (DvfySlider.#STRUCTURAL.has(name)) {
      this.#scheduleRender();
      return;
    }

    // Granular updates for non-structural attributes
    switch (name) {
      case 'value':
      case 'value-end':
        this.#updateValues();
        break;
      case 'min':
      case 'max':
      case 'step':
        this.#updateInputProps();
        break;
      case 'disabled':
        this.#updateDisabled();
        break;
      case 'label':
        this.#updateLabel();
        break;
      case 'label-position':
        // Layout handled entirely by CSS attribute selectors — no DOM change needed
        break;
      case 'size':
      case 'variant':
      case 'no-fill':
        // Handled entirely by CSS attribute selectors — no DOM change needed
        break;
    }
  }

  /** Update input values and fill bar position without rebuild */
  #updateValues() {
    const min = parseFloat(this.getAttribute('min') ?? 0);
    const max = parseFloat(this.getAttribute('max') ?? 100);
    const value = parseFloat(this.getAttribute('value') ?? min);
    const isRange = this.hasAttribute('range');
    const fill = this.querySelector('.dvfy-slider__fill');
    const valueSpan = this.querySelector('.dvfy-slider__value');

    if (isRange) {
      const valueEnd = parseFloat(this.getAttribute('value-end') ?? max);
      const inputMin = this.querySelector('.dvfy-slider__input-min');
      const inputMax = this.querySelector('.dvfy-slider__input-max');
      if (inputMin) inputMin.value = value;
      if (inputMax) inputMax.value = valueEnd;
      if (fill) this.#updateFill(fill, this.#frac(value, min, max), this.#frac(valueEnd, min, max), true);
      if (valueSpan) valueSpan.textContent = `${value} \u2013 ${valueEnd}`;
    } else {
      const input = this.querySelector('input[type="range"]');
      if (input) input.value = value;
      if (fill) this.#updateFill(fill, 0, this.#frac(value, min, max), false);
      if (valueSpan) valueSpan.textContent = value;
    }
  }

  /** Update min/max/step on input elements without rebuild */
  #updateInputProps() {
    const min = parseFloat(this.getAttribute('min') ?? 0);
    const max = parseFloat(this.getAttribute('max') ?? 100);
    const step = parseFloat(this.getAttribute('step') ?? 1);
    const value = parseFloat(this.getAttribute('value') ?? min);
    const isRange = this.hasAttribute('range');
    const fill = this.querySelector('.dvfy-slider__fill');

    for (const input of this.querySelectorAll('input[type="range"]')) {
      input.min = min;
      input.max = max;
      input.step = step;
    }

    // Reposition fill after range change
    if (isRange) {
      const valueEnd = parseFloat(this.getAttribute('value-end') ?? max);
      if (fill) this.#updateFill(fill, this.#frac(value, min, max), this.#frac(valueEnd, min, max), true);
    } else {
      if (fill) this.#updateFill(fill, 0, this.#frac(value, min, max), false);
    }
  }

  /** Toggle disabled state on inputs without rebuild */
  #updateDisabled() {
    const disabled = this.hasAttribute('disabled');
    for (const input of this.querySelectorAll('input[type="range"]')) {
      input.disabled = disabled;
    }
  }

  /** Update label text without rebuild */
  #updateLabel() {
    const label = this.getAttribute('label');
    const lbl = this.querySelector('.dvfy-slider__label');
    if (label && lbl) {
      lbl.textContent = label;
    } else if (label && !lbl) {
      // Label added — need rebuild to insert element
      this.#scheduleRender();
    } else if (!label && lbl) {
      // Label removed — need rebuild to remove element
      this.#scheduleRender();
    }
  }

  #frac(v, min, max) {
    return max > min ? (v - min) / (max - min) : 0;
  }

  /** Position fill bar edges to align with thumb centers */
  #updateFill(fill, startFrac, endFrac, isRange) {
    // Thumb center at fraction f: thumbD/2 + (100% - thumbD) * f
    // Single mode: left edge touches track edge (no gap)
    if (isRange) {
      fill.style.left = `calc(var(--_thumb-d) / 2 + (100% - var(--_thumb-d)) * ${startFrac})`;
    } else {
      fill.style.left = '0';
    }
    fill.style.right = `calc(100% - var(--_thumb-d) / 2 - (100% - var(--_thumb-d)) * ${endFrac})`;
  }

  #render() {
    this.textContent = '';

    const min = parseFloat(this.getAttribute('min') ?? 0);
    const max = parseFloat(this.getAttribute('max') ?? 100);
    const step = parseFloat(this.getAttribute('step') ?? 1);
    const value = parseFloat(this.getAttribute('value') ?? min);
    const name = this.getAttribute('name') || '';
    const label = this.getAttribute('label');
    const disabled = this.hasAttribute('disabled');
    const showValue = this.hasAttribute('show-value');
    const isRange = this.hasAttribute('range');
    const stepsAttr = this.getAttribute('steps');
    const numSteps = stepsAttr ? parseInt(stepsAttr, 10) : 0;
    const id = name || `dvfy-slider-${Math.random().toString(36).slice(2, 8)}`;

    // Label
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-slider__label';
      lbl.setAttribute('for', id);
      lbl.textContent = label;
      this.appendChild(lbl);
    }

    // Row (track-wrap + optional value display)
    const row = document.createElement('div');
    row.className = 'dvfy-slider__row';

    const trackWrap = document.createElement('div');
    trackWrap.className = 'dvfy-slider__track-wrap';

    // Track groove (always present)
    const track = document.createElement('div');
    track.className = 'dvfy-slider__track';
    trackWrap.appendChild(track);

    // Fill bar (rendered always, visibility controlled by CSS [fill] attr)
    const fill = document.createElement('div');
    fill.className = 'dvfy-slider__fill';
    trackWrap.appendChild(fill);

    // Tick marks
    if (numSteps > 0) {
      const stepsContainer = document.createElement('div');
      stepsContainer.className = 'dvfy-slider__steps';
      for (let i = 0; i <= numSteps; i++) {
        const tick = document.createElement('span');
        tick.className = 'dvfy-slider__tick';
        stepsContainer.appendChild(tick);
      }
      trackWrap.appendChild(stepsContainer);
    }

    // Value display element — sized to widest possible content
    let valueSpan = null;
    if (showValue) {
      valueSpan = document.createElement('span');
      valueSpan.className = 'dvfy-slider__value';
      // Determine widest string to lock width
      const fmt = v => String(parseFloat(v.toFixed(10)));
      const widest = isRange
        ? `${fmt(min)} \u2013 ${fmt(max)}`
        : fmt(min).length >= fmt(max).length ? fmt(min) : fmt(max);
      const chars = widest.length;
      valueSpan.style.minWidth = `${chars}ch`;
    }

    if (isRange) {
      this.#renderRange(trackWrap, fill, valueSpan, { min, max, step, value, id, disabled });
    } else {
      this.#renderSingle(trackWrap, fill, valueSpan, { min, max, step, value, id, name, disabled });
    }

    row.appendChild(trackWrap);
    if (valueSpan) row.appendChild(valueSpan);
    this.appendChild(row);
  }

  #renderSingle(trackWrap, fill, valueSpan, { min, max, step, value, id, name, disabled }) {
    this.#updateFill(fill, 0, this.#frac(value, min, max), false);

    if (valueSpan) valueSpan.textContent = value;

    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.name = name;
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    if (disabled) input.disabled = true;

    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      this.#updateFill(fill, 0, this.#frac(v, min, max), false);
      if (valueSpan) valueSpan.textContent = v;
      this.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { value: v } }));
    });

    input.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: parseFloat(input.value) } }));
    });

    trackWrap.appendChild(input);
  }

  #renderRange(trackWrap, fill, valueSpan, { min, max, step, value, id, disabled }) {
    const valueEnd = parseFloat(this.getAttribute('value-end') ?? max);
    this.#updateFill(fill, this.#frac(value, min, max), this.#frac(valueEnd, min, max), true);

    if (valueSpan) valueSpan.textContent = `${value} \u2013 ${valueEnd}`;

    // Min input
    const inputMin = document.createElement('input');
    inputMin.type = 'range';
    inputMin.className = 'dvfy-slider__input-min';
    inputMin.id = id;
    inputMin.min = min;
    inputMin.max = max;
    inputMin.step = step;
    inputMin.value = value;
    inputMin.setAttribute('aria-label', 'Minimum value');
    if (disabled) inputMin.disabled = true;

    // Max input
    const inputMax = document.createElement('input');
    inputMax.type = 'range';
    inputMax.className = 'dvfy-slider__input-max';
    inputMax.min = min;
    inputMax.max = max;
    inputMax.step = step;
    inputMax.value = valueEnd;
    inputMax.setAttribute('aria-label', 'Maximum value');
    if (disabled) inputMax.disabled = true;

    const update = () => {
      let lo = parseFloat(inputMin.value);
      let hi = parseFloat(inputMax.value);
      if (lo > hi) { lo = hi; inputMin.value = lo; }
      if (hi < lo) { hi = lo; inputMax.value = hi; }
      this.#updateFill(fill, this.#frac(lo, min, max), this.#frac(hi, min, max), true);
      if (valueSpan) valueSpan.textContent = `${lo} \u2013 ${hi}`;
    };

    const fireEvent = (type) => {
      const lo = parseFloat(inputMin.value);
      const hi = parseFloat(inputMax.value);
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { value: lo, valueEnd: hi } }));
    };

    inputMin.addEventListener('input', () => { update(); fireEvent('input'); });
    inputMax.addEventListener('input', () => { update(); fireEvent('input'); });
    inputMin.addEventListener('change', () => fireEvent('change'));
    inputMax.addEventListener('change', () => fireEvent('change'));

    trackWrap.appendChild(inputMin);
    trackWrap.appendChild(inputMax);
  }

  get value() {
    if (this.hasAttribute('range')) {
      const minInput = this.querySelector('.dvfy-slider__input-min');
      return minInput?.value ?? '';
    }
    return this.querySelector('input')?.value ?? '';
  }

  set value(v) {
    if (this.hasAttribute('range')) {
      const minInput = this.querySelector('.dvfy-slider__input-min');
      if (minInput) {
        minInput.value = v;
        minInput.dispatchEvent(new Event('input'));
      }
    } else {
      const i = this.querySelector('input');
      if (i) {
        i.value = v;
        const fill = this.querySelector('.dvfy-slider__fill');
        if (fill) {
          const min = parseFloat(i.min);
          const max = parseFloat(i.max);
          this.#updateFill(fill, 0, this.#frac(parseFloat(v), min, max), false);
        }
        const vs = this.querySelector('.dvfy-slider__value');
        if (vs) vs.textContent = v;
      }
    }
  }

  get valueEnd() {
    const maxInput = this.querySelector('.dvfy-slider__input-max');
    return maxInput?.value ?? '';
  }

  set valueEnd(v) {
    const maxInput = this.querySelector('.dvfy-slider__input-max');
    if (maxInput) {
      maxInput.value = v;
      maxInput.dispatchEvent(new Event('input'));
    }
  }
}

customElements.define('dvfy-slider', DvfySlider);
