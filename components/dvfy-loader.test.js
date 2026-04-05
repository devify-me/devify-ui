import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-loader.js';

describe('dvfy-loader', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      expect(el.getAttribute('role')).to.equal('status');
      expect(el.getAttribute('aria-label')).to.equal('Loading');
    });

    it('renders a spinner by default', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      expect(el.querySelector('.dvfy-loader__spinner')).to.exist;
      expect(el.querySelector('.dvfy-loader__dots')).to.be.null;
    });

    it('renders screen reader text when no label', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      // There should be a visually hidden span with "Loading..."
      const spans = el.querySelectorAll('span');
      const srSpan = Array.from(spans).find(s => s.textContent === 'Loading...');
      expect(srSpan).to.exist;
    });
  });

  describe('attributes', () => {
    it('accepts variant="dots"', async () => {
      const el = await fixture(html`<dvfy-loader variant="dots"></dvfy-loader>`);
      expect(el.querySelector('.dvfy-loader__dots')).to.exist;
      expect(el.querySelector('.dvfy-loader__spinner')).to.be.null;
    });

    it('renders three dots for dots variant', async () => {
      const el = await fixture(html`<dvfy-loader variant="dots"></dvfy-loader>`);
      const dots = el.querySelectorAll('.dvfy-loader__dot');
      expect(dots.length).to.equal(3);
    });

    it('accepts size attribute', async () => {
      const el = await fixture(html`<dvfy-loader size="lg"></dvfy-loader>`);
      expect(el.getAttribute('size')).to.equal('lg');
    });

    it('accepts all size values', async () => {
      for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
        const el = await fixture(html`<dvfy-loader size="${size}"></dvfy-loader>`);
        expect(el.getAttribute('size')).to.equal(size);
      }
    });

    it('renders brand icon when icon attribute is set', async () => {
      const el = await fixture(html`<dvfy-loader icon="https://example.com/icon.svg"></dvfy-loader>`);
      const img = el.querySelector('.dvfy-loader__icon');
      expect(img).to.exist;
      expect(img.tagName.toLowerCase()).to.equal('img');
      expect(img.src).to.include('icon.svg');
      expect(img.getAttribute('aria-hidden')).to.equal('true');
    });

    it('does not render icon when icon attribute is absent', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      expect(el.querySelector('.dvfy-loader__icon')).to.be.null;
    });

    it('icon is not rendered in dots variant', async () => {
      const el = await fixture(html`<dvfy-loader variant="dots" icon="https://example.com/icon.svg"></dvfy-loader>`);
      expect(el.querySelector('.dvfy-loader__icon')).to.be.null;
    });
  });

  describe('label', () => {
    it('renders visible label when label attribute is set', async () => {
      const el = await fixture(html`<dvfy-loader label="Uploading..."></dvfy-loader>`);
      const lbl = el.querySelector('.dvfy-loader__label');
      expect(lbl).to.exist;
      expect(lbl.textContent).to.equal('Uploading...');
      expect(lbl.getAttribute('aria-hidden')).to.equal('true');
    });

    it('uses label text as aria-label', async () => {
      const el = await fixture(html`<dvfy-loader label="Processing"></dvfy-loader>`);
      expect(el.getAttribute('aria-label')).to.equal('Processing');
    });

    it('falls back to "Loading" aria-label when no label', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      expect(el.getAttribute('aria-label')).to.equal('Loading');
    });

    it('does not render visible label when label is absent', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      expect(el.querySelector('.dvfy-loader__label')).to.be.null;
    });

    it('does not render sr-only text when label is present', async () => {
      const el = await fixture(html`<dvfy-loader label="Loading files"></dvfy-loader>`);
      const spans = el.querySelectorAll('span');
      const srSpan = Array.from(spans).find(s => s.textContent === 'Loading...');
      expect(srSpan).to.not.exist;
    });

    it('accepts label-position attribute', async () => {
      const el = await fixture(html`<dvfy-loader label="Wait" label-position="bottom"></dvfy-loader>`);
      expect(el.getAttribute('label-position')).to.equal('bottom');
      expect(el.querySelector('.dvfy-loader__label')).to.exist;
    });
  });

  describe('reactivity', () => {
    it('rebuilds when variant changes', async () => {
      const el = await fixture(html`<dvfy-loader variant="spinner"></dvfy-loader>`);
      expect(el.querySelector('.dvfy-loader__spinner')).to.exist;
      el.setAttribute('variant', 'dots');
      expect(el.querySelector('.dvfy-loader__dots')).to.exist;
      expect(el.querySelector('.dvfy-loader__spinner')).to.be.null;
    });

    it('rebuilds when size changes', async () => {
      const el = await fixture(html`<dvfy-loader size="sm"></dvfy-loader>`);
      el.setAttribute('size', 'xl');
      expect(el.getAttribute('size')).to.equal('xl');
    });

    it('rebuilds when label changes', async () => {
      const el = await fixture(html`<dvfy-loader label="Old"></dvfy-loader>`);
      el.setAttribute('label', 'New');
      expect(el.querySelector('.dvfy-loader__label').textContent).to.equal('New');
      expect(el.getAttribute('aria-label')).to.equal('New');
    });
  });

  describe('ARIA', () => {
    it('sets role="status"', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      expect(el.getAttribute('role')).to.equal('status');
    });

    it('sets aria-label', async () => {
      const el = await fixture(html`<dvfy-loader></dvfy-loader>`);
      expect(el.getAttribute('aria-label')).to.exist;
    });
  });
});
