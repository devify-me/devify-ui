import { sanitizeHref } from '../utils/url.js';
import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-invoice-list> — Billing history
 *
 * Lists past invoices with amount, date range, status badge, and hosted invoice link.
 * Fetches data from GET /tenants/{id}/invoices or accepts static JSON via the data attr.
 *
 * Attributes:
 *   tenant-id:  tenant UUID for API calls
 *   api-base:   base URL for billing API (default: current origin)
 *   data:       JSON array of invoice objects (bypasses fetch)
 *
 * Data format (each item):
 *   {
 *     "external_id": "in_xxx",
 *     "amount_cents": 2500,
 *     "currency": "usd",
 *     "status": "paid" | "open" | "void",
 *     "period_start": 1700000000,
 *     "period_end": 1702592000,
 *     "paid_at": 1700001000,
 *     "hosted_url": "https://..."
 *   }
 *
 * Usage:
 *   <dvfy-invoice-list tenant-id="abc-123" api-base="/api"></dvfy-invoice-list>
 */

const STYLES = `
dvfy-invoice-list {
  display: block;
  font-family: var(--dvfy-font-sans);
}

dvfy-invoice-list .dvfy-invoice-list__table {
  width: 100%;
  border-collapse: collapse;
}

dvfy-invoice-list .dvfy-invoice-list__table th {
  text-align: left;
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wide);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-default);
}

dvfy-invoice-list .dvfy-invoice-list__table td {
  padding: var(--dvfy-space-3);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  vertical-align: middle;
}

dvfy-invoice-list .dvfy-invoice-list__table tr:last-child td {
  border-bottom: none;
}

dvfy-invoice-list .dvfy-invoice-list__amount {
  font-weight: var(--dvfy-weight-medium);
  font-variant-numeric: tabular-nums;
}

dvfy-invoice-list .dvfy-invoice-list__date {
  color: var(--dvfy-text-secondary);
  white-space: nowrap;
}

dvfy-invoice-list .dvfy-invoice-list__link {
  color: var(--dvfy-text-link);
  text-decoration: none;
  font-size: var(--dvfy-text-sm);
}

dvfy-invoice-list .dvfy-invoice-list__link:hover {
  color: var(--dvfy-text-link-hover);
  text-decoration: underline;
}

dvfy-invoice-list .dvfy-invoice-list__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-3);
}

dvfy-invoice-list .dvfy-invoice-list__skeleton-row {
  height: 1rem;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-xs);
  animation: dvfy-invoice-list-pulse 1.5s ease-in-out infinite;
}

@keyframes dvfy-invoice-list-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

dvfy-invoice-list .dvfy-invoice-list__error {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-3);
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-sm);
}

dvfy-invoice-list .dvfy-invoice-list__retry {
  margin-left: auto;
}

dvfy-invoice-list .dvfy-invoice-list__empty {
  text-align: center;
  padding: var(--dvfy-space-8);
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}

/* Responsive: stack on narrow containers */
@container (max-width: 30rem) {
  dvfy-invoice-list .dvfy-invoice-list__table thead { display: none; }
  dvfy-invoice-list .dvfy-invoice-list__table,
  dvfy-invoice-list .dvfy-invoice-list__table tbody,
  dvfy-invoice-list .dvfy-invoice-list__table tr,
  dvfy-invoice-list .dvfy-invoice-list__table td {
    display: block;
  }
  dvfy-invoice-list .dvfy-invoice-list__table tr {
    padding: var(--dvfy-space-3) 0;
    border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  }
  dvfy-invoice-list .dvfy-invoice-list__table td {
    padding: var(--dvfy-space-0-5) var(--dvfy-space-3);
    border-bottom: none;
  }
}
`;

const STATUS_MAP = {
  paid: 'success',
  open: 'warning',
  void: 'neutral',
};

/**
 * Billing history list with status badges and hosted invoice links.
 *
 * @element dvfy-invoice-list
 *
 * @attr {string} tenant-id - Tenant UUID for API calls
 * @attr {string} api-base - Base URL for billing API (default: current origin)
 * @attr {string} data - JSON array of invoice objects (bypasses fetch)
 *
 * @event {CustomEvent} dvfy-invoices-loaded - Fires after data loads, detail: invoices array
 * @event {CustomEvent} dvfy-invoices-error - Fires on fetch failure, detail: error message
 *
 * @cssprop {color} --dvfy-success-bg-subtle - Paid status badge background
 * @cssprop {color} --dvfy-warning-bg-subtle - Open status badge background
 */
class DvfyInvoiceList extends HTMLElement {
  #abortController = null;

  connectedCallback() {
    injectStyles('dvfy-invoice-list', STYLES);
    this.style.containerType = 'inline-size';
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Billing history');
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
        const invoices = JSON.parse(dataAttr);
        this.#renderInvoices(invoices);
        this.dispatchEvent(new CustomEvent('dvfy-invoices-loaded', { bubbles: true, detail: invoices }));
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
      const res = await fetch(`${base}/tenants/${tenantId}/invoices`, {
        signal: this.#abortController.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const invoices = await res.json();
      this.#renderInvoices(invoices);
      this.dispatchEvent(new CustomEvent('dvfy-invoices-loaded', { bubbles: true, detail: invoices }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.#renderError(err.message);
        this.dispatchEvent(new CustomEvent('dvfy-invoices-error', { bubbles: true, detail: err.message }));
      }
    }
  }

  #formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts * 1000);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  #formatAmount(cents, currency) {
    const amount = cents / 100;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: (currency || 'usd').toUpperCase(),
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  #renderInvoices(invoices) {
    this.textContent = '';
    if (!invoices || invoices.length === 0) {
      this.#renderEmpty();
      return;
    }

    const table = document.createElement('table');
    table.className = 'dvfy-invoice-list__table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (const label of ['Period', 'Amount', 'Status', '']) {
      const th = document.createElement('th');
      th.textContent = label;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const inv of invoices) {
      const tr = document.createElement('tr');

      // Period
      const tdDate = document.createElement('td');
      tdDate.className = 'dvfy-invoice-list__date';
      tdDate.textContent = `${this.#formatDate(inv.period_start)} — ${this.#formatDate(inv.period_end)}`;
      tr.appendChild(tdDate);

      // Amount
      const tdAmount = document.createElement('td');
      tdAmount.className = 'dvfy-invoice-list__amount';
      tdAmount.textContent = this.#formatAmount(inv.amount_cents, inv.currency);
      tr.appendChild(tdAmount);

      // Status badge
      const tdStatus = document.createElement('td');
      const badge = document.createElement('dvfy-badge');
      badge.setAttribute('status', STATUS_MAP[inv.status] || 'neutral');
      badge.setAttribute('size', 'sm');
      badge.setAttribute('dot', '');
      badge.textContent = inv.status;
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // View link
      const tdLink = document.createElement('td');
      if (inv.hosted_url) {
        const link = document.createElement('a');
        link.className = 'dvfy-invoice-list__link';
        link.href = sanitizeHref(inv.hosted_url);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'View';
        tdLink.appendChild(link);
      }
      tr.appendChild(tdLink);

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.appendChild(table);
  }

  #renderSkeleton() {
    this.textContent = '';
    const skel = document.createElement('div');
    skel.className = 'dvfy-invoice-list__skeleton';
    for (let i = 0; i < 4; i++) {
      const row = document.createElement('div');
      row.className = 'dvfy-invoice-list__skeleton-row';
      row.style.width = `${60 + Math.random() * 40}%`;
      skel.appendChild(row);
    }
    this.appendChild(skel);
  }

  #renderError(msg) {
    this.textContent = '';
    const err = document.createElement('div');
    err.className = 'dvfy-invoice-list__error';
    err.textContent = msg;

    const retry = document.createElement('dvfy-button');
    retry.className = 'dvfy-invoice-list__retry';
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
    empty.className = 'dvfy-invoice-list__empty';
    empty.textContent = 'No invoices yet';
    this.appendChild(empty);
  }
}

customElements.define('dvfy-invoice-list', DvfyInvoiceList);
