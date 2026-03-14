/**
 * <dvfy-table> — Enhanced table wrapper
 *
 * Attributes:
 *   striped:    boolean — alternating row backgrounds
 *   hoverable:  boolean — row hover highlight
 *   compact:    boolean — smaller padding
 *   responsive: boolean — horizontal scroll on overflow
 *
 * Sortable headers: <th data-sort="asc|desc"> get click handlers and indicators
 *
 * Usage:
 *   <dvfy-table striped hoverable responsive>
 *     <table>...</table>
 *   </dvfy-table>
 */

const STYLES = `
dvfy-table {
  display: block;
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-primary);
}

dvfy-table[responsive] {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

dvfy-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dvfy-text-sm);
}

dvfy-table th,
dvfy-table td {
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  text-align: left;
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
}

dvfy-table[compact] th,
dvfy-table[compact] td {
  padding: var(--dvfy-space-1-5) var(--dvfy-space-3);
}

dvfy-table th {
  font-weight: var(--dvfy-weight-semibold);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--dvfy-surface-secondary);
}

/* Sortable headers */
dvfy-table th[data-sort] {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: var(--dvfy-space-8);
}
dvfy-table th[data-sort]:hover {
  background: var(--dvfy-hover-bg);
}
dvfy-table th[data-sort] .dvfy-table__sort {
  position: absolute;
  right: var(--dvfy-space-2);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

/* Striped */
dvfy-table[striped] tbody tr:nth-child(even) {
  background: var(--dvfy-surface-secondary);
}

/* Hoverable */
dvfy-table[hoverable] tbody tr {
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-table[hoverable] tbody tr:hover {
  background: var(--dvfy-hover-bg);
}
`;

class DvfyTable extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyTable.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTable.#styled = true;
    }
    this.#initSort();
  }

  #initSort() {
    const headers = this.querySelectorAll('th[data-sort]');
    for (const th of headers) {
      this.#addSortIndicator(th);
      th.addEventListener('click', () => this.#handleSort(th));
    }
  }

  #addSortIndicator(th) {
    let indicator = th.querySelector('.dvfy-table__sort');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'dvfy-table__sort';
      indicator.setAttribute('aria-hidden', 'true');
      th.appendChild(indicator);
    }
    const dir = th.getAttribute('data-sort');
    indicator.textContent = dir === 'asc' ? '\u25B2' : dir === 'desc' ? '\u25BC' : '\u25B4';
  }

  #handleSort(th) {
    const current = th.getAttribute('data-sort');
    const next = current === 'asc' ? 'desc' : 'asc';

    // Reset siblings
    const siblings = th.parentElement.querySelectorAll('th[data-sort]');
    for (const s of siblings) {
      if (s !== th) {
        s.removeAttribute('data-sort');
        const ind = s.querySelector('.dvfy-table__sort');
        if (ind) ind.textContent = '';
      }
    }

    th.setAttribute('data-sort', next);
    this.#addSortIndicator(th);

    const table = this.querySelector('table');
    if (!table) return;
    const tbody = table.querySelector('tbody') || table;
    const colIndex = Array.from(th.parentElement.children).indexOf(th);
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
      const aText = (a.children[colIndex]?.textContent || '').trim();
      const bText = (b.children[colIndex]?.textContent || '').trim();
      const aNum = parseFloat(aText);
      const bNum = parseFloat(bText);
      const numeric = !isNaN(aNum) && !isNaN(bNum);
      const cmp = numeric ? aNum - bNum : aText.localeCompare(bText);
      return next === 'asc' ? cmp : -cmp;
    });

    for (const row of rows) tbody.appendChild(row);

    this.dispatchEvent(new CustomEvent('sort', {
      detail: { column: colIndex, direction: next },
      bubbles: true
    }));
  }
}

customElements.define('dvfy-table', DvfyTable);
