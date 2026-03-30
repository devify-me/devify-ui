const STYLES = `
dvfy-nav {
  display: inline-flex;
  align-items: center;
}
dvfy-nav a.dvfy-nav__link {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-1-5);
  padding: 0 var(--dvfy-space-3);
  min-height: var(--dvfy-nav-link-height, 100%);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-nav-link-color, var(--dvfy-text-secondary));
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
}
dvfy-nav a.dvfy-nav__link:hover {
  color: var(--dvfy-nav-link-hover, var(--dvfy-text-primary));
  background: color-mix(in srgb, var(--dvfy-text-primary) 4%, transparent);
  border-bottom-color: var(--dvfy-border-strong);
}
dvfy-nav a.dvfy-nav__link:focus-visible {
  outline: 2px solid var(--dvfy-focus-ring);
  outline-offset: -2px;
  border-radius: var(--dvfy-radius-sm);
}
dvfy-nav[active] a.dvfy-nav__link {
  color: var(--dvfy-nav-link-active, var(--dvfy-primary-bg));
  border-bottom-color: var(--dvfy-nav-link-active, var(--dvfy-primary-bg));
  font-weight: var(--dvfy-weight-semibold);
}
dvfy-nav[disabled] a.dvfy-nav__link {
  opacity: 0.5;
  pointer-events: none;
}
.dvfy-nav__icon {
  font-size: var(--dvfy-text-base);
  line-height: 1;
}
`;

/**
 * Single navigation link with active state detection.
 * Tier 1 primitive — a styled anchor with hover/focus states,
 * optional icon, and automatic active indicator based on current URL.
 *
 * @element dvfy-nav
 *
 * @attr {string} href - Link destination URL
 * @attr {string} icon - Icon text displayed before the label
 * @attr {boolean} active - Force active state (auto-detected from URL if omitted)
 * @attr {boolean} disabled - Disable the link
 * @attr {string} label - Visible text label (alternative to slot content)
 * @attr {string} label-position - Label position: top | right | bottom | left
 *
 * @slot - Default slot for link text
 *
 * @cssprop {color} --dvfy-nav-link-color - Link text color (default: var(--dvfy-text-secondary))
 * @cssprop {color} --dvfy-nav-link-hover - Hover text color (default: var(--dvfy-text-primary))
 * @cssprop {color} --dvfy-nav-link-active - Active link color (default: var(--dvfy-primary-bg))
 *
 * @example
 * <dvfy-nav href="/docs" icon="📖">Docs</dvfy-nav>
 */
class DvfyNav extends HTMLElement {
  static #styled = false;
  #autoActive = false; // tracks whether active was set by auto-detection

  static get observedAttributes() {
    return ['href', 'icon', 'active', 'disabled', 'label', 'label-position'];
  }

  connectedCallback() {
    if (!DvfyNav.#styled) {
      const s = document.createElement('style');
      s.id = 'dvfy-nav-style';
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyNav.#styled = true;
    }
    this.#build();
    this.#detectActive();
    window.addEventListener('hashchange', this.#onHashChange);
    window.addEventListener('popstate', this.#onHashChange);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.#onHashChange);
    window.removeEventListener('popstate', this.#onHashChange);
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    const link = this.querySelector('.dvfy-nav__link');
    if (!link) return;

    if (name === 'href') link.href = this.getAttribute('href') || '#';
    if (name === 'icon') this.#updateIcon(link);
    if (name === 'label') this.#updateLabel(link);
    if (name === 'active' || name === 'href') this.#detectActive();
  }

  #onHashChange = () => this.#detectActive();

  #build() {
    while (this.firstChild && !this.firstChild._dvfyBuilt) {
      // Save slot text content before clearing
      break;
    }
    const slotText = this.textContent.trim();
    while (this.firstChild) this.removeChild(this.firstChild);

    const link = document.createElement('a');
    link._dvfyBuilt = true;
    link.className = 'dvfy-nav__link';
    link.href = this.getAttribute('href') || '#';

    this.#updateIcon(link);

    const label = document.createElement('span');
    label.className = 'dvfy-nav__label';
    label.textContent = this.getAttribute('label') || slotText || '';
    link.appendChild(label);

    this.appendChild(link);
  }

  #updateIcon(link) {
    let iconEl = link.querySelector('.dvfy-nav__icon');
    const icon = this.getAttribute('icon');
    if (icon) {
      if (!iconEl) {
        iconEl = document.createElement('span');
        iconEl.className = 'dvfy-nav__icon';
        link.insertBefore(iconEl, link.firstChild);
      }
      iconEl.textContent = icon;
    } else if (iconEl) {
      iconEl.remove();
    }
  }

  #updateLabel(link) {
    const labelEl = link.querySelector('.dvfy-nav__label');
    if (labelEl) labelEl.textContent = this.getAttribute('label') || '';
  }

  #detectActive() {
    // If active is explicitly set by the user (not auto-detection), respect it
    if (this.hasAttribute('active') && !this.#autoActive) return;

    const href = this.getAttribute('href') || '';
    if (!href) return;

    const currentPath = window.location.pathname + window.location.hash;
    const isActive = href && (currentPath === href || currentPath.startsWith(href + '/'));

    if (isActive) {
      this.#autoActive = true;
      this.setAttribute('active', '');
    } else if (this.#autoActive) {
      this.#autoActive = false;
      this.removeAttribute('active');
    }
  }
}

customElements.define('dvfy-nav', DvfyNav);
