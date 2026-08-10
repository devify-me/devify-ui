import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
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

  describe('messages (error/warning/help/state)', () => {
    it('renders error message with role=alert', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" error="Required"></dvfy-checkbox>`);
      const msg = el.querySelector('.dvfy-checkbox__error-msg');
      expect(msg).to.exist;
      expect(msg.textContent).to.equal('Required');
      expect(msg.getAttribute('role')).to.equal('alert');
    });

    it('renders warning message', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" warning="Be careful"></dvfy-checkbox>`);
      const msg = el.querySelector('.dvfy-checkbox__warning-msg');
      expect(msg).to.exist;
      expect(msg.textContent).to.equal('Be careful');
    });

    it('renders help text', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" help="Optional"></dvfy-checkbox>`);
      const msg = el.querySelector('.dvfy-checkbox__help-msg');
      expect(msg).to.exist;
      expect(msg.textContent).to.equal('Optional');
    });

    it('wires aria-describedby from input to error message', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" error="Required"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      const msg = el.querySelector('.dvfy-checkbox__error-msg');
      expect(input.getAttribute('aria-describedby')).to.equal(msg.id);
    });

    it('prioritises error over warning when both set', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" error="Err" warning="Warn"></dvfy-checkbox>`);
      expect(el.querySelector('.dvfy-checkbox__error-msg')).to.exist;
      expect(el.querySelector('.dvfy-checkbox__warning-msg')).to.not.exist;
    });

    it('shows help alongside error', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" error="Err" help="Hint"></dvfy-checkbox>`);
      expect(el.querySelector('.dvfy-checkbox__error-msg')).to.exist;
      expect(el.querySelector('.dvfy-checkbox__help-msg')).to.exist;
    });
  });

  describe('stability', () => {
    it('preserves input reference and checked state when label changes', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Old" checked></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      expect(input.checked).to.be.true;

      el.setAttribute('label', 'New');
      expect(el.querySelector('.dvfy-checkbox__input')).to.equal(input);
      expect(input.checked).to.be.true;
      expect(el.querySelector('.dvfy-checkbox__label').textContent).to.equal('New');
    });

    it('preserves input reference when disabled changes', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Test"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');

      el.setAttribute('disabled', '');
      expect(el.querySelector('.dvfy-checkbox__input')).to.equal(input);
      expect(input.disabled).to.be.true;

      el.removeAttribute('disabled');
      expect(input.disabled).to.be.false;
    });

    it('preserves input reference when error text changes', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" error="First"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');

      el.setAttribute('error', 'Second');
      expect(el.querySelector('.dvfy-checkbox__input')).to.equal(input);
      expect(el.querySelector('.dvfy-checkbox__error-msg').textContent).to.equal('Second');
    });

    it('preserves input reference when error is removed', async () => {
      const el = await fixture(html`<dvfy-checkbox label="Agree" error="Err"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');

      el.removeAttribute('error');
      expect(el.querySelector('.dvfy-checkbox__input')).to.equal(input);
      expect(el.querySelector('.dvfy-checkbox__error-msg')).to.not.exist;
    });

    it('does not rebuild on each click in tri-state mode', async () => {
      const el = await fixture(html`<dvfy-checkbox label="All" indeterminate></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');

      input.click(); // indeterminate → checked
      await Promise.resolve();
      expect(el.querySelector('.dvfy-checkbox__input')).to.equal(input);

      input.click(); // checked → unchecked
      await Promise.resolve();
      expect(el.querySelector('.dvfy-checkbox__input')).to.equal(input);

      input.click(); // unchecked → indeterminate
      await Promise.resolve();
      expect(el.querySelector('.dvfy-checkbox__input')).to.equal(input);
      expect(input.indeterminate).to.be.true;
    });
  });

  describe('whole-host activation', () => {
    // Same contract as dvfy-radio: the host promises clickability via cursor:pointer, and
    // consumers pad it into a full-width row, so the entire host must toggle.
    it('toggles when the host padding (not the input or label) is clicked', async () => {
      const el = await fixture(html`<dvfy-checkbox name="t" label="Accept"></dvfy-checkbox>`);
      const input = el.querySelector('.dvfy-checkbox__input');
      expect(input.checked).to.be.false;

      el.click();

      expect(input.checked).to.be.true;
    });

    // Forwarding must not multiply events: a host click and a direct input click have to
    // produce the SAME number of change events. (The component emits two today — its own
    // re-dispatch plus the native one bubbling — which is a separate pre-existing defect;
    // asserting parity guards this fix without freezing that bug in place.)
    it('a host click emits the same number of change events as a direct input click', async () => {
      const direct = await fixture(html`<dvfy-checkbox name="t" label="Accept"></dvfy-checkbox>`);
      let directCount = 0;
      direct.addEventListener('change', () => { directCount += 1; });
      direct.querySelector('.dvfy-checkbox__input').click();

      const host = await fixture(html`<dvfy-checkbox name="t2" label="Accept"></dvfy-checkbox>`);
      let hostCount = 0;
      host.addEventListener('change', () => { hostCount += 1; });
      host.click();

      expect(hostCount).to.equal(directCount);
      expect(hostCount).to.be.greaterThan(0);
    });

    it('ignores host clicks while disabled', async () => {
      const el = await fixture(html`<dvfy-checkbox name="t" label="Accept" disabled></dvfy-checkbox>`);

      el.click();

      expect(el.querySelector('.dvfy-checkbox__input').checked).to.be.false;
    });

    // Tristate: assert PARITY, not the cycle itself. A programmatic click does not advance
    // the tristate cycle even when dispatched directly on the input — pre-existing behaviour,
    // unrelated to this fix. What this fix owes is that routing through the host changes
    // nothing, which is what is asserted here.
    it('a host click leaves tristate in the same state as a direct input click', async () => {
      const direct = await fixture(html`<dvfy-checkbox name="t" label="All" indeterminate></dvfy-checkbox>`);
      const di = direct.querySelector('.dvfy-checkbox__input');
      di.click();
      await nextFrame();

      const host = await fixture(html`<dvfy-checkbox name="t2" label="All" indeterminate></dvfy-checkbox>`);
      host.click();
      await nextFrame();
      const hi = host.querySelector('.dvfy-checkbox__input');

      expect(hi.checked).to.equal(di.checked);
      expect(hi.indeterminate).to.equal(di.indeterminate);
    });
  });
});
