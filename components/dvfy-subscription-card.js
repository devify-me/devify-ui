/**
 * <dvfy-subscription-card> — Current subscription status
 *
 * Shows current plan, billing period, next renewal date, and cancellation state.
 * Fetches data from GET /tenants/{id}/subscription or accepts static JSON via the data attr.
 *
 * Attributes:
 *   tenant-id:  tenant UUID for API calls
 *   api-base:   base URL for billing API (default: current origin)
 *   data:       JSON subscription object (bypasses fetch)
 *
 * States displayed:
 *   active    — plan name, next billing date, amount
 *   trialing  — plan name, trial end date
 *   canceling — plan name, "Cancels on {date}", reactivate option
 *   canceled  — plan name, "Ended on {date}"
 *   none      — no subscription, prompt to choose a plan
 *
 * Usage:
 *   <dvfy-subscription-card tenant-id="abc-123" api-base="/api"></dvfy-subscription-card>
 */

import { injectStyles } from '../utils/styles.js';


const STYLES = `
dvfy-subscription-card {
  display: block;
  font-family: var(--dvfy-font-sans);
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  padding: var(--dvfy-space-5);
}

dvfy-subscription-card .dvfy-subscription-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dvfy-space-3);
  margin-bottom: var(--dvfy-space-4);
}

dvfy-subscription-card .dvfy-subscription-card__plan-name {
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
}

dvfy-subscription-card .dvfy-subscription-card__details {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-2);
}

dvfy-subscription-card .dvfy-subscription-card__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: var(--dvfy-text-sm);
}

dvfy-subscription-card .dvfy-subscription-card__label {
  color: var(--dvfy-text-muted);
}

dvfy-subscription-card .dvfy-subscription-card__value {
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-medium);
}

dvfy-subscription-card .dvfy-subscription-card__amount {
  font-size: var(--dvfy-text-xl);
  font-weight: var(--dvfy-weight-bold);
  color: var(--dvfy-text-primary);
  font-variant-numeric: tabular-nums;
}

dvfy-subscription-card .dvfy-subscription-card__period {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
  font-weight: var(--dvfy-weight-normal);
}

dvfy-subscription-card .dvfy-subscription-card__actions {
  display: flex;
  gap: var(--dvfy-space-2);
  margin-top: var(--dvfy-space-4);
  padding-top: var(--dvfy-space-4);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}

dvfy-subscription-card .dvfy-subscription-card__cancel-notice {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  margin-top: var(--dvfy-space-3);
  background: var(--dvfy-warning-bg-subtle);
  color: var(--dvfy-warning-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
}

dvfy-subscription-card .dvfy-subscription-card__empty {
  text-align: center;
  padding: var(--dvfy-space-4);
}

dvfy-subscription-card .dvfy-subscription-card__empty-text {
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
  margin-bottom: var(--dvfy-space-3);
}

dvfy-subscription-card .dvfy-subscription-card__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-3);
}

dvfy-subscription-card .dvfy-subscription-card__skeleton-line {
  height: 1rem;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-xs);
  animation: dvfy-sub-card-pulse 1.5s ease-in-out infinite;
}

@keyframes dvfy-sub-card-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

dvfy-subscription-card .dvfy-subscription-card__error {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
}

dvfy-subscription-card .dvfy-subscription-card__retry {
  margin-left: auto;
}
`;

const STATE_BADGE = {
  active:    { status: 'success', label: 'Active' },
  trialing:  { status: 'info',    label: 'Trial' },
  canceling: { status: 'warning', label: 'Canceling' },
  canceled:  { status: 'danger',  label: 'Canceled' },
};

/**
 * Subscription status card showing plan info, billing state, and actions.
 *
 * @element dvfy-subscription-card
 *
 * @attr {string} tenant-id - Tenant UUID for API calls
 * @attr {string} api-base - Base URL for billing API (default: current origin)
 * @attr {string} data - JSON subscription object (bypasses fetch)
 *
 * @event {CustomEvent} dvfy-subscription-loaded - Fires after data loads, detail: subscription
 * @event {CustomEvent} dvfy-subscription-error - Fires on fetch failure, detail: error message
 * @event {CustomEvent} dvfy-subscription-change-plan - Fires when "Change plan" clicked
 * @event {CustomEvent} dvfy-subscription-cancel - Fires when "Cancel" clicked
 * @event {CustomEvent} dvfy-subscription-reactivate - Fires when "Reactivate" clicked
 * @event {CustomEvent} dvfy-subscription-choose-plan - Fires when "Choose a plan" clicked (no subscription)
 *
 * @cssprop {color} --dvfy-surface-raised - Card background
 * @cssprop {color} --dvfy-border-default - Card border
 */
class DvfySubscriptionCard extends HTMLElement {
  #abortController = null;

  connectedCallback() {
    injectStyles('dvfy-subscription-card', STYLES);
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Subscription status');
    }
    queueMicrotask(() => this.#load());
  }

  disconnectedCallback() {
    if (this.#abortController) {
      this.#abortController.abort();
      this.#abortController = null;
    }
  }

  static get observedAttributes() { return ['data', 'tenant-id']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#load();
  }

  async #load() {
    const dataAttr = this.getAttribute('data');
    if (dataAttr) {
      try {
        const sub = JSON.parse(dataAttr);
        this.#renderSubscription(sub);
        this.dispatchEvent(new CustomEvent('dvfy-subscription-loaded', { bubbles: true, detail: sub }));
      } catch {
        this.#renderError('Invalid data format');
      }
      return;
    }

    const tenantId = this.getAttribute('tenant-id');
    if (!tenantId) {
      this.#renderNone();
      return;
    }

    this.#renderSkeleton();

    if (this.#abortController) this.#abortController.abort();
    this.#abortController = new AbortController();

    const base = this.getAttribute('api-base') || '';
    try {
      const res = await fetch(`${base}/tenants/${tenantId}/subscription`, {
        signal: this.#abortController.signal,
      });
      if (!res.ok) {
        if (res.status === 404) {
          this.#renderNone();
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const sub = await res.json();
      this.#renderSubscription(sub);
      this.dispatchEvent(new CustomEvent('dvfy-subscription-loaded', { bubbles: true, detail: sub }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.#renderError(err.message);
        this.dispatchEvent(new CustomEvent('dvfy-subscription-error', { bubbles: true, detail: err.message }));
      }
    }
  }

  #formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(typeof ts === 'number' && ts < 1e12 ? ts * 1000 : ts);
    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  #formatAmount(cents, currency, interval) {
    const amount = (cents || 0) / 100;
    let formatted;
    try {
      formatted = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: (currency || 'usd').toUpperCase(),
      }).format(amount);
    } catch {
      formatted = `$${amount.toFixed(2)}`;
    }
    return formatted;
  }

  #renderSubscription(sub) {
    this.textContent = '';

    if (!sub || !sub.status) {
      this.#renderNone();
      return;
    }

    const state = sub.status;
    const badgeInfo = STATE_BADGE[state] || STATE_BADGE.active;

    // Header: plan name + status badge
    const header = document.createElement('div');
    header.className = 'dvfy-subscription-card__header';

    const planName = document.createElement('span');
    planName.className = 'dvfy-subscription-card__plan-name';
    planName.textContent = sub.plan_name || sub.plan?.display_name || 'Current Plan';
    header.appendChild(planName);

    const badge = document.createElement('dvfy-badge');
    badge.setAttribute('status', badgeInfo.status);
    badge.setAttribute('dot', '');
    badge.setAttribute('size', 'sm');
    badge.textContent = badgeInfo.label;
    header.appendChild(badge);

    this.appendChild(header);

    // Amount
    if (sub.price_cents || sub.amount_cents) {
      const amountEl = document.createElement('div');
      const amountSpan = document.createElement('span');
      amountSpan.className = 'dvfy-subscription-card__amount';
      amountSpan.textContent = this.#formatAmount(sub.price_cents || sub.amount_cents, sub.currency);

      const periodSpan = document.createElement('span');
      periodSpan.className = 'dvfy-subscription-card__period';
      periodSpan.textContent = ` / ${sub.interval || 'month'}`;

      amountEl.appendChild(amountSpan);
      amountEl.appendChild(periodSpan);
      this.appendChild(amountEl);
    }

    // Details
    const details = document.createElement('div');
    details.className = 'dvfy-subscription-card__details';
    details.style.marginTop = `var(--dvfy-space-3)`;

    if (state === 'trialing' && sub.trial_end) {
      this.#addRow(details, 'Trial ends', this.#formatDate(sub.trial_end));
    }

    if (state === 'active' && sub.current_period_end) {
      this.#addRow(details, 'Next billing', this.#formatDate(sub.current_period_end));
    }

    if (sub.current_period_start) {
      this.#addRow(details, 'Period started', this.#formatDate(sub.current_period_start));
    }

    this.appendChild(details);

    // Canceling notice
    if (state === 'canceling') {
      const notice = document.createElement('div');
      notice.className = 'dvfy-subscription-card__cancel-notice';
      notice.textContent = `Your subscription will end on ${this.#formatDate(sub.cancel_at || sub.current_period_end)}`;
      this.appendChild(notice);
    }

    // Canceled notice
    if (state === 'canceled') {
      const notice = document.createElement('div');
      notice.className = 'dvfy-subscription-card__cancel-notice';
      notice.style.background = 'var(--dvfy-danger-bg-subtle)';
      notice.style.color = 'var(--dvfy-danger-text)';
      notice.textContent = `Subscription ended on ${this.#formatDate(sub.canceled_at || sub.current_period_end)}`;
      this.appendChild(notice);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'dvfy-subscription-card__actions';

    if (state === 'active' || state === 'trialing') {
      const changeBtn = document.createElement('dvfy-button');
      changeBtn.setAttribute('variant', 'outline');
      changeBtn.setAttribute('size', 'sm');
      changeBtn.textContent = 'Change plan';
      changeBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('dvfy-subscription-change-plan', { bubbles: true }));
      });
      actions.appendChild(changeBtn);

      const cancelBtn = document.createElement('dvfy-button');
      cancelBtn.setAttribute('variant', 'ghost');
      cancelBtn.setAttribute('size', 'sm');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('dvfy-subscription-cancel', { bubbles: true }));
      });
      actions.appendChild(cancelBtn);
    }

    if (state === 'canceling') {
      const reactivateBtn = document.createElement('dvfy-button');
      reactivateBtn.setAttribute('size', 'sm');
      reactivateBtn.textContent = 'Reactivate';
      reactivateBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('dvfy-subscription-reactivate', { bubbles: true }));
      });
      actions.appendChild(reactivateBtn);
    }

    if (state === 'canceled') {
      const newPlanBtn = document.createElement('dvfy-button');
      newPlanBtn.setAttribute('size', 'sm');
      newPlanBtn.textContent = 'Choose a plan';
      newPlanBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('dvfy-subscription-choose-plan', { bubbles: true }));
      });
      actions.appendChild(newPlanBtn);
    }

    if (actions.children.length > 0) {
      this.appendChild(actions);
    }
  }

  #addRow(container, label, value) {
    const row = document.createElement('div');
    row.className = 'dvfy-subscription-card__row';

    const labelEl = document.createElement('span');
    labelEl.className = 'dvfy-subscription-card__label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'dvfy-subscription-card__value';
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
  }

  #renderNone() {
    this.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'dvfy-subscription-card__empty';

    const text = document.createElement('div');
    text.className = 'dvfy-subscription-card__empty-text';
    text.textContent = 'No active subscription';

    const btn = document.createElement('dvfy-button');
    btn.setAttribute('size', 'sm');
    btn.textContent = 'Choose a plan';
    btn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dvfy-subscription-choose-plan', { bubbles: true }));
    });

    empty.appendChild(text);
    empty.appendChild(btn);
    this.appendChild(empty);
  }

  #renderSkeleton() {
    this.textContent = '';
    const skel = document.createElement('div');
    skel.className = 'dvfy-subscription-card__skeleton';
    for (const w of ['60%', '40%', '80%', '50%']) {
      const line = document.createElement('div');
      line.className = 'dvfy-subscription-card__skeleton-line';
      line.style.width = w;
      skel.appendChild(line);
    }
    this.appendChild(skel);
  }

  #renderError(msg) {
    this.textContent = '';
    const err = document.createElement('div');
    err.className = 'dvfy-subscription-card__error';
    err.textContent = msg;

    const retry = document.createElement('dvfy-button');
    retry.className = 'dvfy-subscription-card__retry';
    retry.setAttribute('variant', 'outline');
    retry.setAttribute('size', 'xs');
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => this.#load());

    err.appendChild(retry);
    this.appendChild(err);
  }
}

customElements.define('dvfy-subscription-card', DvfySubscriptionCard);
