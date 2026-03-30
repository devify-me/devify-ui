import { labelPositionCSS } from '../utils/label-position.js';

/**
 * <dvfy-switch> — Toggle switch
 *
 * Attributes:
 *   checked:     boolean
 *   disabled:    boolean
 *   name:        form field name
 *   value:       form field value
 *   label:       label text
 *   description: optional description text
 *
 * Usage:
 *   <dvfy-switch label="Notifications" description="Receive email alerts" name="notify"></dvfy-switch>
 *   <dvfy-switch label="Dark mode" checked></dvfy-switch>
 */

const STYLES = `
dvfy-switch {
  display: flex;
  align-items: flex-start;
  gap: var(--dvfy-space-3);
  font-family: var(--dvfy-font-sans);
  cursor: pointer;
  user-select: none;
}
dvfy-switch[disabled] { cursor: not-allowed; opacity: 0.5; }

dvfy-switch .dvfy-switch__track {
  position: relative;
  flex-shrink: 0;
  width: 2.25rem;
  height: 1.25rem;
  background: var(--dvfy-neutral-300);
  border-radius: var(--dvfy-radius-md);
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-switch[checked] .dvfy-switch__track {
  background: var(--dvfy-primary-bg);
}

dvfy-switch .dvfy-switch__thumb {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1rem;
  height: 1rem;
  background: var(--dvfy-neutral-0);
  border-radius: var(--dvfy-radius-sm);
  box-shadow: var(--dvfy-shadow-xs);
  transition: transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-switch[checked] .dvfy-switch__thumb {
  transform: translateX(1rem);
}

dvfy-switch .dvfy-switch__text {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-0-5);
}
dvfy-switch .dvfy-switch__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
  line-height: var(--dvfy-leading-tight);
}
dvfy-switch .dvfy-switch__desc {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

dvfy-switch:focus-visible .dvfy-switch__track {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Size: xs — track 1.75rem × 1rem */
dvfy-switch[size="xs"] { gap: var(--dvfy-space-2); }
dvfy-switch[size="xs"] .dvfy-switch__track { width: 1.75rem; height: 1rem; }
dvfy-switch[size="xs"] .dvfy-switch__thumb { width: 0.75rem; height: 0.75rem; }
dvfy-switch[size="xs"][checked] .dvfy-switch__thumb { transform: translateX(0.75rem); }
dvfy-switch[size="xs"] .dvfy-switch__label { font-size: var(--dvfy-text-xs); }
dvfy-switch[size="xs"] .dvfy-switch__desc { font-size: var(--dvfy-text-xs); }

/* Size: sm — track 2rem × 1.125rem */
dvfy-switch[size="sm"] { gap: var(--dvfy-space-2); }
dvfy-switch[size="sm"] .dvfy-switch__track { width: 2rem; height: 1.125rem; }
dvfy-switch[size="sm"] .dvfy-switch__thumb { width: 0.875rem; height: 0.875rem; }
dvfy-switch[size="sm"][checked] .dvfy-switch__thumb { transform: translateX(0.875rem); }
dvfy-switch[size="sm"] .dvfy-switch__label { font-size: var(--dvfy-text-xs); }

/* Size: md (default, no overrides needed) */

/* Size: lg — track 2.75rem × 1.5rem */
dvfy-switch[size="lg"] { gap: var(--dvfy-space-3-5); }
dvfy-switch[size="lg"] .dvfy-switch__track { width: 2.75rem; height: 1.5rem; }
dvfy-switch[size="lg"] .dvfy-switch__thumb { width: 1.25rem; height: 1.25rem; }
dvfy-switch[size="lg"][checked] .dvfy-switch__thumb { transform: translateX(1.25rem); }
dvfy-switch[size="lg"] .dvfy-switch__label { font-size: var(--dvfy-text-base); }

/* Size: xl — track 3.25rem × 1.75rem */
dvfy-switch[size="xl"] { gap: var(--dvfy-space-4); }
dvfy-switch[size="xl"] .dvfy-switch__track { width: 3.25rem; height: 1.75rem; }
dvfy-switch[size="xl"] .dvfy-switch__thumb { width: 1.5rem; height: 1.5rem; }
dvfy-switch[size="xl"][checked] .dvfy-switch__thumb { transform: translateX(1.5rem); }
dvfy-switch[size="xl"] .dvfy-switch__label { font-size: var(--dvfy-text-base); }

/* Round shape */
dvfy-switch[round] .dvfy-switch__track { border-radius: var(--dvfy-radius-full); }
dvfy-switch[round] .dvfy-switch__thumb { border-radius: var(--dvfy-radius-round); }

/* Thumb icon */
dvfy-switch .dvfy-switch__thumb-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.6em;
  line-height: 1;
  user-select: none;
}

${labelPositionCSS('dvfy-switch', { layout: 'inline', label: '.dvfy-switch__text' })}
`;

/**
 * Toggle switch with label and description text.
 *
 * @element dvfy-switch
 *
 * @attr {boolean} checked - On state
 * @attr {boolean} disabled - Disable interaction
 * @attr {string} name - Form field name
 * @attr {string} value - Form field value when checked (default: "on")
 * @attr {string} label - Label text
 * @attr {string} description - Optional description text below label
 * @attr {boolean} round - Use fully rounded track and thumb (pill shape)
 * @attr {string} icon-on - Icon/emoji shown in thumb when checked
 * @attr {string} icon-off - Icon/emoji shown in thumb when unchecked
 * @attr {string} size - Visual size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} label-position - Label placement: top | right | bottom | left (default: "right")
 *
 * @fires change - Toggle state changed
 *
 * @cssprop {color} --dvfy-primary-bg - Track color when checked
 * @cssprop {color} --dvfy-neutral-300 - Track color when unchecked
 * @cssprop {color} --dvfy-neutral-0 - Thumb color
 */
class DvfySwitch extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfySwitch.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfySwitch.#styled = true;
    }

    this.setAttribute('role', 'switch');
    this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');
    if (!this.hasAttribute('disabled')) this.setAttribute('tabindex', '0');

    this.#build();
    this.addEventListener('click', this.#toggle);
    this.addEventListener('keydown', this.#onKey);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#toggle);
    this.removeEventListener('keydown', this.#onKey);
  }

  static get observedAttributes() { return ['checked', 'disabled', 'label', 'description', 'label-position', 'round', 'icon-on', 'icon-off']; }

  attributeChangedCallback(name) {
    if (name === 'checked') {
      this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');
    }
    if (name === 'disabled') {
      this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    }
    if (this.isConnected && (name === 'label' || name === 'description' || name === 'label-position' || name === 'icon-on' || name === 'icon-off')) this.#build();
  }

  #build() {
    this.textContent = '';

    // Hidden input for form compatibility
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = this.getAttribute('name') || '';
    input.value = this.hasAttribute('checked') ? (this.getAttribute('value') || 'on') : '';
    this.appendChild(input);

    // Track + thumb
    const track = document.createElement('span');
    track.className = 'dvfy-switch__track';
    const thumb = document.createElement('span');
    thumb.className = 'dvfy-switch__thumb';

    // Thumb icon
    const iconOn = this.getAttribute('icon-on');
    const iconOff = this.getAttribute('icon-off');
    if (iconOn || iconOff) {
      const icon = document.createElement('span');
      icon.className = 'dvfy-switch__thumb-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = this.hasAttribute('checked') ? (iconOn || '') : (iconOff || '');
      thumb.appendChild(icon);
    }

    track.appendChild(thumb);
    this.appendChild(track);

    // Label + description
    const label = this.getAttribute('label');
    const desc = this.getAttribute('description');
    if (label || desc) {
      const textWrap = document.createElement('span');
      textWrap.className = 'dvfy-switch__text';
      if (label) {
        const lbl = document.createElement('span');
        lbl.className = 'dvfy-switch__label';
        lbl.textContent = label;
        textWrap.appendChild(lbl);
      }
      if (desc) {
        const d = document.createElement('span');
        d.className = 'dvfy-switch__desc';
        d.textContent = desc;
        textWrap.appendChild(d);
      }
      this.appendChild(textWrap);
    }
  }

  #toggle = () => {
    if (this.hasAttribute('disabled')) return;
    if (this.hasAttribute('checked')) {
      this.removeAttribute('checked');
    } else {
      this.setAttribute('checked', '');
    }
    // Update hidden input
    const input = this.querySelector('input');
    if (input) input.value = this.hasAttribute('checked') ? (this.getAttribute('value') || 'on') : '';

    // Update thumb icon
    const thumbIcon = this.querySelector('.dvfy-switch__thumb-icon');
    if (thumbIcon) {
      const iconOn = this.getAttribute('icon-on');
      const iconOff = this.getAttribute('icon-off');
      thumbIcon.textContent = this.hasAttribute('checked') ? (iconOn || '') : (iconOff || '');
    }

    this.dispatchEvent(new Event('change', { bubbles: true }));
  };

  #onKey = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.#toggle();
    }
  };

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }
}

customElements.define('dvfy-switch', DvfySwitch);
