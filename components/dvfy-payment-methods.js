/**
 * <dvfy-payment-methods> — List and manage payment methods
 *
 * Displays saved payment methods with card brand icons, last4, expiry, and default badge.
 * Actions are gateway-conditional: set default (Stripe only), remove (Stripe + PayPal), add new.
 * Fetches from GET /tenants/{id}/payment-methods or accepts static JSON via the data attr.
 *
 * Attributes:
 *   tenant-id:  tenant UUID for API calls
 *   api-base:   base URL for billing API (default: current origin)
 *   gateway:    stripe | paddle | paypal — controls which actions are available
 *   data:       JSON array of payment method objects (bypasses fetch)
 *
 * Data format (each item):
 *   {
 *     "id": "pm_xxx",
 *     "type": "card" | "paypal",
 *     "last4": "4242",
 *     "brand": "visa" | "mastercard" | "amex" | "paypal",
 *     "expiry_m": 12,
 *     "expiry_y": 2027,
 *     "is_default": true
 *   }
 *
 * Usage:
 *   <dvfy-payment-methods tenant-id="abc-123" gateway="stripe"></dvfy-payment-methods>
 */

const STYLES = `
dvfy-payment-methods {
  display: block;
  font-family: var(--dvfy-font-sans);
}

dvfy-payment-methods .dvfy-payment-methods__list {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-3);
}

dvfy-payment-methods .dvfy-payment-methods__item {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}

dvfy-payment-methods .dvfy-payment-methods__item:hover {
  border-color: var(--dvfy-border-strong);
}

dvfy-payment-methods .dvfy-payment-methods__item--default {
  border-color: var(--dvfy-primary-bg);
}

dvfy-payment-methods .dvfy-payment-methods__brand-icon {
  width: 2.5rem;
  height: 1.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-sm);
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-bold);
  color: var(--dvfy-text-secondary);
  text-transform: uppercase;
  flex-shrink: 0;
}

dvfy-payment-methods .dvfy-payment-methods__info {
  flex: 1;
  min-width: 0;
}

dvfy-payment-methods .dvfy-payment-methods__card-number {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
  font-variant-numeric: tabular-nums;
}

dvfy-payment-methods .dvfy-payment-methods__expiry {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

dvfy-payment-methods .dvfy-payment-methods__actions {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  flex-shrink: 0;
}

dvfy-payment-methods .dvfy-payment-methods__add {
  margin-top: var(--dvfy-space-3);
}

dvfy-payment-methods .dvfy-payment-methods__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-3);
}

dvfy-payment-methods .dvfy-payment-methods__skeleton-item {
  height: 3.5rem;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-lg);
  animation: dvfy-pm-pulse 1.5s ease-in-out infinite;
}

@keyframes dvfy-pm-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

dvfy-payment-methods .dvfy-payment-methods__error {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
}

dvfy-payment-methods .dvfy-payment-methods__retry {
  margin-left: auto;
}

dvfy-payment-methods .dvfy-payment-methods__empty {
  text-align: center;
  padding: var(--dvfy-space-6);
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}

dvfy-payment-methods .dvfy-payment-methods__empty-text {
  margin-bottom: var(--dvfy-space-3);
}
`;

const BRAND_LABELS = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  paypal: 'PP',
  discover: 'DISC',
};

const BRAND_COLORS = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  paypal: '#003087',
  discover: '#FF6000',
};

/**
 * Payment method list with gateway-conditional actions.
 *
 * @element dvfy-payment-methods
 *
 * @attr {string} tenant-id - Tenant UUID for API calls
 * @attr {string} api-base - Base URL for billing API (default: current origin)
 * @attr {string} gateway - Active gateway: stripe | paddle | paypal
 * @attr {string} data - JSON array of payment method objects (bypasses fetch)
 *
 * @event {CustomEvent} dvfy-pm-loaded - Fires after data loads, detail: methods array
 * @event {CustomEvent} dvfy-pm-error - Fires on fetch failure, detail: error message
 * @event {CustomEvent} dvfy-pm-set-default - Fires when set-default clicked, detail: method id
 * @event {CustomEvent} dvfy-pm-remove - Fires when remove clicked, detail: method id
 * @event {CustomEvent} dvfy-pm-add - Fires when add-new clicked
 *
 * @cssprop {color} --dvfy-surface-raised - Card background
 * @cssprop {color} --dvfy-primary-bg - Default payment method border
 */
class DvfyPaymentMethods extends HTMLElement {
  static #styled = false;
  #abortController = null;

  connectedCallback() {
    if (!DvfyPaymentMethods.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyPaymentMethods.#styled = true;
    }
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Payment methods');
    }
    queueMicrotask(() => this.#load());
  }

  disconnectedCallback() {
    if (this.#abortController) {
      this.#abortController.abort();
      this.#abortController = null;
    }
  }

  static get observedAttributes() { return ['data', 'tenant-id', 'gateway']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#load();
  }

  get #gateway() { return this.getAttribute('gateway') || 'stripe'; }

  async #load() {
    const dataAttr = this.getAttribute('data');
    if (dataAttr) {
      try {
        const methods = JSON.parse(dataAttr);
        this.#renderMethods(methods);
        this.dispatchEvent(new CustomEvent('dvfy-pm-loaded', { bubbles: true, detail: methods }));
      } catch {
        this.#renderError('Invalid data format');
      }
      return;
    }

    const tenantId = this.getAttribute('tenant-id');
    if (!tenantId) {
      this.#renderEmpty();
      return;
    }

    this.#renderSkeleton();

    if (this.#abortController) this.#abortController.abort();
    this.#abortController = new AbortController();

    const base = this.getAttribute('api-base') || '';
    try {
      const res = await fetch(`${base}/tenants/${tenantId}/payment-methods`, {
        signal: this.#abortController.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const methods = await res.json();
      this.#renderMethods(methods);
      this.dispatchEvent(new CustomEvent('dvfy-pm-loaded', { bubbles: true, detail: methods }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.#renderError(err.message);
        this.dispatchEvent(new CustomEvent('dvfy-pm-error', { bubbles: true, detail: err.message }));
      }
    }
  }

  #canSetDefault() { return this.#gateway === 'stripe'; }
  #canRemove() { return this.#gateway === 'stripe' || this.#gateway === 'paypal'; }

  #renderMethods(methods) {
    this.textContent = '';
    if (!methods || methods.length === 0) {
      this.#renderEmpty();
      return;
    }

    const list = document.createElement('div');
    list.className = 'dvfy-payment-methods__list';

    for (const pm of methods) {
      const item = document.createElement('div');
      item.className = 'dvfy-payment-methods__item';
      if (pm.is_default) item.classList.add('dvfy-payment-methods__item--default');

      // Brand icon
      const icon = document.createElement('div');
      icon.className = 'dvfy-payment-methods__brand-icon';
      icon.textContent = BRAND_LABELS[pm.brand] || pm.brand?.toUpperCase()?.slice(0, 4) || 'CARD';
      const brandColor = BRAND_COLORS[pm.brand];
      if (brandColor) {
        icon.style.color = brandColor;
      }
      item.appendChild(icon);

      // Info
      const info = document.createElement('div');
      info.className = 'dvfy-payment-methods__info';

      const cardNumber = document.createElement('div');
      cardNumber.className = 'dvfy-payment-methods__card-number';
      if (pm.type === 'paypal') {
        cardNumber.textContent = 'PayPal';
      } else {
        cardNumber.textContent = `\u2022\u2022\u2022\u2022 ${pm.last4 || '????'}`;
      }
      info.appendChild(cardNumber);

      if (pm.expiry_m && pm.expiry_y) {
        const expiry = document.createElement('div');
        expiry.className = 'dvfy-payment-methods__expiry';
        expiry.textContent = `Expires ${String(pm.expiry_m).padStart(2, '0')}/${String(pm.expiry_y).slice(-2)}`;
        info.appendChild(expiry);
      }

      item.appendChild(info);

      // Default badge
      if (pm.is_default) {
        const badge = document.createElement('dvfy-badge');
        badge.setAttribute('status', 'success');
        badge.setAttribute('size', 'xs');
        badge.textContent = 'Default';
        item.appendChild(badge);
      }

      // Actions
      const actions = document.createElement('div');
      actions.className = 'dvfy-payment-methods__actions';

      if (!pm.is_default && this.#canSetDefault()) {
        const setDefaultBtn = document.createElement('dvfy-button');
        setDefaultBtn.setAttribute('variant', 'ghost');
        setDefaultBtn.setAttribute('size', 'xs');
        setDefaultBtn.textContent = 'Set default';
        setDefaultBtn.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('dvfy-pm-set-default', { bubbles: true, detail: pm.id }));
        });
        actions.appendChild(setDefaultBtn);
      }

      if (this.#canRemove()) {
        const removeBtn = document.createElement('dvfy-button');
        removeBtn.setAttribute('variant', 'ghost');
        removeBtn.setAttribute('size', 'xs');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('dvfy-pm-remove', { bubbles: true, detail: pm.id }));
        });
        actions.appendChild(removeBtn);
      }

      if (actions.children.length > 0) {
        item.appendChild(actions);
      }

      list.appendChild(item);
    }

    this.appendChild(list);

    // Add new button
    const addBtn = document.createElement('dvfy-button');
    addBtn.className = 'dvfy-payment-methods__add';
    addBtn.setAttribute('variant', 'outline');
    addBtn.setAttribute('size', 'sm');
    addBtn.textContent = '+ Add payment method';
    addBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dvfy-pm-add', { bubbles: true }));
    });
    this.appendChild(addBtn);
  }

  #renderSkeleton() {
    this.textContent = '';
    const skel = document.createElement('div');
    skel.className = 'dvfy-payment-methods__skeleton';
    for (let i = 0; i < 2; i++) {
      const item = document.createElement('div');
      item.className = 'dvfy-payment-methods__skeleton-item';
      skel.appendChild(item);
    }
    this.appendChild(skel);
  }

  #renderError(msg) {
    this.textContent = '';
    const err = document.createElement('div');
    err.className = 'dvfy-payment-methods__error';
    err.textContent = msg;

    const retry = document.createElement('dvfy-button');
    retry.className = 'dvfy-payment-methods__retry';
    retry.setAttribute('variant', 'outline');
    retry.setAttribute('size', 'xs');
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => this.#load());

    err.appendChild(retry);
    this.appendChild(err);
  }

  #renderEmpty() {
    this.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'dvfy-payment-methods__empty';

    const text = document.createElement('div');
    text.className = 'dvfy-payment-methods__empty-text';
    text.textContent = 'No payment methods on file';
    empty.appendChild(text);

    const addBtn = document.createElement('dvfy-button');
    addBtn.setAttribute('size', 'sm');
    addBtn.textContent = 'Add payment method';
    addBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dvfy-pm-add', { bubbles: true }));
    });
    empty.appendChild(addBtn);

    this.appendChild(empty);
  }
}

customElements.define('dvfy-payment-methods', DvfyPaymentMethods);
