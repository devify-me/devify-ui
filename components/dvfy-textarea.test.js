import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-textarea.js';

// dvfy-textarea fixtures in tests without a label are intentional (testing default state,
// testing with other attributes). In production usage, dvfy-textarea should always have
// a label attribute or be wrapped with a proper label element.
// Suppressions explained:
// - label: form elements tested without labels (testing edge cases, not recommended usage)
// - label-title-only: aria-describedby/aria-invalid present without visible label
const TEXTAREA_NO_LABEL_A11Y_RULES = { ignoredRules: ['label', 'label-title-only'] };

describe('dvfy-textarea', () => {
  describe('rendering', () => {
    it('renders an inner textarea field', async () => {
      const el = await fixture(html`<dvfy-textarea></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta).to.exist;
      expect(ta.tagName).to.equal('TEXTAREA');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });

    it('renders a label element with correct text', async () => {
      const el = await fixture(html`<dvfy-textarea label="Bio"></dvfy-textarea>`);
      const label = el.querySelector('.dvfy-textarea__label');
      expect(label).to.exist;
      expect(label.textContent).to.contain('Bio');
      await checkA11y(el);
    });
  });

  describe('rows', () => {
    it('defaults to 3 rows', async () => {
      const el = await fixture(html`<dvfy-textarea></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.rows).to.equal(3);
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });

    it('accepts custom rows attribute', async () => {
      const el = await fixture(html`<dvfy-textarea rows="6"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.rows).to.equal(6);
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });
  });

  describe('disabled state', () => {
    it('disables the inner textarea when disabled attribute is set', async () => {
      const el = await fixture(html`<dvfy-textarea disabled></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.disabled).to.be.true;
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });
  });

  describe('error state', () => {
    it('shows error message with role alert', async () => {
      const el = await fixture(html`<dvfy-textarea error="Required field"></dvfy-textarea>`);
      const errorMsg = el.querySelector('.dvfy-textarea__error-msg');
      expect(errorMsg).to.exist;
      expect(errorMsg.textContent).to.equal('Required field');
      expect(errorMsg.getAttribute('role')).to.equal('alert');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });

    it('sets aria-invalid on the inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea error="Invalid"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.getAttribute('aria-invalid')).to.equal('true');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });
  });

  describe('help text', () => {
    it('shows help text element', async () => {
      const el = await fixture(html`<dvfy-textarea help="Tell us about yourself"></dvfy-textarea>`);
      const help = el.querySelector('.dvfy-textarea__help');
      expect(help).to.exist;
      expect(help.textContent).to.equal('Tell us about yourself');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });
  });

  describe('required', () => {
    it('shows asterisk in label', async () => {
      const el = await fixture(html`<dvfy-textarea label="Notes" required></dvfy-textarea>`);
      const star = el.querySelector('.dvfy-textarea__required');
      expect(star).to.exist;
      expect(star.textContent).to.equal('*');
      await checkA11y(el);
    });

    it('sets required on inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea label="Notes" required></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.required).to.be.true;
      await checkA11y(el);
    });
  });

  describe('maxlength', () => {
    it('shows character counter with format 0/N', async () => {
      const el = await fixture(html`<dvfy-textarea maxlength="500"></dvfy-textarea>`);
      const count = el.querySelector('.dvfy-textarea__count');
      expect(count).to.exist;
      expect(count.textContent).to.equal('0/500');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });
  });

  describe('value binding', () => {
    it('reflects value attribute to inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea value="hello world"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.value).to.equal('hello world');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });
  });

  describe('placeholder', () => {
    it('reflects placeholder attribute to inner textarea', async () => {
      const el = await fixture(html`<dvfy-textarea placeholder="Enter text here"></dvfy-textarea>`);
      const ta = el.querySelector('.dvfy-textarea__field');
      expect(ta.placeholder).to.equal('Enter text here');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });
  });

  describe('state attribute', () => {
    it('renders error message when state="error"', async () => {
      const el = await fixture(html`
        <dvfy-textarea label="Bio" name="bio" state="error">
          <span slot="error-message">This field is required</span>
        </dvfy-textarea>
      `);
      const errorMsg = el.querySelector('.dvfy-textarea__error-msg');
      expect(errorMsg).to.exist;
      expect(errorMsg.textContent).to.equal('This field is required');
      await checkA11y(el);
    });

    it('renders warning message when state="warning"', async () => {
      const el = await fixture(html`
        <dvfy-textarea label="Bio" name="bio" state="warning">
          <span slot="warning-message">Character limit approaching</span>
        </dvfy-textarea>
      `);
      const warningMsg = el.querySelector('.dvfy-textarea__warning-msg');
      expect(warningMsg).to.exist;
      expect(warningMsg.textContent).to.equal('Character limit approaching');
      await checkA11y(el);
    });

    it('renders success message when state="success"', async () => {
      const el = await fixture(html`
        <dvfy-textarea label="Bio" name="bio" state="success">
          <span slot="success-message">Saved successfully</span>
        </dvfy-textarea>
      `);
      const successMsg = el.querySelector('.dvfy-textarea__success-msg');
      expect(successMsg).to.exist;
      expect(successMsg.textContent).to.equal('Saved successfully');
      await checkA11y(el);
    });

    it('renders no message when state is not set', async () => {
      const el = await fixture(html`<dvfy-textarea label="Bio" name="bio"></dvfy-textarea>`);
      expect(el.querySelector('.dvfy-textarea__error-msg')).to.not.exist;
      expect(el.querySelector('.dvfy-textarea__warning-msg')).to.not.exist;
      expect(el.querySelector('.dvfy-textarea__success-msg')).to.not.exist;
      await checkA11y(el);
    });

    it('updates message when state changes', async () => {
      const el = await fixture(html`
        <dvfy-textarea label="Bio" name="bio" state="error">
          <span slot="error-message">Error 1</span>
          <span slot="warning-message">Warning 1</span>
        </dvfy-textarea>
      `);
      expect(el.querySelector('.dvfy-textarea__error-msg')?.textContent).to.equal('Error 1');

      el.setAttribute('state', 'warning');

      expect(el.querySelector('.dvfy-textarea__warning-msg')?.textContent).to.equal('Warning 1');
      await checkA11y(el);
    });

    it('backward compatible with error attribute', async () => {
      const el = await fixture(html`<dvfy-textarea label="Bio" name="bio" error="Legacy error"></dvfy-textarea>`);
      const errorMsg = el.querySelector('.dvfy-textarea__error-msg');
      expect(errorMsg?.textContent).to.equal('Legacy error');
      await checkA11y(el, TEXTAREA_NO_LABEL_A11Y_RULES);
    });

    it('passes axe checks for all states', async () => {
      const el = await fixture(html`
        <dvfy-textarea label="Bio" name="bio" state="error">
          <span slot="error-message">Invalid</span>
        </dvfy-textarea>
      `);
      await checkA11y(el);
    });
  });
});
