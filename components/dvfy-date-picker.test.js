import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-date-picker.js';

describe('dvfy-date-picker', () => {
  describe('rendering', () => {
    it('renders with default state', async () => {
      const el = await fixture(html`<dvfy-date-picker label="Date"></dvfy-date-picker>`);
      expect(el.querySelector('.dvfy-date-picker__label')).to.exist;
      expect(el.querySelector('.dvfy-date-picker__input')).to.exist;
      expect(el.querySelector('.dvfy-date-picker__toggle')).to.exist;
    });

    it('displays label text', async () => {
      const el = await fixture(html`<dvfy-date-picker label="Start Date"></dvfy-date-picker>`);
      expect(el.querySelector('.dvfy-date-picker__label').textContent).to.include('Start Date');
    });

    it('shows required indicator', async () => {
      const el = await fixture(html`<dvfy-date-picker label="Date" required></dvfy-date-picker>`);
      const req = el.querySelector('.dvfy-date-picker__required');
      expect(req).to.exist;
      expect(req.textContent).to.equal('*');
    });

    it('shows placeholder text', async () => {
      const el = await fixture(html`<dvfy-date-picker placeholder="Pick a date"></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      expect(input.placeholder).to.equal('Pick a date');
    });
  });

  describe('attribute reactivity', () => {
    it('reflects value attribute into input display', async () => {
      const el = await fixture(html`<dvfy-date-picker value="2026-03-15"></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      expect(input.value).to.not.be.empty;
    });

    it('updates display when value changes', async () => {
      const el = await fixture(html`<dvfy-date-picker value="2026-01-01"></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      const before = input.value;
      el.setAttribute('value', '2026-06-15');
      expect(input.value).to.not.equal(before);
    });

    it('disables input when disabled attribute is set', async () => {
      const el = await fixture(html`<dvfy-date-picker disabled></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      expect(input.disabled).to.be.true;
    });

    it('shows error message', async () => {
      const el = await fixture(html`<dvfy-date-picker error="Invalid date"></dvfy-date-picker>`);
      expect(el.textContent).to.include('Invalid date');
    });

    it('shows help text', async () => {
      const el = await fixture(html`<dvfy-date-picker help="Format: YYYY-MM-DD"></dvfy-date-picker>`);
      expect(el.textContent).to.include('Format: YYYY-MM-DD');
    });

    it('updates error dynamically', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      el.setAttribute('error', 'Required field');
      expect(el.textContent).to.include('Required field');
    });
  });

  describe('open/close', () => {
    it('opens popup on input click', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      input.click();
      expect(el.hasAttribute('open')).to.be.true;
      expect(el.querySelector('.dvfy-date-picker__popup')).to.exist;
    });

    it('opens popup on toggle button click', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      const toggle = el.querySelector('.dvfy-date-picker__toggle');
      toggle.click();
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('closes on Escape key', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      input.click();
      expect(el.hasAttribute('open')).to.be.true;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('does not open when disabled', async () => {
      const el = await fixture(html`<dvfy-date-picker disabled></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      input.click();
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('calendar navigation', () => {
    it('renders day grid when open', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      el.querySelector('.dvfy-date-picker__input').click();
      const grid = el.querySelector('.dvfy-date-picker__grid');
      expect(grid).to.exist;
      const days = el.querySelectorAll('.dvfy-date-picker__day');
      expect(days.length).to.be.greaterThan(0);
    });

    it('navigates to previous month', async () => {
      const el = await fixture(html`<dvfy-date-picker value="2026-03-15"></dvfy-date-picker>`);
      el.querySelector('.dvfy-date-picker__input').click();
      const headingBefore = el.querySelector('.dvfy-date-picker__heading').textContent;
      const navBtns = el.querySelectorAll('.dvfy-date-picker__nav');
      navBtns[1].click(); // second nav = prev month
      const headingAfter = el.querySelector('.dvfy-date-picker__heading').textContent;
      expect(headingAfter).to.not.equal(headingBefore);
    });

    it('navigates to next month', async () => {
      const el = await fixture(html`<dvfy-date-picker value="2026-03-15"></dvfy-date-picker>`);
      el.querySelector('.dvfy-date-picker__input').click();
      const headingBefore = el.querySelector('.dvfy-date-picker__heading').textContent;
      const navBtns = el.querySelectorAll('.dvfy-date-picker__nav');
      navBtns[2].click(); // third nav = next month
      const headingAfter = el.querySelector('.dvfy-date-picker__heading').textContent;
      expect(headingAfter).to.not.equal(headingBefore);
    });
  });

  describe('date selection', () => {
    it('fires change event when a date is selected', async () => {
      const el = await fixture(html`<dvfy-date-picker value="2026-03-15"></dvfy-date-picker>`);
      el.querySelector('.dvfy-date-picker__input').click();
      const cells = el.querySelectorAll('.dvfy-date-picker__cell:not(.dvfy-date-picker__day--outside)');
      const targetCell = Array.from(cells).find(c => c.textContent.trim() === '20');
      if (targetCell) {
        setTimeout(() => targetCell.click());
        const ev = await oneEvent(el, 'change');
        expect(ev.detail).to.have.property('value');
        expect(ev.detail.value).to.include('2026-03-20');
      }
    });

    it('closes popup after selection', async () => {
      const el = await fixture(html`<dvfy-date-picker value="2026-03-15"></dvfy-date-picker>`);
      el.querySelector('.dvfy-date-picker__input').click();
      const cells = el.querySelectorAll('.dvfy-date-picker__cell:not(.dvfy-date-picker__day--outside)');
      const targetCell = Array.from(cells).find(c => c.textContent.trim() === '10');
      if (targetCell) {
        targetCell.click();
        expect(el.hasAttribute('open')).to.be.false;
      }
    });

    it('updates input value after selection', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      el.querySelector('.dvfy-date-picker__input').click();
      const cells = el.querySelectorAll('.dvfy-date-picker__cell:not(.dvfy-date-picker__day--outside)');
      if (cells.length) {
        cells[5].click();
        const input = el.querySelector('.dvfy-date-picker__input');
        expect(input.value).to.not.be.empty;
      }
    });
  });

  describe('keyboard navigation', () => {
    it('opens calendar on Enter key', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('opens calendar on Space key', async () => {
      const el = await fixture(html`<dvfy-date-picker></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.true;
    });
  });

  describe('range mode', () => {
    it('accepts range attribute', async () => {
      const el = await fixture(html`<dvfy-date-picker range></dvfy-date-picker>`);
      expect(el.hasAttribute('range')).to.be.true;
    });

    it('renders with range values', async () => {
      const el = await fixture(html`<dvfy-date-picker range value="2026-03-10" value-end="2026-03-20"></dvfy-date-picker>`);
      const input = el.querySelector('.dvfy-date-picker__input');
      expect(input.value).to.not.be.empty;
    });
  });

  describe('month/year type', () => {
    it('renders with type=month attribute', async () => {
      const el = await fixture(html`<dvfy-date-picker type="month" value="2026-03-01"></dvfy-date-picker>`);
      expect(el.getAttribute('type')).to.equal('month');
      const input = el.querySelector('.dvfy-date-picker__input');
      expect(input.value).to.not.be.empty;
    });

    it('renders with type=year attribute', async () => {
      const el = await fixture(html`<dvfy-date-picker type="year" value="2026-01-01"></dvfy-date-picker>`);
      expect(el.getAttribute('type')).to.equal('year');
      const input = el.querySelector('.dvfy-date-picker__input');
      expect(input.value).to.not.be.empty;
    });
  });

  describe('state attribute', () => {
    it('renders error message when state="error"', async () => {
      const el = await fixture(html`
        <dvfy-date-picker label="Date" state="error">
          <span slot="error-message">Invalid date</span>
        </dvfy-date-picker>
      `);
      const errorMsg = el.querySelector('.dvfy-date-picker__error-msg');
      expect(errorMsg).to.exist;
      expect(errorMsg.textContent).to.equal('Invalid date');
    });

    it('renders warning message when state="warning"', async () => {
      const el = await fixture(html`
        <dvfy-date-picker label="Date" state="warning">
          <span slot="warning-message">Date is in the past</span>
        </dvfy-date-picker>
      `);
      const warningMsg = el.querySelector('.dvfy-date-picker__warning-msg');
      expect(warningMsg).to.exist;
      expect(warningMsg.textContent).to.equal('Date is in the past');
    });

    it('renders success message when state="success"', async () => {
      const el = await fixture(html`
        <dvfy-date-picker label="Date" state="success">
          <span slot="success-message">Date confirmed</span>
        </dvfy-date-picker>
      `);
      const successMsg = el.querySelector('.dvfy-date-picker__success-msg');
      expect(successMsg).to.exist;
      expect(successMsg.textContent).to.equal('Date confirmed');
    });

    it('renders no message when state is not set', async () => {
      const el = await fixture(html`<dvfy-date-picker label="Date"></dvfy-date-picker>`);
      expect(el.querySelector('.dvfy-date-picker__error-msg')).to.not.exist;
      expect(el.querySelector('.dvfy-date-picker__warning-msg')).to.not.exist;
      expect(el.querySelector('.dvfy-date-picker__success-msg')).to.not.exist;
    });

    it('updates message when state changes', async () => {
      const el = await fixture(html`
        <dvfy-date-picker label="Date" state="error">
          <span slot="error-message">Error 1</span>
          <span slot="warning-message">Warning 1</span>
        </dvfy-date-picker>
      `);
      expect(el.querySelector('.dvfy-date-picker__error-msg')?.textContent).to.equal('Error 1');

      el.setAttribute('state', 'warning');
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(el.querySelector('.dvfy-date-picker__warning-msg')?.textContent).to.equal('Warning 1');
    });

    it('backward compatible with error attribute', async () => {
      const el = await fixture(html`<dvfy-date-picker label="Date" error="Legacy error"></dvfy-date-picker>`);
      const errorMsg = el.querySelector('.dvfy-date-picker__error-msg');
      expect(errorMsg?.textContent).to.equal('Legacy error');
    });

    it('sets aria-invalid on error state', async () => {
      const el = await fixture(html`
        <dvfy-date-picker label="Date" state="error">
          <span slot="error-message">Invalid date</span>
        </dvfy-date-picker>
      `);
      const input = el.querySelector('.dvfy-date-picker__input');
      expect(input.getAttribute('aria-invalid')).to.equal('true');
    });
  });
});
