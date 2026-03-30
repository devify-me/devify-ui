const DRAWER_STYLES = `
dvfy-drawer {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  transition: width var(--dvfy-duration-normal, 200ms) var(--dvfy-ease-out, ease-out),
              max-height var(--dvfy-duration-normal, 200ms) var(--dvfy-ease-out, ease-out);
}

/* ── Position: right (default) ── */
dvfy-drawer:not([position]),
dvfy-drawer[position="right"] {
  border-left: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer:not([position])[collapsed],
dvfy-drawer[position="right"][collapsed] {
  width: 0 !important;
  border-left: none;
}

/* ── Position: left ── */
dvfy-drawer[position="left"] {
  border-right: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
}
dvfy-drawer[position="left"][collapsed] {
  width: 0 !important;
  border-right: none;
}

/* ── Position: top ── */
dvfy-drawer[position="top"] {
  width: 100% !important;
  border-bottom: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  border-left: none;
  border-right: none;
}
dvfy-drawer[position="top"][collapsed] {
  max-height: 0 !important;
  border-bottom: none;
}

/* ── Position: bottom ── */
dvfy-drawer[position="bottom"] {
  width: 100% !important;
  border-top: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  border-left: none;
  border-right: none;
}
dvfy-drawer[position="bottom"][collapsed] {
  max-height: 0 !important;
  border-top: none;
}

/* ── Header ── */
.dvfy-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dvfy-space-3, 0.75rem) var(--dvfy-space-4, 1rem);
  border-bottom: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  flex-shrink: 0;
}
.dvfy-drawer__title {
  font-size: var(--dvfy-text-xs, 0.75rem);
  font-weight: var(--dvfy-weight-semibold, 600);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wider, 0.05em);
  color: var(--dvfy-text-muted, #888);
  margin: 0;
}

/* ── Collapse toggle ── */
.dvfy-drawer__toggle {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  border-radius: var(--dvfy-radius-md, 0.375rem);
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  color: var(--dvfy-text-secondary, #666);
  cursor: pointer;
  font-size: var(--dvfy-text-xs, 0.75rem);
  line-height: 1;
  flex-shrink: 0;
  transition: background var(--dvfy-duration-fast, 100ms);
}
.dvfy-drawer__toggle:hover {
  background: var(--dvfy-surface-sunken, #f0f0f0);
}

/* ── Reopen tab (sibling of drawer, visible when collapsed) ── */
.dvfy-drawer__reopen {
  display: none;
  position: absolute;
  z-index: 2;
  padding: var(--dvfy-space-2, 0.5rem) var(--dvfy-space-1, 0.25rem);
  border: var(--dvfy-border-1, 1px) solid var(--dvfy-drawer-border, var(--dvfy-border-muted));
  background: var(--dvfy-drawer-bg, var(--dvfy-surface-raised));
  color: var(--dvfy-text-secondary, #666);
  cursor: pointer;
  font-size: var(--dvfy-text-xs, 0.75rem);
  font-weight: var(--dvfy-weight-semibold, 600);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wider, 0.05em);
  line-height: 1;
  transition: background var(--dvfy-duration-fast, 100ms);
}
.dvfy-drawer__reopen[data-visible] {
  display: block;
}
.dvfy-drawer__reopen:hover {
  background: var(--dvfy-surface-sunken, #f0f0f0);
}

/* Reopen position: right (default) */
.dvfy-drawer__reopen[data-position="right"] {
  top: var(--dvfy-space-2, 0.5rem);
  right: 0;
  writing-mode: vertical-rl;
  border-right: none;
  border-radius: var(--dvfy-radius-md, 0.375rem) 0 0 var(--dvfy-radius-md, 0.375rem);
}

/* Reopen position: left */
.dvfy-drawer__reopen[data-position="left"] {
  top: var(--dvfy-space-2, 0.5rem);
  left: 0;
  writing-mode: vertical-rl;
  border-left: none;
  border-radius: 0 var(--dvfy-radius-md, 0.375rem) var(--dvfy-radius-md, 0.375rem) 0;
}

/* Reopen position: top */
.dvfy-drawer__reopen[data-position="top"] {
  top: 0;
  right: var(--dvfy-space-2, 0.5rem);
  writing-mode: horizontal-tb;
  border-top: none;
  border-radius: 0 0 var(--dvfy-radius-md, 0.375rem) var(--dvfy-radius-md, 0.375rem);
}

/* Reopen position: bottom */
.dvfy-drawer__reopen[data-position="bottom"] {
  bottom: 0;
  right: var(--dvfy-space-2, 0.5rem);
  writing-mode: horizontal-tb;
  border-bottom: none;
  border-radius: var(--dvfy-radius-md, 0.375rem) var(--dvfy-radius-md, 0.375rem) 0 0;
}

/* ── Scrollable body ── */
.dvfy-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--dvfy-space-4, 1rem);
}
`;

/**
 * Collapsible drawer panel for side or bottom content.
 *
 * A reusable panel that slides in from a configurable edge. Supports
 * collapse/expand with an animated transition and a vertical reopen tab
 * that appears when collapsed. Scrollable body for long content while
 * the parent layout stays fixed.
 *
 * @element dvfy-drawer
 *
 * @attr {boolean} collapsed - Collapsed state (reflected)
 * @attr {string} position - Edge position: top | right | bottom | left (default: "right")
 * @attr {string} width - CSS size value for the drawer dimension (default: "clamp(200px, 40%, 320px)")
 * @attr {string} header - Header title and reopen tab text (default: "Panel")
 * @attr {boolean} fixed - Disable collapse toggle and reopen tab (always open)
 * @attr {boolean} no-header - Hide the header bar (for embedding inside other components)
 *
 * @event {CustomEvent} toggle - Fires on collapse/expand, detail: { collapsed }
 *
 * @slot - Default slot for drawer body content
 *
 * @cssprop {color} --dvfy-drawer-bg - Panel background (default: var(--dvfy-surface-raised))
 * @cssprop {color} --dvfy-drawer-border - Border color (default: var(--dvfy-border-muted))
 * @cssprop {length} --dvfy-drawer-width - Override panel width via CSS
 */
class DvfyDrawer extends HTMLElement {
  static #styled = false;

  #reopen = null;

  connectedCallback() {
    if (!DvfyDrawer.#styled) {
      const s = document.createElement('style');
      s.textContent = DRAWER_STYLES;
      document.head.appendChild(s);
      DvfyDrawer.#styled = true;
    }

    this.#applyWidth();
    this.#build();
    this.#onKeyDown = this.#onKeyDown.bind(this);
    this.addEventListener('keydown', this.#onKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKeyDown);
    // Clean up sibling reopen tab
    if (this.#reopen && this.#reopen.parentNode) {
      this.#reopen.remove();
    }
  }

  static get observedAttributes() {
    return ['collapsed', 'header', 'position', 'width', 'fixed', 'no-header'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.isConnected) return;

    if (name === 'collapsed') {
      const collapsed = this.hasAttribute('collapsed');
      if (this.#reopen) {
        this.#reopen.toggleAttribute('data-visible', collapsed);
      }
      this.dispatchEvent(new CustomEvent('toggle', {
        bubbles: true,
        detail: { collapsed },
      }));
      return;
    }

    if (name === 'width') {
      this.#applyWidth();
      return;
    }

    if (name === 'position') {
      this.#applyWidth();
      if (this.#reopen) {
        this.#reopen.setAttribute('data-position', newVal || 'right');
      }
    }

    // For other attribute changes, rebuild
    this.#build();
  }

  #applyWidth() {
    const pos = this.getAttribute('position') || 'right';
    if (pos === 'top' || pos === 'bottom') {
      this.style.removeProperty('width');
      // Explicit max-height required for CSS transition to animate
      this.style.maxHeight = this.getAttribute('width') || 'var(--dvfy-drawer-width, 50vh)';
    } else {
      this.style.removeProperty('max-height');
      this.style.width = this.getAttribute('width') || 'var(--dvfy-drawer-width, clamp(200px, 40%, 320px))';
    }
  }

  #build() {
    // Preserve slotted content
    const children = [...this.childNodes].filter(
      n => !n.classList?.contains('dvfy-drawer__header') &&
           !n.classList?.contains('dvfy-drawer__body')
    );

    this.textContent = '';
    const showHeader = !this.hasAttribute('no-header');
    const collapsible = !this.hasAttribute('fixed');
    const headerText = this.getAttribute('header') || 'Panel';
    const position = this.getAttribute('position') || 'right';

    // ── Header ──
    if (showHeader) {
      const header = document.createElement('div');
      header.className = 'dvfy-drawer__header';

      const title = document.createElement('p');
      title.className = 'dvfy-drawer__title';
      title.textContent = headerText;
      header.appendChild(title);

      if (collapsible) {
        const toggle = document.createElement('button');
        toggle.className = 'dvfy-drawer__toggle';
        toggle.setAttribute('aria-label', 'Collapse panel');
        toggle.setAttribute('title', 'Collapse');
        toggle.textContent = '\u00D7'; // ×
        toggle.addEventListener('click', () => this.#collapse());
        header.appendChild(toggle);
      }

      this.appendChild(header);
    }

    // ── Scrollable body ──
    const body = document.createElement('div');
    body.className = 'dvfy-drawer__body';
    for (const child of children) {
      body.appendChild(child);
    }
    this.appendChild(body);

    // ── Reopen tab (placed as sibling in parent so it's visible when drawer collapses) ──
    if (this.#reopen && this.#reopen.parentNode) {
      this.#reopen.remove();
    }
    this.#reopen = null;

    if (collapsible && this.parentElement) {
      // Ensure parent has relative positioning for absolute reopen tab
      const parentPos = getComputedStyle(this.parentElement).position;
      if (parentPos === 'static') {
        this.parentElement.style.position = 'relative';
      }

      this.#reopen = document.createElement('button');
      this.#reopen.className = 'dvfy-drawer__reopen';
      this.#reopen.setAttribute('data-position', position);
      this.#reopen.textContent = headerText;
      this.#reopen.setAttribute('aria-label', `Open ${headerText.toLowerCase()}`);
      this.#reopen.addEventListener('click', () => this.#expand());

      if (this.hasAttribute('collapsed')) {
        this.#reopen.setAttribute('data-visible', '');
      }

      // Insert as sibling, right before the drawer
      this.parentElement.insertBefore(this.#reopen, this);
    }
  }

  #onKeyDown(e) {
    if (e.key === 'Escape' && !this.hasAttribute('collapsed') && !this.hasAttribute('fixed')) {
      e.stopPropagation();
      this.#collapse();
    }
  }

  #collapse() {
    this.setAttribute('collapsed', '');
  }

  #expand() {
    this.removeAttribute('collapsed');
  }

  get collapsed() { return this.hasAttribute('collapsed'); }
  set collapsed(v) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }
}

customElements.define('dvfy-drawer', DvfyDrawer);
