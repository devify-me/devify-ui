import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-grid> — Responsive equal-column grid.
 *
 * Replaces invented `dvfy-grid dvfy-grid-cols-* dvfy-grid-cols-md-* dvfy-gap-*`
 * utility classes. Collapses to a single column below the md breakpoint via a
 * container query (parent width, not viewport) — matching the library's
 * container-query responsive convention.
 *
 * Attributes:
 *   cols: 1 | 2 | 3 | 4   — equal columns at full width (default 1)
 *   min:  <length>        — when set, uses auto-fit tracks of min(<length>) instead
 *                           of a fixed column count (e.g. min="16rem")
 *   gap:  sm | md | lg    — gutter between cells (--dvfy-space-*; default md)
 *
 * Usage:
 *   <dvfy-grid cols="3" gap="lg"> <dvfy-card-glow padded>…</dvfy-card-glow> … </dvfy-grid>
 *   <dvfy-grid min="16rem" gap="md"> …auto-fitting cards… </dvfy-grid>
 */

const STYLES = `
dvfy-grid {
  display: grid;
  box-sizing: border-box;
  container-type: inline-size;
  /* default gap = md */
  gap: var(--dvfy-space-6);
  grid-template-columns: 1fr;
}

/* Gap scale */
dvfy-grid[gap="sm"] { gap: var(--dvfy-space-3); }
dvfy-grid[gap="md"] { gap: var(--dvfy-space-6); }
dvfy-grid[gap="lg"] { gap: var(--dvfy-space-10); }

/* Fixed equal columns (>= md). Below md they collapse to 1 column. */
@container (min-width: 48rem) {
  dvfy-grid[cols="2"] { grid-template-columns: repeat(2, 1fr); }
  dvfy-grid[cols="3"] { grid-template-columns: repeat(3, 1fr); }
  dvfy-grid[cols="4"] { grid-template-columns: repeat(4, 1fr); }
}

/* Auto-fit tracks — when min is set, ignore the cols count and fill responsively.
   --dvfy-grid-min is the consumer-set minimum track size. */
dvfy-grid[min] {
  grid-template-columns: repeat(auto-fit, minmax(min(var(--dvfy-grid-min, 16rem), 100%), 1fr));
}
`;

/**
 * Responsive equal-column grid that collapses to one column below the md breakpoint.
 *
 * @element dvfy-grid
 *
 * @attr {string} cols - Equal columns at full width: 1 | 2 | 3 | 4 (default 1)
 * @attr {string} min - Auto-fit track minimum length (e.g. "16rem"); overrides cols when set
 * @attr {string} gap - Gutter between cells: sm | md | lg (default md)
 *
 * @slot - Grid cells
 *
 * @cssprop {length} --dvfy-grid-min - Minimum track size for auto-fit mode (default 16rem)
 *
 * @example
 * <dvfy-grid cols="3" gap="lg">
 *   <dvfy-card-glow padded>One</dvfy-card-glow>
 *   <dvfy-card-glow padded>Two</dvfy-card-glow>
 *   <dvfy-card-glow padded>Three</dvfy-card-glow>
 * </dvfy-grid>
 */
class DvfyGrid extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-grid', STYLES);
    this.#applyMin();
  }

  static get observedAttributes() { return ['min']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#applyMin();
  }

  // Mirror the `min` attribute into the --dvfy-grid-min custom property so the
  // auto-fit track can consume it (attr values can't be read inside CSS minmax()).
  #applyMin() {
    const min = this.getAttribute('min');
    if (min) {
      this.style.setProperty('--dvfy-grid-min', min);
    } else {
      this.style.removeProperty('--dvfy-grid-min');
    }
  }
}

customElements.define('dvfy-grid', DvfyGrid);
