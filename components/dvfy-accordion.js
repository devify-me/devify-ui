import { injectStyles } from '../utils/styles.js';

const STYLES = `
dvfy-accordion {
  display: block;
  font-family: var(--dvfy-font-sans);
}
dvfy-accordion > dvfy-section {
  margin-bottom: 0;
  border-radius: 0;
  border-bottom-width: 0;
}
dvfy-accordion > dvfy-section:first-child {
  border-radius: var(--dvfy-radius-xl) var(--dvfy-radius-xl) 0 0;
}
dvfy-accordion > dvfy-section:last-child {
  border-radius: 0 0 var(--dvfy-radius-xl) var(--dvfy-radius-xl);
  border-bottom-width: var(--dvfy-border-1);
}
dvfy-accordion > dvfy-section:only-child {
  border-radius: var(--dvfy-radius-xl);
}
dvfy-accordion > dvfy-section[open] .dvfy-section__summary .dvfy-section__label {
  color: var(--dvfy-text-link);
  font-weight: var(--dvfy-weight-bold);
}
dvfy-accordion > dvfy-section[open] .dvfy-section__body {
  background: var(--dvfy-surface-page);
}
`;

/**
 * Grouped accordion that wraps dvfy-section elements.
 *
 * In exclusive mode, opening one section automatically closes the others.
 * Supports keyboard navigation with arrow keys between section headers.
 *
 * @element dvfy-accordion
 *
 * @attr {boolean} exclusive - Only one section open at a time
 *
 * @slot - dvfy-section elements
 *
 * @cssprop {color} --dvfy-border-muted - Border between sections
 * @cssprop {length} --dvfy-radius-xl - Corner radius of first/last sections
 */
class DvfyAccordion extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-accordion', STYLES);

    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Accordion');
    }

    this.addEventListener('click', this.#handleToggle);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleToggle);
    this.removeEventListener('keydown', this.#handleKeydown);
  }

  static get observedAttributes() { return ['exclusive']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;
    // When exclusive is added, close all but the first open section
    if (name === 'exclusive' && newValue !== null) {
      this.#enforceExclusive(this.querySelector('dvfy-section[open]'));
    }
  }

  get #sections() {
    return Array.from(this.querySelectorAll(':scope > dvfy-section'));
  }

  #handleToggle = (e) => {
    const summary = e.target.closest('.dvfy-section__summary');
    if (!summary) return;
    const section = summary.closest('dvfy-section');
    if (!section || section.parentElement !== this) return;
    if (!this.hasAttribute('exclusive')) return;

    // Let dvfy-section handle its own toggle first (it runs synchronously),
    // then close siblings if this section is now open
    requestAnimationFrame(() => {
      if (section.hasAttribute('open')) {
        this.#enforceExclusive(section);
      }
    });
  };

  #handleKeydown = (e) => {
    const summary = e.target.closest('.dvfy-section__summary');
    if (!summary) return;
    const section = summary.closest('dvfy-section');
    if (!section || section.parentElement !== this) return;

    const sections = this.#sections;
    const idx = sections.indexOf(section);
    let target = null;

    if (e.key === 'ArrowDown') {
      target = sections[idx + 1] || sections[0];
    } else if (e.key === 'ArrowUp') {
      target = sections[idx - 1] || sections[sections.length - 1];
    } else if (e.key === 'Home') {
      target = sections[0];
    } else if (e.key === 'End') {
      target = sections[sections.length - 1];
    }

    if (target) {
      e.preventDefault();
      const targetSummary = target.querySelector('.dvfy-section__summary');
      if (targetSummary) targetSummary.focus();
    }
  };

  #enforceExclusive(keep) {
    for (const section of this.#sections) {
      if (section !== keep && section.hasAttribute('open')) {
        section.removeAttribute('open');
        const sum = section.querySelector('.dvfy-section__summary');
        if (sum) sum.setAttribute('aria-expanded', 'false');
      }
    }
  }
}

customElements.define('dvfy-accordion', DvfyAccordion);
