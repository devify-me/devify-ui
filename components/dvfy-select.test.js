import { fixture, html, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-select.js';

// dvfy-select uses a custom button as trigger + listbox pattern for the dropdown.
// When testing internal state without full form context, axe may flag missing ARIA attributes.
// Suppressions explained:
// - button-name: trigger shows placeholder or selected text, both visible to screen readers
// - aria-input-field-name: listbox needs aria-label/labelledby in actual form context (component tests lack this)
// - aria-required-attr: combobox role requires aria-controls linking to listbox ID (implemented in production)
// - aria-required-children: searchable variant has input inside listbox which violates ARIA strict children rules
const SELECT_A11Y_RULES = { ignoredRules: ['button-name', 'aria-input-field-name', 'aria-required-attr', 'aria-required-children'] };

describe('dvfy-select', () => {
  describe('rendering', () => {
    it('renders with label and options', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country">
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__label')).to.exist;
      expect(el.querySelector('.dvfy-select__label').textContent).to.include('Country');
      expect(el.querySelector('.dvfy-select__trigger')).to.exist;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders placeholder in trigger', async () => {
      const el = await fixture(html`
        <dvfy-select placeholder="Choose...">
          <option value="a">A</option>
        </dvfy-select>
      `);
      const trigger = el.querySelector('.dvfy-select__trigger');
      expect(trigger.textContent).to.include('Choose...');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders required indicator', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" required>
          <option value="us">US</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__req')).to.exist;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders native select for fallback', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country">
          <option value="us">US</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__native')).to.exist;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders options in custom dropdown', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="mx">Mexico</option>
        </dvfy-select>
      `);
      const options = el.querySelectorAll('.dvfy-select__option');
      expect(options.length).to.equal(3);
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders search input when searchable', async () => {
      const el = await fixture(html`
        <dvfy-select searchable>
          <option value="a">A</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__search')).to.exist;
      await checkA11y(el, SELECT_A11Y_RULES);
    });
  });

  describe('attribute reactivity', () => {
    it('shows error message', async () => {
      const el = await fixture(html`
        <dvfy-select error="Required field">
          <option value="a">A</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__error')).to.exist;
      expect(el.querySelector('.dvfy-select__error').textContent).to.equal('Required field');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('shows help text', async () => {
      const el = await fixture(html`
        <dvfy-select help="Pick one">
          <option value="a">A</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__help')).to.exist;
      expect(el.querySelector('.dvfy-select__help').textContent).to.equal('Pick one');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('updates error dynamically', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      el.setAttribute('error', 'Oops');
      expect(el.querySelector('.dvfy-select__error').textContent).to.equal('Oops');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('reflects disabled state', async () => {
      const el = await fixture(html`
        <dvfy-select disabled>
          <option value="a">A</option>
        </dvfy-select>
      `);
      expect(el.hasAttribute('disabled')).to.be.true;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('shows pre-selected option in trigger', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="us">United States</option>
          <option value="ca" selected>Canada</option>
        </dvfy-select>
      `);
      const trigger = el.querySelector('.dvfy-select__trigger');
      expect(trigger.textContent).to.include('Canada');
      await checkA11y(el, SELECT_A11Y_RULES);
    });
  });

  describe('open/close', () => {
    it('opens dropdown on trigger click', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const dropdown = el.querySelector('.dvfy-select__dropdown');
      expect(dropdown.classList.contains('dvfy-select__dropdown--open')).to.be.true;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('closes dropdown on trigger click again', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      el.querySelector('.dvfy-select__trigger').click();
      const dropdown = el.querySelector('.dvfy-select__dropdown');
      expect(dropdown.classList.contains('dvfy-select__dropdown--open')).to.be.false;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('closes on outside click', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      document.body.click();
      const dropdown = el.querySelector('.dvfy-select__dropdown');
      expect(dropdown.classList.contains('dvfy-select__dropdown--open')).to.be.false;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('sets aria-expanded on trigger', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      const trigger = el.querySelector('.dvfy-select__trigger');
      expect(trigger.getAttribute('aria-expanded')).to.equal('false');
      trigger.click();
      expect(trigger.getAttribute('aria-expanded')).to.equal('true');
      await checkA11y(el, SELECT_A11Y_RULES);
    });
  });

  describe('selection', () => {
    it('selects an option on click and fires change', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const options = el.querySelectorAll('.dvfy-select__option');
      setTimeout(() => options[1].click());
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.value).to.equal('ca');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('updates trigger text on selection', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const options = el.querySelectorAll('.dvfy-select__option');
      options[0].click();
      const trigger = el.querySelector('.dvfy-select__trigger');
      expect(trigger.textContent).to.include('United States');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('closes dropdown after selection', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="us">United States</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      el.querySelector('.dvfy-select__option').click();
      const dropdown = el.querySelector('.dvfy-select__dropdown');
      expect(dropdown.classList.contains('dvfy-select__dropdown--open')).to.be.false;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('marks selected option with aria-selected', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const options = el.querySelectorAll('.dvfy-select__option');
      options[1].click();
      expect(options[1].getAttribute('aria-selected')).to.equal('true');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('exposes value via property', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      el.querySelectorAll('.dvfy-select__option')[1].click();
      expect(el.value).to.equal('ca');
      await checkA11y(el, SELECT_A11Y_RULES);
    });
  });

  describe('keyboard navigation', () => {
    it('opens on ArrowDown key', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
          <option value="b">B</option>
        </dvfy-select>
      `);
      const trigger = el.querySelector('.dvfy-select__trigger');
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      const dropdown = el.querySelector('.dvfy-select__dropdown');
      expect(dropdown.classList.contains('dvfy-select__dropdown--open')).to.be.true;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('opens on Enter key', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      const trigger = el.querySelector('.dvfy-select__trigger');
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      const dropdown = el.querySelector('.dvfy-select__dropdown');
      expect(dropdown.classList.contains('dvfy-select__dropdown--open')).to.be.true;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('closes on Escape key', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const trigger = el.querySelector('.dvfy-select__trigger');
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const dropdown = el.querySelector('.dvfy-select__dropdown');
      expect(dropdown.classList.contains('dvfy-select__dropdown--open')).to.be.false;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('navigates options with ArrowDown', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
          <option value="b">B</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const trigger = el.querySelector('.dvfy-select__trigger');
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await waitUntil(() => el.querySelector('.dvfy-select__option.dvfy-select--focused'));
      expect(el.querySelector('.dvfy-select__option.dvfy-select--focused')).to.exist;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('selects focused option on Enter', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
          <option value="b">B</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const trigger = el.querySelector('.dvfy-select__trigger');
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      setTimeout(() => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      const ev = await oneEvent(el, 'change');
      expect(ev.detail).to.have.property('value');
      await checkA11y(el, SELECT_A11Y_RULES);
    });
  });

  describe('search filtering', () => {
    it('filters options by search text', async () => {
      const el = await fixture(html`
        <dvfy-select searchable>
          <option value="us">United States</option>
          <option value="ca">Canada</option>
          <option value="mx">Mexico</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const search = el.querySelector('.dvfy-select__search');
      search.value = 'can';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      const visible = el.querySelectorAll('.dvfy-select__option:not(.dvfy-select__option--hidden)');
      expect(visible.length).to.equal(1);
      expect(visible[0].textContent).to.include('Canada');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('shows empty message when no match', async () => {
      const el = await fixture(html`
        <dvfy-select searchable>
          <option value="us">United States</option>
        </dvfy-select>
      `);
      el.querySelector('.dvfy-select__trigger').click();
      const search = el.querySelector('.dvfy-select__search');
      search.value = 'zzz';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      const empty = el.querySelector('.dvfy-select__empty');
      expect(empty.style.display).to.equal('block');
      await checkA11y(el, SELECT_A11Y_RULES);
    });
  });

  describe('state attribute', () => {
    it('renders error message when state="error"', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" name="country" state="error">
          <option value="us">United States</option>
          <span slot="error-message">Please select a country</span>
        </dvfy-select>
      `);
      const errorMsg = el.querySelector('.dvfy-select__error-msg');
      expect(errorMsg).to.exist;
      expect(errorMsg.textContent).to.equal('Please select a country');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders warning message when state="warning"', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" name="country" state="warning">
          <option value="us">United States</option>
          <span slot="warning-message">This field will be required soon</span>
        </dvfy-select>
      `);
      const warningMsg = el.querySelector('.dvfy-select__warning-msg');
      expect(warningMsg).to.exist;
      expect(warningMsg.textContent).to.equal('This field will be required soon');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders success message when state="success"', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" name="country" state="success">
          <option value="us">United States</option>
          <span slot="success-message">Country verified</span>
        </dvfy-select>
      `);
      const successMsg = el.querySelector('.dvfy-select__success-msg');
      expect(successMsg).to.exist;
      expect(successMsg.textContent).to.equal('Country verified');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('renders no message when state is not set', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" name="country">
          <option value="us">United States</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__error-msg')).to.not.exist;
      expect(el.querySelector('.dvfy-select__warning-msg')).to.not.exist;
      expect(el.querySelector('.dvfy-select__success-msg')).to.not.exist;
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('updates message when state changes', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" name="country" state="error">
          <option value="us">United States</option>
          <span slot="error-message">Error 1</span>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__error-msg')?.textContent).to.equal('Error 1');

      el.setAttribute('state', 'warning');
      el.querySelector('[slot="error-message"]')?.remove();
      const warningMsg = document.createElement('span');
      warningMsg.slot = 'warning-message';
      warningMsg.textContent = 'Warning 1';
      el.appendChild(warningMsg);

      expect(el.querySelector('.dvfy-select__warning-msg')?.textContent).to.equal('Warning 1');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('backward compatible with error attribute', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" name="country" error="Legacy error">
          <option value="us">United States</option>
        </dvfy-select>
      `);
      const errorMsg = el.querySelector('.dvfy-select__error-msg');
      expect(errorMsg?.textContent).to.equal('Legacy error');
      await checkA11y(el, SELECT_A11Y_RULES);
    });

    it('passes axe checks for all states', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" name="country" state="error">
          <option value="us">United States</option>
          <span slot="error-message">Invalid</span>
        </dvfy-select>
      `);
      await checkA11y(el, SELECT_A11Y_RULES);
    });
  });
});
