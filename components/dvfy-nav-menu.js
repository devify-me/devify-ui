import { injectStyles } from '../utils/styles.js';

const NAV_MENU_STYLES = `
dvfy-nav-menu {
  display: flex;
  align-items: stretch;
  gap: var(--dvfy-nav-menu-gap, 0);
  flex: 1;
  justify-content: flex-end;
  margin-bottom: -1px;
  height: 100%;
}
dvfy-nav-menu[orientation="vertical"] {
  flex-direction: column;
  align-items: stretch;
  gap: var(--dvfy-nav-menu-gap, var(--dvfy-space-1));
  margin-bottom: 0;
  height: auto;
  flex: none;
}
dvfy-nav-menu[orientation="vertical"] dvfy-nav {
  display: flex;
}
dvfy-nav-menu[orientation="vertical"] dvfy-nav a.dvfy-nav__link {
  width: 100%;
  padding: var(--dvfy-space-2-5) var(--dvfy-space-5);
  font-size: var(--dvfy-text-base);
  border-bottom: none;
  border-left: 3px solid transparent;
  min-height: auto;
}
dvfy-nav-menu[orientation="vertical"] dvfy-nav[active] a.dvfy-nav__link {
  border-bottom: none;
  border-left-color: var(--dvfy-nav-link-active, var(--dvfy-primary-bg));
  background: color-mix(in srgb, var(--dvfy-primary-bg) 8%, transparent);
}
dvfy-nav-menu[orientation="vertical"] dvfy-nav a.dvfy-nav__link:hover {
  border-bottom: none;
  background: var(--dvfy-hover-bg);
}
`;

/**
 * Navigation link group that arranges dvfy-nav items.
 * Tier 2 composite — groups navigation links horizontally (desktop)
 * or vertically (mobile/drawer context).
 *
 * @element dvfy-nav-menu
 *
 * @attr {string} orientation - Layout direction: horizontal (default) | vertical
 * @attr {string} aria-label - Accessible group label
 * @attr {string} label - Visible text label
 * @attr {string} label-position - Label position: top | right | bottom | left
 *
 * @slot - dvfy-nav elements
 *
 * @cssprop {length} --dvfy-nav-menu-gap - Gap between items (default: 0 horizontal, var(--dvfy-space-1) vertical)
 *
 * @example
 * <dvfy-nav-menu>
 *   <dvfy-nav href="/docs" icon="📖">Docs</dvfy-nav>
 *   <dvfy-nav href="/pricing">Pricing</dvfy-nav>
 * </dvfy-nav-menu>
 */
class DvfyNavMenu extends HTMLElement {
  static get observedAttributes() {
    return ['orientation', 'label', 'label-position'];
  }

  connectedCallback() {
    injectStyles('dvfy-nav-menu', NAV_MENU_STYLES);

    if (!this.getAttribute('role')) {
      this.setAttribute('role', 'navigation');
    }
  }
}

customElements.define('dvfy-nav-menu', DvfyNavMenu);
