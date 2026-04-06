import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-switch.js';

// dvfy-switch uses role="switch" on a custom element for better component control and styling.
// Suppressions explained:
// - nested-interactive: hidden input inside switch element (component handles all behavior)
// - aria-toggle-field-name: switches without label attribute are missing accessible names (tests check
//   rendering without labels; production usage should include label attribute or aria-label)
const SWITCH_A11Y_RULES = { ignoredRules: ['nested-interactive', 'aria-toggle-field-name'] };

describe('dvfy-switch', () => {
  describe('rendering', () => {
    it('sets role="switch" and tabindex="0"', async () => {
      const el = await fixture(html`<dvfy-switch></dvfy-switch>`);
      expect(el.getAttribute('role')).to.equal('switch');
      expect(el.getAttribute('tabindex')).to.equal('0');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });

    it('creates track and thumb elements', async () => {
      const el = await fixture(html`<dvfy-switch></dvfy-switch>`);
      expect(el.querySelector('.dvfy-switch__track')).to.exist;
      expect(el.querySelector('.dvfy-switch__thumb')).to.exist;
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });

  describe('unchecked default', () => {
    it('has aria-checked="false" by default', async () => {
      const el = await fixture(html`<dvfy-switch></dvfy-switch>`);
      expect(el.getAttribute('aria-checked')).to.equal('false');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });

  describe('checked state', () => {
    it('sets aria-checked="true" when checked', async () => {
      const el = await fixture(html`<dvfy-switch checked></dvfy-switch>`);
      expect(el.getAttribute('aria-checked')).to.equal('true');
      expect(el.hasAttribute('checked')).to.be.true;
      await checkA11y(el, SWITCH_A11Y_RULES);
    });

    it('sets hidden input value when checked', async () => {
      const el = await fixture(html`<dvfy-switch checked name="toggle"></dvfy-switch>`);
      const input = el.querySelector('input');
      expect(input.value).to.equal('on');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });

    it('uses custom value attribute when checked', async () => {
      const el = await fixture(html`<dvfy-switch checked name="toggle" value="yes"></dvfy-switch>`);
      const input = el.querySelector('input');
      expect(input.value).to.equal('yes');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });

  describe('toggle on click', () => {
    it('toggles checked attribute on click', async () => {
      const el = await fixture(html`<dvfy-switch></dvfy-switch>`);
      el.click();
      expect(el.hasAttribute('checked')).to.be.true;
      expect(el.getAttribute('aria-checked')).to.equal('true');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });

    it('toggles off when clicking a checked switch', async () => {
      const el = await fixture(html`<dvfy-switch checked></dvfy-switch>`);
      el.click();
      expect(el.hasAttribute('checked')).to.be.false;
      expect(el.getAttribute('aria-checked')).to.equal('false');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });

  describe('disabled state', () => {
    it('sets tabindex="-1" when disabled', async () => {
      const el = await fixture(html`<dvfy-switch disabled></dvfy-switch>`);
      expect(el.getAttribute('tabindex')).to.equal('-1');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });

    it('does not toggle on click when disabled', async () => {
      const el = await fixture(html`<dvfy-switch disabled></dvfy-switch>`);
      el.click();
      expect(el.hasAttribute('checked')).to.be.false;
      expect(el.getAttribute('aria-checked')).to.equal('false');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });

  describe('keyboard interaction', () => {
    it('toggles on Space key', async () => {
      const el = await fixture(html`<dvfy-switch></dvfy-switch>`);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(el.hasAttribute('checked')).to.be.true;
      await checkA11y(el, SWITCH_A11Y_RULES);
    });

    it('toggles on Enter key', async () => {
      const el = await fixture(html`<dvfy-switch></dvfy-switch>`);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(el.hasAttribute('checked')).to.be.true;
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });

  describe('label and description', () => {
    it('renders label text', async () => {
      const el = await fixture(html`<dvfy-switch label="Notifications"></dvfy-switch>`);
      const label = el.querySelector('.dvfy-switch__label');
      expect(label).to.exist;
      expect(label.textContent).to.equal('Notifications');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });

    it('renders description text', async () => {
      const el = await fixture(html`<dvfy-switch label="Notifications" description="Receive alerts"></dvfy-switch>`);
      const desc = el.querySelector('.dvfy-switch__desc');
      expect(desc).to.exist;
      expect(desc.textContent).to.equal('Receive alerts');
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });

  describe('change event', () => {
    it('fires change event on toggle', async () => {
      const el = await fixture(html`<dvfy-switch></dvfy-switch>`);
      setTimeout(() => el.click());
      const event = await oneEvent(el, 'change');
      expect(event).to.exist;
      expect(event.bubbles).to.be.true;
      await checkA11y(el, SWITCH_A11Y_RULES);
    });
  });
});
