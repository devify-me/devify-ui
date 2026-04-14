/**
 * utils/form-messages.js — Form error/warning/success message rendering
 *
 * Shared utility for consistently rendering validation messages across form components.
 * Handles DOM construction, ARIA attributes, and message visibility.
 */

/**
 * Append error/warning/success/help messages to a form component.
 *
 * @param {HTMLElement} host — The component element (dvfy-input, dvfy-date-picker, etc.)
 * @param {string} prefix — BEM prefix for class names (e.g., 'dvfy-input' → dvfy-input__error-msg)
 * @param {HTMLElement} inputEl — The input element to describe
 * @param {Object} attrs — { error?, warning?, success?, help?, state? }
 */
export function appendFormMessages(host, prefix, inputEl, attrs = {}) {
  const container = document.createElement('div');
  container.className = `${prefix}__messages`;

  const { error, warning, success, help, state } = attrs;

  // Helper to create a message element
  const createMessage = (type, text, role) => {
    if (!text) return null;
    const el = document.createElement('div');
    el.className = `${prefix}__${type}-msg`;
    el.id = `${prefix}-${type}-${Math.random().toString(36).slice(2, 9)}`;
    el.textContent = text;
    if (role) el.setAttribute('role', role);
    return el;
  };

  // Render based on state or explicit attributes
  if (state === 'error' || error) {
    const msg = createMessage('error', error, 'alert');
    if (msg) {
      container.appendChild(msg);
      if (inputEl && msg.id) inputEl.setAttribute('aria-describedby', msg.id);
    }
  } else if (state === 'warning' || warning) {
    const msg = createMessage('warning', warning, 'alert');
    if (msg) {
      container.appendChild(msg);
      if (inputEl && msg.id) inputEl.setAttribute('aria-describedby', msg.id);
    }
  } else if (state === 'success' || success) {
    const msg = createMessage('success', success);
    if (msg) container.appendChild(msg);
  }

  // Help text is always shown regardless of state
  if (help) {
    const msg = createMessage('help', help);
    if (msg) {
      container.appendChild(msg);
      if (inputEl && msg.id && !inputEl.hasAttribute('aria-describedby')) {
        inputEl.setAttribute('aria-describedby', msg.id);
      }
    }
  }

  return container;
}
