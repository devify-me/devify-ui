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
  padding-block: clamp(var(--dvfy-space-12), 6vw, var(--dvfy-space-20));
  padding-inline: clamp(var(--dvfy-space-5), 3vw, var(--dvfy-space-8));
  box-sizing: border-box;
}

/* Align */
dvfy-section-hero[align="left"]  { text-align: left; }
dvfy-section-hero[align="center"] { text-align: center; }

/* Padding scale — fluid via clamp so it grows with viewport width */
dvfy-section-hero[padding="md"] { padding-block: clamp(var(--dvfy-space-8),  4vw, var(--dvfy-space-12)); }
dvfy-section-hero[padding="lg"] { padding-block: clamp(var(--dvfy-space-10), 5vw, var(--dvfy-space-16)); }
dvfy-section-hero[padding="xl"] { padding-block: clamp(var(--dvfy-space-12), 6vw, var(--dvfy-space-20)); }

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

/* ──────────────────────────────────────────────────────────────────────
   Media mode — active only when a [media-position] is set (and thus a
   media slot is used). The no-media path above is untouched, so a hero
   without media renders byte-identically to a text-centric hero.

   Layout: in media mode the component injects a .dvfy-hero-grid descendant
   that holds two cells — a .dvfy-hero-content cell (all text/CTA children)
   and the [slot="media"] cell. The grid is a DESCENDANT of the hero, so its
   @container (min-width: 48rem) query resolves against the hero's own
   inline-size container (an element cannot query its own container-type —
   the grid must be a child). Below 48rem it collapses to one stacked column
   — the same container-query breakpoint the rest of the library uses
   (cf. dvfy-grid).
   ────────────────────────────────────────────────────────────────────── */
dvfy-section-hero[media-position] > .dvfy-hero-grid {
  display: grid;
  align-items: center;
  gap: clamp(var(--dvfy-space-8), 4vw, var(--dvfy-space-12));
  grid-template-columns: 1fr;
  /* Override the centered content rail — the grid spans the hero rail width. */
  max-width: none;
  margin-inline: 0;
  text-align: left;
}

/* Content cell fills its track; allow shrink in grid (min-width:0).
   The media cell is sized separately below (capped + centered), so it is not
   reset to max-width:none here — that reset is what made it span full width. */
dvfy-section-hero[media-position] > .dvfy-hero-grid > .dvfy-hero-content {
  max-width: none;
  margin-inline: 0;
  min-width: 0;
}
dvfy-section-hero[media-position] > .dvfy-hero-grid > [slot="media"] {
  min-width: 0;
}

/* Content cell keeps the authored vertical rhythm between its children. */
dvfy-section-hero[media-position] .dvfy-hero-content > :not(:first-child) {
  margin-top: var(--dvfy-space-5);
}
dvfy-section-hero[media-position] .dvfy-hero-content > [slot="trust"] {
  margin-top: var(--dvfy-space-8);
}

/* Media element sizing — consistent aspect-ratio, token radius, never overflows.
   Bounded: width is fluid (fills its track / stacked column) but capped at
   --dvfy-hero-media-max so a stacked (above/below) media reads as a focused
   hero visual, not a full-bleed banner, and a 2-col cell can't blow up on
   ultrawide hosts. margin-inline:auto centers it within the leftover space
   once capped. The cap is a consumer-overridable knob (default ~half the
   56rem text rail) and width:100% keeps it scaling DOWN below the cap on
   narrow viewports, never overflowing the host content box. */
dvfy-section-hero[media-position] > .dvfy-hero-grid > [slot="media"] {
  display: block;
  width: 100%;
  max-width: var(--dvfy-hero-media-max, var(--dvfy-container-md));
  margin-inline: auto;
  aspect-ratio: var(--dvfy-hero-media-aspect, auto);
  border-radius: var(--dvfy-radius-lg);
  overflow: hidden;
}
dvfy-section-hero[media-position] > .dvfy-hero-grid > img[slot="media"] {
  object-fit: cover;
  height: auto;
}

/* Two columns once the hero's container is wide enough. */
@container (min-width: 48rem) {
  dvfy-section-hero[media-position="left"]  > .dvfy-hero-grid,
  dvfy-section-hero[media-position="right"] > .dvfy-hero-grid {
    grid-template-columns: 1fr 1fr;
  }
  /* media-position=left → media renders in the leading column. */
  dvfy-section-hero[media-position="left"] > .dvfy-hero-grid > [slot="media"] {
    order: -1;
  }
}

/* above / below — single column, media stacked relative to content. */
dvfy-section-hero[media-position="above"] > .dvfy-hero-grid > [slot="media"] {
  order: -1;
}
dvfy-section-hero[media-position="below"] > .dvfy-hero-grid > [slot="media"] {
  order: 1;
}

/* Centered alignment override still honored in media mode. */
dvfy-section-hero[media-position][align="center"] > .dvfy-hero-grid { text-align: center; }
`;

/**
 * Opinionated landing-page hero section: large heading, supporting body, primary CTA, optional
 * trust strip, and an optional media column (image / carousel / before-after compare slider).
 *
 * @element dvfy-section-hero
 *
 * @attr {string} align - Text alignment: left | center (default center; media mode defaults to left)
 * @attr {string} padding - Vertical padding scale: md | lg | xl (default xl)
 * @attr {string} tone - Background tone: default | brand | muted (default default)
 * @attr {string} media-position - Where the media slot sits relative to content: left | right | above | below. Presence of this attribute activates media (two-column) mode.
 * @attr {string} aspect-ratio - CSS aspect-ratio for the media cell (e.g. "16 / 9"), mirrored into --dvfy-hero-media-aspect for consistent sizing.
 *
 * @slot - Hero content (heading + body + CTAs)
 * @slot trust - Optional trust-strip line below CTAs (e.g. "Trusted by 1,000+ teams")
 * @slot media - Optional hero visual: an <img>, <dvfy-carousel>, or <dvfy-compare-slider>. Composed, not reinvented.
 *
 * @cssprop {color} --dvfy-surface-page - Default tone background
 * @cssprop {color} --dvfy-primary-bg-subtle - Brand tone background
 * @cssprop {color} --dvfy-surface-muted - Muted tone background
 * @cssprop {string} --dvfy-hero-media-aspect - Aspect-ratio applied to the media cell (set from the aspect-ratio attribute)
 * @cssprop {length} --dvfy-hero-media-max - Max-width cap for the media cell so a stacked (above/below) visual reads as a focused hero image rather than a full-bleed banner, and a 2-col cell can't blow up on ultrawide hosts (default --dvfy-container-md, ~28rem; width stays fluid + centered below the cap)
 *
 * @example
 * <dvfy-section-hero tone="brand" padding="xl">
 *   <h1>Ship faster.</h1>
 *   <p>Production-ready UI in one line of HTML.</p>
 *   <dvfy-button variant="primary" size="lg">Get started</dvfy-button>
 *   <div slot="trust">Trusted by 1,000+ teams</div>
 * </dvfy-section-hero>
 *
 * @example
 * <dvfy-section-hero media-position="right" aspect-ratio="4 / 3">
 *   <h1>See it before you buy it.</h1>
 *   <p>Compare every angle.</p>
 *   <dvfy-button variant="primary" size="lg">Get started</dvfy-button>
 *   <dvfy-carousel slot="media" images='["/a.jpg","/b.jpg"]'></dvfy-carousel>
 * </dvfy-section-hero>
 */
class DvfySectionHero extends HTMLElement {
  static get observedAttributes() { return ['media-position', 'aspect-ratio']; }

  connectedCallback() {
    injectStyles('dvfy-section-hero', STYLES);
    this.#syncMedia();
    this.#syncAspect();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'media-position') this.#syncMedia();
    if (name === 'aspect-ratio') this.#syncAspect();
  }

  // Mirror the aspect-ratio attribute into a custom property — CSS cannot read an
  // attribute value inside `aspect-ratio`, so we hand it to the media cell via a var.
  #syncAspect() {
    const ratio = this.getAttribute('aspect-ratio');
    if (ratio) {
      this.style.setProperty('--dvfy-hero-media-aspect', ratio);
    } else {
      this.style.removeProperty('--dvfy-hero-media-aspect');
    }
  }

  // In media mode the component injects a .dvfy-hero-grid descendant holding two
  // cells: a .dvfy-hero-content cell (all text/CTA children) and the [slot="media"]
  // cell. The grid must be a DESCENDANT (not the host) so its @container query can
  // resolve against the host's inline-size container. No media → we unwrap,
  // restoring the exact text-centric DOM (regression-safe, byte-identical).
  #syncMedia() {
    const media = this.querySelector(':scope > [slot="media"], :scope > .dvfy-hero-grid > [slot="media"]');
    const hasMedia = this.hasAttribute('media-position') && media;
    if (hasMedia) {
      this.#wrapMedia(media);
    } else {
      this.#unwrapMedia();
    }
  }

  #wrapMedia(media) {
    let grid = this.querySelector(':scope > .dvfy-hero-grid');
    if (grid) return; // already in media mode — layout/order/aspect are CSS-driven

    grid = document.createElement('div');
    grid.className = 'dvfy-hero-grid';
    const content = document.createElement('div');
    content.className = 'dvfy-hero-content';

    // Collect every non-media child into the content cell, preserving source order.
    const children = Array.from(this.children).filter(c => c !== media);
    for (const child of children) content.appendChild(child);

    // Source order is always content→media; CSS `order` handles left/right/above/below.
    grid.append(content, media);
    this.appendChild(grid);
  }

  #unwrapMedia() {
    const grid = this.querySelector(':scope > .dvfy-hero-grid');
    if (!grid) return;
    const content = grid.querySelector(':scope > .dvfy-hero-content');
    // Lift content children back out, then the media element, restoring original order.
    if (content) {
      while (content.firstChild) this.insertBefore(content.firstChild, grid);
      content.remove();
    }
    const media = grid.querySelector(':scope > [slot="media"]');
    if (media) this.insertBefore(media, grid);
    grid.remove();
  }
}

customElements.define('dvfy-section-hero', DvfySectionHero);
