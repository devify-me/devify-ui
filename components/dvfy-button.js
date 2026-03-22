/* <dvfy-button> — Button component */

const STYLES = `
dvfy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
  font-weight: var(--dvfy-weight-medium);
  line-height: var(--dvfy-leading-tight);
  border: var(--dvfy-border-1) solid transparent;
  cursor: pointer;
  transition:
    width var(--dvfy-duration-normal, 200ms) var(--dvfy-ease-in-out, ease-in-out),
    border-radius var(--dvfy-duration-normal, 200ms) var(--dvfy-ease-in-out, ease-in-out),
    background-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
    color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
    border-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
    opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  overflow: hidden;
}

/* Size: xs */
dvfy-button[size="xs"] { padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border-radius: var(--dvfy-radius-sm); }
/* Size: sm */
dvfy-button[size="sm"] { padding: var(--dvfy-space-1-5) var(--dvfy-space-3); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
/* Size: md (default) */
dvfy-button:not([size]), dvfy-button[size="md"] { padding: var(--dvfy-space-2) var(--dvfy-space-4); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-lg); }
/* Size: lg */
dvfy-button[size="lg"] { padding: var(--dvfy-space-2-5) var(--dvfy-space-5); font-size: var(--dvfy-text-base); border-radius: var(--dvfy-radius-lg); }
/* Size: xl */
dvfy-button[size="xl"] { padding: var(--dvfy-space-3) var(--dvfy-space-6); font-size: var(--dvfy-text-lg); border-radius: var(--dvfy-radius-xl); }

/* Icon-only — square aspect ratio */
dvfy-button[icon] { aspect-ratio: 1; padding: var(--dvfy-space-2); }
dvfy-button[icon][size="xs"] { padding: var(--dvfy-space-1); }
dvfy-button[icon][size="sm"] { padding: var(--dvfy-space-1-5); }
dvfy-button[icon][size="lg"] { padding: var(--dvfy-space-2-5); }
dvfy-button[icon][size="xl"] { padding: var(--dvfy-space-3); }

/* Default variant — high specificity to resist overrides */
dvfy-button:not([variant]), dvfy-button[variant="default"] {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text);
  border-color: var(--dvfy-primary-bg);
}
dvfy-button:not([variant]):hover:not([disabled]):not([loading]):not([success]),
dvfy-button[variant="default"]:hover:not([disabled]):not([loading]):not([success]) {
  background: var(--dvfy-primary-bg-hover) !important;
  border-color: var(--dvfy-primary-bg-hover) !important;
}
dvfy-button:not([variant]):active:not([disabled]):not([loading]):not([success]),
dvfy-button[variant="default"]:active:not([disabled]):not([loading]):not([success]) {
  background: var(--dvfy-primary-bg-active) !important;
}

/* Subtle */
dvfy-button[variant="subtle"] {
  background: var(--dvfy-primary-bg-subtle);
  color: var(--dvfy-text-link);
  border-color: transparent;
}
dvfy-button[variant="subtle"]:hover:not([disabled]):not([loading]):not([success]) { background: var(--dvfy-hover-bg); }

/* Outline */
dvfy-button[variant="outline"] {
  background: transparent;
  color: var(--dvfy-text-primary);
  border-color: var(--dvfy-border-default);
}
dvfy-button[variant="outline"]:hover:not([disabled]):not([loading]):not([success]) { background: var(--dvfy-hover-bg); border-color: var(--dvfy-border-strong); }

/* Ghost */
dvfy-button[variant="ghost"] {
  background: transparent;
  color: var(--dvfy-text-secondary);
  border-color: transparent;
}
dvfy-button[variant="ghost"]:hover:not([disabled]):not([loading]):not([success]) { background: var(--dvfy-hover-bg); color: var(--dvfy-text-primary); }

/* Danger */
dvfy-button[variant="danger"] {
  background: var(--dvfy-danger-bg);
  color: var(--dvfy-neutral-0);
  border-color: var(--dvfy-danger-bg);
}
dvfy-button[variant="danger"]:hover:not([disabled]):not([loading]):not([success]) { opacity: 0.9; }

/* States */
dvfy-button:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-button[disabled] {
  background: var(--dvfy-disabled-bg);
  color: var(--dvfy-text-muted);
  border-color: var(--dvfy-border-default);
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading — morph to circle with spinner */
dvfy-button[loading] {
  position: relative;
  border-radius: 9999px;
  pointer-events: none;
  color: transparent;
}
dvfy-button[loading]::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 9999px;
  animation: dvfy-spin 0.6s linear infinite;
  color: var(--dvfy-neutral-0, #fff);
}

/* Success — green circle with checkmark */
dvfy-button[success] {
  position: relative;
  border-radius: 9999px;
  background: var(--dvfy-success-bg) !important;
  border-color: var(--dvfy-success-bg) !important;
  pointer-events: none;
  color: transparent;
}
dvfy-button[success]::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 0.35em;
  height: 0.6em;
  border: 2px solid var(--dvfy-on-success, #fff);
  border-top: none;
  border-left: none;
  transform: rotate(45deg) translate(0, -0.1em);
}

@keyframes dvfy-spin { to { transform: rotate(360deg); } }

/* Respect reduced-motion — no spin, instant morph */
@media (prefers-reduced-motion: reduce) {
  dvfy-button {
    transition: background-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
                color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
                border-color var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
                opacity var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
  }
  dvfy-button[loading]::after {
    animation: none;
    border-right-color: currentColor;
    opacity: 0.6;
  }
}
`;

/**
 * Button component with multiple variants, sizes, and loading/success morph states.
 *
 * @element dvfy-button
 *
 * @attr {string} variant - Button style: default | subtle | outline | ghost | danger (default: "default")
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {boolean} icon - Icon-only mode with square aspect ratio
 * @attr {boolean} disabled - Disable button and prevent interaction
 * @attr {boolean} loading - Show loading state — morphs to spinner circle
 * @attr {boolean} success - Show success state — morphs to green checkmark circle, auto-resets
 * @attr {string} success-duration - Milliseconds before success auto-resets to idle (default: "2000")
 * @attr {string} type - HTML button type: button | submit | reset (default: "button")
 *
 * @event {CustomEvent} dvfy-success-reset - Fires when success state auto-resets to idle
 *
 * @slot - Button label content
 *
 * @cssprop {color} --dvfy-primary-bg - Primary background color
 * @cssprop {color} --dvfy-primary-text - Primary text color
 * @cssprop {color} --dvfy-danger-bg - Danger variant background
 * @cssprop {color} --dvfy-success-bg - Success state background color
 * @cssprop {color} --dvfy-on-success - Success state text/icon color
 */
class DvfyButton extends HTMLElement {
  static #styled = false;

  /** Idle width stored before morph — preserved by ResizeObserver */
  #idleWidth = 0;
  #resizeObserver = null;
  #successTimer = null;

  connectedCallback() {
    if (!DvfyButton.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyButton.#styled = true;
    }

    if (!this.getAttribute('role')) this.setAttribute('role', 'button');
    if (!this.getAttribute('tabindex') && !this.hasAttribute('disabled')) {
      this.setAttribute('tabindex', '0');
    }
    this.#syncAria();

    this.addEventListener('keydown', this.#onKey);

    // Track idle width so morph can animate from a concrete pixel value
    this.#resizeObserver = new ResizeObserver(() => {
      if (!this.hasAttribute('loading') && !this.hasAttribute('success')) {
        this.#idleWidth = this.offsetWidth;
      }
    });
    this.#resizeObserver.observe(this);
    // Capture initial width after first paint
    requestAnimationFrame(() => {
      if (!this.hasAttribute('loading') && !this.hasAttribute('success')) {
        this.#idleWidth = this.offsetWidth;
      }
    });
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKey);
    this.#resizeObserver?.disconnect();
    clearTimeout(this.#successTimer);
  }

  #onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  };

  static get observedAttributes() { return ['disabled', 'loading', 'success']; }

  attributeChangedCallback(name, _oldVal, newVal) {
    if (name === 'disabled') {
      const disabled = newVal !== null;
      this.setAttribute('tabindex', disabled ? '-1' : '0');
      this.setAttribute('aria-disabled', String(disabled));
    }

    if (name === 'loading') {
      const loading = newVal !== null;
      this.setAttribute('aria-busy', String(loading));
      if (loading) {
        this.#morphTo(this.#morphSize());
      } else if (!this.hasAttribute('success')) {
        this.#morphBack();
      }
    }

    if (name === 'success') {
      const success = newVal !== null;
      if (success) {
        // Clear any pending success timer
        clearTimeout(this.#successTimer);
        // If transitioning from loading, size is already set; otherwise start morph
        if (!this.hasAttribute('loading')) {
          this.#morphTo(this.#morphSize());
        }
        // Update aria
        const prevLabel = this.getAttribute('aria-label');
        if (prevLabel) this.dataset.prevAriaLabel = prevLabel;
        this.setAttribute('aria-label', (prevLabel ? prevLabel + ' — ' : '') + 'Success');

        // Auto-reset after configurable delay
        const duration = parseInt(this.getAttribute('success-duration') ?? '2000', 10);
        this.#successTimer = setTimeout(() => {
          this.removeAttribute('success');
          this.dispatchEvent(new CustomEvent('dvfy-success-reset', { bubbles: true }));
        }, duration);
      } else {
        // Restore aria-label
        if (this.dataset.prevAriaLabel !== undefined) {
          this.setAttribute('aria-label', this.dataset.prevAriaLabel);
          delete this.dataset.prevAriaLabel;
        } else {
          this.removeAttribute('aria-label');
        }
        if (!this.hasAttribute('loading')) {
          this.#morphBack();
        }
      }
    }
  }

  /** Size to morph to — matches the button's current height for a perfect circle */
  #morphSize() {
    const h = this.offsetHeight;
    return h > 0 ? `${h}px` : '2.5em';
  }

  /** Animate width to a fixed size (circle) preserving surrounding layout */
  #morphTo(size) {
    // Lock idle width first so transition has a concrete start value
    const idle = this.#idleWidth || this.offsetWidth;
    if (idle > 0) this.style.width = `${idle}px`;

    requestAnimationFrame(() => {
      this.style.width = size;
    });
  }

  /** Animate back to idle width, then clear inline style */
  #morphBack() {
    const idle = this.#idleWidth;
    if (!idle) {
      this.style.width = '';
      return;
    }
    this.style.width = `${idle}px`;
    const onEnd = (e) => {
      if (e.propertyName !== 'width') return;
      this.style.width = '';
      this.removeEventListener('transitionend', onEnd);
    };
    this.addEventListener('transitionend', onEnd);
  }

  #syncAria() {
    if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
    if (this.hasAttribute('loading')) this.setAttribute('aria-busy', 'true');
  }
}

customElements.define('dvfy-button', DvfyButton);
