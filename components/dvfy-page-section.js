import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-page-section> — Page vertical-rhythm wrapper for landing-page sections.
 *
 * The composition primitive that replaces invented `dvfy-py-*` / `dvfy-text-center`
 * utility classes on a page `<section>`. One §8 playbook slot = one page-section.
 *
 * NOTE: this is NOT <dvfy-section> (the collapsible disclosure widget) — that name
 * is taken. Page sections use <dvfy-page-section>.
 *
 * Attributes:
 *   padding: md | lg | xl   — vertical rhythm (fluid clamp on --dvfy-space-*; default lg)
 *   align:   left | center  — content alignment (default left)
 *   tone:    default | muted | brand — background tone (default default)
 *   width:   prose | wide | full — inner content rail max-width (default wide)
 *
 * Usage:
 *   <dvfy-page-section tone="muted" padding="xl" align="center" width="wide">
 *     <dvfy-heading level="2">How it works</dvfy-heading>
 *     <dvfy-grid cols="3" gap="lg"> ... </dvfy-grid>
 *   </dvfy-page-section>
 */

const STYLES = `
dvfy-page-section {
  display: block;
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;
  background: var(--dvfy-surface-page);
  color: var(--dvfy-text-primary);
  font-family: var(--dvfy-font-sans);
  /* default padding = lg */
  padding-block: clamp(var(--dvfy-space-10), 5vw, var(--dvfy-space-16));
  padding-inline: clamp(var(--dvfy-space-5), 3vw, var(--dvfy-space-8));
}

/* Padding scale — fluid clamp, same pattern as dvfy-section-hero */
dvfy-page-section[padding="md"] { padding-block: clamp(var(--dvfy-space-8),  4vw, var(--dvfy-space-12)); }
dvfy-page-section[padding="lg"] { padding-block: clamp(var(--dvfy-space-10), 5vw, var(--dvfy-space-16)); }
dvfy-page-section[padding="xl"] { padding-block: clamp(var(--dvfy-space-12), 6vw, var(--dvfy-space-20)); }

/* Tone */
dvfy-page-section[tone="muted"] { background: var(--dvfy-surface-muted); }
dvfy-page-section[tone="brand"] { background: var(--dvfy-primary-bg-subtle); }

/* Inner content rail — centers the section body, caps width */
dvfy-page-section > * {
  margin-inline: auto;
  box-sizing: border-box;
}

/* Width rail */
dvfy-page-section > * { max-width: var(--dvfy-container-6xl); }            /* default = wide */
dvfy-page-section[width="prose"] > * { max-width: var(--dvfy-prose-lg); }
dvfy-page-section[width="wide"]  > * { max-width: var(--dvfy-container-6xl); }
dvfy-page-section[width="full"]  > * { max-width: none; }

/* Align */
dvfy-page-section[align="center"] { text-align: center; }
dvfy-page-section[align="left"]   { text-align: left; }
`;

/**
 * Page vertical-rhythm wrapper for landing-page sections.
 *
 * @element dvfy-page-section
 *
 * @attr {string} padding - Vertical rhythm scale: md | lg | xl (default lg)
 * @attr {string} align - Content alignment: left | center (default left)
 * @attr {string} tone - Background tone: default | muted | brand (default default)
 * @attr {string} width - Inner content rail: prose | wide | full (default wide)
 *
 * @slot - Section content
 *
 * @cssprop {color} --dvfy-surface-page - Default tone background
 * @cssprop {color} --dvfy-surface-muted - Muted tone background
 * @cssprop {color} --dvfy-primary-bg-subtle - Brand tone background
 *
 * @example
 * <dvfy-page-section tone="muted" padding="xl" align="center">
 *   <dvfy-heading level="2">How it works</dvfy-heading>
 * </dvfy-page-section>
 */
class DvfyPageSection extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-page-section', STYLES);
  }
}

customElements.define('dvfy-page-section', DvfyPageSection);
