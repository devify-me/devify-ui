import { sanitizeHref, sanitizePayPalUrl } from '../utils/url.js';

/**
 * <dvfy-payment-setup> — Add payment method (gateway-specific)
 *
 * Handles three different collection flows:
 *   Stripe:  Mounts Stripe.js Elements card form inline
 *   Paddle:  Opens Paddle.js checkout overlay
 *   PayPal:  Redirects to PayPal approval URL
 *
 * The gateway is auto-detected from the POST /payment-methods/setup response:
 *   - Starts with "seti_"  → Stripe (SetupIntent client secret)
 *   - Equals "paddle_checkout_overlay" → Paddle
 *   - Starts with "http"   → PayPal (approval URL)
 *
 * Or can be pre-set via the gateway attr.
 *
 * Attributes:
 *   tenant-id:              tenant UUID for API calls
 *   api-base:               base URL for billing API (default: current origin)
 *   gateway:                stripe | paddle | paypal (auto-detected if omitted)
 *   stripe-publishable-key: required when gateway=stripe
 *   paddle-client-token:    required when gateway=paddle
 *   paypal-client-id:       required when gateway=paypal
 *   return-url:             where to redirect after PayPal approval
 *
 * Usage:
 *   <dvfy-payment-setup tenant-id="abc-123" gateway="stripe"
 *     stripe-publishable-key="pk_test_xxx"></dvfy-payment-setup>
 */

const STYLES = `
dvfy-payment-setup {
  display: block;
  font-family: var(--dvfy-font-sans);
}

dvfy-payment-setup .dvfy-payment-setup__container {
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  padding: var(--dvfy-space-5);
}

dvfy-payment-setup .dvfy-payment-setup__title {
  font-size: var(--dvfy-text-base);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
  margin-bottom: var(--dvfy-space-4);
}

dvfy-payment-setup .dvfy-payment-setup__stripe-mount {
  padding: var(--dvfy-space-3);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-md);
  background: var(--dvfy-surface-page);
  min-height: 2.5rem;
}

dvfy-payment-setup .dvfy-payment-setup__actions {
  display: flex;
  gap: var(--dvfy-space-2);
  margin-top: var(--dvfy-space-4);
}

dvfy-payment-setup .dvfy-payment-setup__paddle-trigger {
  text-align: center;
  padding: var(--dvfy-space-6);
}

dvfy-payment-setup .dvfy-payment-setup__paddle-text {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-secondary);
  margin-bottom: var(--dvfy-space-3);
}

dvfy-payment-setup .dvfy-payment-setup__paypal-redirect {
  text-align: center;
  padding: var(--dvfy-space-6);
}

dvfy-payment-setup .dvfy-payment-setup__paypal-text {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-secondary);
  margin-bottom: var(--dvfy-space-3);
}

dvfy-payment-setup .dvfy-payment-setup__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--dvfy-space-8);
  gap: var(--dvfy-space-3);
}

dvfy-payment-setup .dvfy-payment-setup__loading-text {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
}

dvfy-payment-setup .dvfy-payment-setup__error {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
  margin-top: var(--dvfy-space-3);
}

dvfy-payment-setup .dvfy-payment-setup__success {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  background: var(--dvfy-success-bg-subtle);
  color: var(--dvfy-success-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
}

dvfy-payment-setup .dvfy-payment-setup__gateway-detect {
  text-align: center;
  padding: var(--dvfy-space-6);
}

dvfy-payment-setup .dvfy-payment-setup__gateway-text {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
  margin-bottom: var(--dvfy-space-3);
}
`;

/**
 * Gateway-specific payment method setup component.
 *
 * @element dvfy-payment-setup
 *
 * @attr {string} tenant-id - Tenant UUID for API calls
 * @attr {string} api-base - Base URL for billing API (default: current origin)
 * @attr {string} gateway - Active gateway: stripe | paddle | paypal
 * @attr {string} stripe-publishable-key - Stripe publishable key
 * @attr {string} paddle-client-token - Paddle client-side token
 * @attr {string} paypal-client-id - PayPal client ID
 * @attr {string} return-url - Redirect URL after PayPal approval
 *
 * @event {CustomEvent} dvfy-payment-method-added - Fires after successful setup, detail: PaymentMethodInfo
 * @event {CustomEvent} dvfy-payment-setup-error - Fires on failure, detail: error message
 * @event {CustomEvent} dvfy-payment-setup-cancel - Fires when user cancels
 *
 * @cssprop {color} --dvfy-surface-raised - Container background
 * @cssprop {color} --dvfy-border-default - Container border
 */
class DvfyPaymentSetup extends HTMLElement {
  static #styled = false;
  #abortController = null;
  #stripeInstance = null;
  #stripeElements = null;
  #cardElement = null;
  #clientSecret = null;

  connectedCallback() {
    if (!DvfyPaymentSetup.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyPaymentSetup.#styled = true;
    }
    this.setAttribute('role', 'form');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Add payment method');
    }
    queueMicrotask(() => this.#init());
  }

  disconnectedCallback() {
    if (this.#abortController) {
      this.#abortController.abort();
      this.#abortController = null;
    }
    if (this.#cardElement) {
      this.#cardElement.destroy();
      this.#cardElement = null;
    }
    this.#stripeInstance = null;
    this.#stripeElements = null;
  }

  static get observedAttributes() { return ['gateway', 'tenant-id']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#init();
  }

  get #gateway() { return this.getAttribute('gateway'); }
  get #tenantId() { return this.getAttribute('tenant-id'); }
  get #apiBase() { return this.getAttribute('api-base') || ''; }

  async #init() {
    const gateway = this.#gateway;

    if (!gateway && this.#tenantId) {
      // Auto-detect gateway by calling setup endpoint
      this.#renderDetecting();
      await this.#detectGateway();
      return;
    }

    switch (gateway) {
      case 'stripe':
        this.#renderStripe();
        break;
      case 'paddle':
        this.#renderPaddle();
        break;
      case 'paypal':
        this.#renderPayPal();
        break;
      default:
        this.#renderDetecting();
        break;
    }
  }

  async #detectGateway() {
    if (this.#abortController) this.#abortController.abort();
    this.#abortController = new AbortController();

    try {
      const res = await fetch(`${this.#apiBase}/tenants/${this.#tenantId}/payment-methods/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: this.#abortController.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const secret = data.client_secret || data.setup_intent || '';

      if (secret.startsWith('seti_')) {
        this.#clientSecret = secret;
        this.setAttribute('gateway', 'stripe');
      } else if (secret === 'paddle_checkout_overlay') {
        this.setAttribute('gateway', 'paddle');
      } else if (secret.startsWith('http')) {
        this.setAttribute('gateway', 'paypal');
        // Store approval URL for redirect — validate PayPal domain
        this.dataset.approvalUrl = sanitizePayPalUrl(secret);
      } else {
        this.#showError('Unable to detect payment gateway');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.#showError(err.message);
        this.dispatchEvent(new CustomEvent('dvfy-payment-setup-error', { bubbles: true, detail: err.message }));
      }
    }
  }

  // ── Stripe ──

  async #loadStripeSDK() {
    if (window.Stripe) return window.Stripe;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve(window.Stripe);
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.head.appendChild(script);
    });
  }

  async #renderStripe() {
    this.textContent = '';

    const container = document.createElement('div');
    container.className = 'dvfy-payment-setup__container';

    const title = document.createElement('div');
    title.className = 'dvfy-payment-setup__title';
    title.textContent = 'Add card';
    container.appendChild(title);

    const mount = document.createElement('div');
    mount.className = 'dvfy-payment-setup__stripe-mount';
    container.appendChild(mount);

    const actions = document.createElement('div');
    actions.className = 'dvfy-payment-setup__actions';

    const submitBtn = document.createElement('dvfy-button');
    submitBtn.setAttribute('size', 'sm');
    submitBtn.textContent = 'Add card';
    submitBtn.addEventListener('click', () => this.#submitStripe());

    const cancelBtn = document.createElement('dvfy-button');
    cancelBtn.setAttribute('variant', 'ghost');
    cancelBtn.setAttribute('size', 'sm');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dvfy-payment-setup-cancel', { bubbles: true }));
    });

    actions.appendChild(submitBtn);
    actions.appendChild(cancelBtn);
    container.appendChild(actions);

    this.appendChild(container);

    // Load Stripe.js and mount Elements
    const pubKey = this.getAttribute('stripe-publishable-key');
    if (!pubKey) {
      this.#showError('Missing stripe-publishable-key attribute');
      return;
    }

    try {
      const StripeFn = await this.#loadStripeSDK();
      this.#stripeInstance = StripeFn(pubKey);
      this.#stripeElements = this.#stripeInstance.elements();
      this.#cardElement = this.#stripeElements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: 'var(--dvfy-font-sans), sans-serif',
            '::placeholder': { color: '#aab7c4' },
          },
          invalid: { color: '#fa755a' },
        },
      });
      this.#cardElement.mount(mount);
    } catch (err) {
      this.#showError(err.message);
    }
  }

  async #submitStripe() {
    if (!this.#stripeInstance || !this.#cardElement) return;

    // Get client secret if we don't have one yet
    if (!this.#clientSecret && this.#tenantId) {
      if (this.#abortController) this.#abortController.abort();
      this.#abortController = new AbortController();
      try {
        const res = await fetch(`${this.#apiBase}/tenants/${this.#tenantId}/payment-methods/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: this.#abortController.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.#clientSecret = data.client_secret || data.setup_intent;
      } catch (err) {
        if (err.name !== 'AbortError') this.#showError(err.message);
        return;
      }
    }

    if (!this.#clientSecret) {
      this.#showError('No client secret available');
      return;
    }

    try {
      const result = await this.#stripeInstance.confirmCardSetup(this.#clientSecret, {
        payment_method: { card: this.#cardElement },
      });

      if (result.error) {
        this.#showError(result.error.message);
        this.dispatchEvent(new CustomEvent('dvfy-payment-setup-error', {
          bubbles: true, detail: result.error.message,
        }));
      } else {
        this.#showSuccess('Card added successfully');
        this.dispatchEvent(new CustomEvent('dvfy-payment-method-added', {
          bubbles: true, detail: result.setupIntent,
        }));
      }
    } catch (err) {
      this.#showError(err.message);
    }
  }

  // ── Paddle ──

  async #loadPaddleSDK() {
    if (window.Paddle) return window.Paddle;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.onload = () => resolve(window.Paddle);
      script.onerror = () => reject(new Error('Failed to load Paddle.js'));
      document.head.appendChild(script);
    });
  }

  #renderPaddle() {
    this.textContent = '';

    const container = document.createElement('div');
    container.className = 'dvfy-payment-setup__container';

    const title = document.createElement('div');
    title.className = 'dvfy-payment-setup__title';
    title.textContent = 'Add payment method';
    container.appendChild(title);

    const trigger = document.createElement('div');
    trigger.className = 'dvfy-payment-setup__paddle-trigger';

    const text = document.createElement('div');
    text.className = 'dvfy-payment-setup__paddle-text';
    text.textContent = 'Click below to open the secure payment form';
    trigger.appendChild(text);

    const openBtn = document.createElement('dvfy-button');
    openBtn.textContent = 'Open checkout';
    openBtn.addEventListener('click', () => this.#openPaddleCheckout());
    trigger.appendChild(openBtn);

    container.appendChild(trigger);
    this.appendChild(container);
  }

  async #openPaddleCheckout() {
    const clientToken = this.getAttribute('paddle-client-token');
    if (!clientToken) {
      this.#showError('Missing paddle-client-token attribute');
      return;
    }

    try {
      const Paddle = await this.#loadPaddleSDK();
      Paddle.Initialize({ token: clientToken });

      Paddle.Checkout.open({
        settings: { displayMode: 'overlay' },
        customData: { tenantId: this.#tenantId },
        successCallback: (data) => {
          this.#showSuccess('Payment method added');
          this.dispatchEvent(new CustomEvent('dvfy-payment-method-added', {
            bubbles: true, detail: data,
          }));
        },
        closeCallback: () => {
          this.dispatchEvent(new CustomEvent('dvfy-payment-setup-cancel', { bubbles: true }));
        },
      });
    } catch (err) {
      this.#showError(err.message);
    }
  }

  // ── PayPal ──

  #renderPayPal() {
    this.textContent = '';

    const container = document.createElement('div');
    container.className = 'dvfy-payment-setup__container';

    const title = document.createElement('div');
    title.className = 'dvfy-payment-setup__title';
    title.textContent = 'Add PayPal';
    container.appendChild(title);

    const redirect = document.createElement('div');
    redirect.className = 'dvfy-payment-setup__paypal-redirect';

    const text = document.createElement('div');
    text.className = 'dvfy-payment-setup__paypal-text';
    text.textContent = 'You will be redirected to PayPal to authorize your account';
    redirect.appendChild(text);

    const actions = document.createElement('div');
    actions.className = 'dvfy-payment-setup__actions';
    actions.style.justifyContent = 'center';

    const redirectBtn = document.createElement('dvfy-button');
    redirectBtn.textContent = 'Continue to PayPal';
    redirectBtn.addEventListener('click', () => this.#redirectToPayPal());
    actions.appendChild(redirectBtn);

    const cancelBtn = document.createElement('dvfy-button');
    cancelBtn.setAttribute('variant', 'ghost');
    cancelBtn.setAttribute('size', 'sm');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dvfy-payment-setup-cancel', { bubbles: true }));
    });
    actions.appendChild(cancelBtn);

    redirect.appendChild(actions);
    container.appendChild(redirect);
    this.appendChild(container);
  }

  async #redirectToPayPal() {
    // If we already have the approval URL from detection
    const storedUrl = this.dataset.approvalUrl;
    if (storedUrl && storedUrl !== '#') {
      window.location.href = storedUrl;
      return;
    }

    // Otherwise, request it
    if (!this.#tenantId) {
      this.#showError('Missing tenant-id attribute');
      return;
    }

    if (this.#abortController) this.#abortController.abort();
    this.#abortController = new AbortController();

    try {
      const res = await fetch(`${this.#apiBase}/tenants/${this.#tenantId}/payment-methods/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: this.getAttribute('return-url') || window.location.href }),
        signal: this.#abortController.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const approvalUrl = data.client_secret || data.approval_url;
      const safeUrl = sanitizePayPalUrl(approvalUrl);

      if (safeUrl && safeUrl !== '#') {
        window.location.href = safeUrl;
      } else {
        this.#showError('Invalid PayPal approval URL');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.#showError(err.message);
      }
    }
  }

  // ── Shared UI ──

  #renderDetecting() {
    this.textContent = '';

    const container = document.createElement('div');
    container.className = 'dvfy-payment-setup__container';

    const detect = document.createElement('div');
    detect.className = 'dvfy-payment-setup__gateway-detect';

    const text = document.createElement('div');
    text.className = 'dvfy-payment-setup__gateway-text';
    text.textContent = 'Set the gateway attribute to get started';

    const loader = document.createElement('dvfy-loader');
    loader.setAttribute('size', 'sm');

    detect.appendChild(loader);
    detect.appendChild(text);
    container.appendChild(detect);
    this.appendChild(container);
  }

  #showError(msg) {
    // Remove any existing error
    const existing = this.querySelector('.dvfy-payment-setup__error');
    if (existing) existing.remove();

    const err = document.createElement('div');
    err.className = 'dvfy-payment-setup__error';
    err.textContent = msg;

    const container = this.querySelector('.dvfy-payment-setup__container');
    if (container) {
      container.appendChild(err);
    } else {
      this.appendChild(err);
    }
  }

  #showSuccess(msg) {
    this.textContent = '';
    const container = document.createElement('div');
    container.className = 'dvfy-payment-setup__container';

    const success = document.createElement('div');
    success.className = 'dvfy-payment-setup__success';
    success.textContent = msg;

    container.appendChild(success);
    this.appendChild(container);
  }
}

customElements.define('dvfy-payment-setup', DvfyPaymentSetup);
