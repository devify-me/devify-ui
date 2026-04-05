import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-button.js';
import './dvfy-loader.js';
import './dvfy-payment-setup.js';

// Helper: wait a microtask for queueMicrotask-based rendering
const tick = () => new Promise(r => queueMicrotask(r));

describe('dvfy-payment-setup', () => {
  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-payment-setup')).to.exist;
    });

    it('renders detecting state when no gateway is set', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup></dvfy-payment-setup>`
      );
      await tick();
      const detect = el.querySelector('.dvfy-payment-setup__gateway-detect');
      expect(detect).to.exist;
      expect(detect.textContent).to.include('Set the gateway attribute');
    });

    it('renders loader in detecting state', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup></dvfy-payment-setup>`
      );
      await tick();
      const loader = el.querySelector('dvfy-loader');
      expect(loader).to.exist;
    });

    it('renders stripe form when gateway=stripe', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup
          gateway="stripe"
          stripe-publishable-key="pk_test_xxx"
        ></dvfy-payment-setup>`
      );
      await tick();
      const container = el.querySelector('.dvfy-payment-setup__container');
      expect(container).to.exist;
      const title = el.querySelector('.dvfy-payment-setup__title');
      expect(title.textContent).to.equal('Add card');
    });

    it('renders stripe mount point', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup
          gateway="stripe"
          stripe-publishable-key="pk_test_xxx"
        ></dvfy-payment-setup>`
      );
      await tick();
      const mount = el.querySelector('.dvfy-payment-setup__stripe-mount');
      expect(mount).to.exist;
    });

    it('renders submit and cancel buttons for stripe', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup
          gateway="stripe"
          stripe-publishable-key="pk_test_xxx"
        ></dvfy-payment-setup>`
      );
      await tick();
      const actions = el.querySelector('.dvfy-payment-setup__actions');
      expect(actions).to.exist;
      const buttons = actions.querySelectorAll('dvfy-button');
      expect(buttons.length).to.equal(2);
      expect(buttons[0].textContent).to.equal('Add card');
      expect(buttons[1].textContent).to.equal('Cancel');
    });

    it('renders paddle trigger when gateway=paddle', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup gateway="paddle"></dvfy-payment-setup>`
      );
      await tick();
      const trigger = el.querySelector('.dvfy-payment-setup__paddle-trigger');
      expect(trigger).to.exist;
      const text = el.querySelector('.dvfy-payment-setup__paddle-text');
      expect(text.textContent).to.include('secure payment form');
    });

    it('renders paddle open checkout button', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup gateway="paddle"></dvfy-payment-setup>`
      );
      await tick();
      const btn = el.querySelector(
        '.dvfy-payment-setup__paddle-trigger dvfy-button'
      );
      expect(btn).to.exist;
      expect(btn.textContent).to.equal('Open checkout');
    });

    it('renders paypal redirect when gateway=paypal', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup gateway="paypal"></dvfy-payment-setup>`
      );
      await tick();
      const redirect = el.querySelector(
        '.dvfy-payment-setup__paypal-redirect'
      );
      expect(redirect).to.exist;
      const text = el.querySelector('.dvfy-payment-setup__paypal-text');
      expect(text.textContent).to.include('redirected to PayPal');
    });

    it('renders paypal continue and cancel buttons', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup gateway="paypal"></dvfy-payment-setup>`
      );
      await tick();
      const buttons = el.querySelectorAll(
        '.dvfy-payment-setup__actions dvfy-button'
      );
      expect(buttons.length).to.equal(2);
      expect(buttons[0].textContent).to.equal('Continue to PayPal');
      expect(buttons[1].textContent).to.equal('Cancel');
    });
  });

  describe('events', () => {
    it('fires dvfy-payment-setup-cancel when stripe cancel is clicked', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup
          gateway="stripe"
          stripe-publishable-key="pk_test_xxx"
        ></dvfy-payment-setup>`
      );
      await tick();
      const cancelBtn = el.querySelectorAll(
        '.dvfy-payment-setup__actions dvfy-button'
      )[1];
      setTimeout(() => cancelBtn.click());
      const event = await oneEvent(el, 'dvfy-payment-setup-cancel');
      expect(event).to.exist;
    });

    it('fires dvfy-payment-setup-cancel when paypal cancel is clicked', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup gateway="paypal"></dvfy-payment-setup>`
      );
      await tick();
      const cancelBtn = el.querySelectorAll(
        '.dvfy-payment-setup__actions dvfy-button'
      )[1];
      setTimeout(() => cancelBtn.click());
      const event = await oneEvent(el, 'dvfy-payment-setup-cancel');
      expect(event).to.exist;
    });
  });

  describe('ARIA', () => {
    it('sets role=form', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup></dvfy-payment-setup>`
      );
      expect(el.getAttribute('role')).to.equal('form');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup></dvfy-payment-setup>`
      );
      expect(el.getAttribute('aria-label')).to.equal('Add payment method');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup
          aria-label="Payment setup form"
        ></dvfy-payment-setup>`
      );
      expect(el.getAttribute('aria-label')).to.equal('Payment setup form');
    });
  });

  describe('attributes', () => {
    it('observes gateway attribute', () => {
      expect(
        customElements.get('dvfy-payment-setup').observedAttributes
      ).to.include('gateway');
    });

    it('observes tenant-id attribute', () => {
      expect(
        customElements.get('dvfy-payment-setup').observedAttributes
      ).to.include('tenant-id');
    });

    it('re-renders when gateway changes', async () => {
      const el = await fixture(
        html`<dvfy-payment-setup gateway="stripe"
          stripe-publishable-key="pk_test_xxx"
        ></dvfy-payment-setup>`
      );
      await tick();
      expect(el.querySelector('.dvfy-payment-setup__title').textContent).to.equal('Add card');

      el.setAttribute('gateway', 'paypal');
      await tick();
      expect(el.querySelector('.dvfy-payment-setup__title').textContent).to.equal('Add PayPal');
    });
  });
});
