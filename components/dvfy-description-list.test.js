import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-description-list.js';

describe('dvfy-description-list', () => {
  describe('rendering', () => {
    it('renders items inside a dl wrapper', async () => {
      const el = await fixture(html`
        <dvfy-description-list>
          <dvfy-dl-item label="Name">Jane</dvfy-dl-item>
        </dvfy-description-list>
      `);
      // Wait for queueMicrotask used in connectedCallback
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => queueMicrotask(resolve));
      const dl = el.querySelector('.dvfy-dl__list');
      expect(dl).to.not.be.null;
      expect(dl.tagName).to.equal('DL');
    });

    it('renders multiple items', async () => {
      const el = await fixture(html`
        <dvfy-description-list>
          <dvfy-dl-item label="Name">Jane</dvfy-dl-item>
          <dvfy-dl-item label="Email">jane@example.com</dvfy-dl-item>
          <dvfy-dl-item label="Role">Admin</dvfy-dl-item>
        </dvfy-description-list>
      `);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => queueMicrotask(resolve));
      const items = el.querySelectorAll('dvfy-dl-item');
      expect(items.length).to.equal(3);
    });
  });

  describe('attributes', () => {
    it('accepts layout="stacked" (default)', async () => {
      const el = await fixture(html`
        <dvfy-description-list layout="stacked">
          <dvfy-dl-item label="Key">Value</dvfy-dl-item>
        </dvfy-description-list>
      `);
      expect(el.getAttribute('layout')).to.equal('stacked');
    });

    it('accepts layout="horizontal"', async () => {
      const el = await fixture(html`
        <dvfy-description-list layout="horizontal">
          <dvfy-dl-item label="Key">Value</dvfy-dl-item>
        </dvfy-description-list>
      `);
      expect(el.getAttribute('layout')).to.equal('horizontal');
    });

    it('accepts layout="grid"', async () => {
      const el = await fixture(html`
        <dvfy-description-list layout="grid">
          <dvfy-dl-item label="Key">Value</dvfy-dl-item>
        </dvfy-description-list>
      `);
      expect(el.getAttribute('layout')).to.equal('grid');
    });

    it('accepts columns attribute for grid layout', async () => {
      const el = await fixture(html`
        <dvfy-description-list layout="grid" columns="3">
          <dvfy-dl-item label="Key">Value</dvfy-dl-item>
        </dvfy-description-list>
      `);
      expect(el.getAttribute('columns')).to.equal('3');
    });

    it('accepts divider attribute', async () => {
      const el = await fixture(html`
        <dvfy-description-list divider>
          <dvfy-dl-item label="Key">Value</dvfy-dl-item>
        </dvfy-description-list>
      `);
      expect(el.hasAttribute('divider')).to.be.true;
    });

    it('accepts striped attribute', async () => {
      const el = await fixture(html`
        <dvfy-description-list striped>
          <dvfy-dl-item label="Key">Value</dvfy-dl-item>
        </dvfy-description-list>
      `);
      expect(el.hasAttribute('striped')).to.be.true;
    });
  });

  describe('ARIA', () => {
    it('sets role="list" on the container', async () => {
      const el = await fixture(html`
        <dvfy-description-list>
          <dvfy-dl-item label="Key">Value</dvfy-dl-item>
        </dvfy-description-list>
      `);
      expect(el.getAttribute('role')).to.equal('list');
    });
  });
});

describe('dvfy-dl-item', () => {
  describe('rendering', () => {
    it('renders label and value', async () => {
      const el = await fixture(html`<dvfy-dl-item label="Name">Jane</dvfy-dl-item>`);
      await new Promise(resolve => queueMicrotask(resolve));
      const dt = el.querySelector('.dvfy-dl-item__label');
      const dd = el.querySelector('.dvfy-dl-item__value');
      expect(dt).to.not.be.null;
      expect(dt.textContent).to.equal('Name');
      expect(dd).to.not.be.null;
      expect(dd.textContent).to.equal('Jane');
    });

    it('renders empty label when no label attr', async () => {
      const el = await fixture(html`<dvfy-dl-item>Value</dvfy-dl-item>`);
      await new Promise(resolve => queueMicrotask(resolve));
      const dt = el.querySelector('.dvfy-dl-item__label');
      expect(dt.textContent).to.equal('');
    });

    it('updates label text when attribute changes', async () => {
      const el = await fixture(html`<dvfy-dl-item label="Old">Value</dvfy-dl-item>`);
      await new Promise(resolve => queueMicrotask(resolve));
      el.setAttribute('label', 'New');
      const dt = el.querySelector('.dvfy-dl-item__label');
      expect(dt.textContent).to.equal('New');
    });
  });

  describe('ARIA', () => {
    it('sets role="listitem"', async () => {
      const el = await fixture(html`<dvfy-dl-item label="Key">Value</dvfy-dl-item>`);
      expect(el.getAttribute('role')).to.equal('listitem');
    });
  });
});
