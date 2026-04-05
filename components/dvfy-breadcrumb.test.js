import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-breadcrumb.js';

describe('dvfy-breadcrumb', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <span>Widget</span>
        </dvfy-breadcrumb>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Breadcrumb');
    });

    it('inserts separator between items', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <span>Widget</span>
        </dvfy-breadcrumb>
      `);
      const seps = el.querySelectorAll('.dvfy-breadcrumb__sep');
      expect(seps.length).to.equal(2);
      expect(seps[0].textContent).to.equal('/');
    });

    it('does not insert separator after last item', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <a href="/">Home</a>
          <span>Current</span>
        </dvfy-breadcrumb>
      `);
      const seps = el.querySelectorAll('.dvfy-breadcrumb__sep');
      expect(seps.length).to.equal(1);
    });

    it('handles single item without separator', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <span>Home</span>
        </dvfy-breadcrumb>
      `);
      const seps = el.querySelectorAll('.dvfy-breadcrumb__sep');
      expect(seps.length).to.equal(0);
    });

    it('handles empty breadcrumb', async () => {
      const el = await fixture(html`<dvfy-breadcrumb></dvfy-breadcrumb>`);
      const seps = el.querySelectorAll('.dvfy-breadcrumb__sep');
      expect(seps.length).to.equal(0);
    });
  });

  describe('attributes', () => {
    it('uses custom separator character', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb separator="&gt;">
          <a href="/">Home</a>
          <span>Page</span>
        </dvfy-breadcrumb>
      `);
      const sep = el.querySelector('.dvfy-breadcrumb__sep');
      expect(sep.textContent).to.equal('>');
    });

    it('updates separators when separator attribute changes', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <a href="/">Home</a>
          <span>Page</span>
        </dvfy-breadcrumb>
      `);
      el.setAttribute('separator', '|');
      const sep = el.querySelector('.dvfy-breadcrumb__sep');
      expect(sep.textContent).to.equal('|');
    });
  });

  describe('ARIA', () => {
    it('sets aria-label=Breadcrumb', async () => {
      const el = await fixture(html`<dvfy-breadcrumb><span>Home</span></dvfy-breadcrumb>`);
      expect(el.getAttribute('aria-label')).to.equal('Breadcrumb');
    });

    it('sets aria-current=page on last item', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <span>Widget</span>
        </dvfy-breadcrumb>
      `);
      const items = el.querySelectorAll(':scope > :not(.dvfy-breadcrumb__sep)');
      const last = items[items.length - 1];
      expect(last.getAttribute('aria-current')).to.equal('page');
    });

    it('does not set aria-current on non-last items', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <span>Widget</span>
        </dvfy-breadcrumb>
      `);
      const firstLink = el.querySelector('a');
      expect(firstLink.hasAttribute('aria-current')).to.be.false;
    });

    it('marks separators as aria-hidden', async () => {
      const el = await fixture(html`
        <dvfy-breadcrumb>
          <a href="/">Home</a>
          <span>Page</span>
        </dvfy-breadcrumb>
      `);
      const sep = el.querySelector('.dvfy-breadcrumb__sep');
      expect(sep.getAttribute('aria-hidden')).to.equal('true');
    });
  });
});
