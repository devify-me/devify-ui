import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-textarea.js';

describe('dvfy-textarea', () => {
  describe('rendering', () => {
    it('renders an inner textarea field', async () => {
      const el = await fixture(html`<dvfy-textarea></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta).to.exist;
      expect(ta.tagName).to.equal('TEXTAREA');
    });

    it('renders a label element with correct text', async () => {
      const el = await fixture(html`<dvfy-textarea label="Bio"></dvfy-textarea>`);
      const label = el.querySelector('.dvfy-textarea__label');
      expect(label).to.exist;
      expect(label.textContent).to.contain('Bio');
    });
  });

  describe('rows', () => {
    it('defaults to 3 rows', async () => {
      const el = await fixture(html`<dvfy-textarea></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.rows).to.equal(3);
    });

    it('accepts custom rows attribute', async () => {
      const el = await fixture(html`<dvfy-textarea rows="6"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.rows).to.equal(6);
    });
  });

  describe('disabled state', () => {
    it('disables the inner textarea when disabled attribute is set', async () => {
      const el = await fixture(html`<dvfy-textarea disabled></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.disabled).to.be.true;
    });
  });

  describe('error state', () => {
    it('shows error message with role alert', async () => {
      const el = await fixture(html`<dvfy-textarea error="Required field"></dvfy-textarea>`);
      const errorMsg = el.querySelector('.dvfy-textarea__error-msg');
      expect(errorMsg).to.exist;
      expect(errorMsg.textContent).to.equal('Required field');
      expect(errorMsg.getAttribute('role')).to.equal('alert');
    });

    it('sets aria-invalid on the inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea error="Invalid"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.getAttribute('aria-invalid')).to.equal('true');
    });
  });

  describe('help text', () => {
    it('shows help text element', async () => {
      const el = await fixture(html`<dvfy-textarea help="Tell us about yourself"></dvfy-textarea>`);
      const help = el.querySelector('.dvfy-textarea__help');
      expect(help).to.exist;
      expect(help.textContent).to.equal('Tell us about yourself');
    });
  });

  describe('required', () => {
    it('shows asterisk in label', async () => {
      const el = await fixture(html`<dvfy-textarea label="Notes" required></dvfy-textarea>`);
      const star = el.querySelector('.dvfy-textarea__required');
      expect(star).to.exist;
      expect(star.textContent).to.equal('*');
    });

    it('sets required on inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea label="Notes" required></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.required).to.be.true;
    });
  });

  describe('maxlength', () => {
    it('shows character counter with format 0/N', async () => {
      const el = await fixture(html`<dvfy-textarea maxlength="500"></dvfy-textarea>`);
      const count = el.querySelector('.dvfy-textarea__count');
      expect(count).to.exist;
      expect(count.textContent).to.equal('0/500');
    });
  });

  describe('value binding', () => {
    it('reflects value attribute to inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea value="hello world"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.value).to.equal('hello world');
    });
  });

  describe('placeholder', () => {
    it('reflects placeholder attribute to inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea placeholder="Enter text here"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.placeholder).to.equal('Enter text here');
    });
  });
});
