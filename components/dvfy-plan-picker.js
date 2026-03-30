import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-plan-picker> — Plan selection grid
 *
 * Shows available plans in a comparison grid with features, pricing, and CTA buttons.
 * Fetches data from GET /plans or accepts static JSON via the data attr.
 *
 * Attributes:
 *   tenant-id:    tenant UUID for API calls
 *   api-base:     base URL for billing API (default: current origin)
 *   data:         JSON array of plan objects (bypasses fetch)
 *   current-plan: plan name/id to highlight as current
 *   columns:      2 | 3 | 4 (default: auto based on plan count)
 *
 * Data format (each plan):
 *   {
 *     "name": "starter",
 *     "display_name": "Starter",
 *     "price_cents": 2500,
 *     "currency": "usd",
 *     "interval": "month",
 *     "features": { "API Calls": "10,000/mo", "Storage": "5 GB", "Support": "Email" }
 *   }
 *
 * Usage:
 *   <dvfy-plan-picker tenant-id="abc-123" current-plan="starter"></dvfy-plan-picker>
 */

const STYLES = `
dvfy-plan-picker {
  display: block;
  font-family: var(--dvfy-font-sans);
  container-type: inline-size;
}

dvfy-plan-picker .dvfy-plan-picker__grid {
  display: grid;
  gap: var(--dvfy-space-4);
}

dvfy-plan-picker .dvfy-plan-picker__grid[data-cols="2"] { grid-template-columns: repeat(2, 1fr); }
dvfy-plan-picker .dvfy-plan-picker__grid[data-cols="3"] { grid-template-columns: repeat(3, 1fr); }
dvfy-plan-picker .dvfy-plan-picker__grid[data-cols="4"] { grid-template-columns: repeat(4, 1fr); }

@container (max-width: 40rem) {
  dvfy-plan-picker .dvfy-plan-picker__grid[data-cols="3"],
  dvfy-plan-picker .dvfy-plan-picker__grid[data-cols="4"] {
    grid-template-columns: 1fr;
  }
}

@container (max-width: 30rem) {
  dvfy-plan-picker .dvfy-plan-picker__grid[data-cols="2"] {
    grid-template-columns: 1fr;
  }
}

dvfy-plan-picker .dvfy-plan-picker__plan {
  display: flex;
  flex-direction: column;
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-2) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  padding: var(--dvfy-space-5);
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}

dvfy-plan-picker .dvfy-plan-picker__plan:hover {
  border-color: var(--dvfy-border-strong);
}

dvfy-plan-picker .dvfy-plan-picker__plan--current {
  border-color: var(--dvfy-primary-bg);
  position: relative;
}

dvfy-plan-picker .dvfy-plan-picker__plan-header {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  margin-bottom: var(--dvfy-space-3);
}

dvfy-plan-picker .dvfy-plan-picker__plan-name {
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
}

dvfy-plan-picker .dvfy-plan-picker__price {
  margin-bottom: var(--dvfy-space-4);
}

dvfy-plan-picker .dvfy-plan-picker__amount {
  font-size: var(--dvfy-text-3xl);
  font-weight: var(--dvfy-weight-bold);
  color: var(--dvfy-text-primary);
  font-variant-numeric: tabular-nums;
}

dvfy-plan-picker .dvfy-plan-picker__interval {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
}

dvfy-plan-picker .dvfy-plan-picker__features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--dvfy-space-5) 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-2);
}

dvfy-plan-picker .dvfy-plan-picker__feature {
  display: flex;
  align-items: baseline;
  gap: var(--dvfy-space-2);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-secondary);
}

dvfy-plan-picker .dvfy-plan-picker__feature::before {
  content: "\\2713";
  color: var(--dvfy-success-bg);
  font-weight: var(--dvfy-weight-bold);
  flex-shrink: 0;
}

dvfy-plan-picker .dvfy-plan-picker__feature-value {
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-medium);
}

dvfy-plan-picker .dvfy-plan-picker__skeleton {
  display: grid;
  gap: var(--dvfy-space-4);
  grid-template-columns: repeat(3, 1fr);
}

dvfy-plan-picker .dvfy-plan-picker__skeleton-card {
  height: 16rem;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-lg);
  animation: dvfy-plan-pulse 1.5s ease-in-out infinite;
}

@keyframes dvfy-plan-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

dvfy-plan-picker .dvfy-plan-picker__error {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
}

dvfy-plan-picker .dvfy-plan-picker__retry {
  margin-left: auto;
}

dvfy-plan-picker .dvfy-plan-picker__empty {
  text-align: center;
  padding: var(--dvfy-space-8);
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}
`;

/**
 * Plan comparison grid with pricing, features, and selection actions.
 *
 * @element dvfy-plan-picker
 *
 * @attr {string} tenant-id - Tenant UUID for API calls
 * @attr {string} api-base - Base URL for billing API (default: current origin)
 * @attr {string} data - JSON array of plan objects (bypasses fetch)
 * @attr {string} current-plan - Plan name to highlight as current
 * @attr {string} columns - Grid columns: 2 | 3 | 4
 *
 * @event {CustomEvent} dvfy-plans-loaded - Fires after data loads, detail: plans array
 * @event {CustomEvent} dvfy-plans-error - Fires on fetch failure, detail: error message
 * @event {CustomEvent} dvfy-plan-select - Fires when a plan is selected, detail: plan object
 *
 * @cssprop {color} --dvfy-surface-raised - Plan card background
 * @cssprop {color} --dvfy-primary-bg - Current plan border highlight
 */
class DvfyPlanPicker extends HTMLElement {
  #abortController = null;

  connectedCallback() {
    injectStyles('dvfy-plan-picker', STYLES);
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Choose a plan');
    }
    queueMicrotask(() => this.#load());
  }

  disconnectedCallback() {
    if (this.#abortController) {
      this.#abortController.abort();
      this.#abortController = null;
    }
  }

  static get observedAttributes() { return ['data', 'tenant-id', 'current-plan', 'columns']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#load();
  }

  async #load() {
    const dataAttr = this.getAttribute('data');
    if (dataAttr) {
      try {
        const plans = JSON.parse(dataAttr);
        this.#renderPlans(plans);
        this.dispatchEvent(new CustomEvent('dvfy-plans-loaded', { bubbles: true, detail: plans }));
      } catch {
        this.#renderError('Invalid data format');
      }
      return;
    }

    const tenantId = this.getAttribute('tenant-id');
    const base = this.getAttribute('api-base') || '';

    if (!tenantId && !base) {
      this.#renderEmpty();
      return;
    }

    this.#renderSkeleton();

    if (this.#abortController) this.#abortController.abort();
    this.#abortController = new AbortController();

    try {
      const res = await fetch(`${base}/plans`, {
        signal: this.#abortController.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const plans = await res.json();
      this.#renderPlans(plans);
      this.dispatchEvent(new CustomEvent('dvfy-plans-loaded', { bubbles: true, detail: plans }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.#renderError(err.message);
        this.dispatchEvent(new CustomEvent('dvfy-plans-error', { bubbles: true, detail: err.message }));
      }
    }
  }

  #formatAmount(cents, currency) {
    const amount = (cents || 0) / 100;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: (currency || 'usd').toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  #renderPlans(plans) {
    this.textContent = '';
    if (!plans || plans.length === 0) {
      this.#renderEmpty();
      return;
    }

    const currentPlan = this.getAttribute('current-plan');
    const cols = this.getAttribute('columns') || String(Math.min(plans.length, 4));

    const grid = document.createElement('div');
    grid.className = 'dvfy-plan-picker__grid';
    grid.dataset.cols = cols;

    for (const plan of plans) {
      grid.appendChild(this.#buildPlanCard(plan, currentPlan));
    }

    this.appendChild(grid);
  }

  #buildPlanCard(plan, currentPlan) {
    const isCurrent = currentPlan && (plan.name === currentPlan || plan.display_name === currentPlan);

    const card = document.createElement('div');
    card.className = 'dvfy-plan-picker__plan';
    if (isCurrent) card.classList.add('dvfy-plan-picker__plan--current');

    // Header
    const header = document.createElement('div');
    header.className = 'dvfy-plan-picker__plan-header';

    const name = document.createElement('span');
    name.className = 'dvfy-plan-picker__plan-name';
    name.textContent = plan.display_name || plan.name;
    header.appendChild(name);

    if (isCurrent) {
      const badge = document.createElement('dvfy-badge');
      badge.setAttribute('status', 'success');
      badge.setAttribute('size', 'xs');
      badge.textContent = 'Current';
      header.appendChild(badge);
    }
    card.appendChild(header);

    // Price
    const priceEl = document.createElement('div');
    priceEl.className = 'dvfy-plan-picker__price';

    const amountSpan = document.createElement('span');
    amountSpan.className = 'dvfy-plan-picker__amount';
    amountSpan.textContent = plan.price_cents === 0 ? 'Free' : this.#formatAmount(plan.price_cents, plan.currency);
    priceEl.appendChild(amountSpan);

    if (plan.price_cents > 0) {
      const intervalSpan = document.createElement('span');
      intervalSpan.className = 'dvfy-plan-picker__interval';
      intervalSpan.textContent = ` / ${plan.interval || 'month'}`;
      priceEl.appendChild(intervalSpan);
    }
    card.appendChild(priceEl);

    // Features
    if (plan.features && Object.keys(plan.features).length > 0) {
      const featureList = document.createElement('ul');
      featureList.className = 'dvfy-plan-picker__features';

      for (const [key, value] of Object.entries(plan.features)) {
        const li = document.createElement('li');
        li.className = 'dvfy-plan-picker__feature';

        const featureValue = document.createElement('span');
        featureValue.className = 'dvfy-plan-picker__feature-value';
        featureValue.textContent = value;

        li.appendChild(featureValue);
        li.appendChild(document.createTextNode(` ${key}`));
        featureList.appendChild(li);
      }
      card.appendChild(featureList);
    }

    // CTA
    const cta = document.createElement('dvfy-button');
    if (isCurrent) {
      cta.setAttribute('variant', 'outline');
      cta.setAttribute('disabled', '');
      cta.textContent = 'Current plan';
    } else {
      cta.textContent = currentPlan ? 'Switch to this plan' : 'Get started';
      cta.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('dvfy-plan-select', { bubbles: true, detail: plan }));
      });
    }
    cta.style.width = '100%';
    card.appendChild(cta);

    return card;
  }

  #renderSkeleton() {
    this.textContent = '';
    const skel = document.createElement('div');
    skel.className = 'dvfy-plan-picker__skeleton';
    for (let i = 0; i < 3; i++) {
      const card = document.createElement('div');
      card.className = 'dvfy-plan-picker__skeleton-card';
      skel.appendChild(card);
    }
    this.appendChild(skel);
  }

  #renderError(msg) {
    this.textContent = '';
    const err = document.createElement('div');
    err.className = 'dvfy-plan-picker__error';
    err.textContent = msg;

    const retry = document.createElement('dvfy-button');
    retry.className = 'dvfy-plan-picker__retry';
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
    empty.className = 'dvfy-plan-picker__empty';
    empty.textContent = 'No plans available';
    this.appendChild(empty);
  }
}

customElements.define('dvfy-plan-picker', DvfyPlanPicker);
