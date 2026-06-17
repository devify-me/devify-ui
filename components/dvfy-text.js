import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-text> — Body text bound to the --dvfy-type-body-* + --dvfy-text-* tokens.
 *
 * Replaces invented `dvfy-body-lg / -md / -sm` and `dvfy-text-muted` utility classes.
 * Renders a real <p> in the light DOM (block paragraph rhythm) unless `inline` is set.
 * Size maps to the body role tokens; tone maps to the semantic text-color roles, so
 * a theme restyles all copy globally.
 *
 * Attributes:
 *   size:   lg | md | sm           — body size role (default md)
 *   tone:   default | muted        — text color role (default default)
 *   inline:                        — render as <span> instead of <p> (no block margin)
 *
 * Usage:
 *   <dvfy-text size="lg">Puntuamos cada coche con un Chollo Score público.</dvfy-text>
 *   <dvfy-text size="sm" tone="muted">Gratis · sin registro · sin compromiso</dvfy-text>
 */

const STYLES = `
dvfy-text {
  display: block;
  color: var(--dvfy-text-primary);
  /* default size = md (body) */
  font-family: var(--dvfy-type-body-family);
  font-size: var(--dvfy-type-body-size);
  font-weight: var(--dvfy-type-body-weight);
  line-height: var(--dvfy-type-body-leading);
  letter-spacing: var(--dvfy-type-body-tracking);
}

dvfy-text[inline] { display: inline; }

dvfy-text > p,
dvfy-text > span {
  margin: 0;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
}

/* Size scale */
dvfy-text[size="lg"] {
  font-size: var(--dvfy-text-lg);
  line-height: var(--dvfy-leading-relaxed);
}
dvfy-text[size="md"] {
  font-family: var(--dvfy-type-body-family);
  font-size: var(--dvfy-type-body-size);
  font-weight: var(--dvfy-type-body-weight);
  line-height: var(--dvfy-type-body-leading);
}
dvfy-text[size="sm"] {
  font-family: var(--dvfy-type-body-sm-family);
  font-size: var(--dvfy-type-body-sm-size);
  font-weight: var(--dvfy-type-body-sm-weight);
  line-height: var(--dvfy-type-body-sm-leading);
}

/* Tone (semantic text-color roles) */
dvfy-text[tone="default"] { color: var(--dvfy-text-primary); }
dvfy-text[tone="muted"]   { color: var(--dvfy-text-muted); }
`;

const VALID_SIZES = new Set(['lg', 'md', 'sm']);

/**
 * Body text bound to the --dvfy-type-body-* size roles and --dvfy-text-* color roles;
 * renders a real <p> (or <span> when inline).
 *
 * @element dvfy-text
 *
 * @attr {string} size - Body size role: lg | md | sm (default md)
 * @attr {string} tone - Text color role: default | muted (default default)
 * @attr {boolean} inline - Render as <span> (inline) instead of <p> (block)
 *
 * @slot - Text content
 *
 * @cssprop {color} --dvfy-text-primary - Default tone color
 * @cssprop {color} --dvfy-text-muted - Muted tone color
 *
 * @example
 * <dvfy-text size="lg">Puntuamos cada coche con un Chollo Score público.</dvfy-text>
 */
class DvfyText extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-text', STYLES);
    this.#render();
  }

  static get observedAttributes() { return ['inline']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    const tag = this.hasAttribute('inline') ? 'span' : 'p';

    const existing = this.firstElementChild;
    if (existing && existing.tagName.toLowerCase() === tag &&
        this.childNodes.length === 1) {
      return;
    }

    const wrap = document.createElement(tag);
    while (this.firstChild) wrap.appendChild(this.firstChild);
    this.appendChild(wrap);
  }
}

customElements.define('dvfy-text', DvfyText);
