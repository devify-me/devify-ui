import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-button.js';
import './dvfy-payment-methods.js';

const SAMPLE_METHODS = JSON.stringify([
  {
    id: 'pm_001',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiry_m: 12,
    expiry_y: 2027,
    is_default: true,
  },
  {
    id: 'pm_002',
    type: 'card',
    last4: '5555',
    brand: 'mastercard',
    expiry_m: 3,
    expiry_y: 2026,
    is_default: false,
  },
]);

const PAYPAL_METHOD = JSON.stringify([
  {
    id: 'pm_pp1',
    type: 'paypal',
    brand: 'paypal',
    is_default: false,
  },
]);

// Helper: wait a microtask for queueMicrotask-based rendering
const tick = () => new Promise(r => queueMicrotask(r));

describe('dvfy-payment-methods', () => {
  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-payment-methods')).to.exist;
    });

    it('renders payment method items from data attribute', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const items = el.querySelectorAll('.dvfy-payment-methods__item');
      expect(items.length).to.equal(2);
    });

    it('renders empty state when no data or tenant-id', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods></dvfy-payment-methods>`
      );
      await tick();
      const empty = el.querySelector('.dvfy-payment-methods__empty');
      expect(empty).to.exist;
      expect(empty.textContent).to.include('No payment methods on file');
    });

    it('renders empty state for empty array', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods data="[]"></dvfy-payment-methods>`
      );
      await tick();
      const empty = el.querySelector('.dvfy-payment-methods__empty');
      expect(empty).to.exist;
    });

    it('renders add button after method list', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const addBtn = el.querySelector('.dvfy-payment-methods__add');
      expect(addBtn).to.exist;
      expect(addBtn.textContent).to.include('Add payment method');
    });

    it('renders error for invalid JSON data', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data="not-json"
        ></dvfy-payment-methods>`
      );
      await tick();
      const error = el.querySelector('.dvfy-payment-methods__error');
      expect(error).to.exist;
      expect(error.textContent).to.include('Invalid data format');
    });
  });

  describe('card display', () => {
    it('shows masked card number with last4', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const cardNumbers = el.querySelectorAll(
        '.dvfy-payment-methods__card-number'
      );
      expect(cardNumbers[0].textContent).to.include('4242');
    });

    it('shows PayPal label for paypal type', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${PAYPAL_METHOD}
          gateway="paypal"
        ></dvfy-payment-methods>`
      );
      await tick();
      const cardNumber = el.querySelector('.dvfy-payment-methods__card-number');
      expect(cardNumber.textContent).to.equal('PayPal');
    });

    it('shows expiry date when present', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const expiry = el.querySelector('.dvfy-payment-methods__expiry');
      expect(expiry).to.exist;
      expect(expiry.textContent).to.include('12/27');
    });

    it('shows brand icon with label', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const icons = el.querySelectorAll('.dvfy-payment-methods__brand-icon');
      expect(icons[0].textContent).to.equal('VISA');
      expect(icons[1].textContent).to.equal('MC');
    });

    it('highlights default payment method', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const defaultItem = el.querySelector(
        '.dvfy-payment-methods__item--default'
      );
      expect(defaultItem).to.exist;
    });
  });

  describe('gateway-conditional actions', () => {
    it('shows set-default and remove buttons for stripe gateway', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      // Second item (non-default) should have set-default and remove
      const items = el.querySelectorAll('.dvfy-payment-methods__item');
      const actions = items[1].querySelector('.dvfy-payment-methods__actions');
      const buttons = actions.querySelectorAll('dvfy-button');
      expect(buttons.length).to.equal(2);
      expect(buttons[0].textContent).to.equal('Set default');
      expect(buttons[1].textContent).to.equal('Remove');
    });

    it('shows only remove button for paypal gateway', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${PAYPAL_METHOD}
          gateway="paypal"
        ></dvfy-payment-methods>`
      );
      await tick();
      const item = el.querySelector('.dvfy-payment-methods__item');
      const actions = item.querySelector('.dvfy-payment-methods__actions');
      const buttons = actions.querySelectorAll('dvfy-button');
      expect(buttons.length).to.equal(1);
      expect(buttons[0].textContent).to.equal('Remove');
    });

    it('hides remove button for paddle gateway', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${PAYPAL_METHOD}
          gateway="paddle"
        ></dvfy-payment-methods>`
      );
      await tick();
      const item = el.querySelector('.dvfy-payment-methods__item');
      const actions = item.querySelector('.dvfy-payment-methods__actions');
      expect(actions).to.not.exist;
    });
  });

  describe('events', () => {
    it('fires dvfy-pm-loaded when data is parsed', async () => {
      const el = document.createElement('dvfy-payment-methods');
      el.setAttribute('gateway', 'stripe');
      document.body.appendChild(el);
      setTimeout(() => el.setAttribute('data', SAMPLE_METHODS));
      const event = await oneEvent(el, 'dvfy-pm-loaded');
      expect(event.detail).to.be.an('array');
      expect(event.detail.length).to.equal(2);
      document.body.removeChild(el);
    });

    it('fires dvfy-pm-add when add button is clicked', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const addBtn = el.querySelector('.dvfy-payment-methods__add');
      setTimeout(() => addBtn.click());
      const event = await oneEvent(el, 'dvfy-pm-add');
      expect(event).to.exist;
    });

    it('fires dvfy-pm-remove when remove button is clicked', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const items = el.querySelectorAll('.dvfy-payment-methods__item');
      const removeBtn = items[1]
        .querySelector('.dvfy-payment-methods__actions')
        .querySelectorAll('dvfy-button')[1];
      setTimeout(() => removeBtn.click());
      const event = await oneEvent(el, 'dvfy-pm-remove');
      expect(event.detail).to.equal('pm_002');
    });

    it('fires dvfy-pm-set-default when set-default is clicked', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
          gateway="stripe"
        ></dvfy-payment-methods>`
      );
      await tick();
      const items = el.querySelectorAll('.dvfy-payment-methods__item');
      const setDefaultBtn = items[1]
        .querySelector('.dvfy-payment-methods__actions')
        .querySelectorAll('dvfy-button')[0];
      setTimeout(() => setDefaultBtn.click());
      const event = await oneEvent(el, 'dvfy-pm-set-default');
      expect(event.detail).to.equal('pm_002');
    });

    it('fires dvfy-pm-add from empty state button', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods></dvfy-payment-methods>`
      );
      await tick();
      const addBtn = el.querySelector('.dvfy-payment-methods__empty dvfy-button');
      setTimeout(() => addBtn.click());
      const event = await oneEvent(el, 'dvfy-pm-add');
      expect(event).to.exist;
    });
  });

  describe('ARIA', () => {
    it('sets role=region', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods></dvfy-payment-methods>`
      );
      expect(el.getAttribute('role')).to.equal('region');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods></dvfy-payment-methods>`
      );
      expect(el.getAttribute('aria-label')).to.equal('Payment methods');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          aria-label="Saved cards"
        ></dvfy-payment-methods>`
      );
      expect(el.getAttribute('aria-label')).to.equal('Saved cards');
    });
  });

  describe('attributes', () => {
    it('observes data attribute', async () => {
      expect(
        customElements.get('dvfy-payment-methods').observedAttributes
      ).to.include('data');
    });

    it('observes tenant-id attribute', async () => {
      expect(
        customElements.get('dvfy-payment-methods').observedAttributes
      ).to.include('tenant-id');
    });

    it('observes gateway attribute', async () => {
      expect(
        customElements.get('dvfy-payment-methods').observedAttributes
      ).to.include('gateway');
    });

    it('defaults gateway to stripe', async () => {
      const el = await fixture(
        html`<dvfy-payment-methods
          data=${SAMPLE_METHODS}
        ></dvfy-payment-methods>`
      );
      await tick();
      // Stripe allows set-default, so non-default items should have it
      const items = el.querySelectorAll('.dvfy-payment-methods__item');
      const actions = items[1].querySelector('.dvfy-payment-methods__actions');
      const buttons = actions.querySelectorAll('dvfy-button');
      const hasSetDefault = Array.from(buttons).some(
        b => b.textContent === 'Set default'
      );
      expect(hasSetDefault).to.be.true;
    });
  });
});
