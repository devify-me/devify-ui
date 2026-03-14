/**
 * <dvfy-nav> — Top navigation bar
 *
 * Attributes:
 *   sticky: boolean — stick to top on scroll
 *   brand:  brand text in left area
 *
 * Usage:
 *   <dvfy-nav brand="Devify" sticky>
 *     <a href="/docs">Docs</a>
 *     <a href="/pricing">Pricing</a>
 *     <dvfy-button variant="default" size="sm">Sign In</dvfy-button>
 *   </dvfy-nav>
 */

const STYLES = `
dvfy-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--dvfy-space-5);
  height: 3.5rem;
  background: var(--dvfy-surface-primary);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
  font-family: var(--dvfy-font-sans);
  z-index: var(--dvfy-z-sticky);
}
dvfy-nav[sticky] {
  position: sticky;
  top: 0;
}
dvfy-nav .dvfy-nav__brand {
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  color: var(--dvfy-text-primary);
  text-decoration: none;
  white-space: nowrap;
  margin-right: var(--dvfy-space-6);
}
dvfy-nav .dvfy-nav__content {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-4);
  flex: 1;
  justify-content: flex-end;
}
dvfy-nav .dvfy-nav__content a {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-secondary);
  text-decoration: none;
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-nav .dvfy-nav__content a:hover { color: var(--dvfy-text-primary); }
dvfy-nav .dvfy-nav__toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dvfy-text-primary);
  font-size: var(--dvfy-text-xl);
  border-radius: var(--dvfy-radius-md);
}
dvfy-nav .dvfy-nav__toggle:hover { background: var(--dvfy-hover-bg); }
dvfy-nav .dvfy-nav__toggle:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

@media (max-width: 768px) {
  dvfy-nav .dvfy-nav__toggle { display: inline-flex; }
  dvfy-nav .dvfy-nav__content {
    display: none;
    position: absolute;
    top: 3.5rem;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    background: var(--dvfy-surface-primary);
    border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
    padding: var(--dvfy-space-2) var(--dvfy-space-4);
    gap: var(--dvfy-space-1);
    box-shadow: var(--dvfy-shadow-md);
  }
  dvfy-nav .dvfy-nav__content a {
    padding: var(--dvfy-space-2) var(--dvfy-space-2);
    border-radius: var(--dvfy-radius-md);
  }
  dvfy-nav .dvfy-nav__content a:hover { background: var(--dvfy-hover-bg); }
  dvfy-nav[data-menu-open] .dvfy-nav__content { display: flex; }
}
`;

class DvfyNav extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyNav.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyNav.#styled = true;
    }
    this.#build();
  }

  static get observedAttributes() { return ['brand']; }

  attributeChangedCallback(name) {
    if (name === 'brand') {
      const el = this.querySelector('.dvfy-nav__brand');
      if (el) el.textContent = this.getAttribute('brand') || '';
    }
  }

  #build() {
    const children = Array.from(this.childNodes);

    // Brand
    const brand = document.createElement('span');
    brand.className = 'dvfy-nav__brand';
    brand.textContent = this.getAttribute('brand') || '';

    // Hamburger
    const toggle = document.createElement('button');
    toggle.className = 'dvfy-nav__toggle';
    toggle.setAttribute('aria-label', 'Toggle menu');
    toggle.textContent = '\u2630';
    toggle.addEventListener('click', () => {
      this.hasAttribute('data-menu-open')
        ? this.removeAttribute('data-menu-open')
        : this.setAttribute('data-menu-open', '');
    });

    // Content wrapper
    const content = document.createElement('div');
    content.className = 'dvfy-nav__content';
    for (const child of children) content.appendChild(child);

    this.appendChild(brand);
    this.appendChild(content);
    this.appendChild(toggle);
  }
}

customElements.define('dvfy-nav', DvfyNav);
