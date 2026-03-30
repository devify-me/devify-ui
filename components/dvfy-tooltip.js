/**
 * <dvfy-tooltip> — Tooltip on hover/focus
 *
 * Attributes:
 *   text:     tooltip content
 *   position: top | right | bottom | left (default: "top")
 *   delay:    ms before showing (default: 200)
 *
 * Usage:
 *   <dvfy-tooltip text="Save changes" position="bottom">
 *     <dvfy-button>Save</dvfy-button>
 *   </dvfy-tooltip>
 */

import { injectStyles } from '../utils/styles.js';


const STYLES = `
dvfy-tooltip {
  display: inline-block;
  position: relative;
}
dvfy-tooltip .dvfy-tooltip__tip {
  position: absolute;
  z-index: var(--dvfy-z-tooltip);
  padding: var(--dvfy-space-1-5) var(--dvfy-space-2-5);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-tooltip-text, var(--dvfy-neutral-100));
  background: var(--dvfy-tooltip-bg, var(--dvfy-neutral-700));
  border: var(--dvfy-border-1) solid var(--dvfy-tooltip-border, var(--dvfy-neutral-600));
  border-radius: var(--dvfy-radius-md);
  box-shadow: var(--dvfy-shadow-md);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-tooltip .dvfy-tooltip__tip[data-visible] { opacity: 1; }

/* Arrow */
dvfy-tooltip .dvfy-tooltip__tip::after {
  content: '';
  position: absolute;
  border: 5px solid transparent;
}

/* Positions */
dvfy-tooltip:not([position]) .dvfy-tooltip__tip,
dvfy-tooltip[position="top"] .dvfy-tooltip__tip {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--dvfy-space-1-5);
}
dvfy-tooltip:not([position]) .dvfy-tooltip__tip::after,
dvfy-tooltip[position="top"] .dvfy-tooltip__tip::after {
  top: 100%; left: 50%; transform: translateX(-50%);
  border-top-color: var(--dvfy-tooltip-bg, var(--dvfy-neutral-700));
}

dvfy-tooltip[position="bottom"] .dvfy-tooltip__tip {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--dvfy-space-1-5);
}
dvfy-tooltip[position="bottom"] .dvfy-tooltip__tip::after {
  bottom: 100%; left: 50%; transform: translateX(-50%);
  border-bottom-color: var(--dvfy-tooltip-bg, var(--dvfy-neutral-700));
}

dvfy-tooltip[position="left"] .dvfy-tooltip__tip {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: var(--dvfy-space-1-5);
}
dvfy-tooltip[position="left"] .dvfy-tooltip__tip::after {
  left: 100%; top: 50%; transform: translateY(-50%);
  border-left-color: var(--dvfy-tooltip-bg, var(--dvfy-neutral-700));
}

dvfy-tooltip[position="right"] .dvfy-tooltip__tip {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--dvfy-space-1-5);
}
dvfy-tooltip[position="right"] .dvfy-tooltip__tip::after {
  right: 100%; top: 50%; transform: translateY(-50%);
  border-right-color: var(--dvfy-tooltip-bg, var(--dvfy-neutral-700));
}
`;

/**
 * Tooltip shown on hover/focus with configurable position and delay.
 *
 * @element dvfy-tooltip
 *
 * @attr {string} text - Tooltip content text
 * @attr {string} position - Placement: top | right | bottom | left (default: "top")
 * @attr {number} delay - Delay in ms before showing (default: 200)
 *
 * @slot - Trigger element that the tooltip is attached to
 *
 * @cssprop {color} --dvfy-tooltip-bg - Tooltip background color
 * @cssprop {color} --dvfy-tooltip-text - Tooltip text color
 * @cssprop {color} --dvfy-tooltip-border - Tooltip border color
 */
class DvfyTooltip extends HTMLElement {
  #tip = null;
  #timer = null;

  connectedCallback() {
    injectStyles('dvfy-tooltip', STYLES);
    const tipId = `dvfy-tip-${Math.random().toString(36).slice(2, 8)}`;
    this.#tip = document.createElement('span');
    this.#tip.className = 'dvfy-tooltip__tip';
    this.#tip.setAttribute('role', 'tooltip');
    this.#tip.id = tipId;
    this.#tip.textContent = this.getAttribute('text') || '';
    this.appendChild(this.#tip);

    // Link trigger element to tooltip via aria-describedby
    const trigger = this.firstElementChild !== this.#tip ? this.firstElementChild : null;
    if (trigger) trigger.setAttribute('aria-describedby', tipId);

    this.addEventListener('mouseenter', this.#show);
    this.addEventListener('mouseleave', this.#hide);
    this.addEventListener('focusin', this.#show);
    this.addEventListener('focusout', this.#hide);
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
  }

  static get observedAttributes() { return ['text']; }

  attributeChangedCallback(name, _, val) {
    if (name === 'text' && this.#tip) this.#tip.textContent = val || '';
  }

  #show = () => {
    const delay = parseInt(this.getAttribute('delay') || '200', 10);
    this.#timer = setTimeout(() => {
      this.#tip?.setAttribute('data-visible', '');
    }, delay);
  };

  #hide = () => {
    clearTimeout(this.#timer);
    this.#tip?.removeAttribute('data-visible');
  };
}

customElements.define('dvfy-tooltip', DvfyTooltip);
