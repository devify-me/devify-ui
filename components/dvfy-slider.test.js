import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-slider.js';

describe('dvfy-slider', () => {
  describe('rendering', () => {
    it('renders a range input, track, and fill bar', async () => {
      const el = await fixture(html`<dvfy-slider></dvfy-slider>`);
      const input = el.querySelector('input[type="range"]');
      const track = el.querySelector('.dvfy-slider__track');
      const fill = el.querySelector('.dvfy-slider__fill');
      expect(input).to.exist;
      expect(track).to.exist;
      expect(fill).to.exist;
    });
  });

  describe('label', () => {
    it('renders a label element with correct text', async () => {
      const el = await fixture(html`<dvfy-slider label="Volume"></dvfy-slider>`);
      const label = el.querySelector('.dvfy-slider__label');
      expect(label).to.exist;
      expect(label.textContent).to.equal('Volume');
    });
  });

  describe('min/max/value', () => {
    it('reflects min, max, and value on the inner input', async () => {
      const el = await fixture(html`<dvfy-slider min="10" max="200" value="75"></dvfy-slider>`);
      const input = el.querySelector('input[type="range"]');
      expect(input.min).to.equal('10');
      expect(input.max).to.equal('200');
      expect(input.value).to.equal('75');
    });
  });

  describe('show-value', () => {
    it('displays a value span with the current value', async () => {
      const el = await fixture(html`<dvfy-slider value="42" show-value></dvfy-slider>`);
      const valueSpan = el.querySelector('.dvfy-slider__value');
      expect(valueSpan).to.exist;
      expect(valueSpan.textContent).to.equal('42');
    });
  });

  describe('disabled state', () => {
    it('disables the inner input when disabled attribute is set', async () => {
      const el = await fixture(html`<dvfy-slider disabled></dvfy-slider>`);
      const input = el.querySelector('input[type="range"]');
      expect(input.disabled).to.be.true;
    });
  });

  describe('steps', () => {
    it('creates steps+1 tick marks', async () => {
      const el = await fixture(html`<dvfy-slider steps="5"></dvfy-slider>`);
      const ticks = el.querySelectorAll('.dvfy-slider__tick');
      expect(ticks.length).to.equal(6);
    });
  });

  describe('range mode', () => {
    it('creates two inputs with min and max classes', async () => {
      const el = await fixture(html`<dvfy-slider range value="20" value-end="80"></dvfy-slider>`);
      const inputMin = el.querySelector('.dvfy-slider__input-min');
      const inputMax = el.querySelector('.dvfy-slider__input-max');
      expect(inputMin).to.exist;
      expect(inputMax).to.exist;
      expect(inputMin.value).to.equal('20');
      expect(inputMax.value).to.equal('80');
    });

    it('shows "lo – hi" in value display', async () => {
      const el = await fixture(html`<dvfy-slider range value="20" value-end="80" show-value></dvfy-slider>`);
      const valueSpan = el.querySelector('.dvfy-slider__value');
      expect(valueSpan).to.exist;
      expect(valueSpan.textContent).to.equal('20 \u2013 80');
    });
  });

  describe('no-fill', () => {
    it('still renders the fill element in the DOM', async () => {
      const el = await fixture(html`<dvfy-slider no-fill></dvfy-slider>`);
      const fill = el.querySelector('.dvfy-slider__fill');
      expect(fill).to.exist;
    });
  });

  describe('input event', () => {
    it('fires input event with detail.value on input interaction', async () => {
      const el = await fixture(html`<dvfy-slider value="50"></dvfy-slider>`);
      const input = el.querySelector('input[type="range"]');
      const listener = oneEvent(el, 'input');
      input.value = 75;
      input.dispatchEvent(new Event('input'));
      const event = await listener;
      expect(event.detail.value).to.equal(75);
    });
  });
});
