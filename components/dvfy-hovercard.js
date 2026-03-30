// Feature detection
const SUPPORTS_INTEREST = (() => {
  try { return 'interestTargetElement' in HTMLButtonElement.prototype; }
  catch (_) { return false; }
})();

const SUPPORTS_POPOVER = (() => {
  try { return typeof HTMLElement.prototype.showPopover === 'function'; }
  catch (_) { return false; }
})();

const STYLES = `
/* === dvfy-hovercard: popover="hint" native styling === */

dvfy-hovercard {
  /* Box */
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  max-width: 20rem;
  /* Type */
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  line-height: var(--dvfy-leading-relaxed);
  color: var(--dvfy-text-primary);
  /* Surface */
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  box-shadow: var(--dvfy-shadow-lg);
  /* Reset browser popover defaults */
  inset: unset;
  margin: var(--dvfy-space-2);
}

/* === Popover open/close animation === */
dvfy-hovercard {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
  transition:
    opacity var(--dvfy-duration-fast) var(--dvfy-ease-out),
    transform var(--dvfy-duration-fast) var(--dvfy-ease-out),
    display var(--dvfy-duration-fast) allow-discrete,
    overlay var(--dvfy-duration-fast) allow-discrete;
}

dvfy-hovercard:popover-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@starting-style {
  dvfy-hovercard:popover-open {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
}

/* JS fallback visible state */
dvfy-hovercard[data-hc-open] {
  display: block;
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* === Anchor-positioned placement hints (Chrome 136+ native path) === */
dvfy-hovercard:not([position]),
dvfy-hovercard[position="top"] {
  position-area: top span-left;
  position-try-fallbacks: bottom span-left, left span-top, right span-top;
}
dvfy-hovercard[position="bottom"] {
  position-area: bottom span-left;
  position-try-fallbacks: top span-left, left span-bottom, right span-bottom;
}
dvfy-hovercard[position="left"] {
  position-area: left span-top;
  position-try-fallbacks: right span-top, top span-left, bottom span-left;
}
dvfy-hovercard[position="right"] {
  position-area: right span-top;
  position-try-fallbacks: left span-top, top span-right, bottom span-right;
}

/* === JS-fallback: fixed positioning === */
dvfy-hovercard[data-hc-fallback] {
  position: fixed;
  z-index: var(--dvfy-z-tooltip);
}

/* === Content typography === */
dvfy-hovercard strong {
  display: block;
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
  margin-bottom: var(--dvfy-space-0-5);
}
dvfy-hovercard p {
  margin: 0;
  color: var(--dvfy-text-secondary);
  font-size: var(--dvfy-text-xs);
}
dvfy-hovercard p + p {
  margin-top: var(--dvfy-space-1);
}
`;

/**
 * <dvfy-hovercard> — Zero-JS hover tooltip via interestfor + popover="hint"
 *
 * Uses the native Interest Invoker API (Chrome 136+) with Popover API fallback
 * for broader browser support. No JavaScript event listeners needed in modern
 * Chrome — hover behavior is handled entirely by the browser.
 *
 * Usage (declarative — Chrome 136+ native):
 *   <button interestfor="my-card">Hover me</button>
 *   <dvfy-hovercard id="my-card">Tooltip content</dvfy-hovercard>
 *
 * Usage (rich content):
 *   <dvfy-button interestfor="user-tip">@alice</dvfy-button>
 *   <dvfy-hovercard id="user-tip">
 *     <strong>Alice Chen</strong>
 *     <p>Senior Engineer · Platform</p>
 *   </dvfy-hovercard>
 *
 * Attributes:
 *   position: top | bottom | left | right (default: "top", used by JS fallback)
 *   delay:    ms before showing (default: 400, used by JS fallback)
 *
 * @element dvfy-hovercard
 *
 * @attr {string} position - Placement hint: top | bottom | left | right (default: "top")
 * @attr {number} delay - Delay in ms before showing (default: 400)
 *
 * @slot - Hovercard content (can be rich HTML)
 *
 * @cssprop {color} --dvfy-surface-raised - Hovercard background
 * @cssprop {color} --dvfy-border-default - Hovercard border color
 * @cssprop {shadow} --dvfy-shadow-lg - Hovercard shadow
 */
class DvfyHovercard extends HTMLElement {
  static #styled = false;
  #timer = null;
  #triggers = [];

  connectedCallback() {
    if (!DvfyHovercard.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyHovercard.#styled = true;
    }

    if (SUPPORTS_INTEREST) {
      // Native path: set popover="hint" and let the browser handle hover
      if (!this.hasAttribute('popover')) {
        this.setAttribute('popover', 'hint');
      }
    } else {
      // Fallback path: JS-driven show/hide
      this.setAttribute('data-hc-fallback', '');
      this.style.display = 'none';
      // Defer so the full document is available
      setTimeout(() => this.#connectFallback(), 0);
    }
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    this.#triggers.forEach(({ el, show, hide }) => {
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
      el.removeEventListener('focusin', show);
      el.removeEventListener('focusout', hide);
    });
    this.#triggers = [];
  }

  #connectFallback() {
    const id = this.id;
    if (!id) return;

    const triggers = document.querySelectorAll(`[interestfor="${CSS.escape(id)}"]`);
    triggers.forEach((el) => {
      const show = () => this.#show(el);
      const hide = () => this.#hide();
      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focusin', show);
      el.addEventListener('focusout', hide);
      this.#triggers.push({ el, show, hide });
    });
  }

  #show(trigger) {
    clearTimeout(this.#timer);
    const delay = parseInt(this.getAttribute('delay') || '400', 10);
    this.#timer = setTimeout(() => {
      this.#applyPosition(trigger);
      this.style.display = 'block';
      this.setAttribute('data-hc-open', '');
      if (SUPPORTS_POPOVER && this.hasAttribute('popover')) {
        try { this.showPopover(); } catch (_) {}
      }
    }, delay);
  }

  #hide() {
    clearTimeout(this.#timer);
    this.removeAttribute('data-hc-open');
    this.style.display = 'none';
    if (SUPPORTS_POPOVER && this.hasAttribute('popover')) {
      try { this.hidePopover(); } catch (_) {}
    }
  }

  #applyPosition(trigger) {
    const rect = trigger.getBoundingClientRect();
    const pos = this.getAttribute('position') || 'top';
    const gap = 8; // px gap between trigger and hovercard

    // Temporarily show to measure
    this.style.visibility = 'hidden';
    this.style.display = 'block';
    const myRect = this.getBoundingClientRect();
    this.style.visibility = '';
    this.style.display = 'none';

    let top, left;
    switch (pos) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left;
        break;
      case 'left':
        top = rect.top + (rect.height - myRect.height) / 2;
        left = rect.left - myRect.width - gap;
        break;
      case 'right':
        top = rect.top + (rect.height - myRect.height) / 2;
        left = rect.right + gap;
        break;
      case 'top':
      default:
        top = rect.top - myRect.height - gap;
        left = rect.left;
        break;
    }

    // Clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(8, Math.min(left, vw - myRect.width - 8));
    top = Math.max(8, Math.min(top, vh - myRect.height - 8));

    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }
}

customElements.define('dvfy-hovercard', DvfyHovercard);
