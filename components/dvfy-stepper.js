const STYLES = `
dvfy-stepper {
  display: block;
  font-family: var(--dvfy-font-sans);
}

/* ── Track ── */
dvfy-stepper .dvfy-stepper__track {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--dvfy-space-6);
}
dvfy-stepper[orientation="vertical"] .dvfy-stepper__track {
  flex-direction: column;
  gap: 0;
  margin-bottom: var(--dvfy-space-4);
}

/* ── Step item ── */
dvfy-stepper .dvfy-stepper__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
dvfy-stepper[orientation="vertical"] .dvfy-stepper__item {
  flex: none;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--dvfy-space-3);
  width: 100%;
  padding-bottom: var(--dvfy-space-5);
}
dvfy-stepper[orientation="vertical"] .dvfy-stepper__item:last-child {
  padding-bottom: 0;
}

/* ── Connector (horizontal) ── */
dvfy-stepper:not([orientation="vertical"]) .dvfy-stepper__item::before {
  content: '';
  position: absolute;
  top: 1.25rem;
  left: calc(50% + 1.25rem);
  right: 0;
  height: 2px;
  background: var(--dvfy-border-default);
  transition: background var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
dvfy-stepper:not([orientation="vertical"]) .dvfy-stepper__item:last-child::before {
  display: none;
}
dvfy-stepper:not([orientation="vertical"]) .dvfy-stepper__item[data-state="completed"]::before {
  background: var(--dvfy-primary-bg);
}

/* ── Connector (vertical) ── */
dvfy-stepper[orientation="vertical"] .dvfy-stepper__item::before {
  content: '';
  position: absolute;
  left: calc(1.25rem - 1px);
  top: 2.5rem;
  width: 2px;
  bottom: 0;
  background: var(--dvfy-border-default);
  transition: background var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
dvfy-stepper[orientation="vertical"] .dvfy-stepper__item:last-child::before {
  display: none;
}
dvfy-stepper[orientation="vertical"] .dvfy-stepper__item[data-state="completed"]::before {
  background: var(--dvfy-primary-bg);
}

/* ── Indicator circle ── */
dvfy-stepper .dvfy-stepper__indicator {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-semibold);
  border: 2px solid var(--dvfy-border-default);
  background: var(--dvfy-surface-page);
  color: var(--dvfy-text-muted);
  cursor: pointer;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
  flex-shrink: 0;
  outline: none;
  position: relative;
  z-index: 1;
}
dvfy-stepper .dvfy-stepper__indicator:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: 2px;
}
dvfy-stepper .dvfy-stepper__item[data-state="active"] .dvfy-stepper__indicator {
  border-color: var(--dvfy-primary-bg);
  background: var(--dvfy-primary-bg);
  color: #fff;
  box-shadow: 0 0 0 4px var(--dvfy-primary-subtle, oklch(from var(--dvfy-primary-bg) l c h / 0.15));
}
dvfy-stepper .dvfy-stepper__item[data-state="completed"] .dvfy-stepper__indicator {
  border-color: var(--dvfy-primary-bg);
  background: var(--dvfy-primary-bg);
  color: #fff;
}
dvfy-stepper .dvfy-stepper__item[data-state="error"] .dvfy-stepper__indicator {
  border-color: var(--dvfy-danger-bg);
  background: var(--dvfy-danger-bg);
  color: #fff;
}
dvfy-stepper[linear] .dvfy-stepper__item[data-state="upcoming"] .dvfy-stepper__indicator {
  cursor: not-allowed;
  opacity: 0.5;
}

/* ── Labels ── */
dvfy-stepper .dvfy-stepper__label-wrap {
  text-align: center;
  margin-top: var(--dvfy-space-2);
  min-width: 0;
}
dvfy-stepper[orientation="vertical"] .dvfy-stepper__label-wrap {
  text-align: left;
  margin-top: 0;
  padding-top: 0.3rem;
}
dvfy-stepper .dvfy-stepper__label {
  display: block;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-muted);
}
dvfy-stepper .dvfy-stepper__item[data-state="active"] .dvfy-stepper__label {
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-semibold);
}
dvfy-stepper .dvfy-stepper__item[data-state="completed"] .dvfy-stepper__label {
  color: var(--dvfy-text-primary);
}
dvfy-stepper .dvfy-stepper__item[data-state="error"] .dvfy-stepper__label {
  color: var(--dvfy-danger-bg);
}
dvfy-stepper .dvfy-stepper__description {
  display: block;
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  margin-top: var(--dvfy-space-0-5);
}

/* ── Step panels ── */
dvfy-step {
  display: none;
}
dvfy-step[active] {
  display: block;
}

/* ── Nav buttons ── */
dvfy-stepper .dvfy-stepper__nav {
  display: flex;
  gap: var(--dvfy-space-3);
  margin-top: var(--dvfy-space-4);
}
dvfy-stepper .dvfy-stepper__nav button {
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  border-radius: var(--dvfy-radius-md);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-primary);
  cursor: pointer;
  transition: opacity var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  outline: none;
}
dvfy-stepper .dvfy-stepper__nav button:hover:not(:disabled) {
  background: var(--dvfy-surface-muted);
}
dvfy-stepper .dvfy-stepper__nav button:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: 2px;
}
dvfy-stepper .dvfy-stepper__nav button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
dvfy-stepper .dvfy-stepper__next {
  background: var(--dvfy-primary-bg);
  color: #fff;
  border-color: transparent;
}
dvfy-stepper .dvfy-stepper__next:hover:not(:disabled) {
  background: var(--dvfy-primary-bg);
  opacity: 0.85;
}
`;

/**
 * Multi-step wizard with numbered indicators, connector lines, and panel navigation.
 *
 * Each child dvfy-step represents one step. The stepper renders a track header with
 * clickable indicators (horizontal or vertical), and shows the active step's content
 * below. In linear mode forward navigation via indicator clicks is blocked; use the
 * built-in Prev/Next buttons or call complete().
 *
 * HTMX-friendly: each dvfy-step can carry hx-get / hx-trigger / hx-target attributes
 * for server-driven content loading.
 *
 * @element dvfy-stepper
 *
 * @attr {number} active-step - Zero-based index of the active step (default: 0)
 * @attr {boolean} linear - Prevent skipping ahead — must advance sequentially
 * @attr {string} orientation - Track layout: horizontal | vertical (default: horizontal)
 *
 * @event {CustomEvent} step-change - Fires when active step changes; detail: { step, previous }
 *
 * @slot - dvfy-step elements
 *
 * @cssprop {color} --dvfy-primary-bg - Active/completed indicator and connector color
 * @cssprop {color} --dvfy-danger-bg - Error state indicator color
 * @cssprop {color} --dvfy-border-default - Inactive connector and indicator border
 */
class DvfyStepper extends HTMLElement {
  static #styled = false;
  #track = null;

  connectedCallback() {
    if (!DvfyStepper.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyStepper.#styled = true;
    }
    this.#build();
  }

  disconnectedCallback() {
    this.#track?.removeEventListener('keydown', this.#onKey);
  }

  static get observedAttributes() { return ['active-step', 'orientation', 'linear']; }

  attributeChangedCallback(name) {
    if (!this.isConnected || !this.#track) return;
    if (name === 'active-step') {
      this.#activate(this.#activeIndex);
    } else {
      this.#rebuild();
    }
  }

  get #activeIndex() {
    return parseInt(this.getAttribute('active-step') || '0', 10);
  }

  get #steps() {
    return Array.from(this.querySelectorAll(':scope > dvfy-step'));
  }

  get #isLinear() {
    return this.hasAttribute('linear');
  }

  get #isVertical() {
    return this.getAttribute('orientation') === 'vertical';
  }

  #build() {
    this.#track = document.createElement('div');
    this.#track.className = 'dvfy-stepper__track';
    this.#track.setAttribute('role', 'tablist');
    this.#track.setAttribute('aria-orientation', this.#isVertical ? 'vertical' : 'horizontal');

    this.#steps.forEach((step, i) => {
      this.#track.appendChild(this.#buildItem(step, i));
    });

    this.insertBefore(this.#track, this.firstChild);
    this.#track.addEventListener('keydown', this.#onKey);
    this.#buildNav();
    this.#activate(this.#activeIndex);
  }

  #buildItem(step, i) {
    const item = document.createElement('div');
    item.className = 'dvfy-stepper__item';
    item.dataset.index = String(i);

    const btn = document.createElement('button');
    btn.className = 'dvfy-stepper__indicator';
    btn.setAttribute('type', 'button');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('tabindex', '-1');
    btn.dataset.index = String(i);
    btn.addEventListener('click', () => this.#handleIndicatorClick(i));

    const wrap = document.createElement('div');
    wrap.className = 'dvfy-stepper__label-wrap';

    const lbl = document.createElement('span');
    lbl.className = 'dvfy-stepper__label';
    lbl.textContent = step.getAttribute('label') || `Step ${i + 1}`;
    wrap.appendChild(lbl);

    const desc = step.getAttribute('description');
    if (desc) {
      const d = document.createElement('span');
      d.className = 'dvfy-stepper__description';
      d.textContent = desc;
      wrap.appendChild(d);
    }

    item.appendChild(btn);
    item.appendChild(wrap);
    return item;
  }

  #buildNav() {
    this.querySelector('.dvfy-stepper__nav')?.remove();
    const nav = document.createElement('div');
    nav.className = 'dvfy-stepper__nav';

    const prev = document.createElement('button');
    prev.className = 'dvfy-stepper__prev';
    prev.setAttribute('type', 'button');
    prev.textContent = 'Previous';
    prev.addEventListener('click', () => this.prev());

    const next = document.createElement('button');
    next.className = 'dvfy-stepper__next';
    next.setAttribute('type', 'button');
    next.textContent = 'Next';
    next.addEventListener('click', () => this.next());

    nav.appendChild(prev);
    nav.appendChild(next);
    this.appendChild(nav);
  }

  #rebuild() {
    this.#track?.removeEventListener('keydown', this.#onKey);
    this.#track?.remove();
    this.querySelector('.dvfy-stepper__nav')?.remove();
    this.#track = null;
    this.#build();
  }

  #handleIndicatorClick(i) {
    const activeIdx = this.#activeIndex;
    // In linear mode, block jumping ahead of the active step
    if (this.#isLinear && i > activeIdx) return;
    this.#goTo(i);
  }

  #goTo(i) {
    const steps = this.#steps;
    if (i < 0 || i >= steps.length) return;
    const prev = this.#activeIndex;
    if (i === prev) return;
    this.setAttribute('active-step', String(i));
    this.dispatchEvent(new CustomEvent('step-change', {
      bubbles: true,
      detail: { step: i, previous: prev },
    }));
  }

  #activate(idx) {
    const steps = this.#steps;
    const items = this.#track
      ? Array.from(this.#track.querySelectorAll('.dvfy-stepper__item'))
      : [];

    steps.forEach((step, i) => {
      // Derive display state
      const explicit = step.getAttribute('state');
      let state;
      if (explicit === 'error') {
        state = 'error';
      } else if (i < idx) {
        state = 'completed';
        step.setAttribute('state', 'completed');
      } else if (i === idx) {
        state = 'active';
        step.setAttribute('state', 'active');
      } else {
        state = 'upcoming';
        step.setAttribute('state', 'upcoming');
      }

      // Panel visibility
      if (i === idx) step.setAttribute('active', '');
      else step.removeAttribute('active');

      const item = items[i];
      if (!item) return;
      item.dataset.state = state;

      const btn = item.querySelector('.dvfy-stepper__indicator');
      if (!btn) return;

      btn.setAttribute('aria-selected', String(i === idx));
      btn.setAttribute('tabindex', i === idx ? '0' : '-1');
      btn.setAttribute(
        'aria-label',
        `${step.getAttribute('label') || `Step ${i + 1}`} — ${state}`
      );

      if (state === 'completed') {
        btn.textContent = '✓';
      } else if (state === 'error') {
        btn.textContent = '!';
      } else {
        btn.textContent = String(i + 1);
      }
    });

    // Nav state
    const prevBtn = this.querySelector('.dvfy-stepper__prev');
    const nextBtn = this.querySelector('.dvfy-stepper__next');
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === steps.length - 1;
  }

  #onKey = (e) => {
    const btns = Array.from(this.#track.querySelectorAll('.dvfy-stepper__indicator'));
    const current = btns.indexOf(document.activeElement);
    if (current < 0) return;

    const fwd = this.#isVertical ? 'ArrowDown' : 'ArrowRight';
    const bck = this.#isVertical ? 'ArrowUp' : 'ArrowLeft';

    let next = current;
    if (e.key === fwd)   next = Math.min(current + 1, btns.length - 1);
    else if (e.key === bck)   next = Math.max(current - 1, 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End')  next = btns.length - 1;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#handleIndicatorClick(current);
      return;
    } else return;

    e.preventDefault();
    btns[next].focus();
  };

  /** Navigate to the previous step. */
  prev() { this.#goTo(this.#activeIndex - 1); }

  /** Navigate to the next step. */
  next() { this.#goTo(this.#activeIndex + 1); }

  /**
   * Mark the current step as completed and advance to the next step.
   * Use this in form wizards after successful validation.
   */
  complete() {
    const steps = this.#steps;
    const idx = this.#activeIndex;
    if (steps[idx]) steps[idx].setAttribute('state', 'completed');
    this.next();
  }

  /**
   * Mark a step as errored and re-render the track.
   * @param {number} idx - Step index to mark as error
   */
  setError(idx) {
    const steps = this.#steps;
    if (steps[idx]) {
      steps[idx].setAttribute('state', 'error');
      this.#activate(this.#activeIndex);
    }
  }
}

/**
 * Individual step panel within a dvfy-stepper wizard.
 *
 * Carries step metadata as attributes (label, description, state). The parent
 * dvfy-stepper reads these to build the track header and manage panel visibility.
 * Add hx-get / hx-trigger on this element to load step content via HTMX.
 *
 * @element dvfy-step
 *
 * @attr {string} label - Step title shown in the track indicator
 * @attr {string} description - Optional subtitle shown under the label
 * @attr {string} state - Current state: active | completed | upcoming | error
 *
 * @slot - Step content rendered when this step is active
 */
class DvfyStep extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'tabpanel');
  }

  static get observedAttributes() { return ['label', 'description', 'state']; }
}

customElements.define('dvfy-stepper', DvfyStepper);
customElements.define('dvfy-step', DvfyStep);
