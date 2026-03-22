/**
 * <dvfy-popover> — Interactive popover with click/hover/focus triggers
 *
 * First child element is the trigger; remaining children become the popover panel.
 * Auto-positions relative to the trigger with viewport-edge flipping.
 *
 * @element dvfy-popover
 *
 * @attr {string} trigger - Trigger mode: click | hover | focus (default: "click")
 * @attr {string} position - Preferred placement: top | bottom | left | right (default: "bottom")
 * @attr {boolean} open - Popover visibility state
 *
 * @event {CustomEvent} dvfy-open - Fires when popover opens
 * @event {CustomEvent} dvfy-close - Fires when popover closes
 *
 * @slot - First child is the trigger element; remaining children are popover content
 *
 * @cssProperty {color} --dvfy-surface-overlay - Panel background
 * @cssProperty {color} --dvfy-border-default - Panel border color
 * @cssProperty {shadow} --dvfy-shadow-lg - Panel shadow
 *
 * @example
 * <dvfy-popover position="bottom">
 *   <button>Open</button>
 *   <div>
 *     <p>Popover content with <a href="#">links</a> and interactive elements.</p>
 *   </div>
 * </dvfy-popover>
 */

const STYLES = `
dvfy-popover {
  display: inline-block;
  position: relative;
}

.dvfy-popover__panel {
  position: fixed;
  z-index: var(--dvfy-z-popover, 50);
  min-width: 14rem;
  max-width: 24rem;
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  line-height: var(--dvfy-leading-relaxed);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-surface-overlay);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  box-shadow: var(--dvfy-shadow-lg);
  opacity: 0;
  transform: scale(0.97) translateY(-4px);
  transition:
    opacity var(--dvfy-duration-fast) var(--dvfy-ease-out),
    transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
  pointer-events: none;
}

.dvfy-popover__panel[data-open] {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
}
`;

const GAP = 8; // px gap between trigger and panel

class DvfyPopover extends HTMLElement {
  static #styled = false;
  #panel = null;
  #trigger = null;
  #timer = null;
  #outsideHandler = null;
  #keyHandler = null;

  connectedCallback() {
    if (!DvfyPopover.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyPopover.#styled = true;
    }
    this.#build();
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    this.#removeGlobalListeners();
    if (this.#panel && document.body.contains(this.#panel)) {
      document.body.removeChild(this.#panel);
    }
  }

  static get observedAttributes() { return ['open', 'trigger']; }

  attributeChangedCallback(name, old, val) {
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        this.#openPanel();
      } else {
        this.#closePanel();
      }
    }
    if (name === 'trigger' && this.#trigger) {
      this.#detachTriggerListeners();
      this.#attachTriggerListeners();
    }
  }

  open() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }
  toggle() {
    if (this.hasAttribute('open')) this.close();
    else this.open();
  }

  #build() {
    const children = Array.from(this.childNodes);
    const firstEl = children.find(n => n.nodeType === Node.ELEMENT_NODE);
    if (!firstEl) return;

    this.#trigger = firstEl;

    // Build panel from remaining element children
    this.#panel = document.createElement('div');
    this.#panel.className = 'dvfy-popover__panel';
    this.#panel.setAttribute('role', 'dialog');
    this.#panel.setAttribute('aria-modal', 'false');

    const panelId = `dvfy-popover-${Math.random().toString(36).slice(2, 8)}`;
    this.#panel.id = panelId;
    this.#trigger.setAttribute('aria-haspopup', 'dialog');
    this.#trigger.setAttribute('aria-expanded', 'false');
    this.#trigger.setAttribute('aria-controls', panelId);

    const contentNodes = children.filter(n => n.nodeType === Node.ELEMENT_NODE && n !== firstEl);
    for (const node of contentNodes) {
      this.#panel.appendChild(node);
    }

    // Panel lives in body to escape stacking contexts
    document.body.appendChild(this.#panel);

    this.#attachTriggerListeners();
  }

  #attachTriggerListeners() {
    if (!this.#trigger) return;
    const mode = this.getAttribute('trigger') || 'click';
    if (mode === 'click') {
      this.#trigger.addEventListener('click', this.#onTriggerClick);
    } else if (mode === 'hover') {
      this.#trigger.addEventListener('mouseenter', this.#onHoverEnter);
      this.#trigger.addEventListener('mouseleave', this.#onHoverLeave);
      this.#trigger.addEventListener('focusin', this.#onFocusIn);
      this.#trigger.addEventListener('focusout', this.#onFocusOut);
    } else if (mode === 'focus') {
      this.#trigger.addEventListener('focusin', this.#onFocusIn);
      this.#trigger.addEventListener('focusout', this.#onFocusOut);
    }
  }

  #detachTriggerListeners() {
    if (!this.#trigger) return;
    this.#trigger.removeEventListener('click', this.#onTriggerClick);
    this.#trigger.removeEventListener('mouseenter', this.#onHoverEnter);
    this.#trigger.removeEventListener('mouseleave', this.#onHoverLeave);
    this.#trigger.removeEventListener('focusin', this.#onFocusIn);
    this.#trigger.removeEventListener('focusout', this.#onFocusOut);
  }

  #onTriggerClick = (e) => {
    e.stopPropagation();
    this.toggle();
  };

  #onHoverEnter = () => {
    clearTimeout(this.#timer);
    this.setAttribute('open', '');
  };

  #onHoverLeave = () => {
    // Small delay so cursor can move into panel
    this.#timer = setTimeout(() => {
      if (!this.#panel?.matches(':hover')) this.close();
    }, 100);
  };

  #onFocusIn = () => {
    clearTimeout(this.#timer);
    this.setAttribute('open', '');
  };

  #onFocusOut = () => {
    // Delay to allow focus to move into panel
    this.#timer = setTimeout(() => {
      if (!this.#panel?.contains(document.activeElement)) this.close();
    }, 100);
  };

  #openPanel() {
    if (!this.#panel || !this.#trigger) return;
    this.#positionPanel();
    this.#panel.setAttribute('data-open', '');
    this.#trigger.setAttribute('aria-expanded', 'true');
    this.#addGlobalListeners();
    this.dispatchEvent(new CustomEvent('dvfy-open', { bubbles: true }));
  }

  #closePanel() {
    if (!this.#panel) return;
    this.#panel.removeAttribute('data-open');
    this.#trigger?.setAttribute('aria-expanded', 'false');
    this.#removeGlobalListeners();
    this.dispatchEvent(new CustomEvent('dvfy-close', { bubbles: true }));
  }

  #positionPanel() {
    const triggerRect = this.#trigger.getBoundingClientRect();
    const pref = this.getAttribute('position') || 'bottom';
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Measure panel size (make visible but off-screen to measure)
    this.#panel.style.visibility = 'hidden';
    this.#panel.style.opacity = '0';
    this.#panel.style.top = '-9999px';
    this.#panel.style.left = '-9999px';
    this.#panel.removeAttribute('data-open');
    // Force layout
    const pw = this.#panel.offsetWidth;
    const ph = this.#panel.offsetHeight;
    this.#panel.style.visibility = '';
    this.#panel.style.opacity = '';

    // Determine best placement by checking available space
    const space = {
      top:    triggerRect.top - GAP,
      bottom: vh - triggerRect.bottom - GAP,
      left:   triggerRect.left - GAP,
      right:  vw - triggerRect.right - GAP,
    };

    // Fallback order per preferred position
    const fallbacks = {
      top:    ['top', 'bottom', 'right', 'left'],
      bottom: ['bottom', 'top', 'right', 'left'],
      left:   ['left', 'right', 'bottom', 'top'],
      right:  ['right', 'left', 'bottom', 'top'],
    };

    const fits = {
      top:    space.top    >= ph,
      bottom: space.bottom >= ph,
      left:   space.left   >= pw,
      right:  space.right  >= pw,
    };

    const order = fallbacks[pref] || fallbacks.bottom;
    const chosen = order.find(d => fits[d]) || pref;

    let top, left;
    switch (chosen) {
      case 'top':
        top  = triggerRect.top - ph - GAP;
        left = triggerRect.left + (triggerRect.width - pw) / 2;
        break;
      case 'bottom':
        top  = triggerRect.bottom + GAP;
        left = triggerRect.left + (triggerRect.width - pw) / 2;
        break;
      case 'left':
        top  = triggerRect.top + (triggerRect.height - ph) / 2;
        left = triggerRect.left - pw - GAP;
        break;
      case 'right':
        top  = triggerRect.top + (triggerRect.height - ph) / 2;
        left = triggerRect.right + GAP;
        break;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, vw - pw - 8));
    top  = Math.max(8, Math.min(top,  vh - ph - 8));

    this.#panel.style.top  = `${top}px`;
    this.#panel.style.left = `${left}px`;
  }

  #addGlobalListeners() {
    this.#outsideHandler = (e) => {
      if (!this.contains(e.target) && !this.#panel?.contains(e.target)) {
        this.close();
      }
    };
    this.#keyHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        this.#trigger?.focus();
      }
      // Tab trap: keep focus inside panel when open
      if (e.key === 'Tab' && this.#panel?.hasAttribute('data-open')) {
        const focusable = Array.from(
          this.#panel.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('click', this.#outsideHandler, true);
    document.addEventListener('keydown', this.#keyHandler);
  }

  #removeGlobalListeners() {
    if (this.#outsideHandler) {
      document.removeEventListener('click', this.#outsideHandler, true);
      this.#outsideHandler = null;
    }
    if (this.#keyHandler) {
      document.removeEventListener('keydown', this.#keyHandler);
      this.#keyHandler = null;
    }
  }
}

customElements.define('dvfy-popover', DvfyPopover);
