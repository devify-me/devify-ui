/**
 * <dvfy-loader> — Loading spinner
 *
 * Attributes:
 *   size:    sm | md | lg (default: "md")
 *   variant: spinner | dots (default: "spinner")
 *
 * Usage:
 *   <dvfy-loader></dvfy-loader>
 *   <dvfy-loader size="lg" variant="dots"></dvfy-loader>
 */

const STYLES = `
dvfy-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Spinner */
dvfy-loader .dvfy-loader__spinner {
  border-radius: var(--dvfy-radius-round);
  border: 2px solid var(--dvfy-border-default);
  border-top-color: var(--dvfy-primary-bg);
  animation: dvfy-spin 0.7s linear infinite;
}

dvfy-loader[size="sm"] .dvfy-loader__spinner { width: 1rem; height: 1rem; border-width: 2px; }
dvfy-loader:not([size]) .dvfy-loader__spinner,
dvfy-loader[size="md"] .dvfy-loader__spinner { width: 1.5rem; height: 1.5rem; border-width: 2px; }
dvfy-loader[size="lg"] .dvfy-loader__spinner { width: 2.5rem; height: 2.5rem; border-width: 3px; }

@keyframes dvfy-spin { to { transform: rotate(360deg); } }

/* Dots */
dvfy-loader .dvfy-loader__dots {
  display: flex;
  gap: var(--dvfy-space-1-5);
  align-items: center;
}
dvfy-loader .dvfy-loader__dot {
  border-radius: var(--dvfy-radius-round);
  background: var(--dvfy-primary-bg);
  animation: dvfy-pulse 1.4s ease-in-out infinite;
}
dvfy-loader .dvfy-loader__dot:nth-child(2) { animation-delay: 0.2s; }
dvfy-loader .dvfy-loader__dot:nth-child(3) { animation-delay: 0.4s; }

dvfy-loader[size="sm"] .dvfy-loader__dot { width: 0.375rem; height: 0.375rem; }
dvfy-loader:not([size]) .dvfy-loader__dot,
dvfy-loader[size="md"] .dvfy-loader__dot { width: 0.5rem; height: 0.5rem; }
dvfy-loader[size="lg"] .dvfy-loader__dot { width: 0.75rem; height: 0.75rem; }

@keyframes dvfy-pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
`;

class DvfyLoader extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyLoader.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyLoader.#styled = true;
    }
    this.setAttribute('role', 'status');
    this.setAttribute('aria-label', 'Loading');
    this.#build();
  }

  static get observedAttributes() { return ['variant', 'size']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#build();
  }

  #build() {
    this.textContent = '';
    const variant = this.getAttribute('variant') || 'spinner';

    if (variant === 'dots') {
      const wrap = document.createElement('span');
      wrap.className = 'dvfy-loader__dots';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'dvfy-loader__dot';
        wrap.appendChild(dot);
      }
      this.appendChild(wrap);
    } else {
      const spinner = document.createElement('span');
      spinner.className = 'dvfy-loader__spinner';
      this.appendChild(spinner);
    }

    // Screen reader text
    const sr = document.createElement('span');
    sr.textContent = 'Loading...';
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    this.appendChild(sr);
  }
}

customElements.define('dvfy-loader', DvfyLoader);
