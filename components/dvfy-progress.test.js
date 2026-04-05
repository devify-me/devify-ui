import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-progress.js';

describe('dvfy-progress', () => {
  describe('rendering', () => {
    it('renders bar variant by default', async () => {
      const el = await fixture(html`<dvfy-progress value="50"></dvfy-progress>`);
      const track = el.querySelector('.dvfy-progress__track');
      expect(track).to.not.be.null;
      const fill = el.querySelector('.dvfy-progress__fill');
      expect(fill).to.not.be.null;
      expect(fill.style.width).to.equal('50%');
    });

    it('renders with zero value by default', async () => {
      const el = await fixture(html`<dvfy-progress></dvfy-progress>`);
      const fill = el.querySelector('.dvfy-progress__fill');
      expect(fill.style.width).to.equal('0%');
    });
  });

  describe('attributes', () => {
    it('clamps value to 0-100', async () => {
      const el = await fixture(html`<dvfy-progress value="150"></dvfy-progress>`);
      expect(el.getAttribute('aria-valuenow')).to.equal('100');

      el.setAttribute('value', '-10');
      expect(el.getAttribute('aria-valuenow')).to.equal('0');
    });

    it('updates fill width when value changes', async () => {
      const el = await fixture(html`<dvfy-progress value="30"></dvfy-progress>`);
      expect(el.querySelector('.dvfy-progress__fill').style.width).to.equal('30%');
      el.setAttribute('value', '80');
      expect(el.querySelector('.dvfy-progress__fill').style.width).to.equal('80%');
    });

    for (const status of ['default', 'success', 'warning', 'danger']) {
      it(`accepts status="${status}"`, async () => {
        const el = await fixture(html`<dvfy-progress value="50" status="${status}"></dvfy-progress>`);
        expect(el.getAttribute('status')).to.equal(status);
      });
    }

    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      it(`accepts size="${size}"`, async () => {
        const el = await fixture(html`<dvfy-progress value="50" size="${size}"></dvfy-progress>`);
        expect(el.getAttribute('size')).to.equal(size);
      });
    }
  });

  describe('label', () => {
    it('shows percentage label when label attribute is set', async () => {
      const el = await fixture(html`<dvfy-progress value="75" label></dvfy-progress>`);
      const lbl = el.querySelector('.dvfy-progress__label');
      expect(lbl).to.not.be.null;
      expect(lbl.textContent).to.equal('75%');
    });

    it('does not show label without attribute', async () => {
      const el = await fixture(html`<dvfy-progress value="75"></dvfy-progress>`);
      expect(el.querySelector('.dvfy-progress__label')).to.be.null;
    });
  });

  describe('circle variant', () => {
    it('renders SVG circle', async () => {
      const el = await fixture(html`<dvfy-progress value="60" variant="circle"></dvfy-progress>`);
      const svg = el.querySelector('.dvfy-progress__circle');
      expect(svg).to.not.be.null;
      expect(el.querySelector('.dvfy-progress__ring-bg')).to.not.be.null;
      expect(el.querySelector('.dvfy-progress__ring-fg')).to.not.be.null;
    });

    it('renders circle label when label is set', async () => {
      const el = await fixture(html`<dvfy-progress value="60" variant="circle" label></dvfy-progress>`);
      const text = el.querySelector('.dvfy-progress__circle-label');
      expect(text).to.not.be.null;
      expect(text.textContent).to.equal('60%');
    });

    it('does not render circle label without label attr', async () => {
      const el = await fixture(html`<dvfy-progress value="60" variant="circle"></dvfy-progress>`);
      expect(el.querySelector('.dvfy-progress__circle-label')).to.be.null;
    });

    it('applies correct SVG dimensions for each size', async () => {
      const el = await fixture(html`<dvfy-progress value="50" variant="circle" size="lg"></dvfy-progress>`);
      const svg = el.querySelector('.dvfy-progress__circle');
      expect(svg.getAttribute('width')).to.equal('96');
      expect(svg.getAttribute('height')).to.equal('96');
    });
  });

  describe('oval variant', () => {
    it('renders bar track with oval variant', async () => {
      const el = await fixture(html`<dvfy-progress value="40" variant="oval"></dvfy-progress>`);
      const track = el.querySelector('.dvfy-progress__track');
      expect(track).to.not.be.null;
    });
  });

  describe('ARIA', () => {
    it('sets role="progressbar"', async () => {
      const el = await fixture(html`<dvfy-progress value="50"></dvfy-progress>`);
      expect(el.getAttribute('role')).to.equal('progressbar');
    });

    it('sets aria-valuenow, aria-valuemin, aria-valuemax', async () => {
      const el = await fixture(html`<dvfy-progress value="42"></dvfy-progress>`);
      expect(el.getAttribute('aria-valuenow')).to.equal('42');
      expect(el.getAttribute('aria-valuemin')).to.equal('0');
      expect(el.getAttribute('aria-valuemax')).to.equal('100');
    });

    it('updates aria-valuenow when value changes', async () => {
      const el = await fixture(html`<dvfy-progress value="20"></dvfy-progress>`);
      el.setAttribute('value', '80');
      expect(el.getAttribute('aria-valuenow')).to.equal('80');
    });
  });
});
