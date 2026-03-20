/**
 * <dvfy-pagination> — Page navigation
 *
 * Attributes:
 *   total:       total pages
 *   current:     current page (default: 1)
 *   max-visible: max page buttons shown (default: 5)
 *
 * Events:
 *   page-change: { detail: { page: number } }
 *
 * Usage:
 *   <dvfy-pagination total="20" current="3" max-visible="7"></dvfy-pagination>
 */

const STYLES = `
dvfy-pagination {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-1);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
}
dvfy-pagination .dvfy-pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 var(--dvfy-space-1-5);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-md);
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-primary);
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  text-decoration: none;
  transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  outline: none;
}
dvfy-pagination .dvfy-pagination__btn:hover:not([disabled]):not([aria-current]) {
  background: var(--dvfy-hover-bg);
  border-color: var(--dvfy-border-strong);
}
dvfy-pagination .dvfy-pagination__btn:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-pagination .dvfy-pagination__btn[aria-current="page"] {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text);
  border-color: var(--dvfy-primary-bg);
}
dvfy-pagination .dvfy-pagination__btn[disabled] {
  color: var(--dvfy-disabled-text);
  cursor: not-allowed;
  pointer-events: none;
}
dvfy-pagination .dvfy-pagination__ellipsis {
  min-width: 2rem;
  text-align: center;
  color: var(--dvfy-text-muted);
}
`;

/**
 * Page navigation with ellipsis and prev/next controls.
 *
 * @element dvfy-pagination
 *
 * @attr {number} total - Total number of pages
 * @attr {number} current - Current page number (default: 1)
 * @attr {number} max-visible - Maximum page buttons shown (default: 5)
 *
 * @fires page-change - Page changed, detail: { page }
 *
 * @cssprop {color} --dvfy-primary-bg - Active page button background
 * @cssprop {color} --dvfy-primary-text - Active page button text
 */
class DvfyPagination extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyPagination.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyPagination.#styled = true;
    }
    this.setAttribute('role', 'navigation');
    this.setAttribute('aria-label', 'Pagination');
    this.#render();
  }

  static get observedAttributes() { return ['total', 'current', 'max-visible']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  get #total() { return Math.max(1, parseInt(this.getAttribute('total') || '1', 10)); }
  get #current() { return Math.max(1, Math.min(this.#total, parseInt(this.getAttribute('current') || '1', 10))); }
  get #maxVisible() { return parseInt(this.getAttribute('max-visible') || '5', 10); }

  #goTo(page) {
    if (page < 1 || page > this.#total || page === this.#current) return;
    this.setAttribute('current', String(page));
    this.dispatchEvent(new CustomEvent('page-change', { bubbles: true, detail: { page } }));
  }

  #makeBtn(text, page, opts = {}) {
    const btn = document.createElement('button');
    btn.className = 'dvfy-pagination__btn';
    btn.textContent = text;
    if (opts.disabled) {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => this.#goTo(page));
    }
    if (opts.current) btn.setAttribute('aria-current', 'page');
    if (opts.label) btn.setAttribute('aria-label', opts.label);
    return btn;
  }

  #render() {
    this.textContent = '';
    const total = this.#total;
    const current = this.#current;
    const max = this.#maxVisible;

    // Prev
    this.appendChild(this.#makeBtn('\u2039', current - 1, { disabled: current <= 1, label: 'Previous page' }));

    // Compute visible range
    const pages = this.#computeRange(current, total, max);
    let last = 0;
    for (const p of pages) {
      if (p - last > 1) {
        const ell = document.createElement('span');
        ell.className = 'dvfy-pagination__ellipsis';
        ell.textContent = '\u2026';
        this.appendChild(ell);
      }
      this.appendChild(this.#makeBtn(String(p), p, { current: p === current }));
      last = p;
    }

    // Next
    this.appendChild(this.#makeBtn('\u203a', current + 1, { disabled: current >= total, label: 'Next page' }));
  }

  #computeRange(current, total, max) {
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total]);
    const half = Math.floor((max - 2) / 2);
    const start = Math.max(2, current - half);
    const end = Math.min(total - 1, start + max - 3);
    const adjustedStart = Math.max(2, end - (max - 3));
    for (let i = adjustedStart; i <= end; i++) pages.add(i);
    return Array.from(pages).sort((a, b) => a - b);
  }
}

customElements.define('dvfy-pagination', DvfyPagination);
