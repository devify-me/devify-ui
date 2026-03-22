/**
 * <dvfy-empty> — Empty state placeholder
 *
 * Attributes:
 *   title:       heading text
 *   description: secondary text
 *   icon:        optional emoji or text shown above title
 *
 * Children become the action area (e.g., a button).
 *
 * Usage:
 *   <dvfy-empty title="No results" description="Try a different search" icon="🔍">
 *     <dvfy-button variant="outline">Clear filters</dvfy-button>
 *   </dvfy-empty>
 */

const STYLES = `
dvfy-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--dvfy-space-10) var(--dvfy-space-5);
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-muted);
}

dvfy-empty .dvfy-empty__icon {
  font-size: var(--dvfy-text-4xl);
  margin-bottom: var(--dvfy-space-3);
  line-height: 1;
}

dvfy-empty .dvfy-empty__title {
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-secondary);
  margin: 0 0 var(--dvfy-space-1) 0;
}

dvfy-empty .dvfy-empty__desc {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
  margin: 0 0 var(--dvfy-space-5) 0;
  max-width: 20rem;
}

dvfy-empty .dvfy-empty__actions {
  display: flex;
  gap: var(--dvfy-space-3);
  align-items: center;
}
`;

/**
 * Empty state placeholder with icon, title, description, and action area.
 *
 * @element dvfy-empty
 *
 * @attr {string} title - Heading text
 * @attr {string} description - Secondary descriptive text
 * @attr {string} icon - Emoji or text icon shown above the title
 *
 * @slot - Action area content (e.g., buttons)
 *
 * @cssprop {color} --dvfy-text-muted - Description and icon color
 * @cssprop {color} --dvfy-text-secondary - Title color
 *
 * @example
 * <dvfy-empty title="No results found" description="Try adjusting your search or filters." icon="🔍">
 *   <dvfy-button variant="outline">Clear filters</dvfy-button>
 * </dvfy-empty>
 */
class DvfyEmpty extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyEmpty.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyEmpty.#styled = true;
    }
    this.#render();
  }

  static get observedAttributes() { return ['title', 'description', 'icon']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    // Save children (action area) before clearing
    const actions = [];
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.ELEMENT_NODE && !child.classList?.contains('dvfy-empty__icon') &&
          !child.classList?.contains('dvfy-empty__title') && !child.classList?.contains('dvfy-empty__desc') &&
          !child.classList?.contains('dvfy-empty__actions')) {
        actions.push(child);
        this.removeChild(child);
      } else {
        this.removeChild(child);
      }
    }

    const iconAttr = this.getAttribute('icon');
    const titleAttr = this.getAttribute('title');
    const descAttr = this.getAttribute('description');

    if (iconAttr) {
      const iconEl = document.createElement('div');
      iconEl.className = 'dvfy-empty__icon';
      iconEl.setAttribute('aria-hidden', 'true');
      iconEl.textContent = iconAttr;
      this.appendChild(iconEl);
    }

    if (titleAttr) {
      const titleEl = document.createElement('p');
      titleEl.className = 'dvfy-empty__title';
      titleEl.textContent = titleAttr;
      this.appendChild(titleEl);
    }

    if (descAttr) {
      const descEl = document.createElement('p');
      descEl.className = 'dvfy-empty__desc';
      descEl.textContent = descAttr;
      this.appendChild(descEl);
    }

    if (actions.length) {
      const actionsEl = document.createElement('div');
      actionsEl.className = 'dvfy-empty__actions';
      for (const a of actions) actionsEl.appendChild(a);
      this.appendChild(actionsEl);
    }
  }
}

customElements.define('dvfy-empty', DvfyEmpty);
