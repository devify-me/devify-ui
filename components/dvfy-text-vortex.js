/**
 * <dvfy-text-vortex> — Spiral scroll text vortex animation
 *
 * Characters spiral inward as the user scrolls, using CSS sibling-index() /
 * sibling-count() functions with scroll-driven animations.
 *
 * Attributes:
 *   depth:     number  — Spiral turns (default: 3)
 *   font-size: string  — Character font size (default: "2rem")
 *   color:     string  — Text color (default: inherit)
 *
 * CSS Custom Properties:
 *   --dvfy-vortex-depth      Override spiral depth
 *   --dvfy-vortex-font-size  Override character font size
 *   --dvfy-vortex-color      Override text color
 *
 * Browser Support:
 *   sibling-index() / sibling-count(): Chrome 130+, Safari 18+ (March 2026)
 *   Firefox fallback: static text, no animation
 *   prefers-reduced-motion: respected — no animation
 *
 * Usage:
 *   <dvfy-text-vortex>Into the void</dvfy-text-vortex>
 *
 *   <dvfy-text-vortex depth="5" font-size="3rem">
 *     Spiral deeper
 *   </dvfy-text-vortex>
 */

import { injectStyles } from '../utils/styles.js';


const STYLES = `
dvfy-text-vortex {
  display: block;
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-vortex-color, var(--dvfy-text-primary, inherit));
  min-height: 60vh;
  position: relative;
}

dvfy-text-vortex .dvfy-vortex-container {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

dvfy-text-vortex .dvfy-vortex-chars {
  position: relative;
  width: 1px;
  height: 1px;
}

/* Character base — sibling-index() path (Chrome 130+, Safari 18+) */
@supports (--x: sibling-index()) {
  dvfy-text-vortex .dvfy-char {
    --_count: sibling-count();
    --_index: sibling-index();
    --_depth: var(--dvfy-vortex-depth, 3);
    --_font-size: var(--dvfy-vortex-font-size, 2rem);

    /* Spiral geometry */
    --_radius: calc(10vh - (7vh / var(--_count) * var(--_index)));
    --_rotation: calc((360deg * var(--_depth) / var(--_count)) * var(--_index));
    --_scale: calc(0.4 - (0.25 / var(--_count)) * var(--_index));

    /* Stagger: each char starts slightly later in the scroll range */
    --_range-start: calc(var(--_index) / var(--_count) * 40%);

    position: absolute;
    top: 0;
    left: 0;
    font-size: var(--_font-size);
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    transform-origin: center center;
    transform:
      rotate(var(--_rotation))
      translateY(calc(-2.9 * var(--_radius)))
      scale(var(--_scale));

    animation-name: dvfy-vortex-in;
    animation-timing-function: ease-in-out;
    animation-fill-mode: both;
  }

  @keyframes dvfy-vortex-in {
    from {
      opacity: 0;
      transform:
        rotate(calc(var(--_rotation) + 180deg))
        translateY(calc(-2.9 * var(--_radius) * 2))
        scale(calc(var(--_scale) * 0.1));
    }
    to {
      opacity: 1;
      transform:
        rotate(var(--_rotation))
        translateY(calc(-2.9 * var(--_radius)))
        scale(var(--_scale));
    }
  }
}

/* Scroll-driven path: only when scroll() timeline is available AND sibling-index() works */
@supports (animation-timeline: scroll()) and (--x: sibling-index()) {
  dvfy-text-vortex[data-scroll] .dvfy-char {
    animation-timeline: scroll();
    animation-range: entry 0% cover 80%;
    animation-range-start: var(--_range-start, 0%);
    animation-duration: auto;
    animation-fill-mode: both;
  }
}

/* Firefox / no-sibling-index fallback: static display */
@supports not (--x: sibling-index()) {
  dvfy-text-vortex .dvfy-vortex-chars {
    width: auto;
    height: auto;
  }

  dvfy-text-vortex .dvfy-char {
    position: static;
    display: inline;
    font-size: var(--dvfy-vortex-font-size, 2rem);
    font-weight: 700;
  }
}

/* Reduced-motion: disable all animation, show text statically */
@media (prefers-reduced-motion: reduce) {
  dvfy-text-vortex .dvfy-char {
    animation: none !important;
    position: static !important;
    display: inline !important;
    transform: none !important;
    opacity: 1 !important;
    font-size: var(--dvfy-vortex-font-size, 2rem);
    font-weight: 700;
  }

  dvfy-text-vortex .dvfy-vortex-chars {
    width: auto !important;
    height: auto !important;
  }
}
`;

/**
 * Spiral scroll text vortex. Characters spiral inward on scroll using CSS
 * sibling-index()/sibling-count() and scroll-driven animations.
 *
 * @element dvfy-text-vortex
 *
 * @attr {number} depth - Number of spiral turns (default: 3)
 * @attr {string} font-size - Character font size CSS value (default: "2rem")
 * @attr {string} color - Text color CSS value (default: var(--dvfy-text-primary))
 *
 * @slot - Text content to spiral (only text content is used)
 *
 * @cssprop {number} --dvfy-vortex-depth - Override spiral depth
 * @cssprop {length} --dvfy-vortex-font-size - Override character font size
 * @cssprop {color} --dvfy-vortex-color - Override text color
 */
class DvfyTextVortex extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-text-vortex', STYLES);
    this.#applyTokens();
    this.#render();
    this.#detectScrollSupport();
  }

  static get observedAttributes() {
    return ['depth', 'font-size', 'color'];
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.#applyTokens();
  }

  #applyTokens() {
    const depth = this.getAttribute('depth');
    const fontSize = this.getAttribute('font-size');
    const color = this.getAttribute('color');

    if (depth) this.style.setProperty('--dvfy-vortex-depth', depth);
    else this.style.removeProperty('--dvfy-vortex-depth');

    if (fontSize) this.style.setProperty('--dvfy-vortex-font-size', fontSize);
    else this.style.removeProperty('--dvfy-vortex-font-size');

    if (color) this.style.setProperty('--dvfy-vortex-color', color);
    else this.style.removeProperty('--dvfy-vortex-color');
  }

  #render() {
    // Collect raw text content before clearing
    const text = this.textContent.trim();
    if (!text) return;

    // Build sticky container + character spans
    const container = document.createElement('div');
    container.className = 'dvfy-vortex-container';
    container.setAttribute('aria-hidden', 'true');

    const charWrapper = document.createElement('div');
    charWrapper.className = 'dvfy-vortex-chars';

    for (const char of text) {
      const span = document.createElement('span');
      span.className = 'dvfy-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      charWrapper.appendChild(span);
    }

    container.appendChild(charWrapper);

    // Accessible screen-reader label preserved in visually-hidden span
    const srText = document.createElement('span');
    srText.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    srText.textContent = text;

    this.textContent = '';
    this.appendChild(srText);
    this.appendChild(container);
  }

  #detectScrollSupport() {
    if (CSS.supports('animation-timeline', 'scroll()')) {
      this.setAttribute('data-scroll', '');
    }
  }
}

customElements.define('dvfy-text-vortex', DvfyTextVortex);
