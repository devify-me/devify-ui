/**
 * <dvfy-section> — Collapsible section with summary header
 *
 * Attributes:
 *   label:    Section title text
 *   open:     boolean — expanded state
 *   icon:     Optional icon/emoji before label
 *
 * Usage:
 *   <dvfy-section label="Button" icon="🔘">
 *     <p>Section content here...</p>
 *   </dvfy-section>
 *
 *   <dvfy-section label="Settings" open>
 *     <p>Open by default</p>
 *   </dvfy-section>
 */

const STYLES = `
dvfy-section {
  display: block;
  margin-bottom: var(--dvfy-space-3);
  border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  border-radius: var(--dvfy-radius-xl);
  overflow: hidden;
  font-family: var(--dvfy-font-sans);
}
dvfy-section .dvfy-section__summary {
  font-size: var(--dvfy-text-base);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
  padding: var(--dvfy-space-3) var(--dvfy-space-5);
  background: var(--dvfy-surface-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  user-select: none;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-section .dvfy-section__summary:hover {
  background: var(--dvfy-hover-bg);
}
dvfy-section .dvfy-section__summary:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: calc(-1 * var(--dvfy-ring-width));
}
dvfy-section .dvfy-section__icon {
  flex-shrink: 0;
}
dvfy-section .dvfy-section__label {
  flex: 1;
}
dvfy-section .dvfy-section__arrow {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  transition: transform var(--dvfy-duration-fast) var(--dvfy-ease-out);
  flex-shrink: 0;
}
dvfy-section[open] .dvfy-section__arrow {
  transform: rotate(90deg);
}
dvfy-section[open] .dvfy-section__summary {
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}
dvfy-section .dvfy-section__body {
  padding: var(--dvfy-space-5);
  display: none;
}
dvfy-section[open] .dvfy-section__body {
  display: block;
}
`;

class DvfySection extends HTMLElement {
  static #styled = false;
  #summary = null;
  #body = null;

  connectedCallback() {
    if (!DvfySection.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfySection.#styled = true;
    }
    this.#build();
  }

  static get observedAttributes() { return ['label', 'icon', 'open']; }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'label') {
      const el = this.querySelector('.dvfy-section__label');
      if (el) el.textContent = this.getAttribute('label') || '';
    } else if (name === 'icon') {
      const el = this.querySelector('.dvfy-section__icon');
      if (el) el.textContent = this.getAttribute('icon') || '';
    }
  }

  #build() {
    const children = Array.from(this.childNodes);

    // Clear
    while (this.firstChild) this.removeChild(this.firstChild);

    // Summary
    this.#summary = document.createElement('div');
    this.#summary.className = 'dvfy-section__summary';
    this.#summary.setAttribute('role', 'button');
    this.#summary.setAttribute('tabindex', '0');
    this.#summary.setAttribute('aria-expanded', String(this.hasAttribute('open')));

    const icon = this.getAttribute('icon');
    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'dvfy-section__icon';
      iconEl.textContent = icon;
      this.#summary.appendChild(iconEl);
    }

    const label = document.createElement('span');
    label.className = 'dvfy-section__label';
    label.textContent = this.getAttribute('label') || '';
    this.#summary.appendChild(label);

    const arrow = document.createElement('span');
    arrow.className = 'dvfy-section__arrow';
    arrow.textContent = '\u25B6';
    arrow.setAttribute('aria-hidden', 'true');
    this.#summary.appendChild(arrow);

    this.#summary.addEventListener('click', () => this.toggle());
    this.#summary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    this.appendChild(this.#summary);

    // Body
    this.#body = document.createElement('div');
    this.#body.className = 'dvfy-section__body';
    for (const child of children) this.#body.appendChild(child);
    this.appendChild(this.#body);
  }

  toggle() {
    if (this.hasAttribute('open')) {
      this.removeAttribute('open');
    } else {
      this.setAttribute('open', '');
    }
    this.#summary.setAttribute('aria-expanded', String(this.hasAttribute('open')));
  }
}

customElements.define('dvfy-section', DvfySection);
