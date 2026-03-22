/**
 * <dvfy-table> — Enhanced data table wrapper
 *
 * Attributes:
 *   striped:    boolean — alternating row backgrounds
 *   hoverable:  boolean — row hover highlight
 *   compact:    boolean — smaller padding
 *   responsive: boolean — horizontal scroll on overflow
 *   selectable: boolean — checkbox column with select-all
 *   filterable: boolean — Excel-style dropdown filters on data-filter columns
 *   searchable: boolean — global search input above table
 *
 * Sortable headers: <th data-sort> get click handlers and indicators
 * Filterable headers: <th data-filter> get dropdown filter icons
 *
 * Events:
 *   sort             — { column, direction }
 *   selection-change  — { selected: number[] } (original row indices)
 *   filter-change     — { filters: { column: string[] }[] } active filters
 *
 * Usage:
 *   <dvfy-table striped hoverable responsive selectable searchable filterable>
 *     <table>
 *       <thead><tr><th data-sort data-filter>Name</th>...</tr></thead>
 *       <tbody><tr><td>...</td></tr></tbody>
 *     </table>
 *   </dvfy-table>
 */

const STYLES = `
dvfy-table {
  display: block;
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-primary);
}

.dvfy-table__wrapper {
  width: 100%;
}
dvfy-table[responsive] .dvfy-table__wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.dvfy-table__search {
  margin-bottom: var(--dvfy-space-3);
}
.dvfy-table__search input {
  width: 100%;
  max-width: 20rem;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-table__search input::placeholder { color: var(--dvfy-text-muted); }
.dvfy-table__search input:focus {
  border-color: var(--dvfy-border-focus);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
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
  background: var(--dvfy-surface-sunken);
  position: relative;
}

/* Sortable headers */
dvfy-table th[data-sort] {
  cursor: pointer;
  user-select: none;
}
dvfy-table th[data-sort]:hover {
  background: var(--dvfy-hover-bg);
}
dvfy-table th[data-sort] .dvfy-table__sort {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  margin-left: var(--dvfy-space-1);
}

/* Header cell content layout */
.dvfy-table__th-content {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-1);
}
.dvfy-table__th-text {
  flex: 1;
  min-width: 0;
}

/* Filter icon in header — CSS funnel (three horizontal lines of decreasing width) */
.dvfy-table__filter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: var(--dvfy-radius-sm);
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  margin-left: auto;
  position: relative;
  flex-direction: column;
  gap: 2px;
}
.dvfy-table__filter-icon .dvfy-table__filter-line {
  display: block;
  height: 1.5px;
  background: var(--dvfy-text-muted);
  border-radius: 1px;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-table__filter-icon .dvfy-table__filter-line:nth-child(1) { width: 10px; }
.dvfy-table__filter-icon .dvfy-table__filter-line:nth-child(2) { width: 7px; }
.dvfy-table__filter-icon .dvfy-table__filter-line:nth-child(3) { width: 4px; }
.dvfy-table__filter-icon:hover {
  background: var(--dvfy-hover-bg);
}
.dvfy-table__filter-icon:hover .dvfy-table__filter-line {
  background: var(--dvfy-text-primary);
}
.dvfy-table__filter-icon--active {
  background: var(--dvfy-primary-bg);
}
.dvfy-table__filter-icon--active .dvfy-table__filter-line {
  background: var(--dvfy-primary-text, #fff);
}
.dvfy-table__filter-icon--active:hover {
  background: var(--dvfy-primary-hover);
}
.dvfy-table__filter-icon--active:hover .dvfy-table__filter-line {
  background: var(--dvfy-primary-text, #fff);
}

/* Filter dropdown panel */
.dvfy-table__filter-panel {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 12rem;
  max-width: 18rem;
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  box-shadow: var(--dvfy-shadow-lg);
  z-index: var(--dvfy-z-dropdown, 1000);
  padding: var(--dvfy-space-2);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1);
}

/* Filter search input */
.dvfy-table__filter-search {
  width: 100%;
  font-family: inherit;
  font-size: var(--dvfy-text-xs);
  padding: var(--dvfy-space-1-5) var(--dvfy-space-2);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-surface-page);
  border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  border-radius: var(--dvfy-radius-md);
  outline: none;
  box-sizing: border-box;
}
.dvfy-table__filter-search::placeholder { color: var(--dvfy-text-muted); }
.dvfy-table__filter-search:focus {
  border-color: var(--dvfy-border-focus);
}

/* Filter quick actions */
.dvfy-table__filter-actions-top {
  display: flex;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-1) 0;
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}
.dvfy-table__filter-actions-top button {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-primary-bg);
  cursor: pointer;
  text-decoration: underline;
}
.dvfy-table__filter-actions-top button:hover {
  color: var(--dvfy-primary-hover);
}

/* Filter value list */
.dvfy-table__filter-list {
  max-height: 12rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Filter item row */
.dvfy-table__filter-item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-1) var(--dvfy-space-1);
  border-radius: var(--dvfy-radius-sm);
  cursor: pointer;
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-primary);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  user-select: none;
}
.dvfy-table__filter-item:hover {
  background: var(--dvfy-hover-bg);
}
.dvfy-table__filter-item input[type="checkbox"] {
  width: 0.875rem;
  height: 0.875rem;
  margin: 0;
  cursor: pointer;
  accent-color: var(--dvfy-primary-bg);
  flex-shrink: 0;
}
.dvfy-table__filter-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Striped */
dvfy-table[striped] tbody tr:nth-child(even) {
  background: var(--dvfy-surface-sunken);
}

/* Hoverable */
dvfy-table[hoverable] tbody tr {
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-table[hoverable] tbody tr:hover {
  background: var(--dvfy-hover-bg);
}

/* Selection */
.dvfy-table__checkbox {
  width: 2.5rem;
  text-align: center;
  padding-left: var(--dvfy-space-2);
  padding-right: var(--dvfy-space-2);
}
.dvfy-table__checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--dvfy-primary-bg);
}
.dvfy-table__row--selected {
  background: var(--dvfy-selected-bg) !important;
}
`;

/**
 * Enhanced data table with sorting, filtering, selection, and global search.
 *
 * @element dvfy-table
 *
 * @attr {boolean} striped - Alternating row backgrounds
 * @attr {boolean} hoverable - Row hover highlight
 * @attr {boolean} compact - Smaller cell padding
 * @attr {boolean} responsive - Horizontal scroll on overflow
 * @attr {boolean} selectable - Checkbox column with select-all
 * @attr {boolean} filterable - Excel-style dropdown filters on data-filter columns
 * @attr {boolean} searchable - Global search input above table
 *
 * @fires sort - Column sorted, detail: { column, direction }
 * @fires selection-change - Row selection changed, detail: { selected: number[] }
 * @fires filter-change - Column filter changed, detail: { column, values }
 *
 * @slot - A <table> element with <thead> and <tbody>
 *
 * @cssprop {color} --dvfy-surface-sunken - Header row background
 * @cssprop {color} --dvfy-hover-bg - Row hover background
 * @cssprop {color} --dvfy-primary-bg - Active filter icon and sort indicator color
 * @cssprop {color} --dvfy-selected-bg - Selected row background
 *
 * @example
 * <dvfy-table striped hoverable responsive selectable searchable>
 *   <table>
 *     <thead><tr><th data-sort>Name</th><th data-sort>Role</th></tr></thead>
 *     <tbody>
 *       <tr><td>Alice</td><td>Engineer</td></tr>
 *       <tr><td>Bob</td><td>Designer</td></tr>
 *     </tbody>
 *   </table>
 * </dvfy-table>
 */
class DvfyTable extends HTMLElement {
  static #styled = false;

  /** @type {Map<number, boolean>} original row index -> selected */
  #selection = new Map();
  /** @type {HTMLInputElement|null} */
  #selectAllCb = null;
  /** @type {HTMLInputElement|null} */
  #searchInput = null;
  /** @type {HTMLTableRowElement[]} original body rows in DOM order */
  #originalRows = [];
  /** @type {Map<HTMLTableRowElement, number>} row element -> original index */
  #rowIndexMap = new Map();

  /** @type {Map<number, { icon: HTMLElement, panel: HTMLElement|null, checkedValues: Set<string>|null, allValues: string[], checkboxes: Array|null }>} col index -> filter state */
  #columnFilters = new Map();
  /** @type {HTMLElement|null} currently open filter panel */
  #openPanel = null;
  /** @type {number|null} currently open filter column index */
  #openCol = null;

  /** Bound handlers for cleanup */
  #boundOutsideClick = null;
  #boundEscapeKey = null;

  connectedCallback() {
    if (!DvfyTable.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyTable.#styled = true;
    }
    this.#enhance();
  }

  disconnectedCallback() {
    this.#closeFilterPanel();
    if (this.#boundOutsideClick) {
      document.removeEventListener('mousedown', this.#boundOutsideClick);
    }
    if (this.#boundEscapeKey) {
      document.removeEventListener('keydown', this.#boundEscapeKey);
    }
  }

  #enhance() {
    const table = this.querySelector('table');
    if (!table) return;

    const tbody = table.querySelector('tbody') || table;
    this.#originalRows = Array.from(tbody.querySelectorAll('tr'));
    this.#originalRows.forEach((row, i) => this.#rowIndexMap.set(row, i));

    // Wrap table in wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = 'dvfy-table__wrapper';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    // Searchable: add search input above wrapper
    if (this.hasAttribute('searchable')) {
      this.#initSearch(wrapper);
    }

    // Selectable: inject checkbox column
    if (this.hasAttribute('selectable')) {
      this.#initSelectable(table);
    }

    // Filterable: add filter icons to data-filter headers
    if (this.hasAttribute('filterable')) {
      this.#initFilterable(table);
    }

    // Sortable: init sort handlers
    this.#initSort(table);

    // Global listeners for closing panels
    this.#boundOutsideClick = (e) => this.#handleOutsideClick(e);
    this.#boundEscapeKey = (e) => this.#handleEscapeKey(e);
    document.addEventListener('mousedown', this.#boundOutsideClick);
    document.addEventListener('keydown', this.#boundEscapeKey);
  }

  #initSearch(wrapper) {
    const div = document.createElement('div');
    div.className = 'dvfy-table__search';
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Search table\u2026';
    input.setAttribute('aria-label', 'Search table');
    input.addEventListener('input', () => this.#applyAllFilters());
    div.appendChild(input);
    this.insertBefore(div, wrapper);
    this.#searchInput = input;
  }

  #initSelectable(table) {
    const thead = table.querySelector('thead');
    if (thead) {
      const headerRow = thead.querySelector('tr');
      if (headerRow) {
        const th = document.createElement('th');
        th.className = 'dvfy-table__checkbox';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.setAttribute('aria-label', 'Select all rows');
        cb.addEventListener('change', () => this.#toggleSelectAll(cb.checked));
        th.appendChild(cb);
        headerRow.insertBefore(th, headerRow.firstChild);
        this.#selectAllCb = cb;
      }
    }

    for (const row of this.#originalRows) {
      const td = document.createElement('td');
      td.className = 'dvfy-table__checkbox';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.setAttribute('aria-label', 'Select row');
      const idx = this.#rowIndexMap.get(row);
      cb.addEventListener('change', () => {
        if (cb.checked) {
          this.#selection.set(idx, true);
          row.classList.add('dvfy-table__row--selected');
        } else {
          this.#selection.delete(idx);
          row.classList.remove('dvfy-table__row--selected');
        }
        this.#syncSelectAll();
        this.#emitSelection();
      });
      td.appendChild(cb);
      row.insertBefore(td, row.firstChild);
    }
  }

  #toggleSelectAll(checked) {
    for (const row of this.#originalRows) {
      if (row.style.display === 'none') continue;
      const cb = row.querySelector('.dvfy-table__checkbox input[type="checkbox"]');
      if (!cb) continue;
      cb.checked = checked;
      const idx = this.#rowIndexMap.get(row);
      if (checked) {
        this.#selection.set(idx, true);
        row.classList.add('dvfy-table__row--selected');
      } else {
        this.#selection.delete(idx);
        row.classList.remove('dvfy-table__row--selected');
      }
    }
    this.#emitSelection();
  }

  #syncSelectAll() {
    if (!this.#selectAllCb) return;
    const visible = this.#originalRows.filter(r => r.style.display !== 'none');
    const checkedCount = visible.filter(r => {
      const cb = r.querySelector('.dvfy-table__checkbox input[type="checkbox"]');
      return cb && cb.checked;
    }).length;
    this.#selectAllCb.checked = visible.length > 0 && checkedCount === visible.length;
    this.#selectAllCb.indeterminate = checkedCount > 0 && checkedCount < visible.length;
  }

  #emitSelection() {
    const selected = Array.from(this.#selection.keys()).sort((a, b) => a - b);
    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: { selected },
      bubbles: true
    }));
  }

  #initFilterable(table) {
    const thead = table.querySelector('thead');
    if (!thead) return;
    const headerRow = thead.querySelector('tr');
    if (!headerRow) return;

    const headerCells = Array.from(headerRow.children);
    for (let i = 0; i < headerCells.length; i++) {
      const th = headerCells[i];

      // Skip the injected checkbox column
      if (th.classList.contains('dvfy-table__checkbox')) continue;

      if (!th.hasAttribute('data-filter')) continue;

      const dataColIndex = this.hasAttribute('selectable') ? i - 1 : i;

      // Collect unique values for this column
      const allValues = this.#collectColumnValues(dataColIndex);

      // Wrap th content in a flex container
      const contentWrap = document.createElement('span');
      contentWrap.className = 'dvfy-table__th-content';

      const textWrap = document.createElement('span');
      textWrap.className = 'dvfy-table__th-text';

      // Move existing children into text wrap
      while (th.firstChild) {
        textWrap.appendChild(th.firstChild);
      }
      contentWrap.appendChild(textWrap);

      // Create filter icon — CSS funnel with three lines
      const icon = document.createElement('span');
      icon.className = 'dvfy-table__filter-icon';
      icon.setAttribute('aria-label', 'Filter column');
      icon.setAttribute('role', 'button');
      icon.setAttribute('tabindex', '0');

      const line1 = document.createElement('span');
      line1.className = 'dvfy-table__filter-line';
      const line2 = document.createElement('span');
      line2.className = 'dvfy-table__filter-line';
      const line3 = document.createElement('span');
      line3.className = 'dvfy-table__filter-line';
      icon.appendChild(line1);
      icon.appendChild(line2);
      icon.appendChild(line3);

      icon.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent sort from triggering
        this.#toggleFilterPanel(dataColIndex, th);
      });
      icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          this.#toggleFilterPanel(dataColIndex, th);
        }
      });

      contentWrap.appendChild(icon);
      th.appendChild(contentWrap);

      this.#columnFilters.set(dataColIndex, {
        icon,
        panel: null,
        checkedValues: null, // null = all selected (no active filter)
        allValues,
        checkboxes: null
      });
    }
  }

  /** Extract unique sorted values from a data column */
  #collectColumnValues(dataColIndex) {
    const valueSet = new Set();
    for (const row of this.#originalRows) {
      const cells = Array.from(row.children);
      const dataCells = this.hasAttribute('selectable') ? cells.slice(1) : cells;
      const cell = dataCells[dataColIndex];
      if (cell) {
        const text = cell.textContent.trim();
        if (text) valueSet.add(text);
      }
    }
    return Array.from(valueSet).sort((a, b) => a.localeCompare(b));
  }

  #toggleFilterPanel(colIndex, th) {
    if (this.#openCol === colIndex) {
      this.#closeFilterPanel();
      return;
    }
    this.#closeFilterPanel();
    this.#openFilterPanel(colIndex, th);
  }

  #openFilterPanel(colIndex, th) {
    const filterState = this.#columnFilters.get(colIndex);
    if (!filterState) return;

    const panel = document.createElement('div');
    panel.className = 'dvfy-table__filter-panel';

    // Search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dvfy-table__filter-search';
    searchInput.placeholder = 'Search\u2026';
    searchInput.setAttribute('aria-label', 'Search filter values');
    panel.appendChild(searchInput);

    // Quick actions: Select All / Clear All
    const actionsTop = document.createElement('div');
    actionsTop.className = 'dvfy-table__filter-actions-top';

    const selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.textContent = 'Select All';

    const clearAllBtn = document.createElement('button');
    clearAllBtn.type = 'button';
    clearAllBtn.textContent = 'Clear All';

    actionsTop.appendChild(selectAllBtn);
    actionsTop.appendChild(clearAllBtn);
    panel.appendChild(actionsTop);

    // Value list
    const list = document.createElement('div');
    list.className = 'dvfy-table__filter-list';

    // Determine which values are currently checked
    const currentChecked = filterState.checkedValues
      ? new Set(filterState.checkedValues)
      : new Set(filterState.allValues);

    const checkboxes = [];

    for (const value of filterState.allValues) {
      const item = document.createElement('label');
      item.className = 'dvfy-table__filter-item';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = currentChecked.has(value);
      cb.dataset.value = value;

      // Apply filter immediately on toggle
      cb.addEventListener('change', () => {
        this.#applyColumnFilterFromPanel(colIndex, checkboxes);
      });

      const label = document.createElement('span');
      label.textContent = value;
      label.title = value;

      item.appendChild(cb);
      item.appendChild(label);
      list.appendChild(item);
      checkboxes.push({ cb, item, value });
    }

    panel.appendChild(list);

    // Store checkboxes reference for immediate apply
    filterState.checkboxes = checkboxes;

    // Search filtering within the dropdown
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      for (const { item, value } of checkboxes) {
        item.style.display = value.toLowerCase().includes(term) ? '' : 'none';
      }
    });

    // Select All / Clear All — apply immediately
    selectAllBtn.addEventListener('click', () => {
      for (const { cb, item } of checkboxes) {
        if (item.style.display !== 'none') cb.checked = true;
      }
      this.#applyColumnFilterFromPanel(colIndex, checkboxes);
    });
    clearAllBtn.addEventListener('click', () => {
      for (const { cb, item } of checkboxes) {
        if (item.style.display !== 'none') cb.checked = false;
      }
      this.#applyColumnFilterFromPanel(colIndex, checkboxes);
    });

    // Prevent clicks inside panel from closing it
    panel.addEventListener('mousedown', (e) => e.stopPropagation());

    th.appendChild(panel);
    filterState.panel = panel;
    this.#openPanel = panel;
    this.#openCol = colIndex;

    // Focus search input
    requestAnimationFrame(() => searchInput.focus());
  }

  #applyColumnFilterFromPanel(colIndex, checkboxes) {
    const filterState = this.#columnFilters.get(colIndex);
    if (!filterState) return;

    const checkedValues = new Set();
    for (const { cb, value } of checkboxes) {
      if (cb.checked) checkedValues.add(value);
    }

    // If all values are checked, clear the filter (no active filter)
    if (checkedValues.size === filterState.allValues.length) {
      filterState.checkedValues = null;
      filterState.icon.classList.remove('dvfy-table__filter-icon--active');
    } else {
      filterState.checkedValues = checkedValues;
      filterState.icon.classList.add('dvfy-table__filter-icon--active');
    }

    this.#applyAllFilters();

    this.dispatchEvent(new CustomEvent('filter-change', {
      detail: { column: colIndex, values: Array.from(checkedValues) },
      bubbles: true
    }));
  }

  #closeFilterPanel() {
    if (this.#openPanel && this.#openPanel.parentNode) {
      this.#openPanel.parentNode.removeChild(this.#openPanel);
    }
    if (this.#openCol !== null) {
      const fs = this.#columnFilters.get(this.#openCol);
      if (fs) {
        fs.panel = null;
        fs.checkboxes = null;
      }
    }
    this.#openPanel = null;
    this.#openCol = null;
  }

  #handleOutsideClick(e) {
    if (!this.#openPanel) return;
    // If click is outside the open panel's parent th, close it
    const th = this.#openPanel.parentElement;
    if (th && !th.contains(e.target)) {
      this.#closeFilterPanel();
    }
  }

  #handleEscapeKey(e) {
    if (e.key === 'Escape' && this.#openPanel) {
      this.#closeFilterPanel();
    }
  }

  #applyAllFilters() {
    const searchTerm = this.#searchInput ? this.#searchInput.value.toLowerCase() : '';

    for (const row of this.#originalRows) {
      const cells = Array.from(row.children);
      const dataCells = this.hasAttribute('selectable') ? cells.slice(1) : cells;

      let visible = true;

      // Column dropdown filters
      for (const [col, filterState] of this.#columnFilters) {
        if (!filterState.checkedValues) continue; // no active filter
        const cell = dataCells[col];
        if (!cell) { visible = false; break; }
        const cellText = cell.textContent.trim();
        if (!filterState.checkedValues.has(cellText)) {
          visible = false;
          break;
        }
      }

      // Global search
      if (visible && searchTerm) {
        const rowText = dataCells.map(c => c.textContent).join(' ').toLowerCase();
        if (!rowText.includes(searchTerm)) {
          visible = false;
        }
      }

      row.style.display = visible ? '' : 'none';
    }

    this.#syncSelectAll();
  }

  #initSort(table) {
    const headers = table.querySelectorAll('th[data-sort]');
    for (const th of headers) {
      this.#addSortIndicator(th);
      th.addEventListener('click', (e) => {
        // Don't sort if clicking the filter icon
        if (e.target.closest('.dvfy-table__filter-icon')) return;
        this.#handleSort(th, table);
      });
    }
  }

  #addSortIndicator(th) {
    // Find or create sort indicator within the th-content wrapper or directly
    const contentWrap = th.querySelector('.dvfy-table__th-content');
    const textWrap = contentWrap
      ? contentWrap.querySelector('.dvfy-table__th-text')
      : th;

    let indicator = textWrap.querySelector('.dvfy-table__sort');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'dvfy-table__sort';
      indicator.setAttribute('aria-hidden', 'true');
      textWrap.appendChild(indicator);
    }
    const dir = th.getAttribute('data-sort');
    indicator.textContent = dir === 'asc' ? '\u25B2' : dir === 'desc' ? '\u25BC' : '\u25B4';
  }

  #handleSort(th, table) {
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

    const tbody = table.querySelector('tbody') || table;
    const headerRow = th.parentElement;
    const colIndex = Array.from(headerRow.children).indexOf(th);

    const visibleRows = this.#originalRows.filter(r => r.style.display !== 'none');

    visibleRows.sort((a, b) => {
      const aText = (a.children[colIndex]?.textContent || '').trim();
      const bText = (b.children[colIndex]?.textContent || '').trim();
      const aNum = parseFloat(aText);
      const bNum = parseFloat(bText);
      const numeric = !isNaN(aNum) && !isNaN(bNum);
      const cmp = numeric ? aNum - bNum : aText.localeCompare(bText);
      return next === 'asc' ? cmp : -cmp;
    });

    for (const row of visibleRows) tbody.appendChild(row);

    this.dispatchEvent(new CustomEvent('sort', {
      detail: { column: colIndex, direction: next },
      bubbles: true
    }));
  }
}

customElements.define('dvfy-table', DvfyTable);
