import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-input.js';

describe('dvfy-input', () => {
  describe('rendering', () => {
    it('renders an inner input field', async () => {
      const el = await fixture(html`<dvfy-input></dvfy-input>`);
      const input = el.querySelector('.dvfy-input__field');
      expect(input).to.exist;
      expect(input.tagName).to.equal('INPUT');
      await checkA11y(el, { ignoredRules: ['label'] });
    });

    it('accepts label attribute', async () => {
      const el = await fixture(html`<dvfy-input label="Email"></dvfy-input>`);
      expect(el.getAttribute('label')).to.equal('Email');
      await checkA11y(el);
    });

    it('renders a label element with correct text', async () => {
      const el = await fixture(html`<dvfy-input label="Username"></dvfy-input>`);
      const label = el.querySelector('.dvfy-input__label');
      expect(label).to.exist;
      expect(label.textContent).to.contain('Username');
      await checkA11y(el);
    });
  });

  describe('type attribute', () => {
    it('defaults to type text', async () => {
      const el = await fixture(html`<dvfy-input></dvfy-input>`);
      const input = el.querySelector('.dvfy-input__field');
      expect(input.type).to.equal('text');
      await checkA11y(el, { ignoredRules: ['label'] });
    });

    it('creates a toggle button for password type', async () => {
      const el = await fixture(html`<dvfy-input type="password"></dvfy-input>`);
      const toggle = el.querySelector('.dvfy-input__toggle');
      expect(toggle).to.exist;
      await checkA11y(el, { ignoredRules: ['label'] });
    });

    it('hides toggle when no-preview is set on password', async () => {
      const el = await fixture(html`<dvfy-input type="password" no-preview></dvfy-input>`);
      const toggle = el.querySelector('.dvfy-input__toggle');
      expect(toggle).to.not.exist;
      await checkA11y(el, { ignoredRules: ['label'] });
    });
  });

  describe('disabled state', () => {
    it('disables the inner input when disabled attribute is set', async () => {
      const el = await fixture(html`<dvfy-input disabled></dvfy-input>`);
      const input = el.querySelector('.dvfy-input__field');
      expect(input.disabled).to.be.true;
      await checkA11y(el, { ignoredRules: ['label'] });
    });
  });

  describe('error state', () => {
    it('shows error message with role alert', async () => {
      const el = await fixture(html`<dvfy-input error="Required field"></dvfy-input>`);
      const errorMsg = el.querySelector('.dvfy-input__error-msg');
      expect(errorMsg).to.exist;
      expect(errorMsg.textContent).to.equal('Required field');
      expect(errorMsg.getAttribute('role')).to.equal('alert');
      await checkA11y(el, { ignoredRules: ['label', 'label-title-only'] });
    });

    it('sets aria-invalid on the inner input', async () => {
      const el = await fixture(html`<dvfy-input error="Invalid"></dvfy-input>`);
      const input = el.querySelector('.dvfy-input__field');
      expect(input.getAttribute('aria-invalid')).to.equal('true');
      await checkA11y(el, { ignoredRules: ['label', 'label-title-only'] });
    });
  });

  describe('help text', () => {
    it('shows help text element', async () => {
      const el = await fixture(html`<dvfy-input help="Enter your email address"></dvfy-input>`);
      const help = el.querySelector('.dvfy-input__help');
      expect(help).to.exist;
      expect(help.textContent).to.equal('Enter your email address');
      await checkA11y(el, { ignoredRules: ['label', 'label-title-only'] });
    });
  });

  describe('required', () => {
    it('shows asterisk in label', async () => {
      const el = await fixture(html`<dvfy-input label="Name" required></dvfy-input>`);
      const star = el.querySelector('.dvfy-input__required');
      expect(star).to.exist;
      expect(star.textContent).to.equal('*');
      await checkA11y(el);
    });

    it('sets required on inner input', async () => {
      const el = await fixture(html`<dvfy-input label="Name" required></dvfy-input>`);
      const input = el.querySelector('.dvfy-input__field');
      expect(input.required).to.be.true;
      await checkA11y(el);
    });
  });

  describe('value binding', () => {
    it('reflects value attribute to inner input', async () => {
      const el = await fixture(html`<dvfy-input value="hello"></dvfy-input>`);
      const input = el.querySelector('.dvfy-input__field');
      expect(input.value).to.equal('hello');
      await checkA11y(el, { ignoredRules: ['label'] });
    });
  });

  describe('clearable', () => {
    it('shows clear button when input has value', async () => {
      const el = await fixture(html`<dvfy-input clearable value="test"></dvfy-input>`);
      const clearBtn = el.querySelector('.dvfy-input__clear');
      expect(clearBtn).to.exist;
      expect(clearBtn.classList.contains('dvfy-input__clear--visible')).to.be.true;
      await checkA11y(el, { ignoredRules: ['label'] });
    });

    it('hides clear button when input is empty', async () => {
      const el = await fixture(html`<dvfy-input clearable></dvfy-input>`);
      const clearBtn = el.querySelector('.dvfy-input__clear');
      expect(clearBtn).to.exist;
      expect(clearBtn.classList.contains('dvfy-input__clear--visible')).to.be.false;
      await checkA11y(el, { ignoredRules: ['label'] });
    });
  });
});
