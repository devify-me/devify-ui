/**
 * <dvfy-toast> — Toast notification
 *
 * Attributes:
 *   status:   info | success | warning | danger (default: "info")
 *   duration: ms (default: 4000, 0 = persistent)
 *   position: top-right | top-left | bottom-right | bottom-left (default: "top-right")
 *
 * Static method:
 *   DvfyToast.show({ message, status, duration, position })
 *
 * Usage:
 *   DvfyToast.show({ message: 'Saved!', status: 'success' })
 */

const STYLES = `
.dvfy-toast-container {
  position: fixed;
  z-index: var(--dvfy-z-toast, 9999);
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-2);
  pointer-events: none;
  max-width: 24rem;
  width: 100%;
}
.dvfy-toast-container[data-position="top-right"] { top: var(--dvfy-space-4); right: var(--dvfy-space-4); }
.dvfy-toast-container[data-position="top-left"] { top: var(--dvfy-space-4); left: var(--dvfy-space-4); }
.dvfy-toast-container[data-position="bottom-right"] { bottom: var(--dvfy-space-4); right: var(--dvfy-space-4); }
.dvfy-toast-container[data-position="bottom-left"] { bottom: var(--dvfy-space-4); left: var(--dvfy-space-4); }
.dvfy-toast-container--preview { position: absolute; }

dvfy-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--dvfy-space-3);
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border-radius: var(--dvfy-radius-lg);
  position: relative;
  overflow: hidden;
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  line-height: var(--dvfy-leading-normal);
  border: var(--dvfy-border-1) solid transparent;
  box-shadow: var(--dvfy-shadow-lg);
  pointer-events: auto;
  cursor: pointer;
  opacity: 0;
  transform: translateX(1rem);
  transition: opacity var(--dvfy-duration-normal) var(--dvfy-ease-out),
              transform var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
dvfy-toast.dvfy-toast--visible {
  opacity: 1;
  transform: translateX(0);
}
dvfy-toast.dvfy-toast--hiding {
  opacity: 0;
  transform: translateX(1rem);
}

/* Status colors — subtle tinted backgrounds like alerts */
dvfy-toast:not([status]), dvfy-toast[status="info"] {
  background: var(--dvfy-info-bg-subtle);
  color: var(--dvfy-info-text);
  border-color: var(--dvfy-info-border);
}

dvfy-toast[status="success"] {
  background: var(--dvfy-success-bg-subtle);
  color: var(--dvfy-success-text);
  border-color: var(--dvfy-success-border);
}

dvfy-toast[status="warning"] {
  background: var(--dvfy-warning-bg-subtle);
  color: var(--dvfy-warning-text);
  border-color: var(--dvfy-warning-border);
}

dvfy-toast[status="danger"] {
  background: var(--dvfy-danger-bg-subtle);
  color: var(--dvfy-danger-text);
  border-color: var(--dvfy-danger-border);
}

dvfy-toast .dvfy-toast__icon { flex-shrink: 0; font-size: var(--dvfy-text-lg); font-weight: var(--dvfy-weight-bold); }
dvfy-toast .dvfy-toast__msg { flex: 1; }

/* Progress countdown bar */
@keyframes dvfy-toast-countdown {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

dvfy-toast .dvfy-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  border-radius: 0 0 var(--dvfy-radius-lg) var(--dvfy-radius-lg);
  transform-origin: left;
  animation: dvfy-toast-countdown var(--_duration) linear forwards;
}

dvfy-toast:hover .dvfy-toast__progress {
  animation-play-state: paused;
}

dvfy-toast:not([status]) .dvfy-toast__progress, dvfy-toast[status="info"] .dvfy-toast__progress { background: var(--dvfy-info-bg); }
dvfy-toast[status="success"] .dvfy-toast__progress { background: var(--dvfy-success-bg); }
dvfy-toast[status="warning"] .dvfy-toast__progress { background: var(--dvfy-warning-bg); }
dvfy-toast[status="danger"] .dvfy-toast__progress { background: var(--dvfy-danger-bg); }
`;

const STATUS_ICONS = { info: '\u2139\uFE0F', success: '\u2705', warning: '\u26A0\uFE0F', danger: '\u274C' };
const CONTAINERS = new Map();

function getContainer(position, context) {
  const preview = context?.closest?.('[data-sc-preview]');
  const root = preview || document.body;
  const key = preview ? `${position}::preview::${root.id || 'anon'}` : position;
  if (CONTAINERS.has(key)) return CONTAINERS.get(key);
  const el = document.createElement('div');
  el.className = 'dvfy-toast-container';
  if (preview) el.classList.add('dvfy-toast-container--preview');
  el.setAttribute('data-position', position);
  el.setAttribute('aria-live', 'polite');
  root.appendChild(el);
  CONTAINERS.set(key, el);
  return el;
}

/**
 * Toast notification with auto-dismiss and status-based styling.
 * Use the static `DvfyToast.show()` method to create toasts programmatically.
 *
 * @element dvfy-toast
 *
 * @attr {string} status - Toast status: info | success | warning | danger (default: "info")
 * @attr {number} duration - Auto-dismiss delay in ms (default: 4000, 0 = persistent)
 * @attr {string} position - Screen position: top-right | top-left | bottom-right | bottom-left (default: "top-right")
 *
 * @cssprop {color} --dvfy-info-bg-subtle - Info toast background
 * @cssprop {color} --dvfy-success-bg-subtle - Success toast background
 * @cssprop {color} --dvfy-warning-bg-subtle - Warning toast background
 * @cssprop {color} --dvfy-danger-bg-subtle - Danger toast background
 */
class DvfyToast extends HTMLElement {
  static #styled = false;
  #timer = null;
  #clickHandler = null;
  #remaining = 0;
  #startedAt = 0;
  #progress = null;

  static get observedAttributes() { return ['status', 'duration', 'position']; }

  attributeChangedCallback() {
    if (this.isConnected) {
      // Re-read message from existing DOM before rebuilding
      const msg = this.querySelector('.dvfy-toast__msg');
      if (msg) {
        const message = msg.textContent;
        const wasVisible = this.classList.contains('dvfy-toast--visible');
        this.textContent = '';
        const status = this.getAttribute('status') || 'info';
        const icon = document.createElement('span');
        icon.className = 'dvfy-toast__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = STATUS_ICONS[status] || STATUS_ICONS.info;
        this.appendChild(icon);
        const msgEl = document.createElement('span');
        msgEl.className = 'dvfy-toast__msg';
        msgEl.textContent = message;
        this.appendChild(msgEl);
        if (wasVisible) this.classList.add('dvfy-toast--visible');
      }
    }
  }

  static show({ message, status = 'info', duration = 4000, position = 'top-right', context } = {}) {
    const toast = document.createElement('dvfy-toast');
    toast.setAttribute('status', status);
    toast.setAttribute('duration', String(duration));
    toast.setAttribute('position', position);
    toast.textContent = message;

    const container = getContainer(position, context);
    container.appendChild(toast);
    return toast;
  }

  connectedCallback() {
    if (!DvfyToast.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyToast.#styled = true;
    }

    const message = this.textContent.trim();
    const status = this.getAttribute('status') || 'info';
    const duration = parseInt(this.getAttribute('duration') || '4000', 10);

    // Clear and rebuild
    this.textContent = '';

    const icon = document.createElement('span');
    icon.className = 'dvfy-toast__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = STATUS_ICONS[status] || STATUS_ICONS.info;
    this.appendChild(icon);

    const msg = document.createElement('span');
    msg.className = 'dvfy-toast__msg';
    msg.textContent = message;
    this.appendChild(msg);

    // Progress countdown bar (only when auto-dismissing)
    if (duration > 0) {
      this.style.setProperty('--_duration', `${duration}ms`);
      this.#progress = document.createElement('div');
      this.#progress.className = 'dvfy-toast__progress';
      this.appendChild(this.#progress);
    }

    this.setAttribute('role', 'alert');
    this.#clickHandler = () => this.dismiss();
    this.addEventListener('click', this.#clickHandler);
    this.addEventListener('mouseenter', this.#onPause);
    this.addEventListener('mouseleave', this.#onResume);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.classList.add('dvfy-toast--visible'));
    });

    // Auto-dismiss
    if (duration > 0) {
      this.#remaining = duration;
      this.#startedAt = Date.now();
      this.#timer = setTimeout(() => this.dismiss(), duration);
    }
  }

  disconnectedCallback() {
    if (this.#timer) clearTimeout(this.#timer);
    if (this.#clickHandler) {
      this.removeEventListener('click', this.#clickHandler);
      this.#clickHandler = null;
    }
    this.removeEventListener('mouseenter', this.#onPause);
    this.removeEventListener('mouseleave', this.#onResume);
  }

  #onPause = () => {
    if (!this.#timer) return;
    clearTimeout(this.#timer);
    this.#timer = null;
    this.#remaining -= Date.now() - this.#startedAt;
    if (this.#remaining < 0) this.#remaining = 0;
  };

  #onResume = () => {
    if (this.#remaining <= 0) return;
    this.#startedAt = Date.now();
    this.#timer = setTimeout(() => this.dismiss(), this.#remaining);
  };

  dismiss() {
    if (this.#timer) clearTimeout(this.#timer);
    this.classList.remove('dvfy-toast--visible');
    this.classList.add('dvfy-toast--hiding');
    this.addEventListener('transitionend', () => this.remove(), { once: true });
    // Fallback if transition doesn't fire
    setTimeout(() => { if (this.parentNode) this.remove(); }, 400);
  }
}

customElements.define('dvfy-toast', DvfyToast);

// Export for static usage
if (typeof window !== 'undefined') window.DvfyToast = DvfyToast;
