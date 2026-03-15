/**
 * <dvfy-header> — Responsive application header
 *
 * Zones: brand (left), nav (center), actions (right), user (far right)
 * On mobile: nav collapses into animated hamburger menu
 *
 * Attributes:
 *   brand:      Brand name text
 *   logo:       Logo image URL
 *   tagline:    Tagline below brand (mobile header bar)
 *   sticky:     boolean — stick to top on scroll
 *   scroll-shrink: boolean — reduce padding + add shadow on scroll
 *   preset:     default | landing | store | dashboard | docs
 *   breakpoint: px width for mobile (default: 768)
 *
 * Children (slot via data attributes):
 *   <a href="..." data-icon="🏠">Home</a>              → nav zone
 *   <a href="..." data-action data-icon="🛒">Cart</a>  → actions (always visible)
 *   <dvfy-theme-switcher data-action>...</dvfy-theme-switcher> → actions
 *   <dvfy-avatar data-user name="Jorge"></dvfy-avatar>   → user zone
 *   Any element with data-badge="3" gets a count badge
 *
 * Usage:
 *   <dvfy-header brand="Devify.me" logo="/logo.svg" sticky scroll-shrink>
 *     <a href="#buttons" data-icon="🔘">Buttons</a>
 *     <a href="#inputs" data-icon="📝">Inputs</a>
 *     <dvfy-theme-switcher data-action>
 *       <option value="devify-cyan">Cyan</option>
 *     </dvfy-theme-switcher>
 *   </dvfy-header>
 */

let _hdrIdCounter = 0;

// Base styles (injected once, no breakpoint dependency)
const HDR_BASE_STYLES = `
/* ── Container query context ── */
dvfy-header {
  container-type: inline-size;
  container-name: dvfy-header;
  display: block;
}

/* ── Skip to content (accessibility) ── */
.dvfy-hdr__skip {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 9999;
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  text-decoration: none;
  border-radius: 0 0 var(--dvfy-radius-md) var(--dvfy-radius-md);
}
.dvfy-hdr__skip:focus { left: var(--dvfy-space-4); }

/* ── Header container ── */
dvfy-header {
  display: block;
  font-family: var(--dvfy-font-sans);
  position: relative;
}
dvfy-header[sticky] .dvfy-hdr__bar {
  position: sticky;
  top: 0;
}

.dvfy-hdr__bar {
  display: flex;
  align-items: stretch;
  padding: 0 var(--dvfy-space-5);
  background: var(--dvfy-surface-raised);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  z-index: calc(var(--dvfy-z-sticky) + 3);
  gap: var(--dvfy-space-3);
  min-height: 3.25rem;
  transition: padding var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}

/* Scroll-shrink state */
.dvfy-hdr__bar--scrolled {
  min-height: 2.75rem;
  box-shadow: var(--dvfy-shadow-md);
}

/* Landing preset: transparent until scrolled */
dvfy-header[preset="landing"] .dvfy-hdr__bar {
  background: transparent;
  border-bottom-color: transparent;
}
dvfy-header[preset="landing"] .dvfy-hdr__bar--scrolled {
  background: var(--dvfy-surface-raised);
  border-bottom-color: var(--dvfy-border-muted);
}

/* ── Brand ── */
.dvfy-hdr__brand {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  text-decoration: none;
  color: var(--dvfy-text-primary);
  flex-shrink: 0;
  padding: var(--dvfy-space-2) 0;
}
.dvfy-hdr__logo {
  height: 1.75rem;
  width: auto;
}
.dvfy-hdr__brand-text {
  font-family: var(--dvfy-font-brand);
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  line-height: 1.2;
}

/* ── Desktop nav (tab bar) ── */
.dvfy-hdr__nav {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex: 1;
  justify-content: center;
  margin-bottom: -1px; /* overlap the bar's bottom border */
}
.dvfy-hdr__nav-item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-1-5);
  padding: 0 var(--dvfy-space-3);
  color: var(--dvfy-text-secondary);
  text-decoration: none;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  border-bottom: 2px solid transparent;
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  white-space: nowrap;
}
.dvfy-hdr__nav-item:hover {
  color: var(--dvfy-text-primary);
  background: color-mix(in srgb, var(--dvfy-text-primary) 4%, transparent);
  border-bottom-color: var(--dvfy-border-strong);
}
.dvfy-hdr__nav-item--active {
  color: var(--dvfy-primary-bg);
  border-bottom-color: var(--dvfy-primary-bg);
  font-weight: var(--dvfy-weight-semibold);
}
.dvfy-hdr__nav-icon {
  font-size: var(--dvfy-text-base);
}

/* ── Actions zone (right) ── */
.dvfy-hdr__actions {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  flex-shrink: 0;
}
.dvfy-hdr__action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--dvfy-text-secondary);
  text-decoration: none;
  font-size: var(--dvfy-text-xl);
  padding: var(--dvfy-space-1-5);
  border-radius: var(--dvfy-radius-md);
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-hdr__action-item:hover {
  color: var(--dvfy-text-primary);
  background: var(--dvfy-hover-bg);
}

/* Badge on action items */
.dvfy-hdr__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 1rem;
  height: 1rem;
  padding: 0 var(--dvfy-space-1);
  background: var(--dvfy-danger-bg);
  color: var(--dvfy-neutral-0);
  font-size: 0.625rem;
  font-weight: var(--dvfy-weight-bold);
  line-height: 1rem;
  text-align: center;
  border-radius: var(--dvfy-radius-full);
}

/* ── User zone ── */
.dvfy-hdr__user {
  flex-shrink: 0;
  cursor: pointer;
}

/* ── Hamburger trigger (mobile only) ── */
.dvfy-hdr__trigger {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 2.25rem;
  height: 2.25rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--dvfy-radius-md);
  padding: 0;
  flex-shrink: 0;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-hdr__trigger:hover { background: var(--dvfy-hover-bg); }
.dvfy-hdr__trigger:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Animated lines */
.dvfy-hdr__line {
  display: block;
  width: 1.125rem;
  height: 2px;
  background: var(--dvfy-text-primary);
  border-radius: 1px;
  transition: transform var(--dvfy-duration-normal) var(--dvfy-ease-out),
              opacity var(--dvfy-duration-normal) var(--dvfy-ease-out);
  transform-origin: center center;
}

/* ☰ → > (expanded) */
dvfy-header[data-menu="expanded"] .dvfy-hdr__line--top {
  opacity: 0;
  transform: translateX(-3px);
}
dvfy-header[data-menu="expanded"] .dvfy-hdr__line--mid {
  transform: rotate(35deg) translateX(-1px);
}
dvfy-header[data-menu="expanded"] .dvfy-hdr__line--bot {
  transform: rotate(-35deg) translateX(-1px);
}

/* > → ✕ (icons) */
dvfy-header[data-menu="icons"] .dvfy-hdr__line--top {
  opacity: 0;
  transform: translateX(-3px);
}
dvfy-header[data-menu="icons"] .dvfy-hdr__line--mid {
  transform: rotate(45deg) translate(0, 3.5px);
}
dvfy-header[data-menu="icons"] .dvfy-hdr__line--bot {
  transform: rotate(-45deg) translate(0, -3.5px);
}

/* ── Mobile menu panel ── */
.dvfy-hdr__menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: min(80vw, 18rem);
  max-height: calc(100vh - 4rem);
  background: var(--dvfy-surface-raised);
  border-bottom-left-radius: var(--dvfy-radius-2xl);
  box-shadow: var(--dvfy-shadow-xl);
  z-index: calc(var(--dvfy-z-sticky) + 2);
  display: flex;
  flex-direction: column;
  padding: var(--dvfy-space-2) 0;
  overflow-y: auto;
  transform: translateX(100%);
  pointer-events: none;
  transition: transform var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
.dvfy-hdr__menu[data-state="expanded"] {
  transform: translateX(0);
  pointer-events: auto;
}
.dvfy-hdr__menu[data-state="icons"] {
  transform: translateX(calc(100% - 4rem));
  pointer-events: auto;
}

.dvfy-hdr__menu-item {
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
.dvfy-hdr__menu-item:hover { background: var(--dvfy-hover-bg); }
.dvfy-hdr__menu-icon {
  font-size: var(--dvfy-text-xl);
  width: 2rem;
  text-align: center;
  flex-shrink: 0;
}
.dvfy-hdr__menu-sep {
  height: 1px;
  background: var(--dvfy-border-muted);
  margin: var(--dvfy-space-1) var(--dvfy-space-3);
}

/* Menu extras: theme switcher etc placed at bottom of menu */
.dvfy-hdr__menu-extras {
  padding: var(--dvfy-space-3) var(--dvfy-space-5);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  margin-top: var(--dvfy-space-2);
}

/* No overlay — click-outside listener handles menu closing */

/* Default: trigger hidden, menu hidden (desktop behavior) */
.dvfy-hdr__trigger { display: none; }
`;

// Per-instance responsive styles using CSS Container Queries
// Each dvfy-header is its own container context — queries respond to
// the header's width, not the viewport. This means a 375px-wide
// container shows hamburger even on a wide desktop screen.
const HDR_RESPONSIVE_FN = (id, bp) => `
@container dvfy-header (max-width: ${bp}px) {
  [data-hdr-id="${id}"] .dvfy-hdr__nav { display: none; }
  [data-hdr-id="${id}"] .dvfy-hdr__trigger { display: flex; }
  [data-hdr-id="${id}"] .dvfy-hdr__bar {
    justify-content: space-between;
    align-items: center;
    padding: var(--dvfy-space-2) var(--dvfy-space-4);
    min-height: auto;
  }
  [data-hdr-id="${id}"] .dvfy-hdr__brand { padding: 0; }
  [data-hdr-id="${id}"] .dvfy-hdr__actions { gap: var(--dvfy-space-1); }
  [data-hdr-id="${id}"] .dvfy-hdr__actions dvfy-theme-switcher { display: none; }
}
@container dvfy-header (min-width: ${bp + 1}px) {
  [data-hdr-id="${id}"] .dvfy-hdr__menu { display: none !important; }
}
`;

class DvfyHeader extends HTMLElement {
  static #baseStyled = false;
  #hdrId = null;
  #bar = null;
  #trigger = null;
  #menu = null;
  #overlay = null;
  #menuState = 'closed'; // closed | expanded | icons
  #scrollHandler = null;
  #onClickOutside = null;

  static get observedAttributes() { return ['brand', 'logo', 'preset', 'sticky', 'scroll-shrink']; }

  connectedCallback() {
    // Inject base styles once
    if (!DvfyHeader.#baseStyled) {
      const s = document.createElement('style');
      s.id = 'dvfy-hdr-base-style';
      s.textContent = HDR_BASE_STYLES;
      document.head.appendChild(s);
      DvfyHeader.#baseStyled = true;
    }

    // Assign unique ID and inject per-instance responsive styles
    this.#hdrId = String(++_hdrIdCounter);
    this.setAttribute('data-hdr-id', this.#hdrId);
    const bp = parseInt(this.getAttribute('breakpoint') || '768', 10);
    const rs = document.createElement('style');
    rs.id = `dvfy-hdr-responsive-${this.#hdrId}`;
    rs.textContent = HDR_RESPONSIVE_FN(this.#hdrId, bp);
    document.head.appendChild(rs);

    this.#build();
  }

  disconnectedCallback() {
    if (this.#onClickOutside) document.removeEventListener('click', this.#onClickOutside);
    if (this.#scrollHandler) window.removeEventListener('scroll', this.#scrollHandler);
    document.removeEventListener('keydown', this.#onKey);
    // Clean up per-instance responsive style
    const rs = document.getElementById(`dvfy-hdr-responsive-${this.#hdrId}`);
    if (rs) rs.remove();
  }

  #build() {
    // Categorize children
    const navItems = [];
    const actionItems = [];
    let userItem = null;
    const others = [];

    for (const child of Array.from(this.children)) {
      if (child.hasAttribute('data-action')) {
        actionItems.push(child);
      } else if (child.hasAttribute('data-user')) {
        userItem = child;
      } else if (child.tagName === 'A') {
        navItems.push(child);
      } else {
        others.push(child);
      }
    }

    // Clear
    while (this.firstChild) this.removeChild(this.firstChild);
    this.setAttribute('data-menu', 'closed');

    // Skip-to-content
    const skip = document.createElement('a');
    skip.className = 'dvfy-hdr__skip';
    skip.href = '#main-content';
    skip.textContent = 'Skip to content';
    this.appendChild(skip);

    // Bar
    this.#bar = document.createElement('header');
    this.#bar.className = 'dvfy-hdr__bar';

    // Brand
    const brand = document.createElement('a');
    brand.className = 'dvfy-hdr__brand';
    brand.href = '/';
    const logoUrl = this.getAttribute('logo');
    if (logoUrl) {
      const img = document.createElement('img');
      img.className = 'dvfy-hdr__logo';
      img.src = logoUrl;
      img.alt = this.getAttribute('brand') || 'Logo';
      brand.appendChild(img);
    }
    // Only show brand text if no logo (horizontal logos usually include the name)
    const brandName = this.getAttribute('brand');
    if (brandName && !logoUrl) {
      const txt = document.createElement('span');
      txt.className = 'dvfy-hdr__brand-text';
      txt.textContent = brandName;
      brand.appendChild(txt);
    }
    this.#bar.appendChild(brand);

    // Desktop nav
    const nav = document.createElement('nav');
    nav.className = 'dvfy-hdr__nav';
    const currentPath = window.location.pathname + window.location.hash;
    for (const link of navItems) {
      const item = document.createElement('a');
      item.className = 'dvfy-hdr__nav-item';
      item.href = link.getAttribute('href') || '#';
      const icon = link.getAttribute('data-icon');
      if (icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'dvfy-hdr__nav-icon';
        iconEl.textContent = icon;
        item.appendChild(iconEl);
      }
      const label = document.createElement('span');
      label.textContent = link.textContent.trim();
      item.appendChild(label);
      // Active detection
      const href = link.getAttribute('href') || '';
      if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
        item.classList.add('dvfy-hdr__nav-item--active');
      }
      nav.appendChild(item);
    }
    this.#bar.appendChild(nav);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'dvfy-hdr__actions';
    for (const item of actionItems) {
      if (item.tagName === 'A') {
        const act = document.createElement('a');
        act.className = 'dvfy-hdr__action-item';
        act.href = item.getAttribute('href') || '#';
        act.textContent = item.getAttribute('data-icon') || '';
        act.setAttribute('aria-label', item.textContent.trim() || item.getAttribute('data-icon') || '');
        const badge = item.getAttribute('data-badge');
        if (badge) {
          const b = document.createElement('span');
          b.className = 'dvfy-hdr__badge';
          b.textContent = badge;
          act.appendChild(b);
        }
        actions.appendChild(act);
      } else {
        // Non-link action items (e.g. theme-switcher) — move directly
        actions.appendChild(item);
      }
    }
    if (userItem) {
      const user = document.createElement('div');
      user.className = 'dvfy-hdr__user';
      user.appendChild(userItem);
      actions.appendChild(user);
    }

    // Hamburger trigger
    this.#trigger = document.createElement('button');
    this.#trigger.className = 'dvfy-hdr__trigger';
    this.#trigger.setAttribute('aria-label', 'Open menu');
    this.#trigger.setAttribute('aria-expanded', 'false');
    for (const pos of ['top', 'mid', 'bot']) {
      const line = document.createElement('span');
      line.className = `dvfy-hdr__line dvfy-hdr__line--${pos}`;
      this.#trigger.appendChild(line);
    }
    this.#trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.#cycleMenu();
    });
    actions.appendChild(this.#trigger);

    this.#bar.appendChild(actions);
    this.appendChild(this.#bar);

    // Mobile menu
    this.#menu = document.createElement('nav');
    this.#menu.className = 'dvfy-hdr__menu';
    this.#menu.setAttribute('data-state', 'closed');
    this.#menu.setAttribute('role', 'navigation');

    for (let i = 0; i < navItems.length; i++) {
      if (i > 0) {
        const sep = document.createElement('div');
        sep.className = 'dvfy-hdr__menu-sep';
        this.#menu.appendChild(sep);
      }
      const link = navItems[i];
      const item = document.createElement('a');
      item.className = 'dvfy-hdr__menu-item';
      item.href = link.getAttribute('href') || '#';
      const icon = document.createElement('span');
      icon.className = 'dvfy-hdr__menu-icon';
      icon.textContent = link.getAttribute('data-icon') || '';
      item.appendChild(icon);
      const label = document.createElement('span');
      label.textContent = link.textContent.trim();
      item.appendChild(label);
      item.addEventListener('click', () => this.#setMenuState('closed'));
      this.#menu.appendChild(item);
    }

    // Move theme switcher clone into menu as a menu item with icon
    const themeSwitcher = actions.querySelector('dvfy-theme-switcher');
    if (themeSwitcher) {
      const sep = document.createElement('div');
      sep.className = 'dvfy-hdr__menu-sep';
      this.#menu.appendChild(sep);

      const themeOptions = themeSwitcher.querySelectorAll('option');
      const isSingleTheme = themeOptions.length <= 1;

      const themeItem = document.createElement('div');
      themeItem.className = 'dvfy-hdr__menu-item dvfy-hdr__menu-theme';

      const themeIcon = document.createElement('span');
      themeIcon.className = 'dvfy-hdr__menu-icon dvfy-hdr__theme-icon';
      // Show sun/moon based on current mode
      const updateIcon = () => {
        const isDark = (document.documentElement.getAttribute('data-theme') || '').endsWith('-dark');
        themeIcon.textContent = isDark ? '\u{1F319}' : '\u{2600}\uFE0F';
      };
      updateIcon();

      themeItem.appendChild(themeIcon);
      const clone = themeSwitcher.cloneNode(true);

      if (isSingleTheme) {
        // Single theme: icon click toggles dark/light directly
        themeIcon.style.cursor = 'pointer';
        themeIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          const toggle = clone.querySelector('.dvfy-ts__toggle');
          if (toggle) toggle.click();
          setTimeout(updateIcon, 50);
        });
      } else {
        // Multiple themes: icon click opens menu back to expanded for interaction
        themeIcon.style.cursor = 'pointer';
        themeIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.#menuState === 'icons') {
            this.#setMenuState('expanded');
          }
        });
      }
      clone.className = (clone.className || '') + ' dvfy-hdr__theme-switcher-clone';
      themeItem.appendChild(clone);
      this.#menu.appendChild(themeItem);

      // Observe theme changes to update icon
      const observer = new MutationObserver(updateIcon);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    this.appendChild(this.#menu);

    // Click-outside detection (no overlay — dropdowns don't need page dimming)
    this.#onClickOutside = (e) => {
      if (this.#menuState !== 'closed' && !this.contains(e.target)) {
        this.#setMenuState('closed');
      }
    };
    document.addEventListener('click', this.#onClickOutside);

    // Keyboard
    this.#onKey = this.#onKey.bind(this);
    document.addEventListener('keydown', this.#onKey);

    // Scroll shrink
    if (this.hasAttribute('scroll-shrink')) {
      this.#scrollHandler = () => {
        if (window.scrollY > 10) {
          this.#bar.classList.add('dvfy-hdr__bar--scrolled');
        } else {
          this.#bar.classList.remove('dvfy-hdr__bar--scrolled');
        }
      };
      window.addEventListener('scroll', this.#scrollHandler, { passive: true });
    }

    // Re-append non-categorized children
    for (const el of others) this.appendChild(el);
  }

  #onKey(e) {
    if (e.key === 'Escape' && this.#menuState !== 'closed') {
      this.#setMenuState('closed');
    }
  }

  #cycleMenu() {
    const next = { closed: 'expanded', expanded: 'icons', icons: 'closed' };
    this.#setMenuState(next[this.#menuState]);
  }

  #setMenuState(state) {
    this.#menuState = state;
    this.setAttribute('data-menu', state);
    this.#menu.setAttribute('data-state', state);
    this.#trigger.setAttribute('aria-expanded', String(state !== 'closed'));
    const labels = { closed: 'Open menu', expanded: 'Collapse menu', icons: 'Close menu' };
    this.#trigger.setAttribute('aria-label', labels[state]);
    // No overlay to toggle — click-outside listener handles closing
  }
}

customElements.define('dvfy-header', DvfyHeader);
