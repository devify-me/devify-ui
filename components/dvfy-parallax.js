/**
 * <dvfy-parallax> — CSS scroll-driven parallax background element
 *
 * Wraps content over a parallax background that moves at a slower rate than
 * the page scroll, creating depth without JavaScript scroll listeners.
 *
 * Uses `animation-timeline: view()` on the compositor thread for 60fps
 * performance. Falls back gracefully in unsupported browsers.
 *
 * Supported in Chromium 115+ and Safari 18+.
 *
 * Attributes:
 *   src:    string  — Background image URL (optional; use slot for custom bg)
 *   speed:  number  — Parallax intensity 0–1 (default: 0.4; 0 = static, 1 = max)
 *   height: string  — CSS height of the section (default: 50vh)
 *
 * CSS Custom Properties:
 *   --dvfy-parallax-height  Container height  (default: 50vh)
 *   --dvfy-parallax-radius  Border radius     (default: 0)
 *   --dvfy-parallax-overlay Semi-transparent overlay color (default: none)
 *
 * Usage:
 *   <!-- Image parallax with slot content -->
 *   <dvfy-parallax src="/hero.jpg" speed="0.4">
 *     <h1>Hello, world</h1>
 *   </dvfy-parallax>
 *
 *   <!-- Decorative gradient background -->
 *   <dvfy-parallax speed="0.6">
 *     <div slot="bg" style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6)"></div>
 *     <p>Content here</p>
 *   </dvfy-parallax>
 */

const STYLES = `
/* ── host ── */
dvfy-parallax {
  display: block;
  position: relative;
  overflow: hidden;
  min-height: var(--dvfy-parallax-height, 50vh);
  border-radius: var(--dvfy-parallax-radius, 0);
}

/* ── parallax background layer ── */
dvfy-parallax .dvfy-parallax__bg {
  position: absolute;
  /* Extend beyond container on both sides to provide parallax travel room */
  inset: calc(var(--_parallax-speed, 0.4) * -40%) 0;
  background-image: var(--_parallax-image, none);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
}

/* ── bg slot support (decorative gradients, videos, etc.) ── */
dvfy-parallax .dvfy-parallax__bg ::slotted(*),
dvfy-parallax .dvfy-parallax__bg > * {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── optional overlay ── */
dvfy-parallax .dvfy-parallax__overlay {
  position: absolute;
  inset: calc(var(--_parallax-speed, 0.4) * -40%) 0;
  background: var(--dvfy-parallax-overlay, transparent);
  pointer-events: none;
}

/* ── foreground content ── */
dvfy-parallax .dvfy-parallax__content {
  position: relative;
  z-index: 1;
  height: 100%;
}

/* ── scroll-driven animation (Chromium 115+, Safari 18+) ── */
@supports (animation-timeline: view()) {
  @keyframes dvfy-parallax-shift {
    from { transform: translateY(calc(var(--_parallax-speed, 0.4) * 40%)); }
    to   { transform: translateY(calc(var(--_parallax-speed, 0.4) * -40%)); }
  }

  dvfy-parallax .dvfy-parallax__bg {
    animation: dvfy-parallax-shift linear both;
    animation-timeline: view();
    animation-range: entry 0% exit 100%;
  }

  dvfy-parallax .dvfy-parallax__overlay {
    animation: dvfy-parallax-shift linear both;
    animation-timeline: view();
    animation-range: entry 0% exit 100%;
  }
}

/* ── prefers-reduced-motion: disable parallax, fill normally ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-parallax .dvfy-parallax__bg,
  dvfy-parallax .dvfy-parallax__overlay {
    animation: none !important;
    inset: 0 !important;
  }
}
`;

/**
 * CSS scroll-driven parallax background container.
 *
 * @element dvfy-parallax
 *
 * @attr {string} src - Background image URL
 * @attr {number} speed - Parallax intensity 0–1 (default: 0.4)
 * @attr {string} height - CSS height of the section (default: 50vh)
 *
 * @slot - Foreground content rendered above the parallax background
 * @slot bg - Custom background element (replaces src; use for gradients, video, etc.)
 *
 * @cssprop {length} --dvfy-parallax-height - Container height (default: 50vh)
 * @cssprop {length} --dvfy-parallax-radius - Border radius (default: 0)
 * @cssprop {color} --dvfy-parallax-overlay - Optional color overlay on background
 */
class DvfyParallax extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyParallax.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyParallax.#styled = true;
    }
    this.#render();
    this.#applySpeed();
    this.#applyHeight();
    this.#applySrc();
  }

  static get observedAttributes() {
    return ['speed', 'src', 'height'];
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'speed')  this.#applySpeed();
    if (name === 'height') this.#applyHeight();
    if (name === 'src')    this.#applySrc();
  }

  #applySpeed() {
    const raw = parseFloat(this.getAttribute('speed') ?? '0.4');
    const speed = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0.4;
    this.style.setProperty('--_parallax-speed', speed);
  }

  #applyHeight() {
    const h = this.getAttribute('height');
    if (h) this.style.setProperty('--dvfy-parallax-height', h);
    else   this.style.removeProperty('--dvfy-parallax-height');
  }

  #applySrc() {
    const src = this.getAttribute('src');
    // Route through a CSS custom property to keep the URL out of JS-constructed strings
    if (src) this.style.setProperty('--_parallax-image', `url("${src.replace(/"/g, '%22')}")`);
    else     this.style.removeProperty('--_parallax-image');
  }

  #render() {
    // Preserve existing light-DOM children (foreground content + bg slot)
    const existing = [...this.childNodes];

    // Background layer — bg-slotted children (or src via CSS var)
    const bg = document.createElement('div');
    bg.className = 'dvfy-parallax__bg';
    bg.setAttribute('aria-hidden', 'true');

    // Move [slot="bg"] children into the bg layer
    const bgSlotted = existing.filter(
      n => n.nodeType === Node.ELEMENT_NODE && n.getAttribute('slot') === 'bg'
    );
    bgSlotted.forEach(el => {
      el.removeAttribute('slot');
      bg.appendChild(el);
    });

    // Overlay (color tinted via --dvfy-parallax-overlay)
    const overlay = document.createElement('div');
    overlay.className = 'dvfy-parallax__overlay';
    overlay.setAttribute('aria-hidden', 'true');

    // Foreground content wrapper
    const content = document.createElement('div');
    content.className = 'dvfy-parallax__content';
    existing
      .filter(n => !bgSlotted.includes(n))
      .forEach(n => content.appendChild(n));

    this.appendChild(bg);
    this.appendChild(overlay);
    this.appendChild(content);
  }
}

customElements.define('dvfy-parallax', DvfyParallax);
