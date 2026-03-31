import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-radio.js';

describe('dvfy-radio', () => {
  describe('rendering', () => {
    it('renders with role="radio"', async () => {
      const el = await fixture(html`<dvfy-radio label="Option A"></dvfy-radio>`);
      expect(el.getAttribute('role')).to.equal('radio');
    });

    it('creates an inner radio input', async () => {
      const el = await fixture(html`<dvfy-radio label="Option A"></dvfy-radio>`);
      const input = el.querySelector('.dvfy-radio__input');
      expect(input).to.exist;
      expect(input.type).to.equal('radio');
    });

    it('shows the label text', async () => {
      const el = await fixture(html`<dvfy-radio label="Option A"></dvfy-radio>`);
      const lbl = el.querySelector('.dvfy-radio__label');
      expect(lbl).to.exist;
      expect(lbl.textContent).to.equal('Option A');
    });
  });

  describe('checked state', () => {
    it('reflects checked attr to inner input and aria-checked', async () => {
      const el = await fixture(html`<dvfy-radio label="On" checked></dvfy-radio>`);
      const input = el.querySelector('.dvfy-radio__input');
      expect(input.checked).to.be.true;
      expect(el.getAttribute('aria-checked')).to.equal('true');
    });
  });

  describe('unchecked default', () => {
    it('has aria-checked="false" when not checked', async () => {
      const el = await fixture(html`<dvfy-radio label="Off"></dvfy-radio>`);
      expect(el.getAttribute('aria-checked')).to.equal('false');
    });
  });

  describe('disabled state', () => {
    it('disables the inner input when disabled attr is set', async () => {
      const el = await fixture(html`<dvfy-radio label="Disabled" disabled></dvfy-radio>`);
      const input = el.querySelector('.dvfy-radio__input');
      expect(input.disabled).to.be.true;
    });
  });

  describe('name grouping', () => {
    it('unchecks siblings with the same name when one is selected', async () => {
      const container = await fixture(html`
        <div>
          <dvfy-radio name="color" value="red" label="Red" checked></dvfy-radio>
          <dvfy-radio name="color" value="blue" label="Blue"></dvfy-radio>
        </div>
      `);
      const [red, blue] = container.querySelectorAll('dvfy-radio');

      // Select blue via its inner input
      const blueInput = blue.querySelector('.dvfy-radio__input');
      blueInput.checked = true;
      blueInput.dispatchEvent(new Event('change'));

      expect(blue.getAttribute('aria-checked')).to.equal('true');
      expect(blue.hasAttribute('checked')).to.be.true;
      expect(red.getAttribute('aria-checked')).to.equal('false');
      expect(red.hasAttribute('checked')).to.be.false;
    });
  });

  describe('change event', () => {
    it('fires a change event when selected', async () => {
      const el = await fixture(html`<dvfy-radio name="plan" value="pro" label="Pro"></dvfy-radio>`);
      const input = el.querySelector('.dvfy-radio__input');

      setTimeout(() => {
        input.checked = true;
        input.dispatchEvent(new Event('change'));
      });

      const event = await oneEvent(el, 'change');
      expect(event).to.exist;
      expect(event.bubbles).to.be.true;
    });
  });
});
