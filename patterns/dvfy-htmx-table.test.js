import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-htmx-table.js';

describe('dvfy-htmx-table', () => {
  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-htmx-table')).to.exist;
    });

    it('wraps table in a wrapper div', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead>
              <tr><th>Name</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>A</td><td>1</td></tr>
            </tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const wrapper = el.querySelector('.dvfy-htmx-table__wrapper');
      expect(wrapper).to.exist;
      expect(wrapper.querySelector('table')).to.exist;
    });

    it('creates pagination container', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const pagination = el.querySelector('.dvfy-htmx-table__pagination');
      expect(pagination).to.exist;
    });

    it('keeps thead structure after enhancement', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead>
              <tr><th>Name</th><th>Value</th></tr>
            </thead>
            <tbody><tr><td>A</td><td>1</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const headers = el.querySelectorAll('thead th');
      expect(headers.length).to.equal(2);
      expect(headers[0].textContent).to.include('Name');
      expect(headers[1].textContent).to.include('Value');
    });
  });

  describe('search', () => {
    it('shows search input when searchable attr is set', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data" searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const controls = el.querySelector('.dvfy-htmx-table__controls');
      expect(controls).to.exist;
      const search = el.querySelector('.dvfy-htmx-table__search input');
      expect(search).to.exist;
      expect(search.type).to.equal('search');
      expect(search.placeholder).to.equal('Search...');
    });

    it('does not show search input without searchable attr', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const controls = el.querySelector('.dvfy-htmx-table__controls');
      expect(controls).to.not.exist;
    });

    it('search input has aria-label', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data" searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const search = el.querySelector('.dvfy-htmx-table__search input');
      expect(search.getAttribute('aria-label')).to.equal('Search table');
    });

    it('renders search icon', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data" searchable>
          <table>
            <thead><tr><th>Name</th></tr></thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const icon = el.querySelector('.dvfy-htmx-table__search-icon svg');
      expect(icon).to.exist;
    });
  });

  describe('sorting', () => {
    it('adds sort indicators to sortable columns', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead>
              <tr>
                <th data-sort="name">Name</th>
                <th data-sort="value">Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody><tr><td>A</td><td>1</td><td>-</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const indicators = el.querySelectorAll('.dvfy-htmx-table__sort-indicator');
      expect(indicators.length).to.equal(2);
    });

    it('sort indicators have aria-hidden', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead>
              <tr><th data-sort="name">Name</th></tr>
            </thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const indicator = el.querySelector('.dvfy-htmx-table__sort-indicator');
      expect(indicator.getAttribute('aria-hidden')).to.equal('true');
    });

    it('activates sort column on header click', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead>
              <tr><th data-sort="name">Name</th></tr>
            </thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const th = el.querySelector('th[data-sort="name"]');
      th.click();
      expect(th.classList.contains('dvfy-htmx-table__th--active')).to.be.true;
      const indicator = th.querySelector('.dvfy-htmx-table__sort-indicator');
      expect(indicator.textContent).to.not.be.empty;
    });

    it('toggles sort order on repeated clicks', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead>
              <tr><th data-sort="name">Name</th></tr>
            </thead>
            <tbody><tr><td>A</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const th = el.querySelector('th[data-sort="name"]');
      th.click();
      const indicator = th.querySelector('.dvfy-htmx-table__sort-indicator');
      const firstDirection = indicator.textContent;
      th.click();
      expect(indicator.textContent).to.not.equal(firstDirection);
    });

    it('does not add sort indicator to non-sortable columns', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table>
            <thead>
              <tr>
                <th data-sort="name">Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody><tr><td>A</td><td>-</td></tr></tbody>
          </table>
        </dvfy-htmx-table>
      `);
      const plainTh = el.querySelectorAll('th')[1];
      const indicator = plainTh.querySelector('.dvfy-htmx-table__sort-indicator');
      expect(indicator).to.not.exist;
    });
  });

  describe('attributes', () => {
    it('accepts src attribute', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/api/data">
          <table><thead><tr><th>A</th></tr></thead><tbody></tbody></table>
        </dvfy-htmx-table>
      `);
      expect(el.getAttribute('src')).to.equal('/api/data');
    });

    it('accepts page-size attribute', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data" page-size="50">
          <table><thead><tr><th>A</th></tr></thead><tbody></tbody></table>
        </dvfy-htmx-table>
      `);
      expect(el.getAttribute('page-size')).to.equal('50');
    });

    it('accepts custom parameter names', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table
          src="/data"
          page-param="p"
          sort-param="s"
          order-param="o"
          search-param="search"
        >
          <table><thead><tr><th>A</th></tr></thead><tbody></tbody></table>
        </dvfy-htmx-table>
      `);
      expect(el.getAttribute('page-param')).to.equal('p');
      expect(el.getAttribute('sort-param')).to.equal('s');
      expect(el.getAttribute('order-param')).to.equal('o');
      expect(el.getAttribute('search-param')).to.equal('search');
    });
  });

  describe('ARIA', () => {
    it('sets role=region', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table><thead><tr><th>A</th></tr></thead><tbody></tbody></table>
        </dvfy-htmx-table>
      `);
      expect(el.getAttribute('role')).to.equal('region');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data">
          <table><thead><tr><th>A</th></tr></thead><tbody></tbody></table>
        </dvfy-htmx-table>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Data table');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`
        <dvfy-htmx-table src="/data" aria-label="Audit log">
          <table><thead><tr><th>A</th></tr></thead><tbody></tbody></table>
        </dvfy-htmx-table>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Audit log');
    });
  });
});
