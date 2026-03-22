/**
 * <dvfy-description-list> — Semantic key-value description list (dl/dt/dd)
 *
 * Wraps a `<dl>` with `<dt>` (label) and `<dd>` (value) pairs.
 * Supports stacked, horizontal, and grid layouts with responsive collapse.
 *
 * Usage:
 *   <dvfy-description-list layout="horizontal">
 *     <dl>
 *       <dt>Name</dt><dd>Alice Chen</dd>
 *       <dt>Role</dt><dd>Senior Engineer</dd>
 *       <dt>Team</dt><dd>Platform</dd>
 *     </dl>
 *   </dvfy-description-list>
 *
 * @element dvfy-description-list
 *
 * @attr {string} layout - Layout mode: stacked | horizontal | grid (default: "stacked")
 * @attr {string} cols - Number of grid columns when layout="grid" (default: "2")
 * @attr {boolean} dividers - Show divider lines between items
 * @attr {boolean} compact - Reduce padding between items
 *
 * @slot - `<dl>` with `<dt>` labels and `<dd>` values
 *
 * @cssprop {color} --dvfy-text-primary - Value text color
 * @cssprop {color} --dvfy-text-secondary - Label text color
 * @cssprop {color} --dvfy-border-default - Divider color
 *
 * @example
 * <dvfy-description-list layout="horizontal" dividers>
 *   <dl>
 *     <dt>Status</dt><dd>Active</dd>
 *     <dt>Plan</dt><dd>Pro</dd>
 *   </dl>
 * </dvfy-description-list>
 */

const STYLES = `
dvfy-description-list {
  display: block;
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-primary);
  container-type: inline-size;
}

dvfy-description-list dl {
  margin: 0;
  padding: 0;
}

/* ── Stacked layout (default) ── */
dvfy-description-list dl {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-4);
}

dvfy-description-list dt {
  font-weight: var(--dvfy-font-medium);
  color: var(--dvfy-text-secondary);
  margin: 0;
}

dvfy-description-list dd {
  margin: var(--dvfy-space-1) 0 0 0;
  color: var(--dvfy-text-primary);
}

/* ── Compact ── */
dvfy-description-list[compact] dl {
  gap: var(--dvfy-space-2);
}

/* ── Dividers ── */
dvfy-description-list[dividers] dl {
  gap: 0;
}

dvfy-description-list[dividers] dt {
  padding-top: var(--dvfy-space-4);
  border-top: 1px solid var(--dvfy-border-default);
}

dvfy-description-list[dividers] dt:first-child {
  border-top: none;
  padding-top: 0;
}

dvfy-description-list[dividers] dd {
  padding-bottom: var(--dvfy-space-4);
}

dvfy-description-list[compact][dividers] dt {
  padding-top: var(--dvfy-space-2);
}

dvfy-description-list[compact][dividers] dd {
  padding-bottom: var(--dvfy-space-2);
}

/* ── Horizontal layout ── */
dvfy-description-list[layout="horizontal"] dl {
  gap: 0;
}

dvfy-description-list[layout="horizontal"] dt {
  margin: 0;
  padding: var(--dvfy-space-3) 0;
  grid-column: 1;
  color: var(--dvfy-text-secondary);
}

dvfy-description-list[layout="horizontal"] dd {
  margin: 0;
  padding: var(--dvfy-space-3) 0;
  grid-column: 2;
  color: var(--dvfy-text-primary);
}

@container (min-width: 30rem) {
  dvfy-description-list[layout="horizontal"] dl {
    display: grid;
    grid-template-columns: minmax(8rem, 30%) 1fr;
    align-items: baseline;
  }

  dvfy-description-list[layout="horizontal"][dividers] dt,
  dvfy-description-list[layout="horizontal"][dividers] dd {
    border-top: 1px solid var(--dvfy-border-default);
    padding-top: var(--dvfy-space-3);
    padding-bottom: var(--dvfy-space-3);
  }

  dvfy-description-list[layout="horizontal"][dividers] dt:first-child,
  dvfy-description-list[layout="horizontal"][dividers] dt:first-child + dd {
    border-top: none;
  }
}

/* ── Grid layout ── */
dvfy-description-list[layout="grid"] dl {
  gap: var(--dvfy-space-4) var(--dvfy-space-6);
}

@container (min-width: 30rem) {
  dvfy-description-list[layout="grid"] dl {
    display: grid;
    grid-template-columns: repeat(var(--dvfy-dl-cols, 2), 1fr);
  }

  dvfy-description-list[layout="grid"] dt {
    margin: 0;
  }

  dvfy-description-list[layout="grid"] dd {
    margin: var(--dvfy-space-1) 0 0 0;
  }
}

/* Collapse horizontal/grid to stacked on small containers */
@container (max-width: 29.999rem) {
  dvfy-description-list[layout="horizontal"] dl,
  dvfy-description-list[layout="grid"] dl {
    display: flex;
    flex-direction: column;
    gap: var(--dvfy-space-4);
  }

  dvfy-description-list[layout="horizontal"] dt,
  dvfy-description-list[layout="horizontal"] dd,
  dvfy-description-list[layout="grid"] dt,
  dvfy-description-list[layout="grid"] dd {
    padding: 0;
    border-top: none !important;
  }

  dvfy-description-list[layout="horizontal"] dd,
  dvfy-description-list[layout="grid"] dd {
    margin-top: var(--dvfy-space-1);
  }

  dvfy-description-list[dividers][layout="horizontal"] dl,
  dvfy-description-list[dividers][layout="grid"] dl {
    gap: 0;
  }

  dvfy-description-list[dividers][layout="horizontal"] dt,
  dvfy-description-list[dividers][layout="grid"] dt {
    padding-top: var(--dvfy-space-4);
    border-top: 1px solid var(--dvfy-border-default) !important;
  }

  dvfy-description-list[dividers][layout="horizontal"] dt:first-child,
  dvfy-description-list[dividers][layout="grid"] dt:first-child {
    border-top: none !important;
    padding-top: 0;
  }

  dvfy-description-list[dividers][layout="horizontal"] dd,
  dvfy-description-list[dividers][layout="grid"] dd {
    padding-bottom: var(--dvfy-space-4);
    margin-top: var(--dvfy-space-1);
  }
}
`;

class DvfyDescriptionList extends HTMLElement {
  static #styled = false;

  static get observedAttributes() { return ['layout', 'cols']; }

  connectedCallback() {
    if (!DvfyDescriptionList.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyDescriptionList.#styled = true;
    }
    this.#applyRole();
    this.#applyCols();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'cols') this.#applyCols();
    if (name === 'layout') this.#applyRole();
  }

  #applyRole() {
    // dl already has implicit list semantics; no extra role needed
  }

  #applyCols() {
    const cols = parseInt(this.getAttribute('cols'), 10) || 2;
    this.style.setProperty('--dvfy-dl-cols', cols);
  }
}

if (!customElements.get('dvfy-description-list')) {
  customElements.define('dvfy-description-list', DvfyDescriptionList);
}
