import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-compare-slider.js';

describe('dvfy-compare-slider', () => {
  const sliderHtml = html`
    <dvfy-compare-slider>
      <img slot="before" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Before" />
      <img slot="after" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="After" />
    </dvfy-compare-slider>
  `;

  describe('rendering', () => {
    it('renders with default value of 50', async () => {
      const el = await fixture(sliderHtml);
      expect(el.value).to.equal(50);
      expect(el.getAttribute('aria-valuenow')).to.equal('50');
    });

    it('builds before and after wrappers', async () => {
      const el = await fixture(sliderHtml);
      expect(el.querySelector('.dvfy-compare-slider-before-wrap')).to.not.be.null;
      expect(el.querySelector('.dvfy-compare-slider-after-wrap')).to.not.be.null;
    });

    it('builds divider and handle', async () => {
      const el = await fixture(sliderHtml);
      expect(el.querySelector('.dvfy-compare-slider-divider')).to.not.be.null;
      expect(el.querySelector('.dvfy-compare-slider-handle')).to.not.be.null;
    });

    it('does not build without slot content', async () => {
      const el = await fixture(html`<dvfy-compare-slider></dvfy-compare-slider>`);
      expect(el.querySelector('.dvfy-compare-slider-before-wrap')).to.be.null;
    });
  });

  describe('attributes', () => {
    it('accepts value attribute', async () => {
      const el = await fixture(html`
        <dvfy-compare-slider value="30">
          <img slot="before" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Before" />
          <img slot="after" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="After" />
        </dvfy-compare-slider>
      `);
      expect(el.value).to.equal(30);
    });

    it('clamps value to 0-100', async () => {
      const el = await fixture(sliderHtml);
      el.value = 150;
      expect(el.value).to.equal(100);
      el.value = -20;
      expect(el.value).to.equal(0);
    });

    it('renders labels when label-before and label-after are set', async () => {
      const el = await fixture(html`
        <dvfy-compare-slider label-before="Before" label-after="After">
          <img slot="before" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Before" />
          <img slot="after" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="After" />
        </dvfy-compare-slider>
      `);
      const beforeLabel = el.querySelector('.dvfy-compare-slider-label-before');
      const afterLabel = el.querySelector('.dvfy-compare-slider-label-after');
      expect(beforeLabel).to.not.be.null;
      expect(beforeLabel.textContent).to.equal('Before');
      expect(afterLabel).to.not.be.null;
      expect(afterLabel.textContent).to.equal('After');
    });
  });

  describe('events', () => {
    it('dispatches change event when value is set programmatically', async () => {
      const el = await fixture(sliderHtml);
      setTimeout(() => { el.value = 75; });
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.value).to.equal(75);
    });
  });

  describe('keyboard navigation', () => {
    it('moves right on ArrowRight', async () => {
      const el = await fixture(sliderHtml);
      el.value = 50;
      // Consume the change from setValue(50), then test ArrowRight
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.value).to.equal(51);
    });

    it('moves left on ArrowLeft', async () => {
      const el = await fixture(sliderHtml);
      el.value = 50;
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })));
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.value).to.equal(49);
    });

    it('moves by 10 with shift+ArrowRight', async () => {
      const el = await fixture(sliderHtml);
      el.value = 50;
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true })));
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.value).to.equal(60);
    });

    it('goes to 0 on Home', async () => {
      const el = await fixture(sliderHtml);
      el.value = 50;
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true })));
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.value).to.equal(0);
    });

    it('goes to 100 on End', async () => {
      const el = await fixture(sliderHtml);
      el.value = 50;
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })));
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.value).to.equal(100);
    });
  });

  describe('ARIA', () => {
    it('sets role="slider"', async () => {
      const el = await fixture(sliderHtml);
      expect(el.getAttribute('role')).to.equal('slider');
    });

    it('sets tabindex="0"', async () => {
      const el = await fixture(sliderHtml);
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('sets aria-label', async () => {
      const el = await fixture(sliderHtml);
      expect(el.getAttribute('aria-label')).to.equal('Image comparison');
    });

    it('sets aria-valuemin and aria-valuemax', async () => {
      const el = await fixture(sliderHtml);
      expect(el.getAttribute('aria-valuemin')).to.equal('0');
      expect(el.getAttribute('aria-valuemax')).to.equal('100');
    });

    it('updates aria-valuenow on value change', async () => {
      const el = await fixture(sliderHtml);
      el.value = 70;
      expect(el.getAttribute('aria-valuenow')).to.equal('70');
    });
  });
});
