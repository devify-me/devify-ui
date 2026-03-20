let _navIdCounter = 0;

const NAV_BASE_STYLES = `
/* ── Container query context ── */
dvfy-nav {
  container-type: inline-size;
  container-name: dvfy-nav;
  display: block;
  width: 100%;
  font-family: var(--dvfy-font-sans);
  position: relative;
}

/* ── Skip to content (accessibility) ── */
.dvfy-nav__skip {
  position: absolute;
  left: -9999px;
  top: var(--dvfy-space-2);
  z-index: calc(var(--dvfy-z-sticky) + 1);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-semibold);
  border-radius: 0 0 var(--dvfy-radius-md) var(--dvfy-radius-md);
  text-decoration: none;
}
.dvfy-nav__skip:focus { left: var(--dvfy-space-4); }

/* ── Bar ── */
.dvfy-nav__bar {
  display: flex;
  align-items: center;
  padding: 0 var(--dvfy-space-5);
  min-height: var(--dvfy-nav-height, 3.5rem);
  background: var(--dvfy-nav-bg, var(--dvfy-surface-raised));
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-nav-border, var(--dvfy-border-default));
  z-index: var(--dvfy-z-sticky);
  gap: var(--dvfy-space-3);
  transition: min-height var(--dvfy-duration-normal) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
dvfy-nav[sticky] .dvfy-nav__bar {
  position: sticky;
  top: 0;
}

/* Scroll-shrink state */
.dvfy-nav__bar--scrolled {
  min-height: 2.75rem;
  box-shadow: var(--dvfy-shadow-md);
}

/* ── Brand ── */
.dvfy-nav__brand {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  text-decoration: none;
  color: var(--dvfy-text-primary);
  flex-shrink: 0;
}
.dvfy-nav__logo {
  height: 1.75rem;
  width: auto;
}
.dvfy-nav__brand-text {
  font-family: var(--dvfy-font-brand);
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  white-space: nowrap;
  line-height: 1.2;
}
.dvfy-nav__tagline {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  white-space: nowrap;
}

/* ── Desktop links ── */
.dvfy-nav__links {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex: 1;
  justify-content: flex-end;
  margin-bottom: -1px;
  height: 100%;
}
.dvfy-nav__link {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-1-5);
  padding: 0 var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-nav-link-color, var(--dvfy-text-secondary));
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  white-space: nowrap;
}
.dvfy-nav__link:hover {
  color: var(--dvfy-nav-link-hover, var(--dvfy-text-primary));
  background: color-mix(in srgb, var(--dvfy-text-primary) 4%, transparent);
  border-bottom-color: var(--dvfy-border-strong);
}
.dvfy-nav__link--active {
  color: var(--dvfy-nav-link-active, var(--dvfy-primary-bg));
  border-bottom-color: var(--dvfy-nav-link-active, var(--dvfy-primary-bg));
  font-weight: var(--dvfy-weight-semibold);
}
.dvfy-nav__link-icon {
  font-size: var(--dvfy-text-base);
  line-height: 1;
}

/* ── Actions (non-link children: buttons, theme-switcher, etc.) ── */
.dvfy-nav__actions {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  flex-shrink: 0;
}

/* ── Hamburger (mobile only, hidden by default) ── */
.dvfy-nav__hamburger {
  display: none;
  flex-shrink: 0;
}

/* ── Mobile drawer menu ── */
.dvfy-nav__drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(80vw, 20rem);
  background: var(--dvfy-nav-bg, var(--dvfy-surface-raised));
  border-left: var(--dvfy-border-1) solid var(--dvfy-nav-border, var(--dvfy-border-default));
  box-shadow: var(--dvfy-shadow-xl);
  z-index: var(--dvfy-z-modal);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform var(--dvfy-duration-normal) var(--dvfy-ease-out);
  overflow-y: auto;
}
.dvfy-nav__drawer[data-open] {
  transform: translateX(0);
}

/* Drawer overlay */
.dvfy-nav__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: calc(var(--dvfy-z-modal) - 1);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
.dvfy-nav__overlay[data-open] {
  opacity: 1;
  pointer-events: auto;
}

/* Drawer header (brand + close) */
.dvfy-nav__drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  flex-shrink: 0;
}

.dvfy-nav__menu-item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-2-5) var(--dvfy-space-5);
  color: var(--dvfy-text-primary);
  text-decoration: none;
  font-size: var(--dvfy-text-base);
  font-weight: var(--dvfy-weight-medium);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-nav__menu-item:hover { background: var(--dvfy-hover-bg); }
.dvfy-nav__menu-item--active {
  color: var(--dvfy-nav-link-active, var(--dvfy-primary-bg));
  font-weight: var(--dvfy-weight-semibold);
}
.dvfy-nav__menu-icon {
  font-size: var(--dvfy-text-lg);
  line-height: 1;
}
.dvfy-nav__menu-actions {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3) var(--dvfy-space-5);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  margin-top: auto;
}
`;

const NAV_RESPONSIVE_FN = (id, bp) => `
@container dvfy-nav (max-width: ${bp}px) {
  [data-nav-id="${id}"] .dvfy-nav__links { display: none; }
  [data-nav-id="${id}"] .dvfy-nav__actions { display: none; }
  [data-nav-id="${id}"] .dvfy-nav__hamburger { display: block; }
  [data-nav-id="${id}"] .dvfy-nav__bar { justify-content: space-between; }
}
@container dvfy-nav (min-width: ${bp + 1}px) {
  [data-nav-id="${id}"] .dvfy-nav__drawer { display: none !important; }
  [data-nav-id="${id}"] .dvfy-nav__overlay { display: none !important; }
}
`;

/**
 * Responsive navigation bar composing dvfy-hamburger for animated mobile toggle.
 * Uses container queries for responsive behavior. Mobile menu renders as a
 * slide-in drawer from the right edge.
 *
 * @element dvfy-nav
 *
 * @attr {string} brand - Brand name text
 * @attr {string} logo - Logo image URL
 * @attr {string} href - Brand link destination (default: "/")
 * @attr {string} tagline - Subtitle below brand name
 * @attr {boolean} sticky - Stick to top on scroll
 * @attr {boolean} scroll-shrink - Reduce padding and add shadow on scroll
 * @attr {number} breakpoint - Pixel width for mobile collapse (default: 768)
 * @attr {string} animation - Hamburger animation: x | x-rotate-r | x-rotate-l | chevron-left | chevron-right | minus
 *
 * @slot - Navigation links (<a>) and action elements (buttons, etc.)
 *
 * @cssprop {color} --dvfy-nav-bg - Nav background (default: var(--dvfy-surface-raised))
 * @cssprop {color} --dvfy-nav-border - Bottom border color (default: var(--dvfy-border-default))
 * @cssprop {color} --dvfy-nav-link-color - Link text color (default: var(--dvfy-text-secondary))
 * @cssprop {color} --dvfy-nav-link-hover - Link hover color (default: var(--dvfy-text-primary))
 * @cssprop {color} --dvfy-nav-link-active - Active link indicator (default: var(--dvfy-primary-bg))
 * @cssprop {length} --dvfy-nav-height - Bar height (default: 3.5rem)
 *
 * @example
 * <dvfy-nav brand="Devify" sticky scroll-shrink>
 *   <a href="/docs" data-icon="book">Docs</a>
 *   <a href="/pricing">Pricing</a>
 *   <dvfy-button variant="default" size="sm">Sign In</dvfy-button>
 * </dvfy-nav>
 */
class DvfyNav extends HTMLElement {
  static #baseStyled = false;
  #navId = null;
  #bar = null;
  #drawer = null;
  #overlay = null;
  #hamburger = null;
  #scrollHandler = null;
  #onClickOutside = null;
  #onKey = null;

  static get observedAttributes() { return ['brand', 'logo']; }

  connectedCallback() {
    if (!DvfyNav.#baseStyled) {
      const s = document.createElement('style');
      s.id = 'dvfy-nav-base-style';
      s.textContent = NAV_BASE_STYLES;
      document.head.appendChild(s);
      DvfyNav.#baseStyled = true;
    }

    this.#navId = String(++_navIdCounter);
    this.setAttribute('data-nav-id', this.#navId);
    const bp = parseInt(this.getAttribute('breakpoint') || '768', 10);
    const rs = document.createElement('style');
    rs.id = `dvfy-nav-responsive-${this.#navId}`;
    rs.textContent = NAV_RESPONSIVE_FN(this.#navId, bp);
    document.head.appendChild(rs);

    this.#build();
  }

  disconnectedCallback() {
    if (this.#onClickOutside) document.removeEventListener('click', this.#onClickOutside);
    if (this.#onKey) document.removeEventListener('keydown', this.#onKey);
    if (this.#scrollHandler) window.removeEventListener('scroll', this.#scrollHandler);
    const rs = document.getElementById(`dvfy-nav-responsive-${this.#navId}`);
    if (rs) rs.remove();
  }

  attributeChangedCallback(name) {
    if (name === 'brand') {
      const el = this.querySelector('.dvfy-nav__brand-text');
      if (el) el.textContent = this.getAttribute('brand') || '';
    }
    if (name === 'logo') {
      const img = this.querySelector('.dvfy-nav__logo');
      if (img) img.src = this.getAttribute('logo') || '';
    }
  }

  #build() {
    // Categorize children before clearing
    const navLinks = [];
    const actionItems = [];
    for (const child of Array.from(this.children)) {
      if (child.tagName === 'A' && !child.hasAttribute('data-action')) {
        navLinks.push(child);
      } else {
        actionItems.push(child);
      }
    }
    while (this.firstChild) this.removeChild(this.firstChild);

    // Skip-to-content
    const skip = document.createElement('a');
    skip.className = 'dvfy-nav__skip';
    skip.href = '#main-content';
    skip.textContent = 'Skip to content';
    this.appendChild(skip);

    // Bar
    this.#bar = document.createElement('nav');
    this.#bar.className = 'dvfy-nav__bar';
    this.#bar.setAttribute('role', 'navigation');

    // Brand
    const brand = document.createElement('a');
    brand.className = 'dvfy-nav__brand';
    brand.href = this.getAttribute('href') || '/';
    const logoUrl = this.getAttribute('logo');
    if (logoUrl) {
      const img = document.createElement('img');
      img.className = 'dvfy-nav__logo';
      img.src = logoUrl;
      img.alt = this.getAttribute('brand') || 'Logo';
      brand.appendChild(img);
    }
    const brandName = this.getAttribute('brand');
    if (brandName && !logoUrl) {
      const brandWrap = document.createElement('div');
      const txt = document.createElement('span');
      txt.className = 'dvfy-nav__brand-text';
      txt.textContent = brandName;
      brandWrap.appendChild(txt);
      const tagline = this.getAttribute('tagline');
      if (tagline) {
        const sub = document.createElement('span');
        sub.className = 'dvfy-nav__tagline';
        sub.textContent = tagline;
        brandWrap.appendChild(sub);
      }
      brand.appendChild(brandWrap);
    }
    this.#bar.appendChild(brand);

    // Desktop links
    const links = document.createElement('div');
    links.className = 'dvfy-nav__links';
    const currentPath = window.location.pathname + window.location.hash;
    for (const link of navLinks) {
      const item = document.createElement('a');
      item.className = 'dvfy-nav__link';
      item.href = link.getAttribute('href') || '#';

      // data-icon support
      const icon = link.getAttribute('data-icon');
      if (icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'dvfy-nav__link-icon';
        iconEl.textContent = icon;
        item.appendChild(iconEl);
      }

      const label = document.createElement('span');
      label.textContent = link.textContent.trim();
      item.appendChild(label);

      const href = link.getAttribute('href') || '';
      if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
        item.classList.add('dvfy-nav__link--active');
      }
      links.appendChild(item);
    }
    this.#bar.appendChild(links);

    // Actions (non-link children: buttons, theme-switcher, etc.)
    if (actionItems.length) {
      const actions = document.createElement('div');
      actions.className = 'dvfy-nav__actions';
      for (const item of actionItems) actions.appendChild(item);
      this.#bar.appendChild(actions);
    }

    // Hamburger (dvfy-hamburger primitive)
    this.#hamburger = document.createElement('dvfy-hamburger');
    this.#hamburger.className = 'dvfy-nav__hamburger';
    this.#hamburger.setAttribute('size', 'sm');
    const animation = this.getAttribute('animation');
    if (animation) this.#hamburger.setAttribute('animation', animation);
    this.#hamburger.addEventListener('toggle', (e) => {
      if (e.detail.open) this.#openMenu();
      else this.#closeMenu();
    });
    this.#bar.appendChild(this.#hamburger);

    this.appendChild(this.#bar);

    // ── Mobile drawer ──
    this.#overlay = document.createElement('div');
    this.#overlay.className = 'dvfy-nav__overlay';
    this.#overlay.addEventListener('click', () => this.#closeMenu());
    this.appendChild(this.#overlay);

    this.#drawer = document.createElement('div');
    this.#drawer.className = 'dvfy-nav__drawer';
    this.#drawer.setAttribute('role', 'navigation');
    this.#drawer.setAttribute('aria-label', 'Mobile navigation');

    // Drawer header with brand + close button
    const drawerHeader = document.createElement('div');
    drawerHeader.className = 'dvfy-nav__drawer-header';
    const drawerBrand = document.createElement('span');
    drawerBrand.className = 'dvfy-nav__brand-text';
    drawerBrand.textContent = brandName || '';
    drawerHeader.appendChild(drawerBrand);

    const closeBtn = document.createElement('dvfy-hamburger');
    closeBtn.setAttribute('size', 'sm');
    closeBtn.setAttribute('animation', animation || 'x');
    closeBtn.open = true;
    closeBtn.addEventListener('toggle', () => this.#closeMenu());
    drawerHeader.appendChild(closeBtn);
    this.#drawer.appendChild(drawerHeader);

    // Drawer nav links
    for (const link of navLinks) {
      const item = document.createElement('a');
      item.className = 'dvfy-nav__menu-item';
      item.href = link.getAttribute('href') || '#';

      const icon = link.getAttribute('data-icon');
      if (icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'dvfy-nav__menu-icon';
        iconEl.textContent = icon;
        item.appendChild(iconEl);
      }

      const label = document.createElement('span');
      label.textContent = link.textContent.trim();
      item.appendChild(label);

      const href = link.getAttribute('href') || '';
      if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
        item.classList.add('dvfy-nav__menu-item--active');
      }
      item.addEventListener('click', () => this.#closeMenu());
      this.#drawer.appendChild(item);
    }

    // Clone action items into drawer
    if (actionItems.length) {
      const menuActions = document.createElement('div');
      menuActions.className = 'dvfy-nav__menu-actions';
      for (const item of actionItems) {
        menuActions.appendChild(item.cloneNode(true));
      }
      this.#drawer.appendChild(menuActions);
    }

    this.appendChild(this.#drawer);

    // Click-outside (for desktop dropdown fallback if needed)
    this.#onClickOutside = (e) => {
      if (this.#hamburger.open && !this.contains(e.target) && !this.#drawer.contains(e.target)) {
        this.#closeMenu();
      }
    };
    document.addEventListener('click', this.#onClickOutside);

    // Escape key
    this.#onKey = (e) => {
      if (e.key === 'Escape' && this.#hamburger.open) {
        this.#closeMenu();
      }
    };
    document.addEventListener('keydown', this.#onKey);

    // Scroll shrink
    if (this.hasAttribute('scroll-shrink')) {
      this.#scrollHandler = () => {
        if (window.scrollY > 10) {
          this.#bar.classList.add('dvfy-nav__bar--scrolled');
        } else {
          this.#bar.classList.remove('dvfy-nav__bar--scrolled');
        }
      };
      window.addEventListener('scroll', this.#scrollHandler, { passive: true });
    }
  }

  #openMenu() {
    this.#drawer.setAttribute('data-open', '');
    this.#overlay.setAttribute('data-open', '');
    this.#hamburger.open = true;
  }

  #closeMenu() {
    this.#drawer.removeAttribute('data-open');
    this.#overlay.removeAttribute('data-open');
    this.#hamburger.open = false;
  }
}

customElements.define('dvfy-nav', DvfyNav);
