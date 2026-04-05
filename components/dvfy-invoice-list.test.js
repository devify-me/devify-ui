import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-badge.js';
import './dvfy-invoice-list.js';

describe('dvfy-invoice-list', () => {
  const sampleData = JSON.stringify([
    {
      external_id: 'in_001',
      amount_cents: 2500,
      currency: 'usd',
      status: 'paid',
      period_start: 1700000000,
      period_end: 1702592000,
      paid_at: 1700001000,
      hosted_url: 'https://example.com/invoice/1',
    },
    {
      external_id: 'in_002',
      amount_cents: 5000,
      currency: 'usd',
      status: 'open',
      period_start: 1702592000,
      period_end: 1705184000,
    },
  ]);

  describe('rendering', () => {
    it('renders table from data attribute', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='${sampleData}'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const table = el.querySelector('.dvfy-invoice-list__table');
      expect(table).to.not.be.null;
    });

    it('renders correct number of rows', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='${sampleData}'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const rows = el.querySelectorAll('tbody tr');
      expect(rows.length).to.equal(2);
    });

    it('renders table headers', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='${sampleData}'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const headers = el.querySelectorAll('thead th');
      expect(headers.length).to.equal(4);
      expect(headers[0].textContent).to.equal('Period');
      expect(headers[1].textContent).to.equal('Amount');
      expect(headers[2].textContent).to.equal('Status');
    });

    it('renders status badges', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='${sampleData}'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const badges = el.querySelectorAll('dvfy-badge');
      expect(badges.length).to.equal(2);
      expect(badges[0].getAttribute('status')).to.equal('success');
      expect(badges[0].textContent).to.include('paid');
      expect(badges[1].getAttribute('status')).to.equal('warning');
      expect(badges[1].textContent).to.include('open');
    });

    it('renders view link for invoices with hosted_url', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='${sampleData}'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const links = el.querySelectorAll('.dvfy-invoice-list__link');
      expect(links.length).to.equal(1);
      expect(links[0].textContent).to.equal('View');
      expect(links[0].target).to.equal('_blank');
      expect(links[0].rel).to.equal('noopener noreferrer');
    });

    it('renders amount in currency format', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='${sampleData}'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const amounts = el.querySelectorAll('.dvfy-invoice-list__amount');
      // Amount should contain $25.00 (2500 cents)
      expect(amounts[0].textContent).to.include('25');
    });
  });

  describe('empty state', () => {
    it('shows empty state without data or tenant-id', async () => {
      const el = await fixture(html`<dvfy-invoice-list></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const empty = el.querySelector('.dvfy-invoice-list__empty');
      expect(empty).to.not.be.null;
      expect(empty.textContent).to.include('No invoices');
    });

    it('shows empty state with empty array', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='[]'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(el.querySelector('.dvfy-invoice-list__empty')).to.not.be.null;
    });
  });

  describe('error state', () => {
    it('shows error on invalid JSON', async () => {
      const el = await fixture(html`<dvfy-invoice-list data='bad-json'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const error = el.querySelector('.dvfy-invoice-list__error');
      expect(error).to.not.be.null;
      expect(error.textContent).to.include('Invalid data format');
    });
  });

  describe('events', () => {
    it('dispatches dvfy-invoices-loaded after data renders', async () => {
      const el = document.createElement('dvfy-invoice-list');
      el.setAttribute('data', sampleData);
      setTimeout(() => document.body.appendChild(el));
      const ev = await oneEvent(el, 'dvfy-invoices-loaded');
      expect(ev.detail).to.be.an('array');
      expect(ev.detail.length).to.equal(2);
      el.remove();
    });
  });

  describe('ARIA', () => {
    it('sets role="region"', async () => {
      const el = await fixture(html`<dvfy-invoice-list></dvfy-invoice-list>`);
      expect(el.getAttribute('role')).to.equal('region');
    });

    it('sets aria-label', async () => {
      const el = await fixture(html`<dvfy-invoice-list></dvfy-invoice-list>`);
      expect(el.getAttribute('aria-label')).to.equal('Billing history');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`<dvfy-invoice-list aria-label="Invoices"></dvfy-invoice-list>`);
      expect(el.getAttribute('aria-label')).to.equal('Invoices');
    });
  });

  describe('void status', () => {
    it('renders void status with neutral badge', async () => {
      const data = JSON.stringify([{
        external_id: 'in_003',
        amount_cents: 1000,
        currency: 'usd',
        status: 'void',
        period_start: 1700000000,
        period_end: 1702592000,
      }]);
      const el = await fixture(html`<dvfy-invoice-list data='${data}'></dvfy-invoice-list>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const badge = el.querySelector('dvfy-badge');
      expect(badge.getAttribute('status')).to.equal('neutral');
    });
  });
});
