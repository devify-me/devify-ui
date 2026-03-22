const STYLES = `
dvfy-header {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  height: 3.5rem;
  padding: 0 var(--dvfy-space-4);
  background: var(--dvfy-surface-muted);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
  font-family: var(--dvfy-font-sans);
  box-sizing: border-box;
  width: 100%;
}
dvfy-header[sticky] {
  position: sticky;
  top: 0;
  z-index: var(--dvfy-z-sticky);
}
.dvfy-header__start {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  flex-shrink: 0;
}
.dvfy-header__brand {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  color: var(--dvfy-text-primary);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}
.dvfy-header__logo {
  height: 2rem;
  width: auto;
}
.dvfy-header__center {
  flex: 1;
  display: flex;
  align-items: center;
}
.dvfy-header__end {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  margin-left: auto;
  flex-shrink: 0;
}
`;

/**
 * Application header bar composing hamburger, brand, and action slots.
 *
 * Children with slot="start" are placed on the left (e.g. dvfy-hamburger).
 * Children with slot="end" are placed on the right (e.g. dvfy-avatar, dvfy-theme-switcher).
 * Remaining children fill the center region.
 *
 * @element dvfy-header
 *
 * @attr {string} brand - Brand name text (shown when no logo is provided)
 * @attr {string} logo - Logo image URL (takes precedence over brand text)
 * @attr {boolean} sticky - Stick to top of viewport via position: sticky
 *
 * @slot start - Left-side content (e.g. dvfy-hamburger)
 * @slot - Default slot for center content
 * @slot end - Right-side content (e.g. dvfy-avatar, dvfy-theme-switcher)
 *
 * @cssprop {color} --dvfy-surface-muted - Header background color
 * @cssprop {color} --dvfy-border-default - Header bottom border color
 * @cssprop {length} --dvfy-z-sticky - z-index when sticky
 *
 * @example
 * <dvfy-header brand="Devify" sticky>
 *   <dvfy-hamburger slot="start"></dvfy-hamburger>
 *   <dvfy-theme-switcher slot="end">
 *     <option value="devify-cyan">Cyan</option>
 *   </dvfy-theme-switcher>
 *   <dvfy-avatar slot="end" name="Jane Doe" status="online"></dvfy-avatar>
 * </dvfy-header>
 */
class DvfyHeader extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyHeader.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyHeader.#styled = true;
    }
    this.setAttribute('role', 'banner');
    this.#build();
  }

  static get observedAttributes() { return ['brand', 'logo', 'sticky']; }

  attributeChangedCallback(name, _, val) {
    if (!this.isConnected) return;
    if (name === 'brand') {
      const el = this.querySelector('.dvfy-header__brand-text');
      if (el) el.textContent = val || '';
    } else if (name === 'logo') {
      const img = this.querySelector('.dvfy-header__logo');
      if (img) { img.src = val || ''; img.alt = this.getAttribute('brand') || 'Logo'; }
    }
  }

  #build() {
    // Distribute children by slot attribute before clearing
    const startChildren = [];
    const endChildren = [];
    const centerChildren = [];

    for (const child of Array.from(this.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const slot = child.getAttribute('slot');
        if (slot === 'start') startChildren.push(child);
        else if (slot === 'end') endChildren.push(child);
        else centerChildren.push(child);
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        centerChildren.push(child);
      }
    }

    this.textContent = '';

    // Start region
    const start = document.createElement('div');
    start.className = 'dvfy-header__start';
    for (const child of startChildren) {
      child.removeAttribute('slot');
      start.appendChild(child);
    }
    this.appendChild(start);

    // Brand
    const logoUrl = this.getAttribute('logo');
    const brand = this.getAttribute('brand');
    if (logoUrl || brand) {
      const brandEl = document.createElement('div');
      brandEl.className = 'dvfy-header__brand';
      if (logoUrl) {
        const img = document.createElement('img');
        img.className = 'dvfy-header__logo';
        img.src = logoUrl;
        img.alt = brand || 'Logo';
        brandEl.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'dvfy-header__brand-text';
        span.textContent = brand;
        brandEl.appendChild(span);
      }
      this.appendChild(brandEl);
    }

    // Center
    if (centerChildren.length) {
      const center = document.createElement('div');
      center.className = 'dvfy-header__center';
      for (const child of centerChildren) center.appendChild(child);
      this.appendChild(center);
    }

    // End region
    const end = document.createElement('div');
    end.className = 'dvfy-header__end';
    for (const child of endChildren) {
      child.removeAttribute('slot');
      end.appendChild(child);
    }
    this.appendChild(end);
  }
}

customElements.define('dvfy-header', DvfyHeader);
