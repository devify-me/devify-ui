import { fixture, html, expect, oneEvent, waitUntil } from '@open-wc/testing';
import './dvfy-select.js';

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
    });

    it('renders placeholder in trigger', async () => {
      const el = await fixture(html`
        <dvfy-select placeholder="Choose...">
          <option value="a">A</option>
        </dvfy-select>
      `);
      const trigger = el.querySelector('.dvfy-select__trigger');
      expect(trigger.textContent).to.include('Choose...');
    });

    it('renders required indicator', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country" required>
          <option value="us">US</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__req')).to.exist;
    });

    it('renders native select for fallback', async () => {
      const el = await fixture(html`
        <dvfy-select label="Country">
          <option value="us">US</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__native')).to.exist;
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
    });

    it('renders search input when searchable', async () => {
      const el = await fixture(html`
        <dvfy-select searchable>
          <option value="a">A</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__search')).to.exist;
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
    });

    it('shows help text', async () => {
      const el = await fixture(html`
        <dvfy-select help="Pick one">
          <option value="a">A</option>
        </dvfy-select>
      `);
      expect(el.querySelector('.dvfy-select__help')).to.exist;
      expect(el.querySelector('.dvfy-select__help').textContent).to.equal('Pick one');
    });

    it('updates error dynamically', async () => {
      const el = await fixture(html`
        <dvfy-select>
          <option value="a">A</option>
        </dvfy-select>
      `);
      el.setAttribute('error', 'Oops');
      expect(el.querySelector('.dvfy-select__error').textContent).to.equal('Oops');
    });

    it('reflects disabled state', async () => {
      const el = await fixture(html`
        <dvfy-select disabled>
          <option value="a">A</option>
        </dvfy-select>
      `);
      expect(el.hasAttribute('disabled')).to.be.true;
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
    });
  });
});
