import { labelPositionCSS } from '../utils/label-position.js';
import { injectStyles } from '../utils/styles.js';

const STYLES = `
dvfy-date-picker {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  font-family: var(--dvfy-font-sans);
  position: relative;
}
dvfy-date-picker .dvfy-date-picker__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}
dvfy-date-picker .dvfy-date-picker__required {
  color: var(--dvfy-danger-text);
  margin-left: var(--dvfy-space-0-5);
}
dvfy-date-picker .dvfy-date-picker__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
dvfy-date-picker .dvfy-date-picker__input {
  width: 100%;
  font-family: inherit;
  color: var(--dvfy-text-primary);
  background: var(--dvfy-input-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-input-border);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  padding-right: 2.75rem;
  font-size: var(--dvfy-text-sm);
  border-radius: var(--dvfy-radius-lg);
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
  caret-color: transparent;
  user-select: none;
}
dvfy-date-picker .dvfy-date-picker__input::placeholder { color: var(--dvfy-input-placeholder); }
dvfy-date-picker .dvfy-date-picker__input:hover:not(:disabled) { border-color: var(--dvfy-input-border-hover); }
dvfy-date-picker[open] .dvfy-date-picker__input,
dvfy-date-picker .dvfy-date-picker__input:focus {
  border-color: var(--dvfy-input-border-focus);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}
dvfy-date-picker[error] .dvfy-date-picker__input { border-color: var(--dvfy-input-error); }
dvfy-date-picker[error] .dvfy-date-picker__input:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-input-error) 25%, transparent);
}
dvfy-date-picker[disabled] .dvfy-date-picker__input {
  background: var(--dvfy-disabled-bg);
  color: var(--dvfy-disabled-text);
  cursor: not-allowed;
}
dvfy-date-picker[disabled] .dvfy-date-picker__label { color: var(--dvfy-disabled-text); }
dvfy-date-picker .dvfy-date-picker__toggle {
  position: absolute;
  right: var(--dvfy-space-2);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: var(--dvfy-space-1);
  color: var(--dvfy-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: var(--dvfy-radius-sm);
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__toggle:hover { color: var(--dvfy-text-primary); }
dvfy-date-picker[disabled] .dvfy-date-picker__toggle { pointer-events: none; }

/* ── Popup ── */
dvfy-date-picker .dvfy-date-picker__popup {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--dvfy-space-1);
  background: var(--dvfy-surface-overlay);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-xl);
  box-shadow: var(--dvfy-shadow-lg);
  padding: var(--dvfy-space-3);
  z-index: var(--dvfy-z-dropdown);
  width: 280px;
  user-select: none;
}
dvfy-date-picker[open] .dvfy-date-picker__popup { display: block; }

/* ── Header ── */
dvfy-date-picker .dvfy-date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dvfy-space-1);
  margin-bottom: var(--dvfy-space-2);
}
dvfy-date-picker .dvfy-date-picker__nav {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--dvfy-space-1);
  color: var(--dvfy-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--dvfy-radius-md);
  font-size: var(--dvfy-text-base);
  line-height: 1;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out),
              color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__nav:hover {
  background: var(--dvfy-surface-hover);
  color: var(--dvfy-text-primary);
}
dvfy-date-picker .dvfy-date-picker__nav:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-date-picker .dvfy-date-picker__heading {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
  flex: 1;
  text-align: center;
  padding: var(--dvfy-space-1) var(--dvfy-space-2);
  border-radius: var(--dvfy-radius-md);
  font-family: inherit;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__heading:hover { background: var(--dvfy-surface-hover); }
dvfy-date-picker .dvfy-date-picker__heading:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* ── Weekday labels ── */
dvfy-date-picker .dvfy-date-picker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: var(--dvfy-space-1);
}
dvfy-date-picker .dvfy-date-picker__weekday {
  text-align: center;
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-muted);
  padding: var(--dvfy-space-0-5);
}

/* ── Calendar grid ── */
dvfy-date-picker .dvfy-date-picker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
dvfy-date-picker .dvfy-date-picker__day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--dvfy-text-xs);
  border-radius: var(--dvfy-radius-md);
  cursor: pointer;
  background: none;
  border: none;
  color: var(--dvfy-text-primary);
  font-family: inherit;
  padding: 0;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out),
              color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__day:hover:not(:disabled) { background: var(--dvfy-surface-hover); }
dvfy-date-picker .dvfy-date-picker__day:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: 1px;
}
dvfy-date-picker .dvfy-date-picker__day--outside { opacity: 0.35; }
dvfy-date-picker .dvfy-date-picker__day--today { font-weight: var(--dvfy-weight-bold); }
dvfy-date-picker .dvfy-date-picker__day--today:not(.dvfy-date-picker__day--selected):not(.dvfy-date-picker__day--range-start):not(.dvfy-date-picker__day--range-end) {
  border: 1px solid var(--dvfy-input-border-focus);
}
dvfy-date-picker .dvfy-date-picker__day--selected {
  background: var(--dvfy-date-picker-selected-bg, var(--dvfy-primary-bg));
  color: var(--dvfy-date-picker-selected-text, #fff);
}
dvfy-date-picker .dvfy-date-picker__day--selected:hover {
  background: var(--dvfy-date-picker-selected-bg, var(--dvfy-primary-bg));
  opacity: 0.88;
}
dvfy-date-picker .dvfy-date-picker__day--in-range {
  background: var(--dvfy-date-picker-range-bg, color-mix(in srgb, var(--dvfy-primary-bg) 15%, transparent));
  border-radius: 0;
}
dvfy-date-picker .dvfy-date-picker__day--range-start {
  background: var(--dvfy-date-picker-selected-bg, var(--dvfy-primary-bg));
  color: var(--dvfy-date-picker-selected-text, #fff);
  border-radius: var(--dvfy-radius-md) 0 0 var(--dvfy-radius-md);
}
dvfy-date-picker .dvfy-date-picker__day--range-end {
  background: var(--dvfy-date-picker-selected-bg, var(--dvfy-primary-bg));
  color: var(--dvfy-date-picker-selected-text, #fff);
  border-radius: 0 var(--dvfy-radius-md) var(--dvfy-radius-md) 0;
}
dvfy-date-picker .dvfy-date-picker__day--range-start.dvfy-date-picker__day--range-end {
  border-radius: var(--dvfy-radius-md);
}
dvfy-date-picker .dvfy-date-picker__day:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Time section ── */
dvfy-date-picker .dvfy-date-picker__time-section {
  margin-top: var(--dvfy-space-2);
  padding-top: var(--dvfy-space-2);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-default);
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
}
dvfy-date-picker .dvfy-date-picker__time-label {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
}
dvfy-date-picker .dvfy-date-picker__time-input {
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-input-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-input-border);
  border-radius: var(--dvfy-radius-md);
  padding: var(--dvfy-space-1) var(--dvfy-space-2);
  flex: 1;
  outline: none;
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__time-input:focus { border-color: var(--dvfy-input-border-focus); }

/* ── Footer ── */
dvfy-date-picker .dvfy-date-picker__footer {
  margin-top: var(--dvfy-space-2);
  padding-top: var(--dvfy-space-2);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-default);
  display: flex;
  justify-content: space-between;
  gap: var(--dvfy-space-2);
}
dvfy-date-picker .dvfy-date-picker__footer-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  padding: var(--dvfy-space-1) var(--dvfy-space-2);
  border-radius: var(--dvfy-radius-md);
  font-family: inherit;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out),
              color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__footer-btn:hover {
  background: var(--dvfy-surface-hover);
  color: var(--dvfy-text-primary);
}
dvfy-date-picker .dvfy-date-picker__footer-btn:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* ── Month grid view ── */
dvfy-date-picker .dvfy-date-picker__month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--dvfy-space-1);
}
dvfy-date-picker .dvfy-date-picker__month-item {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-primary);
  padding: var(--dvfy-space-2) var(--dvfy-space-1);
  border-radius: var(--dvfy-radius-md);
  font-family: inherit;
  text-align: center;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__month-item:hover { background: var(--dvfy-surface-hover); }
dvfy-date-picker .dvfy-date-picker__month-item--active {
  background: var(--dvfy-date-picker-selected-bg, var(--dvfy-primary-bg));
  color: var(--dvfy-date-picker-selected-text, #fff);
}
dvfy-date-picker .dvfy-date-picker__month-item:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: 1px;
}

/* ── Year grid view ── */
dvfy-date-picker .dvfy-date-picker__year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--dvfy-space-1);
  max-height: 200px;
  overflow-y: auto;
  scroll-behavior: smooth;
}
dvfy-date-picker .dvfy-date-picker__year-item {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-primary);
  padding: var(--dvfy-space-1-5) var(--dvfy-space-1);
  border-radius: var(--dvfy-radius-md);
  font-family: inherit;
  text-align: center;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-date-picker .dvfy-date-picker__year-item:hover { background: var(--dvfy-surface-hover); }
dvfy-date-picker .dvfy-date-picker__year-item--active {
  background: var(--dvfy-date-picker-selected-bg, var(--dvfy-primary-bg));
  color: var(--dvfy-date-picker-selected-text, #fff);
}
dvfy-date-picker .dvfy-date-picker__year-item:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: 1px;
}

/* ── Help / error ── */
dvfy-date-picker .dvfy-date-picker__help { font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); }
dvfy-date-picker .dvfy-date-picker__error-msg { font-size: var(--dvfy-text-xs); color: var(--dvfy-input-error); }

${labelPositionCSS('dvfy-date-picker', { layout: 'field', label: '.dvfy-date-picker__label', content: ['.dvfy-date-picker__wrapper'], messages: ['.dvfy-date-picker__help', '.dvfy-date-picker__error-msg'] })}
`;

// Build calendar SVG icon via DOM API (avoids innerHTML with external content)
function buildCalendarIcon() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const rect = document.createElementNS(NS, 'rect');
  rect.setAttribute('x', '3'); rect.setAttribute('y', '4');
  rect.setAttribute('width', '18'); rect.setAttribute('height', '18');
  rect.setAttribute('rx', '2'); rect.setAttribute('ry', '2');
  svg.appendChild(rect);

  const line1 = document.createElementNS(NS, 'line');
  line1.setAttribute('x1', '16'); line1.setAttribute('y1', '2');
  line1.setAttribute('x2', '16'); line1.setAttribute('y2', '6');
  svg.appendChild(line1);

  const line2 = document.createElementNS(NS, 'line');
  line2.setAttribute('x1', '8'); line2.setAttribute('y1', '2');
  line2.setAttribute('x2', '8'); line2.setAttribute('y2', '6');
  svg.appendChild(line2);

  const line3 = document.createElementNS(NS, 'line');
  line3.setAttribute('x1', '3'); line3.setAttribute('y1', '10');
  line3.setAttribute('x2', '21'); line3.setAttribute('y2', '10');
  svg.appendChild(line3);

  return svg;
}

/**
 * <dvfy-date-picker> — Calendar date/time picker with dropdown
 *
 * Renders a text input that opens a floating calendar panel. Supports single
 * date, date range, time, and datetime modes. Fully keyboard accessible with
 * locale-aware display formatting.
 *
 * @element dvfy-date-picker
 *
 * @attr {string} label - Label text shown above the input
 * @attr {string} value - Selected date in ISO format (YYYY-MM-DD for date, HH:MM for time, YYYY-MM-DDTHH:MM for datetime)
 * @attr {string} value-end - Range end date (YYYY-MM-DD), requires range attribute
 * @attr {string} min - Minimum selectable date (YYYY-MM-DD)
 * @attr {string} max - Maximum selectable date (YYYY-MM-DD)
 * @attr {string} type - Picker mode: date | time | datetime (default: "date")
 * @attr {boolean} range - Enable date range selection (two-click: start then end)
 * @attr {boolean} required - Mark field as required
 * @attr {boolean} disabled - Disable the component
 * @attr {string} placeholder - Placeholder text for the input
 * @attr {string} name - Form field name
 * @attr {string} error - Error message (enables error styling)
 * @attr {string} help - Help text shown below input
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "top")
 *
 * @event {CustomEvent} change - Fires on selection; detail: { value, valueEnd? }
 *
 * @cssProperty {color} --dvfy-date-picker-selected-bg - Selected day background (default: --dvfy-primary-bg)
 * @cssProperty {color} --dvfy-date-picker-selected-text - Selected day text color (default: #fff)
 * @cssProperty {color} --dvfy-date-picker-range-bg - In-range days background
 *
 * @example
 * <dvfy-date-picker label="Appointment" value="2026-03-22"></dvfy-date-picker>
 *
 * @example
 * <dvfy-date-picker label="Stay" range value="2026-03-10" value-end="2026-03-20"></dvfy-date-picker>
 *
 * @example
 * <dvfy-date-picker label="Meeting" type="datetime" value="2026-03-22T14:30"></dvfy-date-picker>
 */
class DvfyDatePicker extends HTMLElement {
  // Viewed month/year in the calendar
  #year = new Date().getFullYear();
  #month = new Date().getMonth();

  // Selected dates
  #startDate = null;
  #endDate = null;

  // UI state
  #isOpen = false;
  #view = 'days'; // 'days' | 'months' | 'years'
  #rangeAwaitingEnd = false;
  #hoverDate = null;

  #id = null;
  #outsideClickHandler = null;

  connectedCallback() {
    injectStyles('dvfy-date-picker', STYLES);
    this.#id = this.getAttribute('name') || `dvfy-dp-${Math.random().toString(36).slice(2, 8)}`;
    this.#parseAttrs();
    this.#build();
  }

  disconnectedCallback() {
    if (this.#outsideClickHandler) {
      document.removeEventListener('click', this.#outsideClickHandler);
    }
  }

  static get observedAttributes() {
    return [
      'label', 'value', 'value-end', 'min', 'max', 'type', 'range',
      'required', 'disabled', 'placeholder', 'name', 'error', 'help', 'label-position',
    ];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal || !this.isConnected) return;
    if (name === 'value' || name === 'value-end') {
      this.#parseAttrs();
      this.#updateInputDisplay();
      this.#refreshGrid();
    } else if (name === 'error' || name === 'help') {
      this.#patchMessages();
    } else if (name === 'disabled') {
      const input = this.querySelector('.dvfy-date-picker__input');
      if (input) input.disabled = this.hasAttribute('disabled');
    } else {
      this.#parseAttrs();
      this.#build();
    }
  }

  // ── Parsing ─────────────────────────────────────────────────────────────────

  #parseAttrs() {
    const type = this.getAttribute('type') || 'date';
    const val = this.getAttribute('value');
    const valEnd = this.getAttribute('value-end');

    if (val) {
      const d = this.#parseISO(val, type);
      if (d) {
        this.#startDate = d;
        if (type !== 'time') {
          this.#year = d.getFullYear();
          this.#month = d.getMonth();
        }
      }
    } else {
      this.#startDate = null;
    }

    if (valEnd && this.hasAttribute('range')) {
      this.#endDate = this.#parseISO(valEnd, type);
    } else {
      this.#endDate = null;
    }
  }

  #parseISO(str, type = 'date') {
    if (!str) return null;
    if (type === 'time') {
      const [h, m] = str.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    const [datePart, timePart] = str.split('T');
    const [y, mo, dy] = (datePart || '').split('-').map(Number);
    if (isNaN(y) || isNaN(mo) || isNaN(dy)) return null;
    if (type === 'datetime' && timePart) {
      const [h, m] = timePart.split(':').map(Number);
      return new Date(y, mo - 1, dy, h || 0, m || 0, 0, 0);
    }
    return new Date(y, mo - 1, dy, 0, 0, 0, 0);
  }

  #toISO(date, type = 'date') {
    if (!date) return '';
    const pad = n => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const mo = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    if (type === 'time') return `${h}:${min}`;
    if (type === 'datetime') return `${y}-${mo}-${d}T${h}:${min}`;
    return `${y}-${mo}-${d}`;
  }

  #formatDisplay(date, type = 'date') {
    if (!date) return '';
    try {
      if (type === 'time') {
        return new Intl.DateTimeFormat(navigator.language, { hour: '2-digit', minute: '2-digit' }).format(date);
      }
      if (type === 'datetime') {
        return new Intl.DateTimeFormat(navigator.language, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
      }
      return new Intl.DateTimeFormat(navigator.language, { dateStyle: 'medium' }).format(date);
    } catch {
      return this.#toISO(date, type);
    }
  }

  #getDisplayValue() {
    const type = this.getAttribute('type') || 'date';
    if (!this.#startDate) return '';
    const start = this.#formatDisplay(this.#startDate, type);
    if (this.hasAttribute('range') && this.#endDate) {
      return `${start} \u2013 ${this.#formatDisplay(this.#endDate, type)}`;
    }
    return start;
  }

  #isSameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
  }

  #dateNum(d) {
    return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() : null;
  }

  #isDisabled(date) {
    const minAttr = this.getAttribute('min');
    const maxAttr = this.getAttribute('max');
    if (minAttr) {
      const min = this.#parseISO(minAttr);
      if (min && this.#dateNum(date) < this.#dateNum(min)) return true;
    }
    if (maxAttr) {
      const max = this.#parseISO(maxAttr);
      if (max && this.#dateNum(date) > this.#dateNum(max)) return true;
    }
    return false;
  }

  #getMonthYearLabel() {
    try {
      return new Intl.DateTimeFormat(navigator.language, { month: 'long', year: 'numeric' })
        .format(new Date(this.#year, this.#month, 1));
    } catch {
      return `${this.#year}-${String(this.#month + 1).padStart(2, '0')}`;
    }
  }

  // ── Build ────────────────────────────────────────────────────────────────────

  #build() {
    const wasOpen = this.#isOpen;
    this.textContent = '';
    this.removeAttribute('open');
    this.#isOpen = false;

    const type = this.getAttribute('type') || 'date';

    // Label
    const labelText = this.getAttribute('label');
    if (labelText) {
      const lbl = document.createElement('label');
      lbl.className = 'dvfy-date-picker__label';
      lbl.setAttribute('for', this.#id);
      lbl.textContent = labelText;
      if (this.hasAttribute('required')) {
        const star = document.createElement('span');
        star.className = 'dvfy-date-picker__required';
        star.textContent = '*';
        lbl.appendChild(star);
      }
      this.appendChild(lbl);
    }

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'dvfy-date-picker__wrapper';

    // Display input
    const input = document.createElement('input');
    input.className = 'dvfy-date-picker__input';
    input.id = this.#id;
    input.type = 'text';
    input.readOnly = true;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-haspopup', 'dialog');
    input.setAttribute('aria-expanded', 'false');
    input.placeholder = this.getAttribute('placeholder')
      || (type === 'time' ? 'Select time' : type === 'datetime' ? 'Select date & time' : 'Select date');
    input.name = this.getAttribute('name') || '';
    input.value = this.#getDisplayValue();
    if (this.hasAttribute('disabled')) input.disabled = true;
    if (this.hasAttribute('required')) input.required = true;

    input.addEventListener('click', () => { if (!this.hasAttribute('disabled')) this.#toggle(); });
    input.addEventListener('keydown', e => this.#handleInputKeydown(e));
    wrapper.appendChild(input);

    // Calendar icon toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'dvfy-date-picker__toggle';
    toggleBtn.setAttribute('aria-label', 'Open date picker');
    toggleBtn.setAttribute('tabindex', '-1');
    toggleBtn.appendChild(buildCalendarIcon());
    toggleBtn.addEventListener('click', () => { if (!this.hasAttribute('disabled')) this.#toggle(); });
    wrapper.appendChild(toggleBtn);

    // Popup
    wrapper.appendChild(this.#buildPopup());
    this.appendChild(wrapper);
    this.#appendMessages();

    // Outside-click handler
    if (this.#outsideClickHandler) {
      document.removeEventListener('click', this.#outsideClickHandler);
    }
    this.#outsideClickHandler = (e) => {
      if (this.#isOpen && !this.contains(e.target)) this.#closePopup();
    };
    document.addEventListener('click', this.#outsideClickHandler);

    if (wasOpen) this.#openPopup();
  }

  // ── Popup ────────────────────────────────────────────────────────────────────

  #buildPopup() {
    const popup = document.createElement('div');
    popup.className = 'dvfy-date-picker__popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Date picker');
    popup.setAttribute('aria-modal', 'false');

    const type = this.getAttribute('type') || 'date';

    if (type === 'time') {
      popup.appendChild(this.#buildTimeSection(true));
    } else {
      popup.appendChild(this.#buildHeader());
      popup.appendChild(this.#buildWeekdays());
      popup.appendChild(this.#buildDayGrid());
      if (type === 'datetime') popup.appendChild(this.#buildTimeSection(false));
      popup.appendChild(this.#buildFooter());
    }

    return popup;
  }

  #buildHeader() {
    const header = document.createElement('div');
    header.className = 'dvfy-date-picker__header';

    const makeNav = (label, text, handler) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dvfy-date-picker__nav';
      btn.setAttribute('aria-label', label);
      btn.textContent = text;
      btn.addEventListener('click', (e) => { e.stopPropagation(); handler(); });
      return btn;
    };

    const heading = document.createElement('button');
    heading.type = 'button';
    heading.className = 'dvfy-date-picker__heading';
    heading.setAttribute('aria-live', 'polite');
    heading.textContent = this.#getMonthYearLabel();
    heading.addEventListener('click', (e) => { e.stopPropagation(); this.#showMonthView(); });

    header.appendChild(makeNav('Previous year', '\u00AB', () => this.#prevYear()));
    header.appendChild(makeNav('Previous month', '\u2039', () => this.#prevMonth()));
    header.appendChild(heading);
    header.appendChild(makeNav('Next month', '\u203A', () => this.#nextMonth()));
    header.appendChild(makeNav('Next year', '\u00BB', () => this.#nextYear()));

    return header;
  }

  #buildWeekdays() {
    const row = document.createElement('div');
    row.className = 'dvfy-date-picker__weekdays';

    // Sunday-anchored; 2024-01-07 is a Sunday
    const base = new Date(2024, 0, 7);
    try {
      const fmt = new Intl.DateTimeFormat(navigator.language, { weekday: 'short' });
      for (let i = 0; i < 7; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const cell = document.createElement('div');
        cell.className = 'dvfy-date-picker__weekday';
        cell.setAttribute('aria-hidden', 'true');
        cell.textContent = fmt.format(d).slice(0, 2);
        row.appendChild(cell);
      }
    } catch {
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach((s) => {
        const cell = document.createElement('div');
        cell.className = 'dvfy-date-picker__weekday';
        cell.setAttribute('aria-hidden', 'true');
        cell.textContent = s;
        row.appendChild(cell);
      });
    }
    return row;
  }

  #buildDayGrid() {
    const grid = document.createElement('div');
    grid.className = 'dvfy-date-picker__grid';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', this.#getMonthYearLabel());

    const type = this.getAttribute('type') || 'date';
    const isRange = this.hasAttribute('range');
    const today = new Date();
    const firstDow = new Date(this.#year, this.#month, 1).getDay();
    const totalDays = new Date(this.#year, this.#month + 1, 0).getDate();

    // Effective range boundaries (includes hover preview during range selection)
    let rangeS = this.#dateNum(this.#startDate);
    let rangeE = this.#dateNum(this.#endDate);
    if (isRange && this.#rangeAwaitingEnd && this.#hoverDate) {
      const hNum = this.#dateNum(this.#hoverDate);
      if (hNum < rangeS) { rangeE = rangeS; rangeS = hNum; }
      else { rangeE = hNum; }
    }

    for (let i = 0; i < 42; i++) {
      const dayNum = i - firstDow + 1;
      const date = new Date(this.#year, this.#month, dayNum);
      const isOutside = dayNum < 1 || dayNum > totalDays;
      const isToday = this.#isSameDay(date, today);
      const isDisabled = this.#isDisabled(date);
      const dNum = this.#dateNum(date);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dvfy-date-picker__day';
      btn.textContent = date.getDate();
      btn.setAttribute('aria-label',
        date.toLocaleDateString(navigator.language, { year: 'numeric', month: 'long', day: 'numeric' }));
      btn.setAttribute('data-date', this.#toISO(date));

      if (isOutside) btn.classList.add('dvfy-date-picker__day--outside');
      if (isToday) btn.classList.add('dvfy-date-picker__day--today');
      if (isDisabled) btn.disabled = true;

      if (isRange && rangeS && rangeE) {
        if (dNum === rangeS) btn.classList.add('dvfy-date-picker__day--range-start');
        if (dNum === rangeE) btn.classList.add('dvfy-date-picker__day--range-end');
        if (dNum > rangeS && dNum < rangeE) btn.classList.add('dvfy-date-picker__day--in-range');
      } else if (!isRange && this.#isSameDay(date, this.#startDate)) {
        btn.classList.add('dvfy-date-picker__day--selected');
      }

      if (!isDisabled) {
        btn.addEventListener('click', (e) => { e.stopPropagation(); this.#handleDayClick(date, type); });
        if (isRange) {
          btn.addEventListener('mouseenter', () => {
            if (this.#rangeAwaitingEnd) { this.#hoverDate = date; this.#refreshGrid(); }
          });
        }
      }

      grid.appendChild(btn);
    }

    grid.addEventListener('keydown', e => this.#handleGridKeydown(e));
    return grid;
  }

  #buildTimeSection(standalone) {
    const section = document.createElement('div');
    section.className = 'dvfy-date-picker__time-section';
    if (standalone) {
      section.style.cssText = 'border-top:none;margin-top:0;padding-top:0;';
    }

    const lbl = document.createElement('span');
    lbl.className = 'dvfy-date-picker__time-label';
    lbl.textContent = 'Time';
    section.appendChild(lbl);

    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'dvfy-date-picker__time-input';
    const type = this.getAttribute('type') || 'date';
    if (this.#startDate) {
      timeInput.value = `${String(this.#startDate.getHours()).padStart(2, '0')}:${String(this.#startDate.getMinutes()).padStart(2, '0')}`;
    }
    timeInput.addEventListener('change', (e) => {
      if (!this.#startDate) this.#startDate = new Date();
      const [h, m] = e.target.value.split(':').map(Number);
      this.#startDate.setHours(h, m, 0, 0);
      this.#updateInputDisplay();
      this.setAttribute('value', this.#toISO(this.#startDate, type));
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true, detail: { value: this.#toISO(this.#startDate, type) },
      }));
      if (standalone) this.#closePopup();
    });
    section.appendChild(timeInput);
    return section;
  }

  #buildFooter() {
    const footer = document.createElement('div');
    footer.className = 'dvfy-date-picker__footer';

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'dvfy-date-picker__footer-btn';
    todayBtn.textContent = 'Today';
    todayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const today = new Date();
      this.#year = today.getFullYear();
      this.#month = today.getMonth();
      if (!this.hasAttribute('range')) {
        this.#handleDayClick(today, this.getAttribute('type') || 'date');
      } else {
        this.#refreshAll();
      }
    });

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'dvfy-date-picker__footer-btn';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.#startDate = null;
      this.#endDate = null;
      this.#rangeAwaitingEnd = false;
      this.#hoverDate = null;
      this.removeAttribute('value');
      this.removeAttribute('value-end');
      this.#updateInputDisplay();
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true, detail: { value: '', valueEnd: '' },
      }));
      this.#closePopup();
    });

    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);
    return footer;
  }

  // ── Alternate views ──────────────────────────────────────────────────────────

  #showMonthView() {
    this.#view = 'months';
    const popup = this.querySelector('.dvfy-date-picker__popup');
    if (!popup) return;
    popup.textContent = '';

    const header = document.createElement('div');
    header.className = 'dvfy-date-picker__header';

    const makeNav = (label, text, handler) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dvfy-date-picker__nav';
      btn.setAttribute('aria-label', label);
      btn.textContent = text;
      btn.addEventListener('click', (e) => { e.stopPropagation(); handler(); });
      return btn;
    };

    const yearBtn = document.createElement('button');
    yearBtn.type = 'button';
    yearBtn.className = 'dvfy-date-picker__heading';
    yearBtn.textContent = String(this.#year);
    yearBtn.addEventListener('click', (e) => { e.stopPropagation(); this.#showYearView(); });

    header.appendChild(makeNav('Previous year', '\u2039', () => { this.#year--; this.#showMonthView(); }));
    header.appendChild(yearBtn);
    header.appendChild(makeNav('Next year', '\u203A', () => { this.#year++; this.#showMonthView(); }));
    popup.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'dvfy-date-picker__month-grid';

    let monthNames;
    try {
      const fmt = new Intl.DateTimeFormat(navigator.language, { month: 'short' });
      monthNames = Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2024, m, 1)));
    } catch {
      monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    }

    monthNames.forEach((name, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dvfy-date-picker__month-item';
      if (idx === this.#month) btn.classList.add('dvfy-date-picker__month-item--active');
      btn.textContent = name;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.#month = idx;
        this.#view = 'days';
        this.#refreshAll();
      });
      grid.appendChild(btn);
    });

    popup.appendChild(grid);
  }

  #showYearView() {
    this.#view = 'years';
    const popup = this.querySelector('.dvfy-date-picker__popup');
    if (!popup) return;
    popup.textContent = '';

    const nowYear = new Date().getFullYear();
    const yStart = nowYear - 10;
    const yEnd = nowYear + 10;

    const header = document.createElement('div');
    header.className = 'dvfy-date-picker__header';
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'dvfy-date-picker__heading';
    backBtn.textContent = `${yStart} \u2013 ${yEnd}`;
    backBtn.addEventListener('click', (e) => { e.stopPropagation(); this.#showMonthView(); });
    header.appendChild(backBtn);
    popup.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'dvfy-date-picker__year-grid';

    for (let y = yStart; y <= yEnd; y++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dvfy-date-picker__year-item';
      if (y === this.#year) btn.classList.add('dvfy-date-picker__year-item--active');
      btn.textContent = String(y);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.#year = y;
        this.#showMonthView();
      });
      grid.appendChild(btn);
    }

    popup.appendChild(grid);

    setTimeout(() => {
      grid.querySelector('.dvfy-date-picker__year-item--active')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 0);
  }

  // ── Refresh helpers ──────────────────────────────────────────────────────────

  #refreshAll() {
    const popup = this.querySelector('.dvfy-date-picker__popup');
    if (!popup) return;
    popup.textContent = '';
    const type = this.getAttribute('type') || 'date';
    popup.appendChild(this.#buildHeader());
    popup.appendChild(this.#buildWeekdays());
    popup.appendChild(this.#buildDayGrid());
    if (type === 'datetime') popup.appendChild(this.#buildTimeSection(false));
    popup.appendChild(this.#buildFooter());
    this.#view = 'days';
  }

  #refreshGrid() {
    if (this.#view !== 'days') return;
    const oldGrid = this.querySelector('.dvfy-date-picker__grid');
    if (!oldGrid) return;
    oldGrid.replaceWith(this.#buildDayGrid());
    const heading = this.querySelector('.dvfy-date-picker__heading');
    if (heading) heading.textContent = this.#getMonthYearLabel();
  }

  #updateInputDisplay() {
    const input = this.querySelector('.dvfy-date-picker__input');
    if (input) input.value = this.#getDisplayValue();
  }

  // ── Day interaction ──────────────────────────────────────────────────────────

  #handleDayClick(date, type) {
    const isRange = this.hasAttribute('range');

    if (isRange) {
      if (!this.#rangeAwaitingEnd) {
        this.#startDate = new Date(date);
        this.#endDate = null;
        this.#hoverDate = null;
        this.#rangeAwaitingEnd = true;
        this.setAttribute('value', this.#toISO(date, type));
        this.removeAttribute('value-end');
        this.#updateInputDisplay();
        this.#refreshGrid();
      } else {
        this.#rangeAwaitingEnd = false;
        this.#hoverDate = null;
        let start = this.#startDate;
        let end = new Date(date);
        if (this.#dateNum(end) < this.#dateNum(start)) {
          [start, end] = [end, start];
          this.#startDate = start;
        }
        this.#endDate = end;
        this.setAttribute('value', this.#toISO(start, type));
        this.setAttribute('value-end', this.#toISO(end, type));
        this.#updateInputDisplay();
        this.#refreshGrid();
        this.dispatchEvent(new CustomEvent('change', {
          bubbles: true,
          detail: { value: this.#toISO(start, type), valueEnd: this.#toISO(end, type) },
        }));
        this.#closePopup();
      }
    } else {
      const newDate = new Date(date);
      // Preserve existing time component when switching days in datetime mode
      if (type === 'datetime' && this.#startDate) {
        newDate.setHours(this.#startDate.getHours(), this.#startDate.getMinutes(), 0, 0);
      }
      this.#startDate = newDate;
      this.setAttribute('value', this.#toISO(newDate, type));
      this.#updateInputDisplay();
      this.#refreshGrid();
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true, detail: { value: this.#toISO(newDate, type) },
      }));
      if (type !== 'datetime') this.#closePopup();
    }
  }

  // ── Month/year navigation ────────────────────────────────────────────────────

  #prevMonth() {
    this.#month--;
    if (this.#month < 0) { this.#month = 11; this.#year--; }
    this.#refreshAll();
  }
  #nextMonth() {
    this.#month++;
    if (this.#month > 11) { this.#month = 0; this.#year++; }
    this.#refreshAll();
  }
  #prevYear() { this.#year--; this.#refreshAll(); }
  #nextYear() { this.#year++; this.#refreshAll(); }

  // ── Popup open/close ─────────────────────────────────────────────────────────

  #openPopup() {
    if (this.hasAttribute('disabled')) return;
    this.#isOpen = true;
    this.setAttribute('open', '');
    const input = this.querySelector('.dvfy-date-picker__input');
    if (input) input.setAttribute('aria-expanded', 'true');

    // Flip popup above if insufficient space below
    const popup = this.querySelector('.dvfy-date-picker__popup');
    if (popup) {
      const rect = this.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 340 && rect.top > 340) {
        popup.style.top = 'auto';
        popup.style.bottom = '100%';
        popup.style.marginTop = '0';
        popup.style.marginBottom = 'var(--dvfy-space-1)';
      } else {
        popup.style.top = '';
        popup.style.bottom = '';
        popup.style.marginTop = '';
        popup.style.marginBottom = '';
      }
    }

    setTimeout(() => {
      const sel = this.querySelector(
        '.dvfy-date-picker__day--selected, .dvfy-date-picker__day--range-start'
      );
      const todayCell = this.querySelector('.dvfy-date-picker__day--today');
      (sel || todayCell)?.focus();
    }, 30);
  }

  #closePopup() {
    this.#isOpen = false;
    this.removeAttribute('open');
    this.#view = 'days';
    const input = this.querySelector('.dvfy-date-picker__input');
    if (input) {
      input.setAttribute('aria-expanded', 'false');
      input.focus();
    }
  }

  #toggle() {
    if (this.#isOpen) this.#closePopup();
    else this.#openPopup();
  }

  // ── Keyboard handling ────────────────────────────────────────────────────────

  #handleInputKeydown(e) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.#toggle();
        break;
      case 'Escape':
        if (this.#isOpen) { e.preventDefault(); this.#closePopup(); }
        break;
      case 'ArrowDown':
        if (!this.#isOpen) { e.preventDefault(); this.#openPopup(); }
        break;
    }
  }

  #handleGridKeydown(e) {
    const buttons = [...this.querySelectorAll('.dvfy-date-picker__day:not(:disabled)')];
    const idx = buttons.indexOf(document.activeElement);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (idx > 0) { buttons[idx - 1].focus(); }
        else {
          this.#prevMonth();
          setTimeout(() => {
            const bs = [...this.querySelectorAll('.dvfy-date-picker__day:not(:disabled)')];
            bs.at(-1)?.focus();
          }, 0);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (idx < buttons.length - 1) { buttons[idx + 1].focus(); }
        else {
          this.#nextMonth();
          setTimeout(() => {
            this.querySelectorAll('.dvfy-date-picker__day:not(:disabled)')[0]?.focus();
          }, 0);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (idx >= 7) { buttons[idx - 7]?.focus(); }
        else {
          this.#prevMonth();
          setTimeout(() => {
            const bs = [...this.querySelectorAll('.dvfy-date-picker__day:not(:disabled)')];
            bs.at(-7 + idx)?.focus();
          }, 0);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (idx + 7 < buttons.length) { buttons[idx + 7]?.focus(); }
        else {
          this.#nextMonth();
          setTimeout(() => {
            const bs = [...this.querySelectorAll('.dvfy-date-picker__day:not(:disabled)')];
            bs[idx % 7]?.focus();
          }, 0);
        }
        break;
      case 'PageUp':
        e.preventDefault();
        if (e.shiftKey) this.#prevYear(); else this.#prevMonth();
        break;
      case 'PageDown':
        e.preventDefault();
        if (e.shiftKey) this.#nextYear(); else this.#nextMonth();
        break;
      case 'Home':
        e.preventDefault();
        if (idx >= 0) buttons[idx - (idx % 7)]?.focus();
        break;
      case 'End':
        e.preventDefault();
        if (idx >= 0) buttons[Math.min(idx + (6 - idx % 7), buttons.length - 1)]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        document.activeElement?.click();
        break;
      case 'Escape':
        e.preventDefault();
        this.#closePopup();
        break;
    }
  }

  // ── Messages ─────────────────────────────────────────────────────────────────

  #appendMessages() {
    const error = this.getAttribute('error');
    const help = this.getAttribute('help');
    if (error) {
      const el = document.createElement('span');
      el.className = 'dvfy-date-picker__error-msg';
      el.setAttribute('role', 'alert');
      el.textContent = error;
      this.appendChild(el);
    } else if (help) {
      const el = document.createElement('span');
      el.className = 'dvfy-date-picker__help';
      el.textContent = help;
      this.appendChild(el);
    }
  }

  #patchMessages() {
    this.querySelector('.dvfy-date-picker__error-msg')?.remove();
    this.querySelector('.dvfy-date-picker__help')?.remove();
    this.#appendMessages();
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  get value() {
    return this.#toISO(this.#startDate, this.getAttribute('type') || 'date');
  }
  set value(v) { this.setAttribute('value', v); }

  get valueEnd() {
    return this.#toISO(this.#endDate, this.getAttribute('type') || 'date');
  }
  set valueEnd(v) { this.setAttribute('value-end', v); }
}

customElements.define('dvfy-date-picker', DvfyDatePicker);
