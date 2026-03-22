/**
 * <dvfy-flip-card> — Double-sided 3D card flip component
 *
 * A card with front and back faces that flips 180° on hover or click,
 * using CSS 3D transforms only. Technique: `transform-style: preserve-3d`
 * on the inner wrapper + `perspective` on the host + `rotateY/X(180deg)`
 * on flip. Back face uses `backface-visibility: hidden`.
 *
 * Slot your content into `[slot="front"]` and `[slot="back"]` children.
 *
 * @element dvfy-flip-card
 *
 * @attr {string} direction - Flip axis: horizontal | vertical (default: "horizontal")
 * @attr {string} trigger - What triggers the flip: hover | click (default: "hover")
 * @attr {boolean} flipped - Present when card is showing the back face
 *
 * @event {CustomEvent} flip - Fires when the card flips, detail: { flipped: boolean }
 *
 * @slot front - Content for the front face
 * @slot back - Content for the back face
 *
 * @cssprop {length} --dvfy-flip-card-perspective - Perspective depth (default: 1000px)
 * @cssprop {time} --dvfy-flip-card-duration - Flip animation duration (default: 0.6s)
 * @cssprop {length} --dvfy-flip-card-height - Card height (default: 220px)
 *
 * @example
 * <dvfy-flip-card>
 *   <div slot="front">
 *     <h3>Front Face</h3>
 *     <p>Hover to flip</p>
 *   </div>
 *   <div slot="back">
 *     <h3>Back Face</h3>
 *     <p>The other side</p>
 *   </div>
 * </dvfy-flip-card>
 */

const STYLES = `
dvfy-flip-card {
  display: block;
  perspective: var(--dvfy-flip-card-perspective, 1000px);
  height: var(--dvfy-flip-card-height, 220px);
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-primary);
  outline: none;
}

dvfy-flip-card:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
  border-radius: var(--dvfy-radius-lg);
}

/* Inner wrapper — the element that actually rotates */
dvfy-flip-card .dvfy-fc__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform var(--dvfy-flip-card-duration, 0.6s) var(--dvfy-ease-in-out, ease-in-out);
}

/* Faces — shared styles */
dvfy-flip-card .dvfy-fc__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--dvfy-radius-lg);
  overflow: hidden;
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
}

/* Back face — pre-rotated so it starts hidden */
dvfy-flip-card .dvfy-fc__back {
  background: var(--dvfy-primary-bg, var(--dvfy-surface-sunken));
  border-color: var(--dvfy-primary-border, var(--dvfy-border-strong));
}

/* === Horizontal (rotateY) — default === */
dvfy-flip-card:not([direction]) .dvfy-fc__back,
dvfy-flip-card[direction="horizontal"] .dvfy-fc__back {
  transform: rotateY(180deg);
}

/* Hover trigger — horizontal flip */
@media (hover: hover) {
  dvfy-flip-card[trigger="hover"]:not([direction]):hover .dvfy-fc__inner,
  dvfy-flip-card[trigger="hover"][direction="horizontal"]:hover .dvfy-fc__inner,
  dvfy-flip-card:not([trigger]):not([direction]):hover .dvfy-fc__inner,
  dvfy-flip-card:not([trigger])[direction="horizontal"]:hover .dvfy-fc__inner {
    transform: rotateY(180deg);
  }
}

/* Click/flipped state — horizontal */
dvfy-flip-card[flipped]:not([direction]) .dvfy-fc__inner,
dvfy-flip-card[flipped][direction="horizontal"] .dvfy-fc__inner {
  transform: rotateY(180deg);
}

/* === Vertical (rotateX) === */
dvfy-flip-card[direction="vertical"] .dvfy-fc__back {
  transform: rotateX(180deg);
}

@media (hover: hover) {
  dvfy-flip-card[trigger="hover"][direction="vertical"]:hover .dvfy-fc__inner,
  dvfy-flip-card:not([trigger])[direction="vertical"]:hover .dvfy-fc__inner {
    transform: rotateX(180deg);
  }
}

dvfy-flip-card[flipped][direction="vertical"] .dvfy-fc__inner {
  transform: rotateX(180deg);
}

/* === Reduced motion — instant flip, no animation === */
@media (prefers-reduced-motion: reduce) {
  dvfy-flip-card .dvfy-fc__inner {
    transition: none;
  }
}
`;

class DvfyFlipCard extends HTMLElement {
  static #styled = false;
  static get observedAttributes() { return ['direction', 'trigger', 'flipped']; }

  #inner = null;
  #frontFace = null;
  #backFace = null;

  connectedCallback() {
    if (!DvfyFlipCard.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyFlipCard.#styled = true;
    }

    this.#render();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);

    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }

    this.#updateAria();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeydown);
  }

  attributeChangedCallback(name) {
    if (name === 'flipped') this.#updateAria();
  }

  #render() {
    // Collect named slot children before restructuring
    const frontSlot = this.querySelector('[slot="front"]');
    const backSlot = this.querySelector('[slot="back"]');

    // Build inner wrapper with face divs
    const inner = document.createElement('div');
    inner.className = 'dvfy-fc__inner';

    const frontFace = document.createElement('div');
    frontFace.className = 'dvfy-fc__face dvfy-fc__front';

    const backFace = document.createElement('div');
    backFace.className = 'dvfy-fc__face dvfy-fc__back';

    if (frontSlot) frontFace.appendChild(frontSlot);
    if (backSlot) backFace.appendChild(backSlot);

    inner.appendChild(frontFace);
    inner.appendChild(backFace);

    // Clear host and mount inner wrapper
    while (this.firstChild) this.removeChild(this.firstChild);
    this.appendChild(inner);

    this.#inner = inner;
    this.#frontFace = frontFace;
    this.#backFace = backFace;
  }

  #handleClick = () => {
    const trigger = this.getAttribute('trigger') || 'hover';
    if (trigger !== 'click') return;
    this.#toggle();
  };

  #handleKeydown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.#toggle();
  };

  #toggle() {
    const nowFlipped = !this.hasAttribute('flipped');
    if (nowFlipped) {
      this.setAttribute('flipped', '');
    } else {
      this.removeAttribute('flipped');
    }
    this.#updateAria();
    this.dispatchEvent(new CustomEvent('flip', {
      bubbles: true,
      detail: { flipped: nowFlipped },
    }));
  }

  #updateAria() {
    const flipped = this.hasAttribute('flipped');

    // Both trigger types are keyboard-activatable, so role="button" is always appropriate
    this.setAttribute('role', 'button');
    this.setAttribute('aria-pressed', String(flipped));

    // Hide the inactive face from assistive tech
    if (this.#frontFace) {
      this.#frontFace.setAttribute('aria-hidden', String(flipped));
    }
    if (this.#backFace) {
      this.#backFace.setAttribute('aria-hidden', String(!flipped));
    }
  }
}

customElements.define('dvfy-flip-card', DvfyFlipCard);
