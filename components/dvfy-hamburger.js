/**
 * <dvfy-hamburger> — Responsive header with 3-stage mobile hamburger menu
 *
 * States (below breakpoint):
 *   closed   — hamburger icon (☰), menu hidden
 *   expanded — arrow icon (▶), full dropdown menu with icons + labels
 *   icons    — X icon (✕), compact icon-only strip
 *
 * Transitions: closed → expanded → icons → closed
 *
 * Above breakpoint: renders as a standard horizontal nav bar.
 *
 * Attributes:
 *   brand:      brand name text
 *   tagline:    smaller text below brand
 *   logo:       image URL for logo (replaces brand text)
 *   breakpoint: pixel width below which hamburger activates (default: 768)
 *
 * Children:
 *   Menu items:    <a data-icon="🏠" href="/home">Home</a>
 *   Utility items: <a href="/cart" data-utility data-icon="🛒"></a>
 *
 * Usage:
 *   <dvfy-hamburger brand="Devify" tagline="build something" logo="/logo.svg">
 *     <a href="/cart" data-utility data-icon="🛒"></a>
 *     <a href="/notifications" data-utility data-icon="🔔"></a>
 *     <a href="/home" data-icon="🏠">Home</a>
 *     <a href="/about" data-icon="🧑">About</a>
 *     <a href="/projects" data-icon="💼">Projects</a>
 *   </dvfy-hamburger>
 */

const HAMBURGER_STYLES_FN = (bp) => `
dvfy-hamburger {
  display: block;
  font-family: var(--dvfy-font-sans);
  position: relative;
}

/* ── Header bar (always visible) ── */
.dvfy-hb__bar {
  display: flex;
  align-items: center;
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text);
  position: relative;
  z-index: var(--dvfy-z-sticky, 100);
  gap: var(--dvfy-space-3);
}

/* ── Brand ── */
.dvfy-hb__brand-group {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  flex-shrink: 0;
  text-decoration: none;
  color: inherit;
}
.dvfy-hb__logo {
  height: 2rem;
  width: auto;
  display: block;
}
.dvfy-hb__brand-text {
  display: flex;
  flex-direction: column;
}
.dvfy-hb__brand {
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  line-height: 1.2;
}
.dvfy-hb__tagline {
  font-size: var(--dvfy-text-xs);
  opacity: 0.8;
  line-height: 1.2;
}

/* ── Utility zone (center) ── */
.dvfy-hb__utility {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
}
.dvfy-hb__utility-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: inherit;
  text-decoration: none;
  font-size: var(--dvfy-text-xl);
  border-radius: var(--dvfy-radius-md);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-hb__utility-item:hover {
  background: rgba(255,255,255,0.15);
}

/* ── Trigger button (hamburger/arrow/X) ── */
.dvfy-hb__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dvfy-primary-text);
  font-size: var(--dvfy-text-2xl);
  border-radius: var(--dvfy-radius-md);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
}
.dvfy-hb__trigger:hover { background: rgba(255,255,255,0.15); }
.dvfy-hb__trigger:focus-visible {
  outline: var(--dvfy-ring-width, 2px) solid var(--dvfy-ring-color, currentColor);
  outline-offset: var(--dvfy-ring-offset, 2px);
}

/* ── Overlay ── */
.dvfy-hb__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: calc(var(--dvfy-z-sticky, 100) + 1);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
.dvfy-hb__overlay--active {
  opacity: 1;
  pointer-events: auto;
}

/* ── Menu panel (absolutely positioned relative to header) ── */
.dvfy-hb__menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: auto;
  min-width: 14rem;
  max-width: min(80vw, 20rem);
  max-height: calc(100vh - 4rem);
  background: var(--dvfy-surface-raised);
  border-bottom-left-radius: var(--dvfy-radius-2xl);
  box-shadow: var(--dvfy-shadow-xl);
  z-index: calc(var(--dvfy-z-sticky, 100) + 2);
  display: flex;
  flex-direction: column;
  padding: var(--dvfy-space-2) 0;
  overflow-y: auto;
  overflow-x: hidden;

  /* Animation */
  opacity: 0;
  transform: translateY(-0.5rem);
  pointer-events: none;
  transition: opacity var(--dvfy-duration-normal) var(--dvfy-ease-out),
              transform var(--dvfy-duration-normal) var(--dvfy-ease-out),
              width var(--dvfy-duration-normal) var(--dvfy-ease-out),
              min-width var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
.dvfy-hb__menu--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* ── Menu items: expanded (icon + label) ── */
.dvfy-hb__item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-3) var(--dvfy-space-5);
  color: var(--dvfy-text-primary);
  text-decoration: none;
  font-size: var(--dvfy-text-base);
  font-weight: var(--dvfy-weight-medium);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  white-space: nowrap;
}
.dvfy-hb__item:hover { background: var(--dvfy-hover-bg); }

.dvfy-hb__icon {
  font-size: var(--dvfy-text-xl);
  width: 2rem;
  text-align: center;
  flex-shrink: 0;
}
.dvfy-hb__label {
  overflow: hidden;
  transition: opacity var(--dvfy-duration-normal) var(--dvfy-ease-out),
              max-width var(--dvfy-duration-normal) var(--dvfy-ease-out);
  max-width: 15rem;
  opacity: 1;
}

/* ── Icons-only state ── */
.dvfy-hb__menu--icons {
  min-width: 4rem;
  width: auto;
  padding: var(--dvfy-space-2);
  gap: var(--dvfy-space-1);
}
.dvfy-hb__menu--icons .dvfy-hb__item {
  justify-content: center;
  padding: var(--dvfy-space-2);
  border-radius: var(--dvfy-radius-lg);
  background: var(--dvfy-surface-sunken);
}
.dvfy-hb__menu--icons .dvfy-hb__item:hover {
  background: var(--dvfy-hover-bg);
}
.dvfy-hb__menu--icons .dvfy-hb__icon {
  width: auto;
}
.dvfy-hb__menu--icons .dvfy-hb__label {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
}

/* ── Separator between items ── */
.dvfy-hb__separator {
  height: 1px;
  background: var(--dvfy-border-muted);
  margin: var(--dvfy-space-1) var(--dvfy-space-3);
}
.dvfy-hb__menu--icons .dvfy-hb__separator {
  display: none;
}

/* ── Desktop: horizontal nav bar ── */
@media (min-width: ${bp + 1}px) {
  .dvfy-hb__trigger { display: none; }
  .dvfy-hb__overlay { display: none !important; }
  .dvfy-hb__menu {
    position: static;
    opacity: 1;
    transform: none;
    pointer-events: auto;
    flex-direction: row;
    align-items: center;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
    max-height: none;
    max-width: none;
    min-width: 0;
    width: auto;
    overflow: visible;
    flex: 1;
    justify-content: center;
    gap: var(--dvfy-space-1);
  }
  .dvfy-hb__menu .dvfy-hb__item {
    color: var(--dvfy-primary-text);
    padding: var(--dvfy-space-2) var(--dvfy-space-3);
    border-radius: var(--dvfy-radius-md);
    font-size: var(--dvfy-text-sm);
    gap: var(--dvfy-space-1-5);
  }
  .dvfy-hb__menu .dvfy-hb__item:hover {
    background: rgba(255,255,255,0.15);
  }
  .dvfy-hb__menu .dvfy-hb__icon {
    font-size: var(--dvfy-text-base);
    width: auto;
  }
  .dvfy-hb__menu .dvfy-hb__label {
    max-width: none;
    opacity: 1;
  }
  .dvfy-hb__separator { display: none; }
  .dvfy-hb__bar {
    gap: var(--dvfy-space-4);
  }
  .dvfy-hb__utility {
    order: 3;
  }
}

/* ── Mobile: hide menu when closed, position relative to component ── */
@media (max-width: ${bp}px) {
  .dvfy-hb__bar {
    justify-content: space-between;
  }
  .dvfy-hb__utility {
    flex: 1;
    justify-content: center;
  }
}
`;

class DvfyHamburger extends HTMLElement {
  static #styled = false;
  static #styleBreakpoint = 0;

  /** @type {'closed'|'expanded'|'icons'} */
  #state = 'closed';
  /** @type {HTMLElement} */
  #bar = null;
  /** @type {HTMLButtonElement} */
  #trigger = null;
  /** @type {HTMLElement} */
  #overlay = null;
  /** @type {HTMLElement} */
  #menu = null;
  /** @type {HTMLElement[]} */
  #menuItems = [];
  /** @type {Function} */
  #boundKeydown = null;

  static get observedAttributes() { return ['brand', 'tagline', 'logo', 'breakpoint']; }

  connectedCallback() {
    const bp = parseInt(this.getAttribute('breakpoint') || '768', 10);
    if (!DvfyHamburger.#styled || DvfyHamburger.#styleBreakpoint !== bp) {
      const old = document.getElementById('dvfy-hb-style');
      if (old) old.remove();
      const s = document.createElement('style');
      s.id = 'dvfy-hb-style';
      s.textContent = HAMBURGER_STYLES_FN(bp);
      document.head.appendChild(s);
      DvfyHamburger.#styled = true;
      DvfyHamburger.#styleBreakpoint = bp;
    }
    this.#build();
  }

  disconnectedCallback() {
    if (this.#overlay && this.#overlay.parentNode) {
      this.#overlay.parentNode.removeChild(this.#overlay);
    }
    if (this.#boundKeydown) {
      document.removeEventListener('keydown', this.#boundKeydown);
    }
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'brand') {
      const el = this.querySelector('.dvfy-hb__brand');
      if (el) el.textContent = this.getAttribute('brand') || '';
    } else if (name === 'tagline') {
      const el = this.querySelector('.dvfy-hb__tagline');
      if (el) el.textContent = this.getAttribute('tagline') || '';
    } else if (name === 'logo') {
      const el = this.querySelector('.dvfy-hb__logo');
      if (el) el.src = this.getAttribute('logo') || '';
    }
  }

  #build() {
    // Capture children before modifying DOM
    const allChildren = Array.from(this.children);
    const menuLinks = [];
    const utilityItems = [];

    for (const child of allChildren) {
      if (child.hasAttribute && child.hasAttribute('data-utility')) {
        utilityItems.push(child);
      } else if (child.tagName === 'A' && child.hasAttribute('data-icon')) {
        menuLinks.push(child);
      }
    }

    // Clear the component
    while (this.firstChild) this.removeChild(this.firstChild);

    // ── Header bar ──
    this.#bar = document.createElement('div');
    this.#bar.className = 'dvfy-hb__bar';

    // Brand group
    const brandGroup = document.createElement('div');
    brandGroup.className = 'dvfy-hb__brand-group';

    const logoUrl = this.getAttribute('logo');
    if (logoUrl) {
      const logoImg = document.createElement('img');
      logoImg.className = 'dvfy-hb__logo';
      logoImg.src = logoUrl;
      logoImg.alt = this.getAttribute('brand') || 'Logo';
      brandGroup.appendChild(logoImg);
    }

    const brandText = this.getAttribute('brand');
    const taglineText = this.getAttribute('tagline');
    if (brandText || taglineText) {
      const textGroup = document.createElement('div');
      textGroup.className = 'dvfy-hb__brand-text';

      if (brandText) {
        const brandEl = document.createElement('span');
        brandEl.className = 'dvfy-hb__brand';
        brandEl.textContent = brandText;
        textGroup.appendChild(brandEl);
      }

      if (taglineText) {
        const tagEl = document.createElement('span');
        tagEl.className = 'dvfy-hb__tagline';
        tagEl.textContent = taglineText;
        textGroup.appendChild(tagEl);
      }

      brandGroup.appendChild(textGroup);
    }

    this.#bar.appendChild(brandGroup);

    // Utility zone (center)
    if (utilityItems.length > 0) {
      const utilityZone = document.createElement('div');
      utilityZone.className = 'dvfy-hb__utility';

      for (const item of utilityItems) {
        const utilEl = document.createElement('a');
        utilEl.className = 'dvfy-hb__utility-item';
        utilEl.href = item.getAttribute('href') || '#';
        // Copy data attributes
        for (const attr of item.attributes) {
          if (attr.name.startsWith('data-') && attr.name !== 'data-utility' && attr.name !== 'data-icon') {
            utilEl.setAttribute(attr.name, attr.value);
          }
        }
        utilEl.textContent = item.getAttribute('data-icon') || '';
        utilEl.setAttribute('aria-label', item.textContent.trim() || item.getAttribute('data-icon') || '');
        utilityZone.appendChild(utilEl);
      }

      this.#bar.appendChild(utilityZone);
    }

    // Trigger button
    this.#trigger = document.createElement('button');
    this.#trigger.className = 'dvfy-hb__trigger';
    this.#trigger.setAttribute('aria-label', 'Open menu');
    this.#trigger.setAttribute('aria-expanded', 'false');
    this.#trigger.textContent = '\u2630'; // hamburger ☰
    this.#trigger.addEventListener('click', () => this.#cycle());
    this.#bar.appendChild(this.#trigger);

    this.appendChild(this.#bar);

    // ── Menu panel (inside component, positioned absolutely) ──
    this.#menu = document.createElement('nav');
    this.#menu.className = 'dvfy-hb__menu';
    this.#menu.setAttribute('role', 'navigation');
    this.#menuItems = [];

    for (let i = 0; i < menuLinks.length; i++) {
      const link = menuLinks[i];

      if (i > 0) {
        const sep = document.createElement('div');
        sep.className = 'dvfy-hb__separator';
        this.#menu.appendChild(sep);
      }

      const item = document.createElement('a');
      item.className = 'dvfy-hb__item';
      item.href = link.getAttribute('href') || '#';

      // Copy data attributes
      for (const attr of link.attributes) {
        if (attr.name.startsWith('data-') && attr.name !== 'data-icon') {
          item.setAttribute(attr.name, attr.value);
        }
      }

      const iconSpan = document.createElement('span');
      iconSpan.className = 'dvfy-hb__icon';
      iconSpan.textContent = link.getAttribute('data-icon') || '';
      item.appendChild(iconSpan);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'dvfy-hb__label';
      labelSpan.textContent = link.textContent.trim();
      item.appendChild(labelSpan);

      item.addEventListener('click', () => this.#close());
      this.#menu.appendChild(item);
      this.#menuItems.push(item);
    }

    this.appendChild(this.#menu);

    // ── Overlay (appended to body for full-screen coverage) ──
    this.#overlay = document.createElement('div');
    this.#overlay.className = 'dvfy-hb__overlay';
    this.#overlay.addEventListener('click', () => this.#close());
    document.body.appendChild(this.#overlay);

    // Keyboard: Escape closes
    this.#boundKeydown = (e) => {
      if (e.key === 'Escape' && this.#state !== 'closed') {
        this.#close();
      }
    };
    document.addEventListener('keydown', this.#boundKeydown);
  }

  #cycle() {
    if (this.#state === 'closed') {
      this.#setState('expanded');
    } else if (this.#state === 'expanded') {
      this.#setState('icons');
    } else {
      this.#setState('closed');
    }
  }

  #close() {
    this.#setState('closed');
  }

  #setState(state) {
    this.#state = state;

    // Trigger icon and aria
    if (state === 'closed') {
      this.#trigger.textContent = '\u2630'; // ☰
      this.#trigger.setAttribute('aria-label', 'Open menu');
      this.#trigger.setAttribute('aria-expanded', 'false');
    } else if (state === 'expanded') {
      this.#trigger.textContent = '\u25B6'; // ▶
      this.#trigger.setAttribute('aria-label', 'Collapse menu');
      this.#trigger.setAttribute('aria-expanded', 'true');
    } else {
      this.#trigger.textContent = '\u2715'; // ✕
      this.#trigger.setAttribute('aria-label', 'Close menu');
      this.#trigger.setAttribute('aria-expanded', 'true');
    }

    // Overlay
    if (state === 'closed') {
      this.#overlay.classList.remove('dvfy-hb__overlay--active');
    } else {
      this.#overlay.classList.add('dvfy-hb__overlay--active');
    }

    // Menu classes
    if (state === 'closed') {
      this.#menu.classList.remove('dvfy-hb__menu--open', 'dvfy-hb__menu--icons');
    } else if (state === 'expanded') {
      this.#menu.classList.add('dvfy-hb__menu--open');
      this.#menu.classList.remove('dvfy-hb__menu--icons');
    } else {
      this.#menu.classList.add('dvfy-hb__menu--open', 'dvfy-hb__menu--icons');
    }
  }
}

customElements.define('dvfy-hamburger', DvfyHamburger);
