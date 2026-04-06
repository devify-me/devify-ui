import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-checkbox.js';

describe('dvfy-checkbox', () => {
  describe('rendering', () => {
    it('renders with role="checkbox"', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Accept"></dvfy-checkbox>`);
      expect(el.getAttribute('role')).to.equal('checkbox');
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });

    it('creates an inner checkbox input', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Accept"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      expect(input).to.exist;
      expect(input.type).to.equal('checkbox');
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });

    it('shows label text', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Accept terms"></dvfy-checkbox>`);
      const lbl = el.querySelector('.dvfy-checkbox__label');
      expect(lbl).to.exist;
      expect(lbl.textContent).to.equal('Accept terms');
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });
  });

  describe('unchecked default', () => {
    it('has aria-checked="false" when no checked attr', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Test"></dvfy-checkbox>`);
      expect(el.getAttribute('aria-checked')).to.equal('false');
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });

    it('inner input is not checked', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Test"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      expect(input.checked).to.be.false;
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });
  });

  describe('checked state', () => {
    it('reflects checked attr to inner input and aria-checked', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Test" checked></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      expect(input.checked).to.be.true;
      expect(el.getAttribute('aria-checked')).to.equal('true');
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });
  });

  describe('disabled state', () => {
    it('disables the inner input', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Test" disabled></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      expect(input.disabled).to.be.true;
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });
  });

  describe('indeterminate state', () => {
    it('sets aria-checked="mixed" and inner input indeterminate', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Select all" indeterminate></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      expect(el.getAttribute('aria-checked')).to.equal('mixed');
      expect(input.indeterminate).to.be.true;
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] });
    });
  });

  describe('change event', () => {
    it('fires change with detail.checked on click (binary)', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Test"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      setTimeout(() => input.click());
      const event = await oneEvent(el, 'change');
      expect(event.detail.checked).to.be.true;
      expect(event.detail.indeterminate).to.be.false;
    });

    it('fires change with tri-state cycling on click', async () => {
      const el = await fixture(html`<dvfy-checkbox label="All" indeterminate></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      // indeterminate -> checked
      setTimeout(() => input.click());
      const ev1 = await oneEvent(el, 'change');
      expect(ev1.detail.checked).to.be.true;
      expect(ev1.detail.indeterminate).to.be.false;
    });
  });

  describe('label', () => {
    it('renders no label element when label attr is absent', async () => {
      const el = await fixture(html`<dvfy-checkbox></dvfy-checkbox>`);
      const lbl = el.querySelector('.dvfy-checkbox__label');
      expect(lbl).to.not.exist;
      await checkA11y(el, { ignoredRules: ['nested-interactive', 'aria-toggle-field-name', 'label'] });
    });
  });
});
