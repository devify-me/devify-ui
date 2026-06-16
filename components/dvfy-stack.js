import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-stack> — Flex wrapper with a token-scaled gap.
 *
 * Replaces invented `dvfy-flex dvfy-gap-* dvfy-justify-center` utility classes and
 * implicit vertical spacing. The default is a vertical (column) stack — the most
 * common landing-page rhythm need.
 *
 * Attributes:
 *   direction: column | row    — main axis (default column)
 *   gap:       sm | md | lg     — space between children (--dvfy-space-*; default md)
 *   justify:   start | center | end | between — main-axis distribution (default start)
 *   align:     start | center | end | stretch — cross-axis alignment (default stretch)
 *
 * Usage:
 *   <dvfy-stack gap="md" align="center">
 *     <dvfy-heading level="1">Title</dvfy-heading>
 *     <dvfy-text size="lg" tone="muted">Subhead</dvfy-text>
 *     <dvfy-button variant="primary">Go</dvfy-button>
 *   </dvfy-stack>
 */

const STYLES = `
dvfy-stack {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  /* default gap = md */
  gap: var(--dvfy-space-6);
}

/* Direction */
dvfy-stack[direction="row"]    { flex-direction: row; flex-wrap: wrap; }
dvfy-stack[direction="column"] { flex-direction: column; }

/* Gap scale */
dvfy-stack[gap="sm"] { gap: var(--dvfy-space-3); }
dvfy-stack[gap="md"] { gap: var(--dvfy-space-6); }
dvfy-stack[gap="lg"] { gap: var(--dvfy-space-10); }

/* Justify (main axis) */
dvfy-stack[justify="start"]   { justify-content: flex-start; }
dvfy-stack[justify="center"]  { justify-content: center; }
dvfy-stack[justify="end"]     { justify-content: flex-end; }
dvfy-stack[justify="between"] { justify-content: space-between; }

/* Align (cross axis) */
dvfy-stack[align="start"]   { align-items: flex-start; }
dvfy-stack[align="center"]  { align-items: center; }
dvfy-stack[align="end"]     { align-items: flex-end; }
dvfy-stack[align="stretch"] { align-items: stretch; }
`;

/**
 * Flex wrapper with a token-scaled gap; vertical (column) by default.
 *
 * @element dvfy-stack
 *
 * @attr {string} direction - Main axis: column | row (default column)
 * @attr {string} gap - Space between children: sm | md | lg (default md)
 * @attr {string} justify - Main-axis distribution: start | center | end | between (default start)
 * @attr {string} align - Cross-axis alignment: start | center | end | stretch (default stretch)
 *
 * @slot - Stack children
 *
 * @example
 * <dvfy-stack gap="md" align="center">
 *   <dvfy-heading level="1">Title</dvfy-heading>
 *   <dvfy-text size="lg" tone="muted">Subhead</dvfy-text>
 * </dvfy-stack>
 */
class DvfyStack extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-stack', STYLES);
  }
}

customElements.define('dvfy-stack', DvfyStack);
