/**
 * <dvfy-card-stack> — Scroll-driven stacking card layout
 *
 * Cards stack on top of each other as the user scrolls, using position:sticky
 * and CSS scroll-driven animations. Each card scales slightly as the next one
 * slides over it, creating a layered depth effect.
 *
 * The effect is pure CSS: position:sticky staggered by index, with
 * animation-timeline:view() and animation-range:exit for the shrink.
 *
 * Attributes:
 *   (none — configure via CSS custom properties)
 *
 * CSS Custom Properties:
 *   --dvfy-card-stack-offset   Sticky top stagger per card   (default: 2rem)
 *   --dvfy-card-stack-scale    Scale applied when covered     (default: 0.9)
 *
 * Browser Support:
 *   animation-timeline: view(): Chrome 115+, Firefox 110+, Safari 18+
 *   Fallback (no scroll-driven animations): cards display in normal flow,
 *   sticky stacking still applies where position:sticky is supported.
 *   prefers-reduced-motion: animation disabled, layout unchanged.
 *
 * Usage:
 *   <dvfy-card-stack>
 *     <dvfy-card padded>Card 1</dvfy-card>
 *     <dvfy-card padded>Card 2</dvfy-card>
 *     <dvfy-card padded>Card 3</dvfy-card>
 *   </dvfy-card-stack>
 */

const STYLES = `
dvfy-card-stack {
  display: block;
  --_offset: var(--dvfy-card-stack-offset, 2rem);
  --_scale: var(--dvfy-card-stack-scale, 0.9);
}

dvfy-card-stack > * {
  position: sticky;
  top: calc(var(--_offset) * var(--_i, 0));
}

@supports (animation-timeline: view()) {
  dvfy-card-stack > * {
    animation: dvfy-card-stack-shrink linear both;
    animation-timeline: view();
    animation-range: exit -20% exit 0%;
  }
}

@keyframes dvfy-card-stack-shrink {
  to { scale: var(--_scale, 0.9); }
}

@media (prefers-reduced-motion: reduce) {
  dvfy-card-stack > * {
    animation: none !important;
  }
}
`;

/**
 * Scroll-driven stacking card layout. Cards stack with sticky positioning
 * and scale down as the next card slides over them.
 *
 * @element dvfy-card-stack
 *
 * @slot - Stack of card elements (works with dvfy-card or any block element)
 *
 * @cssprop {length} --dvfy-card-stack-offset - Sticky top stagger per card index (default: 2rem)
 * @cssprop {number} --dvfy-card-stack-scale - Scale factor when a card is covered (default: 0.9)
 *
 * @example
 * <dvfy-card-stack>
 *   <dvfy-card padded elevated>
 *     <h3>Card One</h3>
 *     <p>Scroll down to see cards stack.</p>
 *   </dvfy-card>
 *   <dvfy-card padded elevated>
 *     <h3>Card Two</h3>
 *     <p>This card slides over Card One.</p>
 *   </dvfy-card>
 *   <dvfy-card padded elevated>
 *     <h3>Card Three</h3>
 *     <p>Final card in the stack.</p>
 *   </dvfy-card>
 * </dvfy-card-stack>
 */
class DvfyCardStack extends HTMLElement {
  static #styled = false;
  #observer = null;

  connectedCallback() {
    if (!DvfyCardStack.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyCardStack.#styled = true;
    }

    this.setAttribute('role', 'list');
    this.#indexChildren();

    this.#observer = new MutationObserver(() => this.#indexChildren());
    this.#observer.observe(this, { childList: true });
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #indexChildren() {
    const children = [...this.children];
    children.forEach((child, i) => {
      child.style.setProperty('--_i', i);
      if (!child.getAttribute('role')) child.setAttribute('role', 'listitem');
    });
  }
}

customElements.define('dvfy-card-stack', DvfyCardStack);
