import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-table.js';

const TABLE_HTML = html`
  <dvfy-table striped hoverable>
    <table>
      <thead><tr><th data-sort>Name</th><th data-sort>Role</th></tr></thead>
      <tbody>
        <tr><td>Alice</td><td>Engineer</td></tr>
        <tr><td>Bob</td><td>Designer</td></tr>
        <tr><td>Carol</td><td>Manager</td></tr>
      </tbody>
    </table>
  </dvfy-table>
`;

describe('dvfy-table', () => {
  describe('rendering', () => {
    it('renders table with wrapper', async () => {
      const el = await fixture(TABLE_HTML);
      expect(el.querySelector('.dvfy-table__wrapper')).to.exist;
      expect(el.querySelector('table')).to.exist;
      await checkA11y(el);
    });

    it('preserves original rows', async () => {
      const el = await fixture(TABLE_HTML);
      const rows = el.querySelectorAll('tbody tr');
      expect(rows.length).to.equal(3);
      await checkA11y(el);
    });

    it('applies striped attribute', async () => {
      const el = await fixture(TABLE_HTML);
      expect(el.hasAttribute('striped')).to.be.true;
      await checkA11y(el);
    });

    it('applies hoverable attribute', async () => {
      const el = await fixture(TABLE_HTML);
      expect(el.hasAttribute('hoverable')).to.be.true;
      await checkA11y(el);
    });

    it('accepts compact attribute', async () => {
      const el = await fixture(html`
        <dvfy-table compact>
          <table><thead><tr><th>Col</th></tr></thead><tbody><tr><td>A</td></tr></tbody></table>
        </dvfy-table>
      `);
      expect(el.hasAttribute('compact')).to.be.true;
      await checkA11y(el);
    });

    it('accepts responsive attribute with overflow wrapper', async () => {
      const el = await fixture(html`
        <dvfy-table responsive>
          <table><thead><tr><th>Col</th></tr></thead><tbody><tr><td>A</td></tr></tbody></table>
        </dvfy-table>
      `);
      expect(el.hasAttribute('responsive')).to.be.true;
      expect(el.querySelector('.dvfy-table__wrapper')).to.exist;
      await checkA11y(el);
    });
  });

  describe('sorting', () => {
    it('adds sort indicators to data-sort headers', async () => {
      const el = await fixture(TABLE_HTML);
      const indicators = el.querySelectorAll('.dvfy-table__sort');
      expect(indicators.length).to.equal(2);
      await checkA11y(el);
    });

    it('fires sort event on header click', async () => {
      const el = await fixture(TABLE_HTML);
      const th = el.querySelector('th[data-sort]');
      setTimeout(() => th.click());
      const ev = await oneEvent(el, 'sort');
      expect(ev.detail).to.have.property('column');
      expect(ev.detail).to.have.property('direction');
      await checkA11y(el);
    });

    it('toggles sort direction on repeated clicks', async () => {
      const el = await fixture(TABLE_HTML);
      const th = el.querySelector('th[data-sort]');
      th.click();
      const dir1 = th.getAttribute('data-sort');
      th.click();
      const dir2 = th.getAttribute('data-sort');
      expect(dir1).to.not.equal(dir2);
      await checkA11y(el);
    });

    it('sorts rows alphabetically', async () => {
      const el = await fixture(TABLE_HTML);
      const th = el.querySelector('th[data-sort]');
      th.click(); // asc
      const rows = el.querySelectorAll('tbody tr');
      const names = Array.from(rows).map(r => r.cells[0].textContent);
      expect(names).to.deep.equal(['Alice', 'Bob', 'Carol']);
      await checkA11y(el);
    });

    it('resets other column sort indicators', async () => {
      const el = await fixture(TABLE_HTML);
      const headers = el.querySelectorAll('th[data-sort]');
      headers[0].click();
      headers[1].click();
      expect(headers[0].getAttribute('data-sort')).to.not.be.oneOf(['asc', 'desc']);
      await checkA11y(el);
    });
  });

  describe('selectable', () => {
    it('adds checkbox column when selectable', async () => {
      const el = await fixture(html`
        <dvfy-table selectable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Alice</td></tr><tr><td>Bob</td></tr></tbody>
          </table>
        </dvfy-table>
      `);
      const headerCb = el.querySelector('th.dvfy-table__checkbox input[type="checkbox"]');
      expect(headerCb).to.exist;
      const rowCbs = el.querySelectorAll('td.dvfy-table__checkbox input[type="checkbox"]');
      expect(rowCbs.length).to.equal(2);
      await checkA11y(el);
    });

    it('fires selection-change event on row select', async () => {
      const el = await fixture(html`
        <dvfy-table selectable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Alice</td></tr><tr><td>Bob</td></tr></tbody>
          </table>
        </dvfy-table>
      `);
      const rowCb = el.querySelector('td.dvfy-table__checkbox input[type="checkbox"]');
      setTimeout(() => {
        rowCb.checked = true;
        rowCb.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const ev = await oneEvent(el, 'selection-change');
      expect(ev.detail.selected).to.deep.equal([0]);
      await checkA11y(el);
    });

    it('selects all via header checkbox', async () => {
      const el = await fixture(html`
        <dvfy-table selectable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Alice</td></tr><tr><td>Bob</td></tr></tbody>
          </table>
        </dvfy-table>
      `);
      const headerCb = el.querySelector('th.dvfy-table__checkbox input[type="checkbox"]');
      setTimeout(() => {
        headerCb.checked = true;
        headerCb.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const ev = await oneEvent(el, 'selection-change');
      expect(ev.detail.selected).to.deep.equal([0, 1]);
      await checkA11y(el);
    });

    it('applies selected class to checked rows', async () => {
      const el = await fixture(html`
        <dvfy-table selectable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Alice</td></tr></tbody>
          </table>
        </dvfy-table>
      `);
      const rowCb = el.querySelector('td.dvfy-table__checkbox input[type="checkbox"]');
      rowCb.checked = true;
      rowCb.dispatchEvent(new Event('change', { bubbles: true }));
      const row = el.querySelector('tbody tr');
      expect(row.classList.contains('dvfy-table__row--selected')).to.be.true;
      await checkA11y(el);
    });
  });

  describe('searchable', () => {
    it('renders search input when searchable', async () => {
      const el = await fixture(html`
        <dvfy-table searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Alice</td></tr><tr><td>Bob</td></tr></tbody>
          </table>
        </dvfy-table>
      `);
      const search = el.querySelector('.dvfy-table__search input');
      expect(search).to.exist;
      expect(search.getAttribute('aria-label')).to.equal('Search table');
      await checkA11y(el);
    });

    it('filters rows based on search input', async () => {
      const el = await fixture(html`
        <dvfy-table searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Alice</td></tr><tr><td>Bob</td></tr></tbody>
          </table>
        </dvfy-table>
      `);
      const search = el.querySelector('.dvfy-table__search input');
      search.value = 'Alice';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      const rows = el.querySelectorAll('tbody tr');
      const visible = Array.from(rows).filter(r => r.style.display !== 'none');
      expect(visible.length).to.equal(1);
      await checkA11y(el);
    });

    it('shows all rows when search is cleared', async () => {
      const el = await fixture(html`
        <dvfy-table searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>Alice</td></tr><tr><td>Bob</td></tr></tbody>
          </table>
        </dvfy-table>
      `);
      const search = el.querySelector('.dvfy-table__search input');
      search.value = 'Alice';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      const rows = el.querySelectorAll('tbody tr');
      const visible = Array.from(rows).filter(r => r.style.display !== 'none');
      expect(visible.length).to.equal(2);
      await checkA11y(el);
    });
  });

  describe('filterable', () => {
    it('adds filter icons to data-filter headers', async () => {
      const el = await fixture(html`
        <dvfy-table filterable>
          <table>
            <thead><tr><th data-filter>Role</th></tr></thead>
            <tbody>
              <tr><td>Engineer</td></tr>
              <tr><td>Designer</td></tr>
            </tbody>
          </table>
        </dvfy-table>
      `);
      const filterIcon = el.querySelector('.dvfy-table__filter-icon');
      expect(filterIcon).to.exist;
      await checkA11y(el);
    });

    it('opens filter panel on icon click', async () => {
      const el = await fixture(html`
        <dvfy-table filterable>
          <table>
            <thead><tr><th data-filter>Role</th></tr></thead>
            <tbody>
              <tr><td>Engineer</td></tr>
              <tr><td>Designer</td></tr>
            </tbody>
          </table>
        </dvfy-table>
      `);
      const filterIcon = el.querySelector('.dvfy-table__filter-icon');
      filterIcon.click();
      const panel = el.querySelector('.dvfy-table__filter-panel');
      expect(panel).to.exist;
      await checkA11y(el);
    });

    it('fires filter-change event when filter is applied', async () => {
      const el = await fixture(html`
        <dvfy-table filterable>
          <table>
            <thead><tr><th data-filter>Role</th></tr></thead>
            <tbody>
              <tr><td>Engineer</td></tr>
              <tr><td>Designer</td></tr>
            </tbody>
          </table>
        </dvfy-table>
      `);
      const filterIcon = el.querySelector('.dvfy-table__filter-icon');
      filterIcon.click();
      const checkboxes = el.querySelectorAll('.dvfy-table__filter-item input[type="checkbox"]');
      setTimeout(() => {
        checkboxes[1].checked = false;
        checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));
      });
      const ev = await oneEvent(el, 'filter-change');
      expect(ev.detail).to.have.property('column');
      expect(ev.detail).to.have.property('values');
      await checkA11y(el);
    });
  });
});
