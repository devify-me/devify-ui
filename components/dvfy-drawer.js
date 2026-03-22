const DRAWER_STYLES = `
dvfy-drawer {
  display: contents;
}

/* ── Backdrop ── */
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

/* ── Panel ── */
.dvfy-drawer__panel {
  position: fixed;
  z-index: calc(var(--dvfy-z-modal, 300) + 1);
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  display: flex;
  flex-direction: column;
  transition: transform var(--dvfy-duration-normal, 250ms) var(--dvfy-ease-out, ease-out);
  box-shadow: var(--dvfy-shadow-xl);
  overflow: hidden;
}

/* ── Position: right (default) ── */
.dvfy-drawer__panel[data-position="right"] {
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--dvfy-drawer-width, 24rem);
  max-width: 100vw;
  transform: translateX(100%);
  border-left: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[open] .dvfy-drawer__panel[data-position="right"] {
  transform: translateX(0);
}

/* ── Position: left ── */
.dvfy-drawer__panel[data-position="left"] {
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--dvfy-drawer-width, 24rem);
  max-width: 100vw;
  transform: translateX(-100%);
  border-right: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[open] .dvfy-drawer__panel[data-position="left"] {
  transform: translateX(0);
}

/* ── Position: bottom ── */
.dvfy-drawer__panel[data-position="bottom"] {
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--dvfy-drawer-height, 50vh);
  max-height: 90vh;
  transform: translateY(100%);
  border-top: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  border-radius: var(--dvfy-radius-xl, 0.75rem) var(--dvfy-radius-xl, 0.75rem) 0 0;
}
dvfy-drawer[open] .dvfy-drawer__panel[data-position="bottom"] {
  transform: translateY(0);
}

/* ── Responsive: full width on small screens ── */
@media (max-width: 30rem) {
  .dvfy-drawer__panel[data-position="left"],
  .dvfy-drawer__panel[data-position="right"] {
    width: 100vw;
    max-width: 100vw;
  }
}

/* ── Header ── */
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

/* ── Close button ── */
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

/* ── Scrollable body ── */
.dvfy-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--dvfy-space-5, 1.25rem);
}
`;

/**
 * Slide-over panel that overlays content from a viewport edge.
 *
 * Opens as a fixed overlay from left, right, or bottom. Supports an optional
 * backdrop, focus trap, keyboard dismiss, and responsive full-width on mobile.
 *
 * @element dvfy-drawer
 *
 * @attr {boolean} open - Show/hide the drawer
 * @attr {string} position - Edge to slide from: left | right | bottom (default: "right")
 * @attr {string} title - Header title text
 * @attr {boolean} overlay - Show a dimming backdrop behind the panel
 *
 * @fires open - Drawer opened
 * @fires close - Drawer closed
 *
 * @slot - Drawer body content
 *
 * @cssprop {color} --dvfy-drawer-bg - Panel background (default: var(--dvfy-surface-raised))
 * @cssprop {color} --dvfy-drawer-border - Border color (default: var(--dvfy-border-muted))
 * @cssprop {length} --dvfy-drawer-width - Panel width for left/right positions (default: 24rem)
 * @cssprop {length} --dvfy-drawer-height - Panel height for bottom position (default: 50vh)
 */
class DvfyDrawer extends HTMLElement {
  static #styled = false;
  #panel = null;
  #backdrop = null;
  #prevFocus = null;

  connectedCallback() {
    if (!DvfyDrawer.#styled) {
      const s = document.createElement('style');
      s.textContent = DRAWER_STYLES;
      document.head.appendChild(s);
      DvfyDrawer.#styled = true;
    }
    this.#build();
    if (this.hasAttribute('open')) this.#openPanel();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.#onKey);
  }

  static get observedAttributes() {
    return ['open', 'position', 'title', 'overlay'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.isConnected) return;
    if (name === 'open') {
      this.hasAttribute('open') ? this.#openPanel() : this.#closePanel();
    } else {
      this.#rebuild();
    }
  }

  #rebuild() {
    const wasOpen = this.hasAttribute('open');
    // Collect user body content
    const body = this.#panel?.querySelector('.dvfy-drawer__body');
    const children = body ? [...body.childNodes] : [];

    this.#backdrop?.remove();
    this.#panel?.remove();
    this.#backdrop = null;
    this.#panel = null;

    this.#build(children);
    if (wasOpen) this.#openPanel();
  }

  #build(existingChildren = null) {
    // Collect slotted children if not passed in
    const children = existingChildren ?? [...this.childNodes].filter(
      n => !n.classList?.contains('dvfy-drawer__backdrop') &&
           !n.classList?.contains('dvfy-drawer__panel')
    );

    if (!existingChildren) this.textContent = '';

    const position = this.getAttribute('position') || 'right';
    const titleText = this.getAttribute('title') || '';
    const hasOverlay = this.hasAttribute('overlay');

    // ── Backdrop ──
    this.#backdrop = document.createElement('div');
    this.#backdrop.className = 'dvfy-drawer__backdrop';
    if (!hasOverlay) this.#backdrop.style.display = 'none';
    this.#backdrop.setAttribute('aria-hidden', 'true');
    this.#backdrop.addEventListener('click', () => this.removeAttribute('open'));
    this.appendChild(this.#backdrop);

    // ── Panel ──
    this.#panel = document.createElement('div');
    this.#panel.className = 'dvfy-drawer__panel';
    this.#panel.setAttribute('data-position', position);
    this.#panel.setAttribute('role', 'dialog');
    this.#panel.setAttribute('aria-modal', 'true');
    if (titleText) this.#panel.setAttribute('aria-labelledby', 'dvfy-drawer-title');
    this.#panel.inert = true;

    // Header
    const header = document.createElement('div');
    header.className = 'dvfy-drawer__header';

    const title = document.createElement('h2');
    title.className = 'dvfy-drawer__title';
    title.id = 'dvfy-drawer-title';
    title.textContent = titleText;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'dvfy-drawer__close';
    closeBtn.setAttribute('aria-label', 'Close drawer');
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => this.removeAttribute('open'));

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'dvfy-drawer__body';
    for (const child of children) body.appendChild(child);

    this.#panel.appendChild(header);
    this.#panel.appendChild(body);
    this.appendChild(this.#panel);
  }

  #openPanel() {
    this.#prevFocus = document.activeElement;
    this.#panel.inert = false;
    document.addEventListener('keydown', this.#onKey);
    // Focus first focusable element after transition starts
    requestAnimationFrame(() => {
      const focusable = this.#panel?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    });
    this.dispatchEvent(new CustomEvent('open', { bubbles: true }));
  }

  #closePanel() {
    this.#panel.inert = true;
    document.removeEventListener('keydown', this.#onKey);
    this.#prevFocus?.focus();
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
