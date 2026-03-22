/**
 * <dvfy-stack-cards> — Scroll-driven stacking card effect
 *
 * Cards stack and overlap as the user scrolls, creating a layered reveal
 * where each card slides over the previous one. Uses CSS scroll-driven
 * animations via `view-timeline` + `animation-timeline`; no JS animation logic.
 *
 * Supported in Chromium 115+ and Safari 18+.
 * Graceful fallback: cards display in a normal vertical column.
 *
 * Attributes:
 *   offset: CSS length — vertical gap between stacked card tops (default: "50px")
 *   scale:  number    — scale reduction when a card is buried (default: "0.05")
 *
 * CSS custom properties:
 *   --dvfy-stack-offset       Vertical offset between card tops  (default: 50px)
 *   --dvfy-stack-scale        Scale shrink factor when buried     (default: 0.05)
 *   --dvfy-stack-item-height  Scroll travel per card              (default: 100vh)
 *
 * Usage:
 *   <dvfy-stack-cards>
 *     <dvfy-card padded>Card 1</dvfy-card>
 *     <dvfy-card padded>Card 2</dvfy-card>
 *     <dvfy-card padded>Card 3</dvfy-card>
 *   </dvfy-stack-cards>
 *
 *   <!-- Custom offset and scale -->
 *   <dvfy-stack-cards offset="60px" scale="0.08">
 *     <div>Slide A</div>
 *     <div>Slide B</div>
 *   </dvfy-stack-cards>
 */

const STYLES = `
/* ── Stack cards container ── */
dvfy-stack-cards {
  display: block;
  position: relative;
}

/* ── Per-card scroll spacer ── */
dvfy-stack-cards .dvfy-stack-item {
  position: relative;
  /* Each item provides scroll travel so its card can be "scrolled past" */
  height: var(--dvfy-stack-item-height, 100vh);
}

dvfy-stack-cards .dvfy-stack-item:last-child {
  /* Last card needs no extra travel — just show it */
  height: auto;
  min-height: 30vh;
}

/* ── Sticky card inside each spacer ── */
dvfy-stack-cards .dvfy-stack-card {
  position: sticky;
  top: calc(var(--_index, 0) * var(--dvfy-stack-offset, 50px));
  z-index: calc(var(--_index, 0) + 1);
  transform-origin: top center;
  border-radius: var(--dvfy-radius-xl, 1rem);
  overflow: hidden;
}

/* ── Scroll-driven shrink ── */
@supports (animation-timeline: view()) {
  dvfy-stack-cards .dvfy-stack-item {
    /* Named view-timeline: descendants can reference this */
    view-timeline: --dvfy-stack-card-tl block;
  }

  dvfy-stack-cards .dvfy-stack-card {
    animation: dvfy-stack-card-shrink linear both;
    animation-timeline: --dvfy-stack-card-tl;
    /* Animate while the item exits the viewport from the top */
    animation-range: exit 0% exit 70%;
  }

  @keyframes dvfy-stack-card-shrink {
    0%   { scale: 1; }
    100% { scale: calc(1 - var(--dvfy-stack-scale, 0.05)); }
  }
}

/* ── Respect prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-stack-cards .dvfy-stack-card {
    animation: none !important;
    scale: 1 !important;
  }
}
`;

/**
 * Scroll-driven stacking card effect.
 *
 * @element dvfy-stack-cards
 *
 * @attr {string} offset - Vertical offset between stacked card tops (default: "50px")
 * @attr {number} scale  - Scale shrink factor when card is buried (default: "0.05")
 *
 * @slot - Direct child elements, each becoming one card in the stack
 *
 * @cssprop {length} --dvfy-stack-offset      - Vertical offset between card tops (default: 50px)
 * @cssprop {number} --dvfy-stack-scale       - Scale shrink factor when buried (default: 0.05)
 * @cssprop {length} --dvfy-stack-item-height - Scroll travel per card (default: 100vh)
 */
class DvfyStackCards extends HTMLElement {
  static #styled = false;

  /** Original children captured before render */
  #originalChildren = [];

  connectedCallback() {
    if (!DvfyStackCards.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyStackCards.#styled = true;
    }
    this.#captureChildren();
    this.#applyTokens();
    this.#render();
  }

  static get observedAttributes() {
    return ['offset', 'scale'];
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.#applyTokens();
  }

  /** Capture direct children before the first render clears them */
  #captureChildren() {
    // Only capture once — on first connect
    if (this.#originalChildren.length > 0) return;
    for (const child of [...this.children]) {
      this.#originalChildren.push(child.cloneNode(true));
    }
  }

  /** Sync attributes → CSS custom properties */
  #applyTokens() {
    const offset = this.getAttribute('offset');
    const scale = this.getAttribute('scale');

    if (offset) this.style.setProperty('--dvfy-stack-offset', offset);
    else this.style.removeProperty('--dvfy-stack-offset');

    if (scale) this.style.setProperty('--dvfy-stack-scale', scale);
    else this.style.removeProperty('--dvfy-stack-scale');
  }

  /** Build the sticky-item wrapper structure */
  #render() {
    const cards = this.#originalChildren;
    if (!cards.length) return;

    const count = cards.length;

    // Clear existing children safely
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }

    cards.forEach((child, index) => {
      const item = document.createElement('div');
      item.className = 'dvfy-stack-item';
      item.style.setProperty('--_index', String(index));
      item.style.setProperty('--_count', String(count));

      const inner = document.createElement('div');
      inner.className = 'dvfy-stack-card';
      inner.appendChild(child);

      item.appendChild(inner);
      this.appendChild(item);
    });
  }
}

customElements.define('dvfy-stack-cards', DvfyStackCards);
