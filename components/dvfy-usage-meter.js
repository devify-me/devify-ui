/**
 * <dvfy-usage-meter> — Feature usage progress bars
 *
 * Displays current usage vs. plan limits for metered features.
 * Fetches data from GET /tenants/{id}/usage or accepts static JSON via the data attr.
 *
 * Attributes:
 *   tenant-id:  tenant UUID for API calls
 *   api-base:   base URL for billing API (default: current origin)
 *   data:       JSON array of usage items (bypasses fetch)
 *
 * Data format (each item):
 *   { "feature": "API Calls", "used": 8500, "limit": 10000, "unit": "calls" }
 *
 * Usage:
 *   <dvfy-usage-meter tenant-id="abc-123" api-base="/api"></dvfy-usage-meter>
 *   <dvfy-usage-meter data='[{"feature":"Storage","used":3,"limit":10,"unit":"GB"}]'></dvfy-usage-meter>
 */

const STYLES = `
dvfy-usage-meter {
  display: block;
  font-family: var(--dvfy-font-sans);
}

dvfy-usage-meter .dvfy-usage-meter__list {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-4);
}

dvfy-usage-meter .dvfy-usage-meter__item {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
}

dvfy-usage-meter .dvfy-usage-meter__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

dvfy-usage-meter .dvfy-usage-meter__feature {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}

dvfy-usage-meter .dvfy-usage-meter__counts {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-secondary);
}

dvfy-usage-meter .dvfy-usage-meter__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-4);
}

dvfy-usage-meter .dvfy-usage-meter__skeleton-row {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
}

dvfy-usage-meter .dvfy-usage-meter__skeleton-bar {
  height: 0.5rem;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-sm);
  animation: dvfy-usage-meter-pulse 1.5s ease-in-out infinite;
}

dvfy-usage-meter .dvfy-usage-meter__skeleton-text {
  height: 0.875rem;
  width: 40%;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-xs);
  animation: dvfy-usage-meter-pulse 1.5s ease-in-out infinite;
}

@keyframes dvfy-usage-meter-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

dvfy-usage-meter .dvfy-usage-meter__error {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
}

dvfy-usage-meter .dvfy-usage-meter__retry {
  margin-left: auto;
}

dvfy-usage-meter .dvfy-usage-meter__empty {
  text-align: center;
  padding: var(--dvfy-space-6);
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}
`;

/**
 * Feature usage progress bars for metered billing features.
 *
 * @element dvfy-usage-meter
 *
 * @attr {string} tenant-id - Tenant UUID for API calls
 * @attr {string} api-base - Base URL for billing API (default: current origin)
 * @attr {string} data - JSON array of usage items (bypasses fetch)
 *
 * @event {CustomEvent} dvfy-usage-loaded - Fires after usage data loads, detail: items array
 * @event {CustomEvent} dvfy-usage-error - Fires on fetch failure, detail: error message
 *
 * @cssprop {color} --dvfy-primary-bg - Default progress bar fill
 * @cssprop {color} --dvfy-warning-bg - Warning threshold fill
 * @cssprop {color} --dvfy-danger-bg - Danger threshold fill
 */
class DvfyUsageMeter extends HTMLElement {
  static #styled = false;
  #abortController = null;

  connectedCallback() {
    if (!DvfyUsageMeter.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyUsageMeter.#styled = true;
    }
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Feature usage');
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
        const items = JSON.parse(dataAttr);
        this.#renderItems(items);
        this.dispatchEvent(new CustomEvent('dvfy-usage-loaded', { bubbles: true, detail: items }));
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
      const res = await fetch(`${base}/tenants/${tenantId}/usage`, {
        signal: this.#abortController.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = await res.json();
      this.#renderItems(items);
      this.dispatchEvent(new CustomEvent('dvfy-usage-loaded', { bubbles: true, detail: items }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.#renderError(err.message);
        this.dispatchEvent(new CustomEvent('dvfy-usage-error', { bubbles: true, detail: err.message }));
      }
    }
  }

  #getStatus(used, limit) {
    if (limit <= 0) return 'default';
    const pct = used / limit;
    if (pct >= 0.9) return 'danger';
    if (pct >= 0.75) return 'warning';
    return 'default';
  }

  #formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  #renderItems(items) {
    this.textContent = '';
    if (!items || items.length === 0) {
      this.#renderEmpty();
      return;
    }

    const list = document.createElement('div');
    list.className = 'dvfy-usage-meter__list';

    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'dvfy-usage-meter__item';

      const header = document.createElement('div');
      header.className = 'dvfy-usage-meter__header';

      const feature = document.createElement('span');
      feature.className = 'dvfy-usage-meter__feature';
      feature.textContent = item.feature;

      const counts = document.createElement('span');
      counts.className = 'dvfy-usage-meter__counts';
      const unit = item.unit ? ` ${item.unit}` : '';
      counts.textContent = `${this.#formatNumber(item.used)} / ${this.#formatNumber(item.limit)}${unit}`;

      header.appendChild(feature);
      header.appendChild(counts);

      const pct = item.limit > 0 ? Math.min(100, Math.round((item.used / item.limit) * 100)) : 0;
      const status = this.#getStatus(item.used, item.limit);

      const progress = document.createElement('dvfy-progress');
      progress.setAttribute('value', String(pct));
      progress.setAttribute('status', status);
      progress.setAttribute('size', 'sm');

      row.appendChild(header);
      row.appendChild(progress);
      list.appendChild(row);
    }

    this.appendChild(list);
  }

  #renderSkeleton() {
    this.textContent = '';
    const skel = document.createElement('div');
    skel.className = 'dvfy-usage-meter__skeleton';
    for (let i = 0; i < 3; i++) {
      const row = document.createElement('div');
      row.className = 'dvfy-usage-meter__skeleton-row';
      const text = document.createElement('div');
      text.className = 'dvfy-usage-meter__skeleton-text';
      const bar = document.createElement('div');
      bar.className = 'dvfy-usage-meter__skeleton-bar';
      row.appendChild(text);
      row.appendChild(bar);
      skel.appendChild(row);
    }
    this.appendChild(skel);
  }

  #renderError(msg) {
    this.textContent = '';
    const err = document.createElement('div');
    err.className = 'dvfy-usage-meter__error';
    err.textContent = msg;

    const retry = document.createElement('dvfy-button');
    retry.className = 'dvfy-usage-meter__retry';
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
    empty.className = 'dvfy-usage-meter__empty';
    empty.textContent = 'No usage data available';
    this.appendChild(empty);
  }
}

customElements.define('dvfy-usage-meter', DvfyUsageMeter);
