import { injectStyles } from '../utils/styles.js';

const STYLES = `
dvfy-field-group {
  display: block;
  width: 100%;
  font-family: var(--dvfy-font-sans);
}
dvfy-field-group fieldset {
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-2);
}
dvfy-field-group legend {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
  padding: 0;
  margin-bottom: var(--dvfy-space-1);
  float: left;
  width: 100%;
}
dvfy-field-group legend + * { clear: left; }
dvfy-field-group .dvfy-field-group__help {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  margin-top: calc(-1 * var(--dvfy-space-1));
}
dvfy-field-group .dvfy-field-group__slot {
  display: contents;
}
dvfy-field-group .dvfy-field-group__message {
  font-size: var(--dvfy-text-xs);
}
dvfy-field-group .dvfy-field-group__message--error   { color: var(--dvfy-danger-text); }
dvfy-field-group .dvfy-field-group__message--warning { color: var(--dvfy-warning-text); }
dvfy-field-group .dvfy-field-group__message--success { color: var(--dvfy-success-text); }
dvfy-field-group [slot] { display: none; }
`;

/**
 * Wrapper component that groups related form fields with a shared label, help text,
 * and group-level validation message. Renders as a semantic fieldset + legend.
 *
 * @element dvfy-field-group
 *
 * @attr {string} label - Group label text (e.g., "Address", "Date Range")
 * @attr {string} help - Helper text shown below the legend
 * @attr {string} state - Group-level validation state: error | warning | success
 *
 * @slot - Child form elements (dvfy-input, dvfy-select, etc.)
 * @slot error-message - Group-level error message (shown when state="error")
 * @slot warning-message - Group-level warning message (shown when state="warning")
 * @slot success-message - Group-level success message (shown when state="success")
 *
 * @cssprop {color} --dvfy-danger-text - Error message text color
 * @cssprop {color} --dvfy-warning-text - Warning message text color
 * @cssprop {color} --dvfy-success-text - Success message text color
 *
 * @example
 * <dvfy-field-group label="Email Address" help="We'll never share your email">
 *   <dvfy-input label="Email" name="email" type="email" required></dvfy-input>
 * </dvfy-field-group>
 *
 * @example
 * <dvfy-field-group label="Date Range" state="error">
 *   <dvfy-input label="Start Date" name="start" type="date" required></dvfy-input>
 *   <dvfy-input label="End Date" name="end" type="date" required></dvfy-input>
 *   <span slot="error-message">End date must be after start date</span>
 * </dvfy-field-group>
 */
class DvfyFieldGroup extends HTMLElement {
  #isConnected = false;
  #msgId = null;

  connectedCallback() {
    injectStyles('dvfy-field-group', STYLES);
    this.#msgId = `dvfy-fg-${Math.random().toString(36).slice(2, 8)}`;
    this.#isConnected = true;
    this.#build();
  }

  static get observedAttributes() {
    return ['label', 'help', 'state'];
  }

  attributeChangedCallback(_name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this.#isConnected) this.#build();
  }

  #build() {
    // Preserve slotted children (hidden via CSS) before clearing
    const slottedChildren = Array.from(this.children).filter(el => el.hasAttribute('slot'));
    // Preserve non-generated children (the user's actual form elements)
    const contentChildren = Array.from(this.children).filter(
      el => !el.hasAttribute('slot') && !el.classList.contains('dvfy-field-group__fieldset')
    );

    // Remove the previously generated fieldset (if any)
    this.querySelector('.dvfy-field-group__fieldset')?.remove();

    const label = this.getAttribute('label') || '';
    const help = this.getAttribute('help') || '';
    const state = this.getAttribute('state') || '';

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'dvfy-field-group__fieldset';

    // Legend (required for fieldset a11y)
    const legend = document.createElement('legend');
    legend.textContent = label;
    fieldset.appendChild(legend);

    // Help text
    if (help) {
      const helpEl = document.createElement('span');
      helpEl.className = 'dvfy-field-group__help';
      helpEl.textContent = help;
      fieldset.appendChild(helpEl);
    }

    // Move content children into fieldset (preserves live DOM nodes — no innerHTML clone)
    for (const child of contentChildren) {
      fieldset.appendChild(child);
    }

    // Group-level state message
    if (state === 'error' || state === 'warning' || state === 'success') {
      const slotName = `${state}-message`;
      const slotEl = slottedChildren.find(el => el.getAttribute('slot') === slotName);
      const msgEl = document.createElement('span');
      msgEl.className = `dvfy-field-group__message dvfy-field-group__message--${state}`;
      msgEl.id = `${this.#msgId}-${state}`;
      msgEl.setAttribute('role', state === 'error' ? 'alert' : 'status');
      if (slotEl) msgEl.textContent = slotEl.textContent;
      fieldset.appendChild(msgEl);

      // Link fieldset to message via aria-describedby
      fieldset.setAttribute('aria-describedby', msgEl.id);
    } else {
      fieldset.removeAttribute('aria-describedby');
    }

    this.appendChild(fieldset);

    // Re-attach slotted children (hidden via CSS, serve as data sources)
    for (const child of slottedChildren) {
      this.appendChild(child);
    }
  }
}

customElements.define('dvfy-field-group', DvfyFieldGroup);
