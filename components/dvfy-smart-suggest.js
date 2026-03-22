/**
 * <dvfy-smart-suggest> — Adaptive contextual suggestion strip
 *
 * Displays a horizontal strip of next-action chips tailored to the current
 * workflow context. Tracks how often each suggestion is clicked (per context)
 * and reorders them by frequency — an AI-inspired adaptive UX pattern that
 * learns from user behaviour without any server round-trips.
 *
 * Usage:
 *   <dvfy-smart-suggest context="project-detail" label="Next steps">
 *     <dvfy-suggestion id="add-task"    icon="✚" label="Add task"></dvfy-suggestion>
 *     <dvfy-suggestion id="invite"      icon="👤" label="Invite member"></dvfy-suggestion>
 *     <dvfy-suggestion id="set-due"     icon="📅" label="Set due date"></dvfy-suggestion>
 *     <dvfy-suggestion id="attach-file" icon="📎" label="Attach file" disabled></dvfy-suggestion>
 *   </dvfy-smart-suggest>
 *
 * Attributes (dvfy-smart-suggest):
 *   context:     Scope key for localStorage tracking     (default: "default")
 *   storage-key: localStorage namespace prefix           (default: "dvfy-suggest")
 *   label:       Accessible + visible strip label         (default: "Suggestions")
 *   max:         Max suggestions to display (0 = all)    (default: 0)
 *
 * Attributes (dvfy-suggestion — child elements):
 *   id:       Unique identifier (required for frequency tracking)
 *   label:    Chip label text (required)
 *   icon:     Optional leading emoji/glyph
 *   disabled: boolean — chip is not clickable
 *
 * Events (dispatched from dvfy-smart-suggest):
 *   suggest — CustomEvent, detail: { id, label, context }
 *
 * @element dvfy-smart-suggest
 *
 * @attr {string} context - Scope key for per-context frequency tracking (default: "default")
 * @attr {string} storage-key - localStorage namespace prefix (default: "dvfy-suggest")
 * @attr {string} label - Visible/accessible strip label (default: "Suggestions")
 * @attr {number} max - Max chips to display, 0 = all (default: 0)
 *
 * @event {CustomEvent} suggest - Fires when a chip is clicked, detail: { id, label, context }
 *
 * @slot - dvfy-suggestion child elements
 *
 * @cssprop {color} --dvfy-surface-raised - Chip background
 * @cssprop {color} --dvfy-border-default - Chip border
 * @cssprop {color} --dvfy-primary-bg - Chip hover accent
 */

const STYLES = `
/* === dvfy-smart-suggest === */

dvfy-smart-suggest {
  display: block;
  font-family: var(--dvfy-font-sans);
}

.dvfy-ss__label {
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--dvfy-space-2);
}

.dvfy-ss__strip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dvfy-space-2);
}

.dvfy-ss__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-1-5, 0.375rem);
  padding: var(--dvfy-space-1) var(--dvfy-space-3);
  background: var(--dvfy-surface-raised);
  border: var(--dvfy-border-1) solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-full);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: background var(--dvfy-duration-fast, 100ms) ease,
              border-color var(--dvfy-duration-fast, 100ms) ease,
              transform var(--dvfy-duration-fast, 100ms) ease;
  white-space: nowrap;
}

.dvfy-ss__chip:hover:not([disabled]):not([aria-disabled="true"]) {
  background: color-mix(in srgb, var(--dvfy-primary-bg) 8%, var(--dvfy-surface-raised));
  border-color: color-mix(in srgb, var(--dvfy-primary-bg) 40%, var(--dvfy-border-default));
  color: var(--dvfy-text-primary);
}

.dvfy-ss__chip:active:not([disabled]):not([aria-disabled="true"]) {
  transform: scale(0.96);
}

.dvfy-ss__chip:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: 2px;
}

.dvfy-ss__chip[disabled],
.dvfy-ss__chip[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Top-ranked chip gets a subtle accent glow */
.dvfy-ss__chip[data-top] {
  border-color: color-mix(in srgb, var(--dvfy-primary-bg) 50%, var(--dvfy-border-default));
}

.dvfy-ss__chip-icon {
  font-size: 0.9em;
  flex-shrink: 0;
}

.dvfy-ss__chip-label {
  /* text already inherits */
}
`;

/**
 * @element dvfy-suggestion
 * @attr {string} label - Chip label (required)
 * @attr {string} icon - Leading icon (emoji/glyph)
 * @attr {boolean} disabled - Chip is not clickable
 */
class DvfySuggestion extends HTMLElement {}
customElements.define('dvfy-suggestion', DvfySuggestion);

/**
 * Adaptive suggestion strip with localStorage-backed frequency ranking.
 *
 * @element dvfy-smart-suggest
 */
class DvfySmartSuggest extends HTMLElement {
  static #styled = false;
  #labelEl = null;
  #strip = null;

  connectedCallback() {
    if (!DvfySmartSuggest.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfySmartSuggest.#styled = true;
    }
    this.#build();
  }

  static get observedAttributes() {
    return ['context', 'storage-key', 'label', 'max'];
  }

  attributeChangedCallback() {
    if (this.#strip) this.#render();
  }

  // ── Build DOM ────────────────────────────────────────────────────────────

  #build() {
    this.setAttribute('role', 'region');
    this.setAttribute('aria-label', this.#getLabel());

    this.#labelEl = document.createElement('div');
    this.#labelEl.className = 'dvfy-ss__label';
    this.#labelEl.setAttribute('aria-hidden', 'true');
    this.#labelEl.textContent = this.#getLabel();

    this.#strip = document.createElement('div');
    this.#strip.className = 'dvfy-ss__strip';

    this.appendChild(this.#labelEl);
    this.appendChild(this.#strip);

    this.#render();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  #getLabel()      { return this.getAttribute('label') ?? 'Suggestions'; }
  #getContext()    { return this.getAttribute('context') ?? 'default'; }
  #getMax()        { return parseInt(this.getAttribute('max') ?? '0', 10) || 0; }
  #getStorageKey() {
    const ns = this.getAttribute('storage-key') ?? 'dvfy-suggest';
    return `${ns}:${this.#getContext()}`;
  }

  // ── Frequency tracking ────────────────────────────────────────────────────

  #getFreq() {
    try {
      const raw = localStorage.getItem(this.#getStorageKey());
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const safe = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
          safe[k] = v;
        }
      }
      return safe;
    } catch { return {}; }
  }

  #bumpFreq(id) {
    if (!id) return;
    try {
      const freq = this.#getFreq();
      freq[id] = (freq[id] ?? 0) + 1;
      localStorage.setItem(this.#getStorageKey(), JSON.stringify(freq));
    } catch { /* localStorage unavailable */ }
  }

  // ── Suggestion extraction ─────────────────────────────────────────────────

  #getSuggestions() {
    return Array.from(this.querySelectorAll('dvfy-suggestion')).map(el => ({
      id:       el.id || el.getAttribute('label') || '',
      label:    el.getAttribute('label') ?? '',
      icon:     el.getAttribute('icon') ?? '',
      disabled: el.hasAttribute('disabled'),
    }));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  #render() {
    if (!this.#strip) return;

    // Update accessible label
    const label = this.#getLabel();
    this.setAttribute('aria-label', label);
    if (this.#labelEl) this.#labelEl.textContent = label;

    const freq = this.#getFreq();
    let suggestions = this.#getSuggestions();

    // Sort: disabled last → frequency desc → original order (stable)
    suggestions.sort((a, b) => {
      if (a.disabled !== b.disabled) return a.disabled ? 1 : -1;
      return (freq[b.id] ?? 0) - (freq[a.id] ?? 0);
    });

    // Respect max
    const max = this.#getMax();
    if (max > 0 && suggestions.length > max) {
      suggestions = suggestions.slice(0, max);
    }

    this.#strip.replaceChildren();

    for (let i = 0; i < suggestions.length; i++) {
      const sug = suggestions[i];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dvfy-ss__chip';

      if (sug.disabled) {
        btn.setAttribute('disabled', '');
        btn.setAttribute('aria-disabled', 'true');
      }

      // Accent the most-used chip
      if (i === 0 && !sug.disabled && (freq[sug.id] ?? 0) > 0) {
        btn.setAttribute('data-top', '');
      }

      if (sug.icon) {
        const ic = document.createElement('span');
        ic.className = 'dvfy-ss__chip-icon';
        ic.setAttribute('aria-hidden', 'true');
        ic.textContent = sug.icon;
        btn.appendChild(ic);
      }

      const lbl = document.createElement('span');
      lbl.className = 'dvfy-ss__chip-label';
      lbl.textContent = sug.label;
      btn.appendChild(lbl);

      if (!sug.disabled) {
        btn.addEventListener('click', () => this.#select(sug));
      }

      this.#strip.appendChild(btn);
    }
  }

  // ── Select ────────────────────────────────────────────────────────────────

  #select(sug) {
    this.#bumpFreq(sug.id);
    this.dispatchEvent(new CustomEvent('suggest', {
      bubbles: true,
      composed: false,
      detail: { id: sug.id, label: sug.label, context: this.#getContext() },
    }));
    // Re-render to reflect updated ranking
    this.#render();
  }
}

customElements.define('dvfy-smart-suggest', DvfySmartSuggest);
