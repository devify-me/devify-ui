import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-infinite-scroll.js';

describe('dvfy-infinite-scroll', () => {
  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-infinite-scroll')).to.exist;
    });

    it('wraps children in content container', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
        </dvfy-infinite-scroll>
      `);
      const content = el.querySelector('.dvfy-infinite-scroll__content');
      expect(content).to.exist;
      const items = content.querySelectorAll('.item');
      expect(items.length).to.equal(2);
    });

    it('creates loader element', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item 1</div>
        </dvfy-infinite-scroll>
      `);
      const loader = el.querySelector('.dvfy-infinite-scroll__loader');
      expect(loader).to.exist;
    });

    it('loader contains spinner', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item 1</div>
        </dvfy-infinite-scroll>
      `);
      const spinner = el.querySelector('.dvfy-infinite-scroll__loader-spinner');
      expect(spinner).to.exist;
    });

    it('loader is hidden initially', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item 1</div>
        </dvfy-infinite-scroll>
      `);
      const loader = el.querySelector('.dvfy-infinite-scroll__loader');
      expect(loader.style.display).to.equal('none');
    });

    it('creates sentinel element for IntersectionObserver', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item 1</div>
        </dvfy-infinite-scroll>
      `);
      const sentinel = el.querySelector('.dvfy-infinite-scroll__sentinel');
      expect(sentinel).to.exist;
    });

    it('creates hidden HTMX target', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item 1</div>
        </dvfy-infinite-scroll>
      `);
      const target = el.querySelector('.dvfy-infinite-scroll__htmx-target');
      expect(target).to.exist;
    });
  });

  describe('attributes', () => {
    it('accepts src attribute', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('src')).to.equal('/api/items');
    });

    it('accepts page-param attribute', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items" page-param="p">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('page-param')).to.equal('p');
    });

    it('accepts start-page attribute', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items" start-page="3">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('start-page')).to.equal('3');
    });

    it('accepts threshold attribute', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items" threshold="500">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('threshold')).to.equal('500');
    });

    it('accepts no-more-text attribute', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items" no-more-text="All done">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('no-more-text')).to.equal('All done');
    });
  });

  describe('structure order', () => {
    it('renders elements in correct order: content, loader, htmx-target, sentinel', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      const children = Array.from(el.children);
      const classes = children.map(c => c.className);
      expect(classes).to.include('dvfy-infinite-scroll__content');
      expect(classes).to.include('dvfy-infinite-scroll__loader');
      expect(classes).to.include('dvfy-infinite-scroll__htmx-target');
      expect(classes).to.include('dvfy-infinite-scroll__sentinel');

      const contentIdx = classes.indexOf('dvfy-infinite-scroll__content');
      const loaderIdx = classes.indexOf('dvfy-infinite-scroll__loader');
      const sentinelIdx = classes.indexOf('dvfy-infinite-scroll__sentinel');
      expect(contentIdx).to.be.lessThan(loaderIdx);
      expect(loaderIdx).to.be.lessThan(sentinelIdx);
    });
  });

  describe('ARIA', () => {
    it('sets role=feed', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('role')).to.equal('feed');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Infinite scroll content');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items" aria-label="Task list">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Task list');
    });
  });

  describe('cleanup', () => {
    it('disconnects observer on removal', async () => {
      const el = await fixture(html`
        <dvfy-infinite-scroll src="/api/items">
          <div>Item</div>
        </dvfy-infinite-scroll>
      `);
      // Should not throw when removed
      el.remove();
      expect(document.querySelector('dvfy-infinite-scroll')).to.not.exist;
    });
  });
});
