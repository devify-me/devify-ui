/**
 * <dvfy-holo-card> — Holographic foil shimmer hover effect
 *
 * Cards shimmer with a hue-rotating rainbow gradient overlay on hover,
 * simulating a holographic foil finish. Optional tilt/perspective tracking
 * via mousemove. Respects prefers-reduced-motion.
 *
 * @element dvfy-holo-card
 *
 * @attr {boolean} tilt - Enable JS mouse-tracking perspective tilt
 * @attr {boolean} elevated - Add shadow elevation
 * @attr {boolean} padded - Enable padding
 * @attr {number} shimmer-intensity - Foil overlay opacity on hover (default: 0.6)
 *
 * @slot - Card content
 *
 * @cssprop {number} --dvfy-holo-card-intensity - Foil overlay opacity (default: 0.6)
 * @cssprop {length} --dvfy-holo-card-tilt-max - Max tilt angle in degrees (default: 15deg)
 * @cssprop {color} --dvfy-holo-card-bg - Card background
 *
 * @example
 * <dvfy-holo-card tilt padded>
 *   <h3>Holographic Card</h3>
 *   <p>Hover to reveal the foil shimmer effect.</p>
 * </dvfy-holo-card>
 */

const STYLES = `
dvfy-holo-card {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-holo-card-bg, var(--dvfy-surface-raised));
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  color: var(--dvfy-text-primary);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  --_holo-intensity: var(--dvfy-holo-card-intensity, 0.6);
  --_holo-tilt-max: var(--dvfy-holo-card-tilt-max, 15deg);
  transform-style: preserve-3d;
  will-change: transform;
  transition:
    transform var(--dvfy-duration-normal, 300ms) var(--dvfy-ease-out, ease-out),
    box-shadow var(--dvfy-duration-normal, 300ms) var(--dvfy-ease-out, ease-out);
}

/* Lift direct children above the foil overlay */
dvfy-holo-card > * {
  position: relative;
  z-index: 1;
}

/* Padded */
dvfy-holo-card[padded] {
  padding: var(--dvfy-space-5);
}

/* Elevated */
dvfy-holo-card[elevated] {
  box-shadow: var(--dvfy-shadow-md);
}

/* Holographic foil overlay */
dvfy-holo-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    oklch(80% 0.3 0deg),
    oklch(80% 0.3 60deg),
    oklch(80% 0.3 120deg),
    oklch(80% 0.3 180deg),
    oklch(80% 0.3 240deg),
    oklch(80% 0.3 300deg),
    oklch(80% 0.3 360deg)
  );
  mix-blend-mode: overlay;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  transition: opacity var(--dvfy-duration-normal, 300ms) var(--dvfy-ease-out, ease-out);
  border-radius: inherit;
}

/* Sheen layer — catches light at an angle */
dvfy-holo-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(255, 255, 255, 0.15) 40%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.15) 60%,
    transparent 80%
  );
  background-size: 200% 200%;
  background-position: -100% -100%;
  mix-blend-mode: overlay;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
  transition:
    opacity var(--dvfy-duration-normal, 300ms) var(--dvfy-ease-out, ease-out),
    background-position var(--dvfy-duration-slow, 600ms) var(--dvfy-ease-out, ease-out);
}

/* Hover effects — only on pointer devices */
@media (hover: hover) {
  dvfy-holo-card:hover::before {
    opacity: var(--_holo-intensity);
    animation: dvfy-holo-rotate 4s linear infinite;
  }

  dvfy-holo-card:hover::after {
    opacity: 1;
    background-position: 200% 200%;
  }

  dvfy-holo-card[elevated]:hover {
    box-shadow: var(--dvfy-shadow-lg);
  }
}

/* Reduced motion — disable animation, keep static shimmer */
@media (prefers-reduced-motion: reduce) {
  dvfy-holo-card,
  dvfy-holo-card::before,
  dvfy-holo-card::after {
    transition: opacity var(--dvfy-duration-fast, 150ms) ease !important;
    animation: none !important;
  }

  dvfy-holo-card[tilt] {
    transform: none !important;
  }
}

@keyframes dvfy-holo-rotate {
  0%   { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
`;

class DvfyHoloCard extends HTMLElement {
  static #styled = false;
  #reducedMotion = false;

  #onMouseMove = (e) => {
    if (this.#reducedMotion || !this.hasAttribute('tilt')) return;
    const rect = this.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
    const maxDeg = parseFloat(
      getComputedStyle(this).getPropertyValue('--_holo-tilt-max') || '15'
    );
    const rotateX = (-dy * maxDeg).toFixed(2);
    const rotateY = (dx * maxDeg).toFixed(2);
    this.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  #onMouseLeave = () => {
    if (!this.hasAttribute('tilt')) return;
    this.style.transform = '';
  };

  connectedCallback() {
    if (!DvfyHoloCard.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyHoloCard.#styled = true;
    }

    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.addEventListener('mousemove', this.#onMouseMove);
    this.addEventListener('mouseleave', this.#onMouseLeave);

    // Sync shimmer-intensity attr to CSS custom property
    this.#syncIntensity();

    if (!this.hasAttribute('role')) this.setAttribute('role', 'article');
  }

  disconnectedCallback() {
    this.removeEventListener('mousemove', this.#onMouseMove);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
  }

  static get observedAttributes() { return ['shimmer-intensity', 'tilt']; }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'shimmer-intensity') this.#syncIntensity();
  }

  #syncIntensity() {
    const val = this.getAttribute('shimmer-intensity');
    if (val !== null) {
      const clamped = Math.min(1, Math.max(0, parseFloat(val) || 0.6));
      this.style.setProperty('--_holo-intensity', String(clamped));
    } else {
      this.style.removeProperty('--_holo-intensity');
    }
  }
}

customElements.define('dvfy-holo-card', DvfyHoloCard);
