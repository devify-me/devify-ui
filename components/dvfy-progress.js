/**
 * <dvfy-progress> — Progress indicator
 *
 * Attributes:
 *   value:   0-100
 *   variant: bar | oval | circle (default: "bar")
 *   size:    sm | md | lg (default: "md")
 *   status:  default | success | warning | danger
 *   label:   boolean — show percentage text
 *
 * Usage:
 *   <dvfy-progress value="75" status="success" label></dvfy-progress>
 *   <dvfy-progress value="40" variant="circle" size="lg"></dvfy-progress>
 */

import { injectStyles } from '../utils/styles.js';


const STYLES = `
dvfy-progress {
  display: inline-flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
}

/* Bar track */
dvfy-progress .dvfy-progress__track {
  flex: 1;
  background: var(--dvfy-surface-muted);
  border-radius: var(--dvfy-radius-sm);
  overflow: hidden;
}
dvfy-progress:not([variant]) .dvfy-progress__track,
dvfy-progress[variant="bar"] .dvfy-progress__track,
dvfy-progress[variant="oval"] .dvfy-progress__track { display: block; width: 100%; }
dvfy-progress[variant="circle"] .dvfy-progress__track { display: none; }

/* Oval variant — pill-shaped track */
dvfy-progress[variant="oval"] .dvfy-progress__track { border-radius: var(--dvfy-radius-round); }

dvfy-progress[size="xs"] .dvfy-progress__track { height: 0.25rem; }
dvfy-progress[size="sm"] .dvfy-progress__track { height: 0.375rem; }
dvfy-progress:not([size]) .dvfy-progress__track,
dvfy-progress[size="md"] .dvfy-progress__track { height: 0.5rem; }
dvfy-progress[size="lg"] .dvfy-progress__track { height: 0.75rem; }
dvfy-progress[size="xl"] .dvfy-progress__track { height: 1rem; }

dvfy-progress:not([variant]),
dvfy-progress[variant="bar"],
dvfy-progress[variant="oval"] { width: 100%; }

dvfy-progress .dvfy-progress__fill {
  height: 100%;
  border-radius: inherit;
  transition: width var(--dvfy-duration-normal) var(--dvfy-ease-out);
}

/* Status colors — fill & ring */
dvfy-progress:not([status]) .dvfy-progress__fill,
dvfy-progress[status="default"] .dvfy-progress__fill { background: var(--dvfy-primary-bg); }
dvfy-progress[status="success"] .dvfy-progress__fill { background: var(--dvfy-success-bg); }
dvfy-progress[status="warning"] .dvfy-progress__fill { background: var(--dvfy-warning-bg); }
dvfy-progress[status="danger"] .dvfy-progress__fill { background: var(--dvfy-danger-bg); }

dvfy-progress:not([status]) .dvfy-progress__ring-fg,
dvfy-progress[status="default"] .dvfy-progress__ring-fg { stroke: var(--dvfy-primary-bg); }
dvfy-progress[status="success"] .dvfy-progress__ring-fg { stroke: var(--dvfy-success-bg); }
dvfy-progress[status="warning"] .dvfy-progress__ring-fg { stroke: var(--dvfy-warning-bg); }
dvfy-progress[status="danger"] .dvfy-progress__ring-fg { stroke: var(--dvfy-danger-bg); }

/* Circle */
dvfy-progress .dvfy-progress__circle { display: none; }
dvfy-progress[variant="circle"] .dvfy-progress__circle { display: block; }
dvfy-progress[variant="circle"] { width: auto; }

dvfy-progress .dvfy-progress__ring-bg {
  stroke: var(--dvfy-surface-muted);
  fill: none;
}
dvfy-progress .dvfy-progress__ring-fg {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--dvfy-duration-normal) var(--dvfy-ease-out);
  transform: rotate(-90deg);
  transform-origin: center;
}

/* Label */
dvfy-progress .dvfy-progress__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-secondary);
  white-space: nowrap;
}
dvfy-progress .dvfy-progress__circle-label {
  font-weight: var(--dvfy-weight-semibold);
  fill: var(--dvfy-text-primary);
  dominant-baseline: central;
  text-anchor: middle;
}
`;

const SIZES = { xs: { dim: 32, stroke: 3, font: 8 }, sm: { dim: 48, stroke: 4, font: 10 }, md: { dim: 64, stroke: 5, font: 13 }, lg: { dim: 96, stroke: 6, font: 18 }, xl: { dim: 128, stroke: 8, font: 22 } };

/**
 * Progress indicator with bar and circle variants.
 *
 * @element dvfy-progress
 *
 * @attr {number} value - Progress value from 0 to 100
 * @attr {string} variant - Display style: bar | oval | circle (default: "bar")
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} status - Color status: default | success | warning | danger
 * @attr {boolean} label - Show percentage text
 *
 * @cssprop {color} --dvfy-primary-bg - Default progress fill color
 * @cssprop {color} --dvfy-success-bg - Success progress fill color
 * @cssprop {color} --dvfy-warning-bg - Warning progress fill color
 * @cssprop {color} --dvfy-danger-bg - Danger progress fill color
 */
class DvfyProgress extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-progress', STYLES);
    this.setAttribute('role', 'progressbar');
    this.#render();
  }

  static get observedAttributes() { return ['value', 'variant', 'size', 'status', 'label']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  get #value() { return Math.max(0, Math.min(100, parseInt(this.getAttribute('value') || '0', 10))); }
  get #isCircle() { return this.getAttribute('variant') === 'circle'; }
  get #sizeKey() { return this.getAttribute('size') || 'md'; }

  #render() {
    this.textContent = '';
    this.setAttribute('aria-valuenow', String(this.#value));
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');

    if (this.#isCircle) {
      this.#renderCircle();
    } else {
      this.#renderBar();
    }
  }

  #renderBar() {
    const track = document.createElement('div');
    track.className = 'dvfy-progress__track';
    const fill = document.createElement('div');
    fill.className = 'dvfy-progress__fill';
    fill.style.width = this.#value + '%';
    track.appendChild(fill);
    this.appendChild(track);

    if (this.hasAttribute('label')) {
      const lbl = document.createElement('span');
      lbl.className = 'dvfy-progress__label';
      lbl.textContent = this.#value + '%';
      this.appendChild(lbl);
    }
  }

  #renderCircle() {
    const cfg = SIZES[this.#sizeKey] || SIZES.md;
    const r = (cfg.dim - cfg.stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - this.#value / 100);

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'dvfy-progress__circle');
    svg.setAttribute('width', String(cfg.dim));
    svg.setAttribute('height', String(cfg.dim));
    svg.setAttribute('viewBox', `0 0 ${cfg.dim} ${cfg.dim}`);

    const bg = document.createElementNS(ns, 'circle');
    bg.setAttribute('class', 'dvfy-progress__ring-bg');
    bg.setAttribute('cx', String(cfg.dim / 2));
    bg.setAttribute('cy', String(cfg.dim / 2));
    bg.setAttribute('r', String(r));
    bg.setAttribute('stroke-width', String(cfg.stroke));

    const fg = document.createElementNS(ns, 'circle');
    fg.setAttribute('class', 'dvfy-progress__ring-fg');
    fg.setAttribute('cx', String(cfg.dim / 2));
    fg.setAttribute('cy', String(cfg.dim / 2));
    fg.setAttribute('r', String(r));
    fg.setAttribute('stroke-width', String(cfg.stroke));
    fg.setAttribute('stroke-dasharray', String(circ));
    fg.setAttribute('stroke-dashoffset', String(offset));

    svg.appendChild(bg);
    svg.appendChild(fg);

    if (this.hasAttribute('label')) {
      const text = document.createElementNS(ns, 'text');
      text.setAttribute('class', 'dvfy-progress__circle-label');
      text.setAttribute('x', String(cfg.dim / 2));
      text.setAttribute('y', String(cfg.dim / 2));
      text.setAttribute('font-size', String(cfg.font));
      text.textContent = this.#value + '%';
      svg.appendChild(text);
    }

    this.appendChild(svg);
  }
}

customElements.define('dvfy-progress', DvfyProgress);
