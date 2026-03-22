/**
 * <dvfy-wavy-underline> — animated wavy underline for links and headings
 *
 * Renders a continuously scrolling SVG wave underline beneath its text content.
 * Uses a CSS mask on a `::after` pseudo-element so the wave color is driven by
 * the `--dvfy-wave-color` custom property (no data-URI color limitations).
 *
 * Attributes:
 *   trigger: "always" | "hover"  — play continuously or only on hover/focus (default: "always")
 *
 * CSS Custom Properties:
 *   --dvfy-wave-color   Wave color         (default: currentColor — inherits text color)
 *   --dvfy-wave-height  Wave height / amplitude in px  (default: 3px)
 *   --dvfy-wave-speed   Animation duration             (default: 1s)
 *   --dvfy-wave-gap     Gap between text baseline and wave (default: 3px)
 *
 * Usage:
 *   <!-- Continuously animated, inherits text color -->
 *   <a href="#"><dvfy-wavy-underline>Hover me</dvfy-wavy-underline></a>
 *
 *   <!-- Animates only on hover / keyboard focus -->
 *   <dvfy-wavy-underline trigger="hover">Link text</dvfy-wavy-underline>
 *
 *   <!-- Custom color and speed -->
 *   <dvfy-wavy-underline style="--dvfy-wave-color:#f43f5e;--dvfy-wave-speed:0.6s">
 *     Fast pink wave
 *   </dvfy-wavy-underline>
 *
 *   <!-- CSS utility class on any element -->
 *   <a href="#" class="dvfy-wavy-underline">Plain link styled as wavy</a>
 *   <a href="#" class="dvfy-wavy-underline dvfy-wavy-underline--hover">Hover-only variant</a>
 *
 * Browser Support:
 *   All modern browsers. CSS mask-image + animation.
 *   prefers-reduced-motion: static wave (no scrolling animation).
 *
 * Note:
 *   The element renders as inline-block. For block-level headings, wrap the
 *   text in a <span> or nest the component inside the heading element.
 */

// SVG wave used as a CSS mask. White stroke on transparent background:
// opaque pixels reveal the background-color (the wave color); transparent pixels
// hide it. This allows the wave color to be driven by a CSS custom property.
//
// Wave path: one full sine-like cycle 20 px wide × 6 px tall,
//   M 0 3  Q 5 0.5 10 3  Q 15 5.5 20 3
// The SVG period (20 px) must match the @keyframes end value so the loop is seamless.
const WAVE_MASK_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='6'%3E%3Cpath d='M0 3 Q5 0.5 10 3 Q15 5.5 20 3' fill='none' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E\")";

const STYLES = `
/* ── wavy-underline — element + utility class ── */
dvfy-wavy-underline,
.dvfy-wavy-underline {
  display: inline-block;
  position: relative;
  text-decoration: none; /* suppress default underline when wrapping <a> text */
}

dvfy-wavy-underline::after,
.dvfy-wavy-underline::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: calc(-1 * (var(--dvfy-wave-height, 3px) + var(--dvfy-wave-gap, 3px)));
  height: var(--dvfy-wave-height, 3px);

  /* Wave color — CSS custom property drives background-color, not the SVG fill */
  background-color: var(--dvfy-wave-color, currentColor);

  /* Wave shape via CSS mask — white stroke on transparent SVG */
  mask-image: ${WAVE_MASK_URL};
  -webkit-mask-image: ${WAVE_MASK_URL};
  mask-repeat: repeat-x;
  -webkit-mask-repeat: repeat-x;
  mask-size: 20px var(--dvfy-wave-height, 3px);
  -webkit-mask-size: 20px var(--dvfy-wave-height, 3px);
  mask-position: 0 center;
  -webkit-mask-position: 0 center;

  animation: dvfy-wavy-underline-scroll var(--dvfy-wave-speed, 1s) linear infinite;
}

/* ── hover-only trigger (attribute on element) ── */
dvfy-wavy-underline[trigger="hover"]::after {
  animation-play-state: paused;
}

dvfy-wavy-underline[trigger="hover"]:hover::after,
dvfy-wavy-underline[trigger="hover"]:focus-within::after {
  animation-play-state: running;
}

/* ── hover-only trigger (CSS utility modifier class) ── */
.dvfy-wavy-underline--hover::after {
  animation-play-state: paused;
}

.dvfy-wavy-underline--hover:hover::after,
.dvfy-wavy-underline--hover:focus-within::after {
  animation-play-state: running;
}

/* ── keyframes — scroll mask 20 px to match SVG period for seamless tiling ── */
@keyframes dvfy-wavy-underline-scroll {
  to {
    mask-position: 20px center;
    -webkit-mask-position: 20px center;
  }
}

/* ── reduced-motion: static wave, no scrolling ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-wavy-underline::after,
  .dvfy-wavy-underline::after {
    animation: none;
  }
}
`;

/**
 * Animated wavy underline for links, headings, or any inline element.
 *
 * @element dvfy-wavy-underline
 *
 * @attr {string} trigger - Animation trigger: always | hover (default: "always")
 *
 * @slot - Text or inline content to underline
 *
 * @cssprop {color} --dvfy-wave-color - Wave color (default: currentColor)
 * @cssprop {length} --dvfy-wave-height - Wave height / amplitude (default: 3px)
 * @cssprop {time} --dvfy-wave-speed - Scroll animation duration (default: 1s)
 * @cssprop {length} --dvfy-wave-gap - Gap between text baseline and wave (default: 3px)
 *
 * @example
 * <dvfy-wavy-underline>Always animated</dvfy-wavy-underline>
 *
 * @example
 * <dvfy-wavy-underline trigger="hover" style="--dvfy-wave-color:var(--dvfy-accent-brand)">
 *   Hover to animate
 * </dvfy-wavy-underline>
 */
class DvfyWavyUnderline extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyWavyUnderline.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyWavyUnderline.#styled = true;
    }
  }
}

customElements.define('dvfy-wavy-underline', DvfyWavyUnderline);
