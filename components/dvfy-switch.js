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
`;

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

  static get observedAttributes() { return ['checked', 'disabled', 'label', 'description']; }

  attributeChangedCallback(name) {
    if (name === 'checked') {
      this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');
    }
    if (name === 'disabled') {
      this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    }
    if (this.isConnected && (name === 'label' || name === 'description')) this.#build();
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

    this.dispatchEvent(new Event('change', { bubbles: true }));
  };

  #onKey = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      this.#toggle();
    }
  };

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }
}

customElements.define('dvfy-switch', DvfySwitch);
