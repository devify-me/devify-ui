import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-heading> — Semantic heading bound to the --dvfy-type-h*-* role tokens.
 *
 * Replaces invented `dvfy-heading-1 / -2 / -3` utility classes. The level attribute
 * selects BOTH the visual role token and the underlying semantic tag — it renders a
 * real <h1>/<h2>/<h3> in the light DOM so the page keeps a correct heading outline
 * (SEO single-<h1>, a11y landmarks). Typography flows entirely through
 * --dvfy-type-h{level}-* tokens, so a theme can restyle every heading globally.
 *
 * Attributes:
 *   level: 1 | 2 | 3   — heading level / role token (default 2)
 *
 * Usage:
 *   <dvfy-heading level="1">Tu mejor renting</dvfy-heading>
 *   <dvfy-heading level="2">Cómo funciona</dvfy-heading>
 */

const STYLES = `
dvfy-heading {
  display: block;
  color: var(--dvfy-text-primary);
  /* default = h2 */
  font-family: var(--dvfy-type-h2-family);
  font-size: var(--dvfy-type-h2-size);
  font-weight: var(--dvfy-type-h2-weight);
  line-height: var(--dvfy-type-h2-leading);
  letter-spacing: var(--dvfy-type-h2-tracking);
}

dvfy-heading > h1,
dvfy-heading > h2,
dvfy-heading > h3 {
  margin: 0;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
}

dvfy-heading[level="1"] {
  font-family: var(--dvfy-type-h1-family);
  font-size: var(--dvfy-type-h1-size);
  font-weight: var(--dvfy-type-h1-weight);
  line-height: var(--dvfy-type-h1-leading);
  letter-spacing: var(--dvfy-type-h1-tracking);
}
dvfy-heading[level="2"] {
  font-family: var(--dvfy-type-h2-family);
  font-size: var(--dvfy-type-h2-size);
  font-weight: var(--dvfy-type-h2-weight);
  line-height: var(--dvfy-type-h2-leading);
  letter-spacing: var(--dvfy-type-h2-tracking);
}
dvfy-heading[level="3"] {
  font-family: var(--dvfy-type-h3-family);
  font-size: var(--dvfy-type-h3-size);
  font-weight: var(--dvfy-type-h3-weight);
  line-height: var(--dvfy-type-h3-leading);
  letter-spacing: var(--dvfy-type-h3-tracking);
}
`;

const VALID_LEVELS = new Set(['1', '2', '3']);

/**
 * Semantic heading bound to the --dvfy-type-h{level}-* role tokens; renders a real
 * <h1>/<h2>/<h3> so the document keeps a correct heading outline.
 *
 * @element dvfy-heading
 *
 * @attr {string} level - Heading level / role token: 1 | 2 | 3 (default 2)
 *
 * @slot - Heading text
 *
 * @cssprop {*} --dvfy-type-h1-size - H1 font size (and family/weight/leading/tracking siblings)
 * @cssprop {*} --dvfy-type-h2-size - H2 font size (and siblings)
 * @cssprop {*} --dvfy-type-h3-size - H3 font size (and siblings)
 *
 * @example
 * <dvfy-heading level="1">Tu mejor renting</dvfy-heading>
 */
class DvfyHeading extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-heading', STYLES);
    this.#render();
  }

  static get observedAttributes() { return ['level']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    const raw = this.getAttribute('level');
    const level = VALID_LEVELS.has(raw) ? raw : '2';
    const tag = `h${level}`;

    // Already wrapping the right tag? Leave the existing text untouched.
    const existing = this.firstElementChild;
    if (existing && existing.tagName.toLowerCase() === tag &&
        this.childNodes.length === 1) {
      return;
    }

    // Move all current content (text + inline markup) into the semantic tag.
    const heading = document.createElement(tag);
    while (this.firstChild) heading.appendChild(this.firstChild);
    this.appendChild(heading);
  }
}

customElements.define('dvfy-heading', DvfyHeading);
