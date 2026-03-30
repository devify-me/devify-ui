import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-popover> — Interactive popover
 *
 * Unlike dvfy-tooltip (informational, non-interactive), dvfy-popover supports
 * interactive content (forms, buttons, links) with click/hover/focus triggers,
 * auto-positioning that flips on viewport edges, and proper focus management.
 *
 * Attributes:
 *   trigger:   click | hover | focus (default: "click")
 *   position:  top | right | bottom | left (default: "bottom")
 *   delay:     ms before showing on hover trigger (default: 200)
 *   offset:    px gap between trigger and popover (default: 8)
 *   open:      boolean — programmatically show/hide
 *
 * Usage:
 *   <dvfy-popover>
 *     <dvfy-button>Open menu</dvfy-button>
 *     <div slot="content">
 *       <p>Interactive content here</p>
 *       <dvfy-button size="sm">Action</dvfy-button>
 *     </div>
 *   </dvfy-popover>
 */

const STYLES = `
dvfy-popover {
  display: inline-block;
  position: relative;
}

dvfy-popover .dvfy-popover__panel {
  position: absolute;
  z-index: var(--dvfy-z-popover);
  min-width: 12rem;
  max-width: 24rem;
  padding: var(--dvfy-space-3);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-elevation-lg-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  box-shadow: var(--dvfy-shadow-lg);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--dvfy-duration-fast) var(--dvfy-ease-out),
    transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
}

dvfy-popover .dvfy-popover__panel[data-visible] {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) translateX(0);
}

/* Arrow */
dvfy-popover .dvfy-popover__arrow {
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  transform: rotate(45deg);
}

/* Positions */
dvfy-popover[data-pos="bottom"] .dvfy-popover__panel {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
}
dvfy-popover[data-pos="bottom"] .dvfy-popover__panel[data-visible] {
  transform: translateX(-50%) translateY(0);
}
dvfy-popover[data-pos="bottom"] .dvfy-popover__arrow {
  top: calc(-0.25rem - 1px);
  left: 50%;
  margin-left: -0.25rem;
  border-right: none;
  border-bottom: none;
}

dvfy-popover[data-pos="top"] .dvfy-popover__panel {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
}
dvfy-popover[data-pos="top"] .dvfy-popover__panel[data-visible] {
  transform: translateX(-50%) translateY(0);
}
dvfy-popover[data-pos="top"] .dvfy-popover__arrow {
  bottom: calc(-0.25rem - 1px);
  left: 50%;
  margin-left: -0.25rem;
  border-left: none;
  border-top: none;
}

dvfy-popover[data-pos="left"] .dvfy-popover__panel {
  right: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(-4px);
}
dvfy-popover[data-pos="left"] .dvfy-popover__panel[data-visible] {
  transform: translateY(-50%) translateX(0);
}
dvfy-popover[data-pos="left"] .dvfy-popover__arrow {
  right: calc(-0.25rem - 1px);
  top: 50%;
  margin-top: -0.25rem;
  border-left: none;
  border-bottom: none;
}

dvfy-popover[data-pos="right"] .dvfy-popover__panel {
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(4px);
}
dvfy-popover[data-pos="right"] .dvfy-popover__panel[data-visible] {
  transform: translateY(-50%) translateX(0);
}
dvfy-popover[data-pos="right"] .dvfy-popover__arrow {
  left: calc(-0.25rem - 1px);
  top: 50%;
  margin-top: -0.25rem;
  border-right: none;
  border-top: none;
}
`;

/**
 * Interactive popover with click/hover/focus triggers and auto-positioning.
 *
 * @element dvfy-popover
 *
 * @attr {string} trigger - Trigger mode: click | hover | focus (default: "click")
 * @attr {string} position - Preferred placement: top | right | bottom | left (default: "bottom")
 * @attr {number} delay - Delay in ms for hover trigger (default: 200)
 * @attr {number} offset - Gap in px between trigger and panel (default: 8)
 * @attr {boolean} open - Programmatically control visibility
 *
 * @event {CustomEvent} dvfy-popover-show - Fires when popover opens
 * @event {CustomEvent} dvfy-popover-hide - Fires when popover closes
 *
 * @slot - Trigger element (first child)
 * @slot content - Popover content panel
 *
 * @cssprop {color} --dvfy-surface-raised - Panel background
 * @cssprop {color} --dvfy-border-default - Panel border
 * @cssprop {length} --dvfy-shadow-lg - Panel shadow
 */
class DvfyPopover extends HTMLElement {
  #panel = null;
  #arrow = null;
  #timer = null;
  #isOpen = false;

  connectedCallback() {
    injectStyles('dvfy-popover', STYLES);

    this.#buildPanel();
    this.#bindTrigger();

    // Set initial position data attribute
    this.dataset.pos = this.getAttribute('position') || 'bottom';

    // Handle programmatic open
    if (this.hasAttribute('open')) this.#show();
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    document.removeEventListener('click', this.#onDocClick);
    document.removeEventListener('keydown', this.#onDocKey);
  }

  static get observedAttributes() { return ['position', 'open', 'trigger']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.isConnected) return;

    if (name === 'position') {
      this.dataset.pos = newVal || 'bottom';
    }
    if (name === 'open') {
      if (this.hasAttribute('open')) this.#show();
      else this.#hide();
    }
    if (name === 'trigger') {
      this.#unbindTrigger();
      this.#bindTrigger();
    }
  }

  get #triggerMode() { return this.getAttribute('trigger') || 'click'; }
  get #delay() { return parseInt(this.getAttribute('delay') || '200', 10); }
  get #offset() { return parseInt(this.getAttribute('offset') || '8', 10); }

  #buildPanel() {
    // Create the popover panel
    this.#panel = document.createElement('div');
    this.#panel.className = 'dvfy-popover__panel';
    this.#panel.setAttribute('role', 'dialog');
    this.#panel.setAttribute('aria-modal', 'false');

    // Create arrow
    this.#arrow = document.createElement('div');
    this.#arrow.className = 'dvfy-popover__arrow';
    this.#panel.appendChild(this.#arrow);

    // Move slotted content into the panel
    const contentSlot = this.querySelector('[slot="content"]');
    if (contentSlot) {
      contentSlot.removeAttribute('slot');
      this.#panel.appendChild(contentSlot);
    }

    this.appendChild(this.#panel);

    // Set offset via CSS custom property
    this.style.setProperty('--_popover-offset', `${this.#offset}px`);
  }

  #getTriggerElement() {
    for (const child of this.children) {
      if (child !== this.#panel) return child;
    }
    return null;
  }

  #bindTrigger() {
    const mode = this.#triggerMode;
    const trigger = this.#getTriggerElement();
    if (!trigger) return;

    // Set ARIA
    const panelId = `dvfy-popover-${Math.random().toString(36).slice(2, 8)}`;
    this.#panel.id = panelId;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);

    if (mode === 'click') {
      trigger.addEventListener('click', this.#onTriggerClick);
      document.addEventListener('click', this.#onDocClick);
      document.addEventListener('keydown', this.#onDocKey);
    } else if (mode === 'hover') {
      this.addEventListener('mouseenter', this.#onMouseEnter);
      this.addEventListener('mouseleave', this.#onMouseLeave);
      // Also support focus for a11y
      trigger.addEventListener('focusin', this.#onFocusIn);
      trigger.addEventListener('focusout', this.#onFocusOut);
    } else if (mode === 'focus') {
      trigger.addEventListener('focusin', this.#onFocusIn);
      trigger.addEventListener('focusout', this.#onFocusOut);
    }
  }

  #unbindTrigger() {
    const trigger = this.#getTriggerElement();
    if (!trigger) return;

    trigger.removeEventListener('click', this.#onTriggerClick);
    this.removeEventListener('mouseenter', this.#onMouseEnter);
    this.removeEventListener('mouseleave', this.#onMouseLeave);
    trigger.removeEventListener('focusin', this.#onFocusIn);
    trigger.removeEventListener('focusout', this.#onFocusOut);
    document.removeEventListener('click', this.#onDocClick);
    document.removeEventListener('keydown', this.#onDocKey);
  }

  // ── Event handlers ──

  #onTriggerClick = (e) => {
    e.stopPropagation();
    if (this.#isOpen) this.#hide();
    else this.#show();
  };

  #onDocClick = (e) => {
    if (!this.#isOpen) return;
    if (!this.contains(e.target)) this.#hide();
  };

  #onDocKey = (e) => {
    if (e.key === 'Escape' && this.#isOpen) {
      e.preventDefault();
      this.#hide();
      this.#getTriggerElement()?.focus();
    }
  };

  #onMouseEnter = () => {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#show(), this.#delay);
  };

  #onMouseLeave = () => {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#hide(), 150);
  };

  #onFocusIn = () => {
    clearTimeout(this.#timer);
    this.#show();
  };

  #onFocusOut = (e) => {
    // Don't close if focus moved within the popover
    requestAnimationFrame(() => {
      if (!this.contains(document.activeElement)) {
        this.#hide();
      }
    });
  };

  // ── Show/Hide ──

  #show() {
    if (this.#isOpen) return;
    this.#isOpen = true;

    this.#autoPosition();
    this.#panel.setAttribute('data-visible', '');

    const trigger = this.#getTriggerElement();
    if (trigger) trigger.setAttribute('aria-expanded', 'true');

    this.dispatchEvent(new CustomEvent('dvfy-popover-show', { bubbles: true }));
  }

  #hide() {
    if (!this.#isOpen) return;
    this.#isOpen = false;

    this.#panel.removeAttribute('data-visible');

    const trigger = this.#getTriggerElement();
    if (trigger) trigger.setAttribute('aria-expanded', 'false');

    this.dispatchEvent(new CustomEvent('dvfy-popover-hide', { bubbles: true }));
  }

  // ── Auto-positioning ──

  #autoPosition() {
    const preferred = this.getAttribute('position') || 'bottom';
    const rect = this.getBoundingClientRect();
    const offset = this.#offset;

    // Temporarily show panel to measure it
    this.#panel.style.visibility = 'hidden';
    this.#panel.style.display = 'block';
    const panelRect = this.#panel.getBoundingClientRect();
    this.#panel.style.visibility = '';
    this.#panel.style.display = '';

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Check if preferred position fits
    const fits = {
      top: rect.top - panelRect.height - offset > 0,
      bottom: rect.bottom + panelRect.height + offset < vh,
      left: rect.left - panelRect.width - offset > 0,
      right: rect.right + panelRect.width + offset < vw,
    };

    // Flip if preferred doesn't fit
    const opposites = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    let pos = preferred;
    if (!fits[preferred] && fits[opposites[preferred]]) {
      pos = opposites[preferred];
    }

    this.dataset.pos = pos;
  }
}

customElements.define('dvfy-popover', DvfyPopover);
