/**
 * <dvfy-breadcrumb> — Breadcrumb navigation
 *
 * Attributes:
 *   separator: character between items (default: "/")
 *
 * Usage:
 *   <dvfy-breadcrumb>
 *     <a href="/">Home</a>
 *     <a href="/products">Products</a>
 *     <span>Widget</span>
 *   </dvfy-breadcrumb>
 */

const STYLES = `
dvfy-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
}
dvfy-breadcrumb .dvfy-breadcrumb__sep {
  color: var(--dvfy-text-muted);
  user-select: none;
}
dvfy-breadcrumb a {
  color: var(--dvfy-text-link);
  text-decoration: none;
}
dvfy-breadcrumb a:hover { text-decoration: underline; }
dvfy-breadcrumb > :last-child {
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-medium);
  pointer-events: none;
}
`;

class DvfyBreadcrumb extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyBreadcrumb.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyBreadcrumb.#styled = true;
    }
    this.setAttribute('aria-label', 'Breadcrumb');
    this.#insertSeparators();
  }

  static get observedAttributes() { return ['separator']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#insertSeparators();
  }

  #insertSeparators() {
    // Remove existing separators
    this.querySelectorAll('.dvfy-breadcrumb__sep').forEach(s => s.remove());

    const sep = this.getAttribute('separator') || '/';
    const items = Array.from(this.children).filter(c => !c.classList.contains('dvfy-breadcrumb__sep'));
    const last = items[items.length - 1];
    if (last) last.setAttribute('aria-current', 'page');

    // Insert separators between items
    for (let i = 0; i < items.length - 1; i++) {
      const span = document.createElement('span');
      span.className = 'dvfy-breadcrumb__sep';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = sep;
      items[i].after(span);
    }
  }
}

customElements.define('dvfy-breadcrumb', DvfyBreadcrumb);
