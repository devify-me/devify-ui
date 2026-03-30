import { sanitizeHref } from '../utils/url.js';
import { injectStyles } from '../utils/styles.js';

let _navBarIdCounter = 0;

const STYLES = `
/* ── Container query context ── */
dvfy-nav-bar {
  container-type: inline-size;
  container-name: dvfy-nav-bar;
  display: block;
  width: 100%;
  font-family: var(--dvfy-font-sans);
  position: relative;
}

/* ── Skip to content (accessibility) ── */
.dvfy-nav-bar__skip {
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
.dvfy-nav-bar__skip:focus { left: var(--dvfy-space-4); }

/* ── Bar ── */
.dvfy-nav-bar__bar {
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
dvfy-nav-bar[sticky] .dvfy-nav-bar__bar {
  position: sticky;
  top: 0;
}
.dvfy-nav-bar__bar--scrolled {
  min-height: 2.75rem;
  box-shadow: var(--dvfy-shadow-md);
}

/* ── Brand ── */
.dvfy-nav-bar__brand {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  text-decoration: none;
  color: var(--dvfy-text-primary);
  flex-shrink: 0;
}
.dvfy-nav-bar__logo {
  height: 1.75rem;
  width: auto;
}
.dvfy-nav-bar__brand-text {
  font-family: var(--dvfy-font-brand);
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  color: var(--dvfy-nav-brand-text, var(--dvfy-text-primary));
  white-space: nowrap;
  line-height: 1.2;
}
.dvfy-nav-bar__tagline {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  white-space: nowrap;
}

/* ── Actions (non-menu children: buttons, theme-switcher, etc.) ── */
.dvfy-nav-bar__actions {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  flex-shrink: 0;
}

/* ── Hamburger (mobile only) ── */
.dvfy-nav-bar__hamburger {
  display: none;
  flex-shrink: 0;
}

/* ── Mobile overlay (backdrop behind drawer) ── */
.dvfy-nav-bar__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: calc(var(--dvfy-z-modal) - 1);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
.dvfy-nav-bar__overlay[data-open] {
  opacity: 1;
  pointer-events: auto;
}

/* ── Mobile drawer wrapper (positions dvfy-drawer as fixed overlay) ── */
.dvfy-nav-bar__mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(80vw, 20rem);
  z-index: var(--dvfy-z-modal);
  transform: translateX(100%);
  transition: transform var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
.dvfy-nav-bar__mobile-drawer[data-open] {
  transform: translateX(0);
}
.dvfy-nav-bar__mobile-drawer dvfy-drawer {
  height: 100%;
  width: 100% !important;
  border-left: var(--dvfy-border-1) solid var(--dvfy-nav-border, var(--dvfy-border-default));
  box-shadow: var(--dvfy-shadow-xl);
}

/* ── Drawer header ── */
.dvfy-nav-bar__drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  flex-shrink: 0;
}

/* ── Drawer actions ── */
.dvfy-nav-bar__drawer-actions {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3) var(--dvfy-space-5);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  margin-top: auto;
}
`;

const NAV_BAR_RESPONSIVE_FN = (id, bp) => `
@container dvfy-nav-bar (max-width: ${bp}px) {
  [data-nav-bar-id="${id}"] dvfy-nav-menu { display: none; }
  [data-nav-bar-id="${id}"] .dvfy-nav-bar__actions { display: none; }
  [data-nav-bar-id="${id}"] .dvfy-nav-bar__hamburger { display: block; }
  [data-nav-bar-id="${id}"] .dvfy-nav-bar__bar { justify-content: space-between; }
}
@container dvfy-nav-bar (min-width: ${bp + 1}px) {
  [data-nav-bar-id="${id}"] .dvfy-nav-bar__mobile-drawer { display: none !important; }
  [data-nav-bar-id="${id}"] .dvfy-nav-bar__overlay { display: none !important; }
}
`;

/**
 * Full responsive navigation bar composing lower-tier components.
 * Tier 3 organism — brand section + dvfy-nav-menu + action items.
 * Mobile breakpoint triggers dvfy-hamburger toggle and dvfy-drawer slide-in.
 *
 * @element dvfy-nav-bar
 *
 * @attr {string} brand - Brand name text
 * @attr {string} logo - Logo image URL
 * @attr {string} href - Brand link destination (default: "/")
 * @attr {string} tagline - Subtitle below brand name
 * @attr {boolean} sticky - Stick to top on scroll
 * @attr {boolean} scroll-shrink - Reduce height and add shadow on scroll
 * @attr {number} breakpoint - Pixel width for mobile collapse (default: 768)
 * @attr {string} animation - Hamburger animation: x | x-rotate-r | x-rotate-l | chevron-left | chevron-right | minus
 *
 * @slot - dvfy-nav-menu for links, other elements treated as actions
 *
 * @cssprop {color} --dvfy-nav-bg - Nav background (default: var(--dvfy-surface-raised))
 * @cssprop {color} --dvfy-nav-border - Bottom border color (default: var(--dvfy-border-default))
 * @cssprop {color} --dvfy-nav-brand-text - Brand name text color (default: var(--dvfy-text-primary))
 * @cssprop {length} --dvfy-nav-height - Bar height (default: 3.5rem)
 *
 * @example
 * <dvfy-nav-bar brand="Devify" sticky scroll-shrink>
 *   <dvfy-nav-menu>
 *     <dvfy-nav href="/docs">Docs</dvfy-nav>
 *     <dvfy-nav href="/pricing">Pricing</dvfy-nav>
 *   </dvfy-nav-menu>
 *   <dvfy-button variant="default" size="sm">Sign In</dvfy-button>
 * </dvfy-nav-bar>
 */
class DvfyNavBar extends HTMLElement {
  #barId = null;
  #bar = null;
  #drawer = null;
  #overlay = null;
  #hamburger = null;
  #scrollHandler = null;
  #onKey = null;

  static get observedAttributes() { return ['brand', 'logo']; }

  connectedCallback() {
    injectStyles('dvfy-nav-bar', STYLES);

    this.#barId = String(++_navBarIdCounter);
    this.setAttribute('data-nav-bar-id', this.#barId);
    const bp = parseInt(this.getAttribute('breakpoint') || '768', 10);
    const rs = document.createElement('style');
    rs.id = `dvfy-nav-bar-responsive-${this.#barId}`;
    rs.textContent = NAV_BAR_RESPONSIVE_FN(this.#barId, bp);
    document.head.appendChild(rs);

    this.#build();
  }

  disconnectedCallback() {
    if (this.#onKey) document.removeEventListener('keydown', this.#onKey);
    if (this.#scrollHandler) window.removeEventListener('scroll', this.#scrollHandler);
    const rs = document.getElementById(`dvfy-nav-bar-responsive-${this.#barId}`);
    if (rs) rs.remove();
  }

  attributeChangedCallback(name) {
    if (name === 'brand') {
      const el = this.querySelector('.dvfy-nav-bar__brand-text');
      if (el) el.textContent = this.getAttribute('brand') || '';
    }
    if (name === 'logo') {
      const img = this.querySelector('.dvfy-nav-bar__logo');
      if (img) img.src = this.getAttribute('logo') || '';
    }
  }

  #build() {
    // Categorize children: dvfy-nav-menu vs action items
    const menus = [];
    const actionItems = [];
    for (const child of Array.from(this.children)) {
      if (child.tagName === 'DVFY-NAV-MENU') {
        menus.push(child);
      } else {
        actionItems.push(child);
      }
    }
    while (this.firstChild) this.removeChild(this.firstChild);

    // Skip-to-content
    const skip = document.createElement('a');
    skip.className = 'dvfy-nav-bar__skip';
    skip.href = '#main-content';
    skip.textContent = 'Skip to content';
    this.appendChild(skip);

    // Bar
    this.#bar = document.createElement('nav');
    this.#bar.className = 'dvfy-nav-bar__bar';
    this.#bar.setAttribute('role', 'navigation');
    this.#bar.setAttribute('aria-label', 'Main navigation');

    this.#bar.appendChild(this.#buildBrand());

    for (const menu of menus) {
      this.#bar.appendChild(menu);
    }

    if (actionItems.length) {
      const actions = document.createElement('div');
      actions.className = 'dvfy-nav-bar__actions';
      for (const item of actionItems) actions.appendChild(item);
      this.#bar.appendChild(actions);
    }

    this.#buildHamburger();
    this.#bar.appendChild(this.#hamburger);
    this.appendChild(this.#bar);

    // Mobile overlay
    this.#overlay = document.createElement('div');
    this.#overlay.className = 'dvfy-nav-bar__overlay';
    this.#overlay.addEventListener('click', () => this.#closeMenu());
    this.appendChild(this.#overlay);

    // Mobile drawer
    this.appendChild(this.#buildMobileDrawer(menus, actionItems));

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
          this.#bar.classList.add('dvfy-nav-bar__bar--scrolled');
        } else {
          this.#bar.classList.remove('dvfy-nav-bar__bar--scrolled');
        }
      };
      window.addEventListener('scroll', this.#scrollHandler, { passive: true });
    }
  }

  #buildBrand() {
    const brand = document.createElement('a');
    brand.className = 'dvfy-nav-bar__brand';
    brand.href = sanitizeHref(this.getAttribute('href') || '/');
    const logoUrl = this.getAttribute('logo');
    if (logoUrl) {
      const img = document.createElement('img');
      img.className = 'dvfy-nav-bar__logo';
      img.src = logoUrl;
      img.alt = this.getAttribute('brand') || 'Logo';
      brand.appendChild(img);
    }
    const brandName = this.getAttribute('brand');
    if (brandName && !logoUrl) {
      const brandWrap = document.createElement('div');
      const txt = document.createElement('span');
      txt.className = 'dvfy-nav-bar__brand-text';
      txt.textContent = brandName;
      brandWrap.appendChild(txt);
      const tagline = this.getAttribute('tagline');
      if (tagline) {
        const sub = document.createElement('span');
        sub.className = 'dvfy-nav-bar__tagline';
        sub.textContent = tagline;
        brandWrap.appendChild(sub);
      }
      brand.appendChild(brandWrap);
    }
    return brand;
  }

  #buildHamburger() {
    this.#hamburger = document.createElement('dvfy-hamburger');
    this.#hamburger.className = 'dvfy-nav-bar__hamburger';
    this.#hamburger.setAttribute('size', 'sm');
    this.#hamburger.setAttribute('aria-label', 'Open menu');
    const animation = this.getAttribute('animation');
    if (animation) {
      this.#hamburger.setAttribute('animation', animation);
    } else {
      const pos = this.getAttribute('drawer-position') || 'right';
      const defaultAnim = (pos === 'left' || pos === 'bottom') ? 'x-rotate-r' : 'x-rotate-l';
      this.#hamburger.setAttribute('animation', defaultAnim);
    }
    this.#hamburger.addEventListener('toggle', (e) => {
      if (e.detail.open) this.#openMenu();
      else this.#closeMenu();
    });
  }

  #buildMobileDrawer(menus, actionItems) {
    const brandName = this.getAttribute('brand');
    const animation = this.getAttribute('animation');

    const drawerWrap = document.createElement('div');
    drawerWrap.className = 'dvfy-nav-bar__mobile-drawer';

    this.#drawer = document.createElement('dvfy-drawer');
    this.#drawer.setAttribute('position', 'right');
    this.#drawer.setAttribute('no-header', '');
    this.#drawer.setAttribute('fixed', '');

    // Drawer header with brand + close button
    const drawerHeader = document.createElement('div');
    drawerHeader.className = 'dvfy-nav-bar__drawer-header';
    const drawerBrand = document.createElement('span');
    drawerBrand.className = 'dvfy-nav-bar__brand-text';
    drawerBrand.textContent = brandName || '';
    drawerHeader.appendChild(drawerBrand);

    const closeBtn = document.createElement('dvfy-hamburger');
    closeBtn.setAttribute('size', 'sm');
    closeBtn.setAttribute('animation', animation || 'x');
    closeBtn.open = true;
    closeBtn.addEventListener('toggle', () => this.#closeMenu());
    drawerHeader.appendChild(closeBtn);

    // Clone nav links for mobile (vertical orientation)
    const mobileMenu = document.createElement('dvfy-nav-menu');
    mobileMenu.setAttribute('orientation', 'vertical');
    mobileMenu.setAttribute('aria-label', 'Mobile navigation');
    for (const menu of menus) {
      for (const nav of menu.querySelectorAll('dvfy-nav')) {
        const clone = nav.cloneNode(true);
        clone.addEventListener('click', () => this.#closeMenu());
        mobileMenu.appendChild(clone);
      }
    }

    // Build drawer content: header → links → actions
    const drawerContent = document.createElement('div');
    drawerContent.style.cssText = 'display:flex;flex-direction:column;height:100%;';
    drawerContent.appendChild(drawerHeader);
    drawerContent.appendChild(mobileMenu);

    if (actionItems.length) {
      const menuActions = document.createElement('div');
      menuActions.className = 'dvfy-nav-bar__drawer-actions';
      for (const item of actionItems) {
        menuActions.appendChild(item.cloneNode(true));
      }
      drawerContent.appendChild(menuActions);
    }

    this.#drawer.appendChild(drawerContent);
    drawerWrap.appendChild(this.#drawer);
    return drawerWrap;
  }

  #openMenu() {
    const drawerWrap = this.querySelector('.dvfy-nav-bar__mobile-drawer');
    if (drawerWrap) drawerWrap.setAttribute('data-open', '');
    this.#overlay.setAttribute('data-open', '');
    this.#hamburger.open = true;
  }

  #closeMenu() {
    const drawerWrap = this.querySelector('.dvfy-nav-bar__mobile-drawer');
    if (drawerWrap) drawerWrap.removeAttribute('data-open');
    this.#overlay.removeAttribute('data-open');
    this.#hamburger.open = false;
  }
}

customElements.define('dvfy-nav-bar', DvfyNavBar);
