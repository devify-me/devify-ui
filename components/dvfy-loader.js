import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-loader> — Loading spinner
 *
 * Attributes:
 *   size:    sm | md | lg (default: "md")
 *   variant: spinner | dots (default: "spinner")
 *   icon:    URL to brand icon (shown at center of spinner)
 *
 * Usage:
 *   <dvfy-loader></dvfy-loader>
 *   <dvfy-loader size="lg" icon="/static/brand-icon.svg"></dvfy-loader>
 *   <dvfy-loader variant="dots"></dvfy-loader>
 */

const STYLES = `
dvfy-loader {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dvfy-space-2);
}

/* Label */
dvfy-loader .dvfy-loader__label {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-secondary);
  white-space: nowrap;
}

/* Label positions (top = default: label DOM-first, spinner below) */
dvfy-loader[label-position="bottom"] .dvfy-loader__label { order: 1; }
dvfy-loader[label-position="left"] { flex-direction: row; }
dvfy-loader[label-position="right"] { flex-direction: row; }
dvfy-loader[label-position="right"] .dvfy-loader__label { order: 1; }

/* Spinner container for icon overlay */
dvfy-loader .dvfy-loader__spinner-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

dvfy-loader .dvfy-loader__spinner {
  border-radius: var(--dvfy-radius-round);
  border: 2px solid var(--dvfy-border-default);
  border-top-color: var(--dvfy-primary-bg);
  animation: dvfy-spin 0.7s linear infinite;
}

dvfy-loader .dvfy-loader__icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Size: xs */
dvfy-loader[size="xs"] .dvfy-loader__spinner { width: 0.75rem; height: 0.75rem; border-width: 1.5px; }
dvfy-loader[size="xs"] .dvfy-loader__icon { width: 0.375rem; height: 0.375rem; }
/* Size: sm */
dvfy-loader[size="sm"] .dvfy-loader__spinner { width: 1rem; height: 1rem; border-width: 2px; }
dvfy-loader[size="sm"] .dvfy-loader__icon { width: 0.5rem; height: 0.5rem; }
/* Size: md (default) */
dvfy-loader:not([size]) .dvfy-loader__spinner,
dvfy-loader[size="md"] .dvfy-loader__spinner { width: 1.5rem; height: 1.5rem; border-width: 2px; }
dvfy-loader:not([size]) .dvfy-loader__icon,
dvfy-loader[size="md"] .dvfy-loader__icon { width: 0.75rem; height: 0.75rem; }
/* Size: lg */
dvfy-loader[size="lg"] .dvfy-loader__spinner { width: 2.5rem; height: 2.5rem; border-width: 3px; }
dvfy-loader[size="lg"] .dvfy-loader__icon { width: 1.25rem; height: 1.25rem; }
/* Size: xl */
dvfy-loader[size="xl"] .dvfy-loader__spinner { width: 3.5rem; height: 3.5rem; border-width: 4px; }
dvfy-loader[size="xl"] .dvfy-loader__icon { width: 1.75rem; height: 1.75rem; }

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

dvfy-loader[size="xs"] .dvfy-loader__dot { width: 0.25rem; height: 0.25rem; }
dvfy-loader[size="sm"] .dvfy-loader__dot { width: 0.375rem; height: 0.375rem; }
dvfy-loader:not([size]) .dvfy-loader__dot,
dvfy-loader[size="md"] .dvfy-loader__dot { width: 0.5rem; height: 0.5rem; }
dvfy-loader[size="lg"] .dvfy-loader__dot { width: 0.75rem; height: 0.75rem; }
dvfy-loader[size="xl"] .dvfy-loader__dot { width: 1rem; height: 1rem; }

@keyframes dvfy-pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
`;

/**
 * Loading spinner with spinner and dots variants, optional brand icon overlay.
 *
 * @element dvfy-loader
 *
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} variant - Animation style: spinner | dots (default: "spinner")
 * @attr {string} icon - URL to brand icon shown at center of spinner
 * @attr {string} label - Visible text label (e.g. "Uploading..."); also used as aria-label
 * @attr {string} label-position - top | right | bottom | left (default: "top")
 *
 * @cssprop {color} --dvfy-primary-bg - Spinner accent color and dot color
 * @cssprop {color} --dvfy-border-default - Spinner track color
 */
class DvfyLoader extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-loader', STYLES);
    this.setAttribute('role', 'status');
    this.#build();
  }

  static get observedAttributes() { return ['variant', 'size', 'icon', 'label', 'label-position']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#build();
  }

  #build() {
    this.textContent = '';
    const variant = this.getAttribute('variant') || 'spinner';
    const iconSrc = this.getAttribute('icon');
    const labelText = this.getAttribute('label');

    // Update aria-label from label attr or fallback
    this.setAttribute('aria-label', labelText || 'Loading');

    // Visible label (top by default — DOM-first)
    if (labelText) {
      const lbl = document.createElement('span');
      lbl.className = 'dvfy-loader__label';
      lbl.setAttribute('aria-hidden', 'true');
      lbl.textContent = labelText;
      this.appendChild(lbl);
    }

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
      const wrap = document.createElement('span');
      wrap.className = 'dvfy-loader__spinner-wrap';

      const spinner = document.createElement('span');
      spinner.className = 'dvfy-loader__spinner';
      wrap.appendChild(spinner);

      if (iconSrc) {
        const img = document.createElement('img');
        img.className = 'dvfy-loader__icon';
        img.src = iconSrc;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        wrap.appendChild(img);
      }

      this.appendChild(wrap);
    }

    // Screen reader text when no visible label
    if (!labelText) {
      const sr = document.createElement('span');
      sr.textContent = 'Loading...';
      sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      this.appendChild(sr);
    }
  }
}

customElements.define('dvfy-loader', DvfyLoader);
