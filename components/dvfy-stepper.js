/**
 * <dvfy-stepper> — Multi-step wizard with visual progress.
 *
 * Usage:
 *   <dvfy-stepper active="1">
 *     <dvfy-step label="Account" description="Create your account">
 *       <p>Step 1 content</p>
 *     </dvfy-step>
 *     <dvfy-step label="Profile" description="Set up profile">
 *       <p>Step 2 content</p>
 *     </dvfy-step>
 *     <dvfy-step label="Confirm">
 *       <p>Step 3 content</p>
 *     </dvfy-step>
 *   </dvfy-stepper>
 *
 * @element dvfy-stepper
 *
 * @attr {number} active - Active step (1-based index, default: 1)
 * @attr {boolean} linear - Must complete steps in order
 * @attr {boolean} vertical - Vertical orientation (default: horizontal)
 *
 * @event {CustomEvent} change - Fires when active step changes, detail: { step, index }
 *
 * @slot - <dvfy-step> elements
 *
 * @cssprop {color} --dvfy-primary-bg - Active/completed step indicator color
 * @cssprop {color} --dvfy-danger-bg - Error step indicator color
 *
 * @example
 * <dvfy-stepper active="1">
 *   <dvfy-step label="Account" description="Create your account"><p>Account form here</p></dvfy-step>
 *   <dvfy-step label="Profile"><p>Profile form here</p></dvfy-step>
 *   <dvfy-step label="Done"><p>All set!</p></dvfy-step>
 * </dvfy-stepper>
 */

const STYLES = `
dvfy-stepper {
  display: block;
  font-family: var(--dvfy-font-sans);
}

/* ── Step header row ─────────────────────────────────────────────── */
.dvfy-stepper__nav {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: var(--dvfy-space-6, 1.5rem);
}
dvfy-stepper[vertical] .dvfy-stepper__nav {
  flex-direction: column;
  margin-bottom: 0;
}

/* Individual step header */
.dvfy-stepper__header {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2, 0.5rem);
  cursor: pointer;
  border: none;
  background: none;
  padding: var(--dvfy-space-2, 0.5rem);
  font-family: inherit;
  text-align: left;
  outline: none;
  flex-shrink: 0;
}
.dvfy-stepper__header:focus-visible {
  outline: var(--dvfy-ring-width, 2px) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset, 2px);
  border-radius: var(--dvfy-radius-md);
}
.dvfy-stepper__header[data-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Step number circle */
.dvfy-stepper__indicator {
  width: 2rem;
  height: 2rem;
  border-radius: var(--dvfy-radius-round, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--dvfy-text-sm, 0.875rem);
  font-weight: var(--dvfy-weight-semibold, 600);
  flex-shrink: 0;
  transition: background var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              border-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  border: 2px solid var(--dvfy-border-default);
  background: transparent;
  color: var(--dvfy-text-muted);
}

/* States */
.dvfy-stepper__header[data-state="active"] .dvfy-stepper__indicator {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text, #fff);
  border-color: var(--dvfy-primary-bg);
}
.dvfy-stepper__header[data-state="completed"] .dvfy-stepper__indicator {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text, #fff);
  border-color: var(--dvfy-primary-bg);
}
.dvfy-stepper__header[data-state="error"] .dvfy-stepper__indicator {
  background: var(--dvfy-danger-bg);
  color: #fff;
  border-color: var(--dvfy-danger-bg);
}

/* Label + description */
.dvfy-stepper__label {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-0-5, 0.125rem);
}
.dvfy-stepper__label-text {
  font-size: var(--dvfy-text-sm, 0.875rem);
  font-weight: var(--dvfy-weight-medium, 500);
  color: var(--dvfy-text-muted);
  transition: color var(--dvfy-duration-fast, 150ms);
}
.dvfy-stepper__header[data-state="active"] .dvfy-stepper__label-text {
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-semibold, 600);
}
.dvfy-stepper__header[data-state="completed"] .dvfy-stepper__label-text {
  color: var(--dvfy-text-primary);
}
.dvfy-stepper__label-desc {
  font-size: var(--dvfy-text-xs, 0.75rem);
  color: var(--dvfy-text-muted);
}

/* Connector line between steps */
.dvfy-stepper__connector {
  flex: 1;
  height: 2px;
  background: var(--dvfy-border-default);
  align-self: center;
  margin-top: calc(-1 * var(--dvfy-space-2, 0.5rem));
  min-width: var(--dvfy-space-4, 1rem);
  transition: background var(--dvfy-duration-fast, 150ms);
}
.dvfy-stepper__connector[data-completed] {
  background: var(--dvfy-primary-bg);
}
dvfy-stepper[vertical] .dvfy-stepper__connector {
  width: 2px;
  height: var(--dvfy-space-6, 1.5rem);
  min-width: 0;
  margin-top: 0;
  margin-left: calc(1rem - 1px);
  align-self: flex-start;
  flex: none;
}

/* ── Step content panels ─────────────────────────────────────────── */
dvfy-step {
  display: none;
}
dvfy-step[active] {
  display: block;
  padding: var(--dvfy-space-4, 1rem) 0;
}
dvfy-stepper[vertical] dvfy-step[active] {
  padding: var(--dvfy-space-2, 0.5rem) 0 var(--dvfy-space-4, 1rem) calc(2rem + var(--dvfy-space-4, 1rem));
}
`;

/**
 * Multi-step wizard with visual progress, keyboard navigation, and step states.
 *
 * @element dvfy-stepper
 *
 * @attr {number} active - Active step (1-based index, default: 1)
 * @attr {boolean} linear - Must complete steps in order
 * @attr {boolean} vertical - Vertical orientation (default: horizontal)
 *
 * @event {CustomEvent} change - Fires when active step changes, detail: { step, index }
 */
class DvfyStepper extends HTMLElement {
  static #styled = false;
  #nav = null;

  connectedCallback() {
    if (!DvfyStepper.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyStepper.#styled = true;
    }
    this.setAttribute('role', 'navigation');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Progress steps');
    }
    queueMicrotask(() => this.#build());
  }

  disconnectedCallback() {
    this.#nav?.removeEventListener('keydown', this.#onKey);
  }

  static get observedAttributes() { return ['active']; }

  attributeChangedCallback(name) {
    if (name === 'active' && this.isConnected && this.#nav) {
      this.#activate(this.#activeIndex);
    }
  }

  get #activeIndex() {
    return parseInt(this.getAttribute('active') || '1', 10);
  }

  get #steps() {
    return Array.from(this.querySelectorAll(':scope > dvfy-step'));
  }

  #build() {
    this.#nav = document.createElement('div');
    this.#nav.className = 'dvfy-stepper__nav';
    this.#nav.setAttribute('role', 'tablist');

    const steps = this.#steps;
    steps.forEach((step, i) => {
      if (i > 0) {
        const connector = document.createElement('div');
        connector.className = 'dvfy-stepper__connector';
        this.#nav.appendChild(connector);
      }

      const btn = document.createElement('button');
      btn.className = 'dvfy-stepper__header';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('tabindex', i + 1 === this.#activeIndex ? '0' : '-1');

      const indicator = document.createElement('span');
      indicator.className = 'dvfy-stepper__indicator';
      indicator.textContent = String(i + 1);

      const label = document.createElement('span');
      label.className = 'dvfy-stepper__label';
      const labelText = document.createElement('span');
      labelText.className = 'dvfy-stepper__label-text';
      labelText.textContent = step.getAttribute('label') || `Step ${i + 1}`;
      label.appendChild(labelText);

      const desc = step.getAttribute('description');
      if (desc) {
        const labelDesc = document.createElement('span');
        labelDesc.className = 'dvfy-stepper__label-desc';
        labelDesc.textContent = desc;
        label.appendChild(labelDesc);
      }

      btn.append(indicator, label);
      btn.addEventListener('click', () => this.#onHeaderClick(i));
      this.#nav.appendChild(btn);
    });

    this.insertBefore(this.#nav, this.firstChild);
    this.#nav.addEventListener('keydown', this.#onKey);
    this.#activate(this.#activeIndex);
  }

  #onHeaderClick(idx) {
    const step = this.#steps[idx];
    if (!step || step.hasAttribute('disabled')) return;

    // Linear mode: can't skip ahead past last completed + 1
    if (this.hasAttribute('linear')) {
      const steps = this.#steps;
      let lastCompleted = -1;
      steps.forEach((s, i) => {
        if (s.hasAttribute('completed')) lastCompleted = i;
      });
      if (idx > lastCompleted + 1) return;
    }

    this.setAttribute('active', String(idx + 1));
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      detail: { step: this.#steps[idx], index: idx + 1 },
    }));
  }

  #activate(activeIdx) {
    const steps = this.#steps;
    const headers = this.#nav ? Array.from(this.#nav.querySelectorAll('.dvfy-stepper__header')) : [];
    const connectors = this.#nav ? Array.from(this.#nav.querySelectorAll('.dvfy-stepper__connector')) : [];

    steps.forEach((step, i) => {
      const idx1 = i + 1; // 1-based
      const header = headers[i];
      if (!header) return;

      // Determine state
      let state = 'upcoming';
      if (step.hasAttribute('error')) {
        state = 'error';
      } else if (step.hasAttribute('completed')) {
        state = 'completed';
      } else if (idx1 === activeIdx) {
        state = 'active';
      }

      header.setAttribute('data-state', state);
      header.setAttribute('aria-selected', String(idx1 === activeIdx));
      header.setAttribute('tabindex', idx1 === activeIdx ? '0' : '-1');

      if (step.hasAttribute('disabled')) {
        header.setAttribute('data-disabled', '');
      } else {
        header.removeAttribute('data-disabled');
      }

      // Update indicator content
      const indicator = header.querySelector('.dvfy-stepper__indicator');
      if (indicator) {
        indicator.textContent = state === 'completed' ? '✓' : String(idx1);
      }

      // Show/hide content panel
      if (idx1 === activeIdx) {
        step.setAttribute('active', '');
      } else {
        step.removeAttribute('active');
      }
    });

    // Update connector lines
    connectors.forEach((conn, i) => {
      const stepAfter = steps[i]; // connector before step i+1 → check if step i is completed
      if (stepAfter?.hasAttribute('completed') || (i + 1 < activeIdx)) {
        conn.setAttribute('data-completed', '');
      } else {
        conn.removeAttribute('data-completed');
      }
    });
  }

  #onKey = (e) => {
    const headers = Array.from(this.#nav.querySelectorAll('.dvfy-stepper__header'));
    const current = headers.indexOf(document.activeElement);
    if (current < 0) return;

    const isVertical = this.hasAttribute('vertical');
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    let next = current;
    if (e.key === nextKey) next = (current + 1) % headers.length;
    else if (e.key === prevKey) next = (current - 1 + headers.length) % headers.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = headers.length - 1;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#onHeaderClick(current);
      return;
    } else return;

    e.preventDefault();
    headers[next].focus();
  };
}

/**
 * Individual step within a dvfy-stepper.
 *
 * @element dvfy-step
 *
 * @attr {string} label - Step header text
 * @attr {string} description - Optional subtitle below label
 * @attr {boolean} completed - Step is completed (shows checkmark)
 * @attr {boolean} error - Step has an error
 * @attr {boolean} disabled - Step cannot be activated
 *
 * @slot - Step content (forms, text, etc.)
 */
class DvfyStep extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'tabpanel');
  }
}

customElements.define('dvfy-stepper', DvfyStepper);
customElements.define('dvfy-step', DvfyStep);
