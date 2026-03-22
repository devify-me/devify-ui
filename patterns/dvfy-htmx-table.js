/**
 * <dvfy-htmx-table> — Server-side sorted, filtered, paginated table via HTMX.
 *
 * Attributes:
 *   src:          base URL for table data
 *   page-param:   pagination parameter (default: "page")
 *   sort-param:   sort parameter (default: "sort")
 *   order-param:  order parameter (default: "order")
 *   search-param: search parameter (default: "q")
 *   searchable:   boolean — shows search input above table
 *   page-size:    items per page (default: "20")
 *
 * Children: a <table> with <thead> defining columns.
 *   Use <th data-sort="column_name"> to enable sorting on that column.
 *
 * Server response requirements:
 *   - Return <tbody> content (rows) as HTML partial
 *   - Include X-Total-Pages or X-Total-Count header for pagination
 *
 * Usage with Go templates:
 *   <dvfy-htmx-table
 *     src="/audit/data"
 *     searchable
 *     page-size="25"
 *   >
 *     <table>
 *       <thead>
 *         <tr>
 *           <th data-sort="timestamp">Time</th>
 *           <th data-sort="event">Event</th>
 *           <th data-sort="caller">Caller</th>
 *           <th>Details</th>
 *         </tr>
 *       </thead>
 *       <tbody>
 *         {{range .Entries}}
 *           <tr>
 *             <td>{{.Timestamp.Format "2006-01-02 15:04"}}</td>
 *             <td>{{.Event}}</td>
 *             <td>{{.Caller}}</td>
 *             <td>{{.Details}}</td>
 *           </tr>
 *         {{end}}
 *       </tbody>
 *     </table>
 *   </dvfy-htmx-table>
 *
 *   <!-- Minimal: just sorting, no search/pagination -->
 *   <dvfy-htmx-table src="/tasks/data">
 *     <table>
 *       <thead>
 *         <tr>
 *           <th data-sort="title">Title</th>
 *           <th data-sort="status">Status</th>
 *           <th data-sort="created_at">Created</th>
 *         </tr>
 *       </thead>
 *       <tbody>{{template "task-rows" .Tasks}}</tbody>
 *     </table>
 *   </dvfy-htmx-table>
 */

const STYLES = `
dvfy-htmx-table {
  display: block;
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-primary);
}
dvfy-htmx-table .dvfy-htmx-table__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dvfy-space-3);
  margin-bottom: var(--dvfy-space-3);
}
dvfy-htmx-table .dvfy-htmx-table__search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 20rem;
  flex: 1;
}
dvfy-htmx-table .dvfy-htmx-table__search-icon {
  position: absolute;
  left: var(--dvfy-space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--dvfy-text-muted);
  pointer-events: none;
  display: flex;
}
dvfy-htmx-table .dvfy-htmx-table__search-icon svg {
  width: 0.875rem;
  height: 0.875rem;
}
dvfy-htmx-table .dvfy-htmx-table__search input {
  width: 100%;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  padding-left: var(--dvfy-space-9);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-input-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-input-border);
  border-radius: var(--dvfy-radius-lg);
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-htmx-table .dvfy-htmx-table__search input::placeholder { color: var(--dvfy-input-placeholder); }
dvfy-htmx-table .dvfy-htmx-table__search input:hover { border-color: var(--dvfy-input-border-hover); }
dvfy-htmx-table .dvfy-htmx-table__search input:focus {
  border-color: var(--dvfy-input-border-focus);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}
dvfy-htmx-table .dvfy-htmx-table__wrapper {
  position: relative;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
dvfy-htmx-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dvfy-text-sm);
}
dvfy-htmx-table th,
dvfy-htmx-table td {
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  text-align: left;
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
}
dvfy-htmx-table th {
  font-weight: var(--dvfy-weight-semibold);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--dvfy-surface-sunken);
  white-space: nowrap;
}
dvfy-htmx-table th[data-sort] {
  cursor: pointer;
  user-select: none;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-htmx-table th[data-sort]:hover {
  background: var(--dvfy-hover-bg);
}
dvfy-htmx-table th[data-sort]:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: -2px;
}
dvfy-htmx-table th .dvfy-htmx-table__sort-indicator {
  margin-left: var(--dvfy-space-1);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}
dvfy-htmx-table th.dvfy-htmx-table__th--active .dvfy-htmx-table__sort-indicator {
  color: var(--dvfy-primary-bg);
}
dvfy-htmx-table tbody tr {
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-htmx-table tbody tr:hover {
  background: var(--dvfy-hover-bg);
}
dvfy-htmx-table.dvfy-htmx-table--loading .dvfy-htmx-table__wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--dvfy-surface-page) 50%, transparent);
  z-index: 1;
  pointer-events: none;
}
dvfy-htmx-table .dvfy-htmx-table__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dvfy-space-3) 0;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
}
dvfy-htmx-table .dvfy-htmx-table__pagination-info {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}
dvfy-htmx-table .dvfy-htmx-table__pagination-buttons {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-1);
}
dvfy-htmx-table .dvfy-htmx-table__page-btn {
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
  font-size: var(--dvfy-text-sm);
  transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  outline: none;
}
dvfy-htmx-table .dvfy-htmx-table__page-btn:hover:not([disabled]):not(.dvfy-htmx-table__page-btn--active) {
  background: var(--dvfy-hover-bg);
  border-color: var(--dvfy-border-strong);
}
dvfy-htmx-table .dvfy-htmx-table__page-btn--active {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text, #fff);
  border-color: var(--dvfy-primary-bg);
}
dvfy-htmx-table .dvfy-htmx-table__page-btn[disabled] {
  color: var(--dvfy-text-disabled);
  cursor: not-allowed;
  pointer-events: none;
}
dvfy-htmx-table .dvfy-htmx-table__page-ellipsis {
  min-width: 2rem;
  text-align: center;
  color: var(--dvfy-text-muted);
}
`;

/**
 * Server-side sorted, filtered, paginated table via HTMX or fetch fallback.
 *
 * @element dvfy-htmx-table
 *
 * @attr {string} src - Base URL for table data
 * @attr {string} page-param - Pagination query parameter (default: "page")
 * @attr {string} sort-param - Sort column query parameter (default: "sort")
 * @attr {string} order-param - Sort order query parameter (default: "order")
 * @attr {string} search-param - Search query parameter (default: "q")
 * @attr {boolean} searchable - Show search input above table
 * @attr {number} page-size - Items per page (default: 20)
 *
 * @slot - A <table> with <thead> defining columns; use <th data-sort="col"> for sortable columns
 *
 * @cssprop {color} --dvfy-surface-sunken - Table header background
 * @cssprop {color} --dvfy-hover-bg - Row hover background
 * @cssprop {color} --dvfy-primary-bg - Active sort indicator and pagination button color
 * @cssprop {color} --dvfy-input-border - Search input border color
 */
class DvfyHtmxTable extends HTMLElement {
  static #styled = false;
  #built = false;
  #table = null;
  #tbody = null;
  #wrapper = null;
  #paginationEl = null;
  #searchInput = null;
  #searchTimer = null;
  #currentPage = 1;
  #totalPages = 1;
  #sortColumn = null;
  #sortOrder = null;
  #searchQuery = '';

  connectedCallback() {
    if (!DvfyHtmxTable.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyHtmxTable.#styled = true;
    }
    this.#enhance();
  }

  disconnectedCallback() {
    if (this.#searchTimer) clearTimeout(this.#searchTimer);
  }

  #enhance() {
    if (this.#built) return;
    this.#table = this.querySelector('table');
    if (!this.#table) return;
    this.#built = true;

    this.#tbody = this.#table.querySelector('tbody');

    // Wrap table in wrapper
    this.#wrapper = document.createElement('div');
    this.#wrapper.className = 'dvfy-htmx-table__wrapper';
    this.#table.parentNode.insertBefore(this.#wrapper, this.#table);
    this.#wrapper.appendChild(this.#table);

    // Controls area (search)
    if (this.hasAttribute('searchable')) {
      const controls = document.createElement('div');
      controls.className = 'dvfy-htmx-table__controls';

      const searchWrap = document.createElement('div');
      searchWrap.className = 'dvfy-htmx-table__search';

      // Search icon
      const iconWrap = document.createElement('span');
      iconWrap.className = 'dvfy-htmx-table__search-icon';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '11');
      circle.setAttribute('cy', '11');
      circle.setAttribute('r', '8');
      svg.appendChild(circle);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '21');
      line.setAttribute('y1', '21');
      line.setAttribute('x2', '16.65');
      line.setAttribute('y2', '16.65');
      svg.appendChild(line);
      iconWrap.appendChild(svg);
      searchWrap.appendChild(iconWrap);

      this.#searchInput = document.createElement('input');
      this.#searchInput.type = 'search';
      this.#searchInput.placeholder = 'Search...';
      this.#searchInput.setAttribute('aria-label', 'Search table');
      this.#searchInput.addEventListener('input', () => this.#onSearchInput());
      searchWrap.appendChild(this.#searchInput);

      controls.appendChild(searchWrap);
      this.insertBefore(controls, this.#wrapper);
    }

    // Init sort headers
    this.#initSortHeaders();

    // Create pagination area
    this.#paginationEl = document.createElement('div');
    this.#paginationEl.className = 'dvfy-htmx-table__pagination';
    this.appendChild(this.#paginationEl);

    // Initial load from server
    this.#fetchData();
  }

  #initSortHeaders() {
    const headers = this.#table.querySelectorAll('th[data-sort]');
    for (const th of headers) {
      // Add sort indicator
      const indicator = document.createElement('span');
      indicator.className = 'dvfy-htmx-table__sort-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      th.appendChild(indicator);

      // Make header keyboard-focusable and activatable
      th.setAttribute('tabindex', '0');
      th.setAttribute('role', 'columnheader');
      th.setAttribute('aria-sort', 'none');

      const activate = () => {
        const column = th.getAttribute('data-sort');
        if (this.#sortColumn === column) {
          this.#sortOrder = this.#sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.#sortColumn = column;
          this.#sortOrder = 'asc';
        }
        this.#currentPage = 1;
        this.#updateSortIndicators();
        this.#fetchData();
      };

      th.addEventListener('click', activate);
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    }
  }

  #updateSortIndicators() {
    const headers = this.#table.querySelectorAll('th[data-sort]');
    for (const th of headers) {
      const indicator = th.querySelector('.dvfy-htmx-table__sort-indicator');
      const column = th.getAttribute('data-sort');
      if (column === this.#sortColumn) {
        th.classList.add('dvfy-htmx-table__th--active');
        indicator.textContent = this.#sortOrder === 'asc' ? '\u25B2' : '\u25BC';
        th.setAttribute('aria-sort', this.#sortOrder === 'asc' ? 'ascending' : 'descending');
      } else {
        th.classList.remove('dvfy-htmx-table__th--active');
        indicator.textContent = '';
        th.setAttribute('aria-sort', 'none');
      }
    }
  }

  #onSearchInput() {
    if (this.#searchTimer) clearTimeout(this.#searchTimer);
    this.#searchTimer = setTimeout(() => {
      this.#searchQuery = this.#searchInput.value.trim();
      this.#currentPage = 1;
      this.#fetchData();
    }, 300);
  }

  #buildUrl() {
    const src = this.getAttribute('src');
    if (!src) return null;

    const url = new URL(src, window.location.origin);
    const pageParam = this.getAttribute('page-param') || 'page';
    const sortParam = this.getAttribute('sort-param') || 'sort';
    const orderParam = this.getAttribute('order-param') || 'order';
    const searchParam = this.getAttribute('search-param') || 'q';

    url.searchParams.set(pageParam, String(this.#currentPage));

    if (this.#sortColumn) {
      url.searchParams.set(sortParam, this.#sortColumn);
      url.searchParams.set(orderParam, this.#sortOrder || 'asc');
    }

    if (this.#searchQuery) {
      url.searchParams.set(searchParam, this.#searchQuery);
    }

    const pageSize = this.getAttribute('page-size') || '20';
    url.searchParams.set('page_size', pageSize);

    return url.toString();
  }

  #fetchData() {
    const url = this.#buildUrl();
    if (!url) return;

    this.classList.add('dvfy-htmx-table--loading');

    if (typeof htmx !== 'undefined' && this.#tbody) {
      // Use HTMX: set up a one-time request on the tbody
      this.#tbody.setAttribute('hx-get', url);
      this.#tbody.setAttribute('hx-swap', 'innerHTML');
      this.#tbody.setAttribute('hx-target', 'this');

      // Listen for response headers to get pagination info
      const onAfterRequest = (e) => {
        this.#tbody.removeEventListener('htmx:afterRequest', onAfterRequest);
        this.classList.remove('dvfy-htmx-table--loading');

        const xhr = e.detail.xhr;
        if (xhr) {
          this.#parsePaginationHeaders(xhr);
        }

        // Clean up hx attributes to prevent re-triggering
        this.#tbody.removeAttribute('hx-get');
        this.#tbody.removeAttribute('hx-swap');
        this.#tbody.removeAttribute('hx-target');
      };

      this.#tbody.addEventListener('htmx:afterRequest', onAfterRequest);
      htmx.process(this.#tbody);
      htmx.trigger(this.#tbody, 'load');
    } else {
      // Fallback: use fetch
      this.#fetchFallback(url);
    }
  }

  async #fetchFallback(url) {
    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      this.#parsePaginationHeaders(response);

      const text = await response.text();

      if (this.#tbody) {
        // Parse with DOMParser, then move nodes safely
        const doc = new DOMParser().parseFromString(
          '<table><tbody>' + text + '</tbody></table>',
          'text/html'
        );
        const newTbody = doc.querySelector('tbody');

        // Clear existing tbody
        while (this.#tbody.firstChild) {
          this.#tbody.removeChild(this.#tbody.firstChild);
        }

        // Move rows from parsed tbody
        if (newTbody) {
          const rows = Array.from(newTbody.childNodes);
          for (const row of rows) {
            this.#tbody.appendChild(document.adoptNode(row));
          }
        }
      }
    } catch (_) {
      // Network error — silently fail, table keeps current state
    } finally {
      this.classList.remove('dvfy-htmx-table--loading');
    }
  }

  #parsePaginationHeaders(responseOrXhr) {
    let totalPages = null;

    // Support both fetch Response and XMLHttpRequest
    const getHeader = (name) => {
      if (responseOrXhr.getResponseHeader) {
        return responseOrXhr.getResponseHeader(name);
      }
      if (responseOrXhr.headers && responseOrXhr.headers.get) {
        return responseOrXhr.headers.get(name);
      }
      return null;
    };

    const totalPagesHeader = getHeader('X-Total-Pages');
    if (totalPagesHeader) {
      totalPages = parseInt(totalPagesHeader, 10);
    } else {
      const totalCountHeader = getHeader('X-Total-Count');
      if (totalCountHeader) {
        const pageSize = parseInt(this.getAttribute('page-size') || '20', 10);
        totalPages = Math.ceil(parseInt(totalCountHeader, 10) / pageSize);
      }
    }

    if (totalPages !== null && totalPages > 0) {
      this.#totalPages = totalPages;
      this.#renderPagination();
    } else {
      // No pagination headers — hide pagination
      this.#paginationEl.textContent = '';
    }
  }

  #renderPagination() {
    this.#paginationEl.textContent = '';

    if (this.#totalPages <= 1) return;

    const pageSize = parseInt(this.getAttribute('page-size') || '20', 10);

    // Info text
    const info = document.createElement('span');
    info.className = 'dvfy-htmx-table__pagination-info';
    const start = (this.#currentPage - 1) * pageSize + 1;
    const end = Math.min(this.#currentPage * pageSize, this.#totalPages * pageSize);
    info.textContent = 'Page ' + this.#currentPage + ' of ' + this.#totalPages;
    this.#paginationEl.appendChild(info);

    // Page buttons
    const buttons = document.createElement('div');
    buttons.className = 'dvfy-htmx-table__pagination-buttons';

    // Previous button
    const prevBtn = this.#createPageBtn('\u2039', this.#currentPage - 1, this.#currentPage <= 1);
    prevBtn.setAttribute('aria-label', 'Previous page');
    buttons.appendChild(prevBtn);

    // Page numbers
    const pages = this.#computePageRange(this.#currentPage, this.#totalPages, 5);
    let last = 0;
    for (const p of pages) {
      if (p - last > 1) {
        const ell = document.createElement('span');
        ell.className = 'dvfy-htmx-table__page-ellipsis';
        ell.textContent = '\u2026';
        buttons.appendChild(ell);
      }
      const btn = this.#createPageBtn(String(p), p, false);
      if (p === this.#currentPage) {
        btn.classList.add('dvfy-htmx-table__page-btn--active');
        btn.setAttribute('aria-current', 'page');
      }
      buttons.appendChild(btn);
      last = p;
    }

    // Next button
    const nextBtn = this.#createPageBtn('\u203A', this.#currentPage + 1, this.#currentPage >= this.#totalPages);
    nextBtn.setAttribute('aria-label', 'Next page');
    buttons.appendChild(nextBtn);

    this.#paginationEl.appendChild(buttons);
  }

  #createPageBtn(text, page, disabled) {
    const btn = document.createElement('button');
    btn.className = 'dvfy-htmx-table__page-btn';
    btn.type = 'button';
    btn.textContent = text;
    if (disabled) {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        if (page < 1 || page > this.#totalPages || page === this.#currentPage) return;
        this.#currentPage = page;
        this.#fetchData();
      });
    }
    return btn;
  }

  #computePageRange(current, total, max) {
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

customElements.define('dvfy-htmx-table', DvfyHtmxTable);
