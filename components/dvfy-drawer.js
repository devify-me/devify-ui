const DRAWER_STYLES = `
/* ── Host element defaults ── */
dvfy-drawer {
  display: contents;
}

/* ════════════════════════════════════════════════════
   PUSH MODE (default — drawer is a flex/grid item)
   ════════════════════════════════════════════════════ */
dvfy-drawer[data-mode="push"] {
  display: flex;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* Left/right: animate width */
dvfy-drawer[data-mode="push"][data-position="left"],
dvfy-drawer[data-mode="push"][data-position="right"] {
  flex-direction: row;
  height: 100%;
  width: var(--dvfy-drawer-width, 17rem);
  transition: width var(--dvfy-duration-normal, 250ms) var(--dvfy-ease-out, ease-out);
}
dvfy-drawer[data-mode="push"]:not([open])[data-position="left"],
dvfy-drawer[data-mode="push"]:not([open])[data-position="right"] {
  width: 0;
}
dvfy-drawer[data-mode="push"]:not([open])[label][data-position="left"],
dvfy-drawer[data-mode="push"]:not([open])[label][data-position="right"] {
  width: var(--dvfy-drawer-tab-size, 2.5rem);
}

/* Top/bottom: animate height */
dvfy-drawer[data-mode="push"][data-position="top"],
dvfy-drawer[data-mode="push"][data-position="bottom"] {
  flex-direction: column;
  width: 100%;
  height: var(--dvfy-drawer-height, 50vh);
  transition: height var(--dvfy-duration-normal, 250ms) var(--dvfy-ease-out, ease-out);
}
dvfy-drawer[data-mode="push"]:not([open])[data-position="top"],
dvfy-drawer[data-mode="push"]:not([open])[data-position="bottom"] {
  height: 0;
}
dvfy-drawer[data-mode="push"]:not([open])[label][data-position="top"],
dvfy-drawer[data-mode="push"]:not([open])[label][data-position="bottom"] {
  height: var(--dvfy-drawer-tab-size, 2.5rem);
}

/* Push panel: fills the drawer element */
dvfy-drawer[data-mode="push"] .dvfy-drawer__panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
dvfy-drawer[data-mode="push"][data-position="left"] .dvfy-drawer__panel {
  border-right: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  box-shadow: var(--dvfy-shadow-md);
}
dvfy-drawer[data-mode="push"][data-position="right"] .dvfy-drawer__panel {
  border-left: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  box-shadow: var(--dvfy-shadow-md);
}
dvfy-drawer[data-mode="push"][data-position="bottom"] .dvfy-drawer__panel {
  border-top: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  box-shadow: var(--dvfy-shadow-md);
}
dvfy-drawer[data-mode="push"][data-position="top"] .dvfy-drawer__panel {
  border-bottom: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  box-shadow: var(--dvfy-shadow-md);
}

/* ════════════════════════════════════════════════════
   FLOAT MODE (position: absolute within container)
   ════════════════════════════════════════════════════ */
dvfy-drawer[data-mode="float"] .dvfy-drawer__panel {
  position: absolute;
  z-index: var(--dvfy-z-overlay, 200);
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  display: flex;
  flex-direction: column;
  box-shadow: var(--dvfy-shadow-xl);
  overflow: hidden;
  transition: transform var(--dvfy-duration-normal, 250ms) var(--dvfy-ease-out, ease-out);
}
dvfy-drawer[data-mode="float"] .dvfy-drawer__panel[data-position="right"] {
  top: 0; right: 0; bottom: 0;
  width: var(--dvfy-drawer-width, 17rem);
  transform: translateX(100%);
  border-left: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[data-mode="float"][open] .dvfy-drawer__panel[data-position="right"] { transform: translateX(0); }
dvfy-drawer[data-mode="float"] .dvfy-drawer__panel[data-position="left"] {
  top: 0; left: 0; bottom: 0;
  width: var(--dvfy-drawer-width, 17rem);
  transform: translateX(-100%);
  border-right: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[data-mode="float"][open] .dvfy-drawer__panel[data-position="left"] { transform: translateX(0); }
dvfy-drawer[data-mode="float"] .dvfy-drawer__panel[data-position="bottom"] {
  left: 0; right: 0; bottom: 0;
  height: var(--dvfy-drawer-height, 50vh);
  transform: translateY(100%);
  border-top: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[data-mode="float"][open] .dvfy-drawer__panel[data-position="bottom"] { transform: translateY(0); }
dvfy-drawer[data-mode="float"] .dvfy-drawer__panel[data-position="top"] {
  left: 0; right: 0; top: 0;
  height: var(--dvfy-drawer-height, 50vh);
  transform: translateY(-100%);
  border-bottom: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[data-mode="float"][open] .dvfy-drawer__panel[data-position="top"] { transform: translateY(0); }

/* ════════════════════════════════════════════════════
   OVERLAY MODE (position: fixed with backdrop)
   ════════════════════════════════════════════════════ */
.dvfy-drawer__backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--dvfy-z-modal, 300);
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity var(--dvfy-duration-normal, 200ms) var(--dvfy-ease-out, ease-out);
  pointer-events: none;
}
dvfy-drawer[open] .dvfy-drawer__backdrop {
  opacity: 1;
  pointer-events: auto;
}

dvfy-drawer[data-mode="overlay"] .dvfy-drawer__panel {
  position: fixed;
  z-index: calc(var(--dvfy-z-modal, 300) + 1);
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  display: flex;
  flex-direction: column;
  box-shadow: var(--dvfy-shadow-xl);
  overflow: hidden;
  transition: transform var(--dvfy-duration-normal, 250ms) var(--dvfy-ease-out, ease-out);
}
dvfy-drawer[data-mode="overlay"] .dvfy-drawer__panel[data-position="right"] {
  top: 0; right: 0; bottom: 0;
  width: var(--dvfy-drawer-width, 24rem); max-width: 100vw;
  transform: translateX(100%);
  border-left: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[data-mode="overlay"][open] .dvfy-drawer__panel[data-position="right"] { transform: translateX(0); }
dvfy-drawer[data-mode="overlay"] .dvfy-drawer__panel[data-position="left"] {
  top: 0; left: 0; bottom: 0;
  width: var(--dvfy-drawer-width, 24rem); max-width: 100vw;
  transform: translateX(-100%);
  border-right: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[data-mode="overlay"][open] .dvfy-drawer__panel[data-position="left"] { transform: translateX(0); }
dvfy-drawer[data-mode="overlay"] .dvfy-drawer__panel[data-position="bottom"] {
  left: 0; right: 0; bottom: 0;
  height: var(--dvfy-drawer-height, 50vh); max-height: 90vh;
  transform: translateY(100%);
  border-top: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  border-radius: var(--dvfy-radius-xl, 0.75rem) var(--dvfy-radius-xl, 0.75rem) 0 0;
}
dvfy-drawer[data-mode="overlay"][open] .dvfy-drawer__panel[data-position="bottom"] { transform: translateY(0); }
dvfy-drawer[data-mode="overlay"] .dvfy-drawer__panel[data-position="top"] {
  left: 0; right: 0; top: 0;
  height: var(--dvfy-drawer-height, 50vh); max-height: 90vh;
  transform: translateY(-100%);
  border-bottom: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  border-radius: 0 0 var(--dvfy-radius-xl, 0.75rem) var(--dvfy-radius-xl, 0.75rem);
}
dvfy-drawer[data-mode="overlay"][open] .dvfy-drawer__panel[data-position="top"] { transform: translateY(0); }

/* Responsive: full width on small screens (overlay) */
@media (max-width: 30rem) {
  dvfy-drawer[data-mode="overlay"] .dvfy-drawer__panel[data-position="left"],
  dvfy-drawer[data-mode="overlay"] .dvfy-drawer__panel[data-position="right"] {
    width: 100vw;
    max-width: 100vw;
  }
}

/* ════════════════════════════════════════════════════
   COLLAPSED LABEL TAB
   ════════════════════════════════════════════════════ */
.dvfy-drawer__label-tab {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  color: var(--dvfy-text-secondary);
  font-size: var(--dvfy-text-sm, 0.875rem);
  font-weight: var(--dvfy-weight-medium, 500);
  user-select: none;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: background var(--dvfy-duration-fast, 100ms), color var(--dvfy-duration-fast, 100ms),
              opacity var(--dvfy-duration-fast, 100ms);
  z-index: 1;
}
.dvfy-drawer__label-tab:hover {
  background: var(--dvfy-hover-bg);
  color: var(--dvfy-text-primary);
}
.dvfy-drawer__label-tab:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Show label tab when collapsed state is reached */
dvfy-drawer[data-collapsed] .dvfy-drawer__label-tab {
  opacity: 1;
  pointer-events: auto;
}

/* Left: tab at right edge, text vertical */
dvfy-drawer[data-position="left"] .dvfy-drawer__label-tab {
  right: 0; top: 0; bottom: 0;
  width: var(--dvfy-drawer-tab-size, 2.5rem);
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  border-right: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}

/* Right: tab at left edge, text vertical */
dvfy-drawer[data-position="right"] .dvfy-drawer__label-tab {
  left: 0; top: 0; bottom: 0;
  width: var(--dvfy-drawer-tab-size, 2.5rem);
  writing-mode: vertical-lr;
  border-left: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}

/* Bottom: tab at top edge, text horizontal */
dvfy-drawer[data-position="bottom"] .dvfy-drawer__label-tab {
  left: 0; right: 0; top: 0;
  height: var(--dvfy-drawer-tab-size, 2.5rem);
  border-top: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}

/* Top: tab at bottom edge, text horizontal */
dvfy-drawer[data-position="top"] .dvfy-drawer__label-tab {
  left: 0; right: 0; bottom: 0;
  height: var(--dvfy-drawer-tab-size, 2.5rem);
  border-bottom: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}

/* ════════════════════════════════════════════════════
   PANEL INTERIOR: HEADER / CLOSE / BODY
   ════════════════════════════════════════════════════ */
.dvfy-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dvfy-space-4, 1rem) var(--dvfy-space-5, 1.25rem);
  border-bottom: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  flex-shrink: 0;
  gap: var(--dvfy-space-3, 0.75rem);
}
.dvfy-drawer__title {
  font-size: var(--dvfy-text-base, 1rem);
  font-weight: var(--dvfy-weight-semibold, 600);
  color: var(--dvfy-text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
}
.dvfy-drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  border-radius: var(--dvfy-radius-md, 0.375rem);
  cursor: pointer;
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-lg, 1.125rem);
  flex-shrink: 0;
  transition: background var(--dvfy-duration-fast, 100ms);
}
.dvfy-drawer__close:hover {
  background: var(--dvfy-hover-bg);
  color: var(--dvfy-text-primary);
}
.dvfy-drawer__close:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
.dvfy-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--dvfy-space-5, 1.25rem);
  min-height: 0;
}
`;

/**
 * Docking panel that slides from a container edge with push, float, or overlay layout.
 *
 * In **push** mode (default) the drawer is a flex item that occupies space and
 * pushes sibling content. An optional collapsed label tab appears when closed.
 * In **float** mode the panel is positioned absolutely over content within the
 * container (container must have `position: relative`).
 * In **overlay** mode the panel is fixed to the viewport with a dimming backdrop.
 *
 * @element dvfy-drawer
 *
 * @attr {boolean} open - Show/hide the drawer panel
 * @attr {string} position - Slide direction: left | right | top | bottom (default: "right")
 * @attr {string} title - Panel header title text; omit to suppress header
 * @attr {string} label - Text on the collapsed tab (push mode); omit to hide tab
 * @attr {boolean} float - Float mode: panel is position absolute over container content
 * @attr {boolean} overlay - Overlay mode: panel is fixed with a dimming backdrop
 *
 * @fires {CustomEvent} open - Fires when the panel opens
 * @fires {CustomEvent} close - Fires when the panel closes
 *
 * @slot - Drawer body content
 *
 * @cssprop {color} --dvfy-drawer-bg - Panel background (default: var(--dvfy-surface-raised))
 * @cssprop {color} --dvfy-drawer-border - Border color (default: var(--dvfy-border-muted))
 * @cssprop {length} --dvfy-drawer-width - Panel width for left/right positions (default: 17rem push, 24rem overlay)
 * @cssprop {length} --dvfy-drawer-height - Panel height for top/bottom positions (default: 50vh)
 * @cssprop {length} --dvfy-drawer-tab-size - Collapsed label tab thickness (default: 2.5rem)
 *
 * @example
 * <div style="display:flex;height:100vh">
 *   <dvfy-drawer position="left" label="Nav" open style="--dvfy-drawer-width:16rem">
 *     <nav>Sidebar content</nav>
 *   </dvfy-drawer>
 *   <main>Main content</main>
 * </div>
 */
class DvfyDrawer extends HTMLElement {
  static #styled = false;
  #panel = null;
  #backdrop = null;
  #labelTab = null;
  #prevFocus = null;
  #collapseTimer = null;

  connectedCallback() {
    if (!DvfyDrawer.#styled) {
      const s = document.createElement('style');
      s.textContent = DRAWER_STYLES;
      document.head.appendChild(s);
      DvfyDrawer.#styled = true;
    }
    this.#syncMode();
    this.#syncPosition();
    this.#build();
    if (this.hasAttribute('open')) {
      this.#openPanel();
    } else if (this.getAttribute('label')) {
      this.setAttribute('data-collapsed', '');
    }
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.#onKey);
    clearTimeout(this.#collapseTimer);
  }

  static get observedAttributes() {
    return ['open', 'position', 'title', 'label', 'float', 'overlay'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.isConnected) return;
    if (name === 'open') {
      this.hasAttribute('open') ? this.#openPanel() : this.#closePanel();
    } else if (name === 'float' || name === 'overlay') {
      this.#syncMode();
      this.#rebuild();
    } else if (name === 'position') {
      this.#syncPosition();
      this.#rebuild();
    } else {
      this.#rebuild();
    }
  }

  /** Derive and set data-mode from boolean attrs */
  #syncMode() {
    const mode = this.hasAttribute('float') ? 'float'
               : this.hasAttribute('overlay') ? 'overlay'
               : 'push';
    this.setAttribute('data-mode', mode);
  }

  /** Mirror position attr to data-position for CSS targeting */
  #syncPosition() {
    const pos = this.getAttribute('position') || 'right';
    this.setAttribute('data-position', pos);
  }

  #rebuild() {
    this.#syncMode();
    this.#syncPosition();
    const wasOpen = this.hasAttribute('open');

    // Preserve user body content
    const body = this.#panel?.querySelector('.dvfy-drawer__body');
    const savedChildren = body ? [...body.childNodes] : [];

    this.#backdrop?.remove();
    this.#panel?.remove();
    this.#labelTab?.remove();
    this.#backdrop = null;
    this.#panel = null;
    this.#labelTab = null;

    this.#build(savedChildren);
    if (wasOpen) {
      this.#openPanel();
    } else if (this.getAttribute('label') && this.getAttribute('data-mode') === 'push') {
      this.setAttribute('data-collapsed', '');
    }
  }

  #build(existingChildren = null) {
    const mode = this.getAttribute('data-mode') || 'push';
    const position = this.getAttribute('position') || 'right';
    const titleText = this.getAttribute('title') || '';
    const labelText = this.getAttribute('label') || '';

    // Collect slotted children if not passed in
    const children = existingChildren ?? [...this.childNodes].filter(
      n => !n.classList?.contains('dvfy-drawer__backdrop') &&
           !n.classList?.contains('dvfy-drawer__panel') &&
           !n.classList?.contains('dvfy-drawer__label-tab')
    );
    if (!existingChildren) this.textContent = '';

    // ── Backdrop (overlay mode only) ──
    if (mode === 'overlay') {
      this.#backdrop = document.createElement('div');
      this.#backdrop.className = 'dvfy-drawer__backdrop';
      this.#backdrop.setAttribute('aria-hidden', 'true');
      this.#backdrop.addEventListener('click', () => this.removeAttribute('open'));
      this.appendChild(this.#backdrop);
    }

    // ── Panel ──
    this.#panel = document.createElement('div');
    this.#panel.className = 'dvfy-drawer__panel';
    this.#panel.setAttribute('data-position', position);
    if (mode === 'overlay') {
      this.#panel.setAttribute('role', 'dialog');
      this.#panel.setAttribute('aria-modal', 'true');
      this.#panel.inert = true;
    }
    if (titleText && mode === 'overlay') {
      this.#panel.setAttribute('aria-labelledby', 'dvfy-drawer-title');
    }

    // Header: show when title is set, or in overlay mode (always needs close button)
    if (titleText || mode === 'overlay') {
      const header = document.createElement('div');
      header.className = 'dvfy-drawer__header';

      if (titleText) {
        const title = document.createElement('h2');
        title.className = 'dvfy-drawer__title';
        title.id = 'dvfy-drawer-title';
        title.textContent = titleText;
        header.appendChild(title);
      }

      const closeBtn = document.createElement('button');
      closeBtn.className = 'dvfy-drawer__close';
      closeBtn.setAttribute('aria-label', 'Close drawer');
      closeBtn.textContent = '\u00d7';
      closeBtn.addEventListener('click', () => this.removeAttribute('open'));

      header.appendChild(closeBtn);
      this.#panel.appendChild(header);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'dvfy-drawer__body';
    for (const child of children) body.appendChild(child);
    this.#panel.appendChild(body);

    this.appendChild(this.#panel);

    // ── Label tab (push mode only) ──
    if (labelText && mode === 'push') {
      this.#labelTab = document.createElement('button');
      this.#labelTab.className = 'dvfy-drawer__label-tab';
      this.#labelTab.setAttribute('aria-label', `Open ${labelText}`);
      this.#labelTab.textContent = labelText;
      this.#labelTab.addEventListener('click', () => this.setAttribute('open', ''));
      this.appendChild(this.#labelTab);
    }
  }

  #openPanel() {
    clearTimeout(this.#collapseTimer);
    this.removeAttribute('data-collapsed');
    this.#prevFocus = document.activeElement;

    if (this.#panel) this.#panel.inert = false;

    if (this.getAttribute('data-mode') === 'overlay') {
      document.addEventListener('keydown', this.#onKey);
      requestAnimationFrame(() => {
        const focusable = this.#panel?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      });
    }

    this.dispatchEvent(new CustomEvent('open', { bubbles: true }));
  }

  #closePanel() {
    const mode = this.getAttribute('data-mode') || 'push';

    if (mode === 'overlay') {
      if (this.#panel) this.#panel.inert = true;
      document.removeEventListener('keydown', this.#onKey);
      this.#prevFocus?.focus();
    }

    // In push mode with label: show label tab after collapse animation completes
    if (mode === 'push' && this.getAttribute('label')) {
      // Listen for transitionend on the element itself (width/height transition)
      const onEnd = () => {
        this.removeEventListener('transitionend', onEnd);
        if (!this.hasAttribute('open')) {
          this.setAttribute('data-collapsed', '');
        }
      };
      this.addEventListener('transitionend', onEnd);
      // Fallback timer in case transitionend doesn't fire (e.g., prefers-reduced-motion)
      this.#collapseTimer = setTimeout(() => {
        this.removeEventListener('transitionend', onEnd);
        if (!this.hasAttribute('open')) {
          this.setAttribute('data-collapsed', '');
        }
      }, 350);
    }

    this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
  }

  #onKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.removeAttribute('open');
      return;
    }
    if (e.key === 'Tab' && this.#panel) {
      const focusable = [...this.#panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  get open() { return this.hasAttribute('open'); }
  set open(v) { v ? this.setAttribute('open', '') : this.removeAttribute('open'); }
}

customElements.define('dvfy-drawer', DvfyDrawer);
