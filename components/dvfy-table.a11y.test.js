import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-table.js';

// Helper: dispatch a keydown on document (where the table's escape listener lives)
function pressKeyDoc(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

// Helper: dispatch a keydown on the filter icon element
function pressKeyOn(el, key) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const BASIC_TABLE = html`
  <dvfy-table>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Department</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Engineer</td><td>Platform</td></tr>
        <tr><td>Bob</td><td>Designer</td><td>Product</td></tr>
        <tr><td>Carol</td><td>Manager</td><td>Platform</td></tr>
      </tbody>
    </table>
  </dvfy-table>
`;

const SORT_TABLE = html`
  <dvfy-table>
    <table>
      <thead>
        <tr>
          <th data-sort>Name</th>
          <th data-sort>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Engineer</td></tr>
        <tr><td>Bob</td><td>Designer</td></tr>
        <tr><td>Carol</td><td>Manager</td></tr>
      </tbody>
    </table>
  </dvfy-table>
`;

const SELECTABLE_TABLE = html`
  <dvfy-table selectable>
    <table>
      <thead>
        <tr><th>Name</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Engineer</td></tr>
        <tr><td>Bob</td><td>Designer</td></tr>
        <tr><td>Carol</td><td>Manager</td></tr>
      </tbody>
    </table>
  </dvfy-table>
`;

const FILTERABLE_TABLE = html`
  <dvfy-table filterable>
    <table>
      <thead>
        <tr>
          <th data-filter>Name</th>
          <th data-filter>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Engineer</td></tr>
        <tr><td>Bob</td><td>Designer</td></tr>
        <tr><td>Carol</td><td>Engineer</td></tr>
      </tbody>
    </table>
  </dvfy-table>
`;

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('dvfy-table — accessibility', () => {

  // ─── Table Structure ───────────────────────────────────────────────────────

  describe('table structure', () => {
    it('renders a semantic <table> element', async () => {
      const el = await fixture(BASIC_TABLE);
      const table = el.querySelector('table');
      expect(table).to.exist;
      expect(table.tagName.toLowerCase()).to.equal('table');
    });

    it('has <thead> containing <th> header cells', async () => {
      const el = await fixture(BASIC_TABLE);
      const thead = el.querySelector('thead');
      expect(thead).to.exist;
      const ths = thead.querySelectorAll('th');
      expect(ths.length).to.be.greaterThan(0);
    });

    it('has <tbody> containing <tr> rows', async () => {
      const el = await fixture(BASIC_TABLE);
      const tbody = el.querySelector('tbody');
      expect(tbody).to.exist;
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).to.be.greaterThan(0);
    });

    it('header cells are <th> elements, not <td>', async () => {
      const el = await fixture(BASIC_TABLE);
      const thead = el.querySelector('thead');
      const headerCells = thead.querySelectorAll('th');
      expect(headerCells.length).to.equal(3);
      for (const cell of headerCells) {
        expect(cell.tagName.toLowerCase()).to.equal('th');
      }
    });

    it('each body row has <td> data cells', async () => {
      const el = await fixture(BASIC_TABLE);
      const rows = el.querySelectorAll('tbody tr');
      for (const row of rows) {
        const tds = row.querySelectorAll('td');
        expect(tds.length).to.be.greaterThan(0);
      }
    });

    it('table is wrapped in a container div after enhance', async () => {
      const el = await fixture(BASIC_TABLE);
      const wrapper = el.querySelector('.dvfy-table__wrapper');
      expect(wrapper).to.exist;
      expect(wrapper.querySelector('table')).to.exist;
    });

    it('preserves all original data rows after enhancement', async () => {
      const el = await fixture(BASIC_TABLE);
      const rows = el.querySelectorAll('tbody tr');
      expect(rows.length).to.equal(3);
    });
  });

  // ─── Sortable Header Semantics ─────────────────────────────────────────────

  describe('sortable header semantics', () => {
    it('sortable headers have data-sort attribute for identification', async () => {
      const el = await fixture(SORT_TABLE);
      const sortableHeaders = el.querySelectorAll('th[data-sort]');
      expect(sortableHeaders.length).to.equal(2);
    });

    it('sort indicator is hidden from assistive technology via aria-hidden', async () => {
      const el = await fixture(SORT_TABLE);
      const indicators = el.querySelectorAll('.dvfy-table__sort');
      for (const ind of indicators) {
        expect(ind.getAttribute('aria-hidden')).to.equal('true');
      }
    });

    it('clicking a sortable header sets data-sort to "asc" on first click', async () => {
      const el = await fixture(SORT_TABLE);
      const th = el.querySelector('th[data-sort]');
      th.click();
      expect(th.getAttribute('data-sort')).to.equal('asc');
    });

    it('clicking a sorted column again toggles to "desc"', async () => {
      const el = await fixture(SORT_TABLE);
      const th = el.querySelector('th[data-sort]');
      th.click(); // asc
      th.click(); // desc
      expect(th.getAttribute('data-sort')).to.equal('desc');
    });

    it('sorting emits a sort event with column and direction', async () => {
      const el = await fixture(SORT_TABLE);
      const th = el.querySelector('th[data-sort]');
      setTimeout(() => th.click());
      const ev = await oneEvent(el, 'sort');
      expect(ev.detail).to.have.property('column');
      expect(ev.detail).to.have.property('direction');
      expect(['asc', 'desc']).to.include(ev.detail.direction);
    });

    it('only the clicked column retains data-sort after sibling is clicked', async () => {
      const el = await fixture(SORT_TABLE);
      const headers = el.querySelectorAll('th[data-sort]');
      headers[0].click(); // sort by col 0
      headers[1].click(); // sort by col 1
      // col 0 should no longer have asc/desc
      expect(headers[0].getAttribute('data-sort')).to.not.be.oneOf(['asc', 'desc']);
      // col 1 should now be active
      expect(['asc', 'desc']).to.include(headers[1].getAttribute('data-sort'));
    });
  });

  // ─── Selectable: Checkbox ARIA ─────────────────────────────────────────────

  describe('selectable — checkbox accessibility', () => {
    it('header checkbox has aria-label="Select all rows"', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const headerCb = el.querySelector('th.dvfy-table__checkbox input[type="checkbox"]');
      expect(headerCb).to.exist;
      expect(headerCb.getAttribute('aria-label')).to.equal('Select all rows');
    });

    it('each row checkbox has aria-label="Select row"', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const rowCbs = el.querySelectorAll('td.dvfy-table__checkbox input[type="checkbox"]');
      expect(rowCbs.length).to.equal(3);
      for (const cb of rowCbs) {
        expect(cb.getAttribute('aria-label')).to.equal('Select row');
      }
    });

    it('row checkboxes are native inputs — keyboard-operable by default', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const rowCbs = el.querySelectorAll('td.dvfy-table__checkbox input[type="checkbox"]');
      for (const cb of rowCbs) {
        expect(cb.type).to.equal('checkbox');
        // Native checkboxes have no tabindex attr restriction — they are in tab order
        expect(cb.getAttribute('tabindex')).to.be.null;
      }
    });

    it('checking a row checkbox applies selected class to the row', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const [firstRow] = el.querySelectorAll('tbody tr');
      const cb = firstRow.querySelector('.dvfy-table__checkbox input[type="checkbox"]');
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      expect(firstRow.classList.contains('dvfy-table__row--selected')).to.be.true;
    });

    it('unchecking a row checkbox removes selected class', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const [firstRow] = el.querySelectorAll('tbody tr');
      const cb = firstRow.querySelector('.dvfy-table__checkbox input[type="checkbox"]');
      // Select then deselect
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      cb.checked = false;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      expect(firstRow.classList.contains('dvfy-table__row--selected')).to.be.false;
    });

    it('select-all fires selection-change with all row indices', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const headerCb = el.querySelector('th.dvfy-table__checkbox input[type="checkbox"]');
      setTimeout(() => {
        headerCb.checked = true;
        headerCb.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const ev = await oneEvent(el, 'selection-change');
      expect(ev.detail.selected).to.deep.equal([0, 1, 2]);
    });

    it('selecting individual rows fires selection-change with correct index', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const rows = el.querySelectorAll('tbody tr');
      const secondRowCb = rows[1].querySelector('.dvfy-table__checkbox input[type="checkbox"]');
      setTimeout(() => {
        secondRowCb.checked = true;
        secondRowCb.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const ev = await oneEvent(el, 'selection-change');
      expect(ev.detail.selected).to.deep.equal([1]);
    });

    it('header checkbox becomes indeterminate when some but not all rows are selected', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const rows = el.querySelectorAll('tbody tr');
      const firstCb = rows[0].querySelector('.dvfy-table__checkbox input[type="checkbox"]');
      firstCb.checked = true;
      firstCb.dispatchEvent(new Event('change', { bubbles: true }));
      const headerCb = el.querySelector('th.dvfy-table__checkbox input[type="checkbox"]');
      expect(headerCb.indeterminate).to.be.true;
    });

    it('header checkbox is checked when all rows are selected', async () => {
      const el = await fixture(SELECTABLE_TABLE);
      const rowCbs = el.querySelectorAll('td.dvfy-table__checkbox input[type="checkbox"]');
      for (const cb of rowCbs) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const headerCb = el.querySelector('th.dvfy-table__checkbox input[type="checkbox"]');
      expect(headerCb.checked).to.be.true;
      expect(headerCb.indeterminate).to.be.false;
    });
  });

  // ─── Filterable: Filter Icon ARIA ──────────────────────────────────────────

  describe('filterable — filter icon accessibility', () => {
    it('filter icon has role="button" for keyboard accessibility', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icons = el.querySelectorAll('.dvfy-table__filter-icon');
      for (const icon of icons) {
        expect(icon.getAttribute('role')).to.equal('button');
      }
    });

    it('filter icon has tabindex="0" — in the natural tab order', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icons = el.querySelectorAll('.dvfy-table__filter-icon');
      for (const icon of icons) {
        expect(icon.getAttribute('tabindex')).to.equal('0');
      }
    });

    it('filter icon has an aria-label', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icons = el.querySelectorAll('.dvfy-table__filter-icon');
      for (const icon of icons) {
        expect(icon.getAttribute('aria-label')).to.exist;
        expect(icon.getAttribute('aria-label').length).to.be.greaterThan(0);
      }
    });

    it('Enter on filter icon opens the filter panel', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      pressKeyOn(icon, 'Enter');
      const panel = el.querySelector('.dvfy-table__filter-panel');
      expect(panel).to.exist;
    });

    it('Space on filter icon opens the filter panel', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      pressKeyOn(icon, ' ');
      const panel = el.querySelector('.dvfy-table__filter-panel');
      expect(panel).to.exist;
    });

    it('filter panel search input has aria-label', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      icon.click();
      const searchInput = el.querySelector('.dvfy-table__filter-search');
      expect(searchInput).to.exist;
      expect(searchInput.getAttribute('aria-label')).to.equal('Search filter values');
    });
  });

  // ─── Escape Key: Filter Panel ─────────────────────────────────────────────

  describe('Escape key — filter panel', () => {
    it('Escape closes an open filter panel', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      icon.click();
      expect(el.querySelector('.dvfy-table__filter-panel')).to.exist;
      pressKeyDoc('Escape');
      expect(el.querySelector('.dvfy-table__filter-panel')).to.be.null;
    });

    it('Escape when no filter panel is open does not throw', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      let threw = false;
      try {
        pressKeyDoc('Escape');
      } catch (e) {
        threw = true;
      }
      expect(threw).to.be.false;
    });

    it('clicking outside the filter panel closes it', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      icon.click();
      expect(el.querySelector('.dvfy-table__filter-panel')).to.exist;
      // Simulate outside click
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(el.querySelector('.dvfy-table__filter-panel')).to.be.null;
    });

    it('clicking inside the filter panel does not close it', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      icon.click();
      const panel = el.querySelector('.dvfy-table__filter-panel');
      expect(panel).to.exist;
      panel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(el.querySelector('.dvfy-table__filter-panel')).to.exist;
    });
  });

  // ─── Search Input Accessibility ────────────────────────────────────────────

  describe('searchable — search input accessibility', () => {
    it('search input has type="search"', async () => {
      const el = await fixture(html`
        <dvfy-table searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody>
              <tr><td>Alice</td></tr>
              <tr><td>Bob</td></tr>
            </tbody>
          </table>
        </dvfy-table>
      `);
      const input = el.querySelector('.dvfy-table__search input');
      expect(input).to.exist;
      expect(input.type).to.equal('search');
    });

    it('search input has aria-label="Search table"', async () => {
      const el = await fixture(html`
        <dvfy-table searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody>
              <tr><td>Alice</td></tr>
            </tbody>
          </table>
        </dvfy-table>
      `);
      const input = el.querySelector('.dvfy-table__search input');
      expect(input.getAttribute('aria-label')).to.equal('Search table');
    });

    it('search hides non-matching rows without removing them from DOM', async () => {
      const el = await fixture(html`
        <dvfy-table searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody>
              <tr><td>Alice</td></tr>
              <tr><td>Bob</td></tr>
            </tbody>
          </table>
        </dvfy-table>
      `);
      const input = el.querySelector('.dvfy-table__search input');
      input.value = 'Alice';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const rows = el.querySelectorAll('tbody tr');
      // Rows are hidden via display:none, not removed — preserves DOM structure
      expect(rows.length).to.equal(2);
      const visible = Array.from(rows).filter(r => r.style.display !== 'none');
      expect(visible.length).to.equal(1);
      expect(visible[0].textContent).to.include('Alice');
    });
  });

  // ─── Keyboard Listener Lifecycle ───────────────────────────────────────────

  describe('keyboard listener lifecycle', () => {
    it('removing element from DOM does not leave stale escape handler', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      icon.click(); // open panel, register handler
      el.remove();
      // Dispatching escape after disconnect must not throw
      let threw = false;
      try {
        pressKeyDoc('Escape');
      } catch (e) {
        threw = true;
      }
      expect(threw).to.be.false;
    });
  });

  // ─── Unhandled Key Safety ──────────────────────────────────────────────────

  describe('unhandled key safety', () => {
    it('pressing arbitrary keys on a filter icon does not open the panel', async () => {
      const el = await fixture(FILTERABLE_TABLE);
      const icon = el.querySelector('.dvfy-table__filter-icon');
      pressKeyOn(icon, 'a');
      pressKeyOn(icon, 'b');
      pressKeyOn(icon, 'ArrowDown');
      expect(el.querySelector('.dvfy-table__filter-panel')).to.be.null;
    });

    it('pressing non-sort keys on table header does not change sort state', async () => {
      const el = await fixture(SORT_TABLE);
      const th = el.querySelector('th[data-sort]');
      const initialSort = th.getAttribute('data-sort');
      th.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      th.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(th.getAttribute('data-sort')).to.equal(initialSort);
    });
  });

});
