import { injectStyles } from '../utils/styles.js';

const STYLES = `
dvfy-section-hero {
  display: block;
  width: 100%;
  container-type: inline-size;
  background: var(--dvfy-surface-page);
  color: var(--dvfy-text-primary);
  font-family: var(--dvfy-font-sans);
  text-align: center;
  padding-block: var(--dvfy-space-12);
  padding-inline: var(--dvfy-space-5);
  box-sizing: border-box;
}

/* Align */
dvfy-section-hero[align="left"]  { text-align: left; }
dvfy-section-hero[align="center"] { text-align: center; }

/* Padding scale (mobile-first; container-query bumps at wider widths) */
dvfy-section-hero[padding="md"] { padding-block: var(--dvfy-space-8); }
dvfy-section-hero[padding="lg"] { padding-block: var(--dvfy-space-10); }
dvfy-section-hero[padding="xl"] { padding-block: var(--dvfy-space-12); }

@container (min-width: 640px) {
  dvfy-section-hero            { padding-inline: var(--dvfy-space-8); }
  dvfy-section-hero[padding="md"] { padding-block: var(--dvfy-space-12); }
  dvfy-section-hero[padding="lg"] { padding-block: var(--dvfy-space-16); }
  dvfy-section-hero[padding="xl"] { padding-block: var(--dvfy-space-20); }
}

/* Tone */
dvfy-section-hero[tone="brand"] {
  background: var(--dvfy-primary-bg-subtle);
}
dvfy-section-hero[tone="muted"] {
  background: var(--dvfy-surface-muted);
}

/* Inner content rail — caps line length, centers via auto margins */
dvfy-section-hero > * {
  max-width: 56rem;
  margin-inline: auto;
}
dvfy-section-hero[align="left"] > * {
  margin-inline: 0;
}

/* Default-slot vertical rhythm */
dvfy-section-hero > :not([slot="trust"]) + :not([slot="trust"]) {
  margin-top: var(--dvfy-space-5);
}

/* Heading defaults — let consumer override via own tags */
dvfy-section-hero h1,
dvfy-section-hero h2 {
  font-size: var(--dvfy-text-fluid-2xl);
  font-weight: var(--dvfy-weight-bold);
  line-height: var(--dvfy-leading-tight, 1.15);
  margin: 0;
}

dvfy-section-hero p {
  font-size: var(--dvfy-text-fluid-base);
  color: var(--dvfy-text-secondary);
  margin: 0;
}

/* Trust strip */
dvfy-section-hero > [slot="trust"] {
  margin-top: var(--dvfy-space-8);
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-muted);
}
`;

/**
 * Opinionated landing-page hero section: large heading, supporting body, primary CTA, optional trust strip.
 *
 * @element dvfy-section-hero
 *
 * @attr {string} align - Text alignment: left | center (default center)
 * @attr {string} padding - Vertical padding scale: md | lg | xl (default xl)
 * @attr {string} tone - Background tone: default | brand | muted (default default)
 *
 * @slot - Hero content (heading + body + CTAs)
 * @slot trust - Optional trust-strip line below CTAs (e.g. "Trusted by 1,000+ teams")
 *
 * @cssprop {color} --dvfy-surface-page - Default tone background
 * @cssprop {color} --dvfy-primary-bg-subtle - Brand tone background
 * @cssprop {color} --dvfy-surface-muted - Muted tone background
 *
 * @example
 * <dvfy-section-hero tone="brand" padding="xl">
 *   <h1>Ship faster.</h1>
 *   <p>Production-ready UI in one line of HTML.</p>
 *   <dvfy-button variant="primary" size="lg">Get started</dvfy-button>
 *   <div slot="trust">Trusted by 1,000+ teams</div>
 * </dvfy-section-hero>
 */
class DvfySectionHero extends HTMLElement {
  connectedCallback() {
    injectStyles('dvfy-section-hero', STYLES);
  }
}

customElements.define('dvfy-section-hero', DvfySectionHero);
