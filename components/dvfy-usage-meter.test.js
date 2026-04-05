import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-progress.js';
import './dvfy-usage-meter.js';

describe('dvfy-usage-meter', () => {
  const sampleData = JSON.stringify([
    { feature: 'API Calls', used: 8500, limit: 10000, unit: 'calls' },
    { feature: 'Storage', used: 3, limit: 10, unit: 'GB' },
  ]);

  describe('rendering', () => {
    it('renders items from data attribute', async () => {
      const el = await fixture(html`<dvfy-usage-meter data='${sampleData}'></dvfy-usage-meter>`);
      // Wait for queueMicrotask in connectedCallback
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const items = el.querySelectorAll('.dvfy-usage-meter__item');
      expect(items.length).to.equal(2);
    });

    it('renders feature names', async () => {
      const el = await fixture(html`<dvfy-usage-meter data='${sampleData}'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const features = el.querySelectorAll('.dvfy-usage-meter__feature');
      expect(features[0].textContent).to.equal('API Calls');
      expect(features[1].textContent).to.equal('Storage');
    });

    it('renders formatted counts with units', async () => {
      const el = await fixture(html`<dvfy-usage-meter data='${sampleData}'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const counts = el.querySelectorAll('.dvfy-usage-meter__counts');
      expect(counts[0].textContent).to.include('8.5K');
      expect(counts[0].textContent).to.include('10K');
      expect(counts[0].textContent).to.include('calls');
    });

    it('renders dvfy-progress elements for each item', async () => {
      const el = await fixture(html`<dvfy-usage-meter data='${sampleData}'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const progressBars = el.querySelectorAll('dvfy-progress');
      expect(progressBars.length).to.equal(2);
    });

    it('sets danger status when usage >= 90%', async () => {
      const data = JSON.stringify([
        { feature: 'API Calls', used: 9500, limit: 10000, unit: 'calls' },
      ]);
      const el = await fixture(html`<dvfy-usage-meter data='${data}'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const progress = el.querySelector('dvfy-progress');
      expect(progress.getAttribute('status')).to.equal('danger');
    });

    it('sets warning status when usage >= 75%', async () => {
      const data = JSON.stringify([
        { feature: 'Storage', used: 8, limit: 10, unit: 'GB' },
      ]);
      const el = await fixture(html`<dvfy-usage-meter data='${data}'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const progress = el.querySelector('dvfy-progress');
      expect(progress.getAttribute('status')).to.equal('warning');
    });

    it('sets default status when usage < 75%', async () => {
      const data = JSON.stringify([
        { feature: 'Storage', used: 3, limit: 10, unit: 'GB' },
      ]);
      const el = await fixture(html`<dvfy-usage-meter data='${data}'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const progress = el.querySelector('dvfy-progress');
      expect(progress.getAttribute('status')).to.equal('default');
    });
  });

  describe('empty state', () => {
    it('shows empty state without data or tenant-id', async () => {
      const el = await fixture(html`<dvfy-usage-meter></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const empty = el.querySelector('.dvfy-usage-meter__empty');
      expect(empty).to.not.be.null;
      expect(empty.textContent).to.include('No usage data');
    });

    it('shows empty state with empty array', async () => {
      const el = await fixture(html`<dvfy-usage-meter data='[]'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(el.querySelector('.dvfy-usage-meter__empty')).to.not.be.null;
    });
  });

  describe('error state', () => {
    it('shows error on invalid JSON', async () => {
      const el = await fixture(html`<dvfy-usage-meter data='not-json'></dvfy-usage-meter>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const error = el.querySelector('.dvfy-usage-meter__error');
      expect(error).to.not.be.null;
      expect(error.textContent).to.include('Invalid data format');
    });
  });

  describe('events', () => {
    it('dispatches dvfy-usage-loaded after data renders', async () => {
      const el = document.createElement('dvfy-usage-meter');
      el.setAttribute('data', sampleData);
      setTimeout(() => document.body.appendChild(el));
      const ev = await oneEvent(el, 'dvfy-usage-loaded');
      expect(ev.detail).to.be.an('array');
      expect(ev.detail.length).to.equal(2);
      el.remove();
    });
  });

  describe('ARIA', () => {
    it('sets role="region"', async () => {
      const el = await fixture(html`<dvfy-usage-meter></dvfy-usage-meter>`);
      expect(el.getAttribute('role')).to.equal('region');
    });

    it('sets aria-label', async () => {
      const el = await fixture(html`<dvfy-usage-meter></dvfy-usage-meter>`);
      expect(el.getAttribute('aria-label')).to.equal('Feature usage');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`<dvfy-usage-meter aria-label="Custom label"></dvfy-usage-meter>`);
      expect(el.getAttribute('aria-label')).to.equal('Custom label');
    });
  });
});
