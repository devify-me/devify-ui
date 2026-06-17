import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-section-hero.js';
import './dvfy-carousel.js';

describe('dvfy-section-hero', () => {
  describe('rendering (text-centric, no media)', () => {
    it('renders slotted heading + body content', async () => {
      const el = await fixture(html`
        <dvfy-section-hero>
          <h1>Ship faster.</h1>
          <p>Production-ready UI in one line of HTML.</p>
        </dvfy-section-hero>
      `);
      expect(el.querySelector('h1').textContent).to.equal('Ship faster.');
      expect(el.querySelector('p').textContent).to.equal('Production-ready UI in one line of HTML.');
    });

    it('renders the trust slot', async () => {
      const el = await fixture(html`
        <dvfy-section-hero>
          <h1>Title</h1>
          <div slot="trust">Trusted by 1,000+ teams</div>
        </dvfy-section-hero>
      `);
      expect(el.querySelector('[slot="trust"]').textContent).to.equal('Trusted by 1,000+ teams');
    });
  });

  describe('attributes', () => {
    it('accepts align attribute', async () => {
      const el = await fixture(html`<dvfy-section-hero align="left"><h1>T</h1></dvfy-section-hero>`);
      expect(getComputedStyle(el).textAlign).to.equal('left');
    });

    it('defaults to centered text', async () => {
      const el = await fixture(html`<dvfy-section-hero><h1>T</h1></dvfy-section-hero>`);
      expect(getComputedStyle(el).textAlign).to.equal('center');
    });

    it('accepts padding + tone attributes without error', async () => {
      const el = await fixture(html`<dvfy-section-hero padding="lg" tone="brand"><h1>T</h1></dvfy-section-hero>`);
      expect(el.getAttribute('padding')).to.equal('lg');
      expect(el.getAttribute('tone')).to.equal('brand');
    });
  });

  describe('regression — no-media hero is unchanged', () => {
    it('does NOT introduce a media wrapper or grid layout when no media slot is present', async () => {
      const el = await fixture(html`
        <dvfy-section-hero>
          <h1>Ship faster.</h1>
          <p>Body.</p>
        </dvfy-section-hero>
      `);
      // No media slot → no two-column grid; host stays block, content rail centered.
      expect(getComputedStyle(el).display).to.equal('block');
      expect(el.querySelector('[slot="media"]')).to.equal(null);
      // Direct children remain the authored content, not an injected wrapper.
      const kids = Array.from(el.children).map(c => c.tagName.toLowerCase());
      expect(kids).to.deep.equal(['h1', 'p']);
    });
  });

  describe('media slot', () => {
    it('renders an <img> placed in the media slot', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right">
          <h1>Title</h1>
          <p>Body</p>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      const media = el.querySelector('[slot="media"]');
      expect(media).to.exist;
      expect(media.tagName.toLowerCase()).to.equal('img');
      expect(media.getAttribute('alt')).to.equal('Hero');
    });

    it('renders a <dvfy-carousel> placed in the media slot', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="left">
          <h1>Title</h1>
          <dvfy-carousel slot="media" images='["/a.jpg","/b.jpg"]'></dvfy-carousel>
        </dvfy-section-hero>
      `);
      const media = el.querySelector('dvfy-carousel[slot="media"]');
      expect(media).to.exist;
      expect(media.tagName.toLowerCase()).to.equal('dvfy-carousel');
    });

    it('injects a two-cell grid (content + media) when media is present', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right">
          <h1>Title</h1>
          <p>Body</p>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      const grid = el.querySelector(':scope > .dvfy-hero-grid');
      expect(grid).to.exist;
      expect(getComputedStyle(grid).display).to.equal('grid');
      // Content children collected into the content cell; media is the sibling cell.
      const content = grid.querySelector(':scope > .dvfy-hero-content');
      expect(content.querySelector('h1')).to.exist;
      expect(content.querySelector('p')).to.exist;
      expect(grid.querySelector(':scope > [slot="media"]')).to.exist;
    });

    it('renders two grid columns at full container width (>=48rem)', async () => {
      const el = await fixture(html`
        <div style="width: 60rem;">
          <dvfy-section-hero media-position="right">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const grid = el.querySelector('.dvfy-hero-grid');
      expect(getComputedStyle(grid).gridTemplateColumns.split(' ').length).to.equal(2);
    });

    it('collapses media layout to a single column below the 48rem container breakpoint', async () => {
      const el = await fixture(html`
        <div style="width: 30rem;">
          <dvfy-section-hero media-position="right">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const grid = el.querySelector('.dvfy-hero-grid');
      // Below breakpoint → single track (stacked).
      expect(getComputedStyle(grid).gridTemplateColumns.split(' ').length).to.equal(1);
    });

    it('orders media before content for media-position="left" at wide widths', async () => {
      const el = await fixture(html`
        <div style="width: 60rem;">
          <dvfy-section-hero media-position="left">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const hero = el.querySelector('dvfy-section-hero');
      const media = hero.querySelector('[slot="media"]');
      // media-position=left → media column rendered first (order < content order).
      expect(getComputedStyle(media).order).to.equal('-1');
    });

    it('does NOT pull media first for media-position="right"', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      const media = el.querySelector('[slot="media"]');
      expect(getComputedStyle(media).order).to.equal('0');
    });

    it('mirrors the aspect-ratio attribute into --dvfy-hero-media-aspect', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right" aspect-ratio="16 / 9">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      expect(el.style.getPropertyValue('--dvfy-hero-media-aspect').trim()).to.equal('16 / 9');
    });

    it('updates the mirrored aspect-ratio when the attribute changes', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right" aspect-ratio="16 / 9">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      el.setAttribute('aspect-ratio', '4 / 3');
      expect(el.style.getPropertyValue('--dvfy-hero-media-aspect').trim()).to.equal('4 / 3');
    });

    it('clears the mirrored aspect-ratio when the attribute is removed', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right" aspect-ratio="16 / 9">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      el.removeAttribute('aspect-ratio');
      expect(el.style.getPropertyValue('--dvfy-hero-media-aspect')).to.equal('');
    });
  });

  describe('media sizing — bounded + responsive (regression: rueda full-bleed bug)', () => {
    // The cap defaults to var(--dvfy-container-md) (28rem = 448px). Tests provide that
    // token on the wrapper to mirror a themed app (the token bundle isn't auto-loaded
    // into the bare test page); the component references the real token, not a literal.
    const MEDIA_MAX_PX = 448;
    const TOKENS = '--dvfy-container-md: 28rem;';

    it('caps stacked media (media-position="above") to a bounded max-width, not none', async () => {
      const el = await fixture(html`
        <div style="width: 80rem; ${TOKENS}">
          <dvfy-section-hero media-position="above" aspect-ratio="4 / 3">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const media = el.querySelector('[slot="media"]');
      const maxWidth = getComputedStyle(media).maxWidth;
      expect(maxWidth).to.not.equal('none');
      // On a very wide host the media must NOT span the full hero width.
      expect(media.getBoundingClientRect().width).to.be.at.most(MEDIA_MAX_PX + 1);
    });

    it('caps stacked media (media-position="below") to a bounded max-width, not none', async () => {
      const el = await fixture(html`
        <div style="width: 80rem; ${TOKENS}">
          <dvfy-section-hero media-position="below" aspect-ratio="4 / 3">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const media = el.querySelector('[slot="media"]');
      expect(getComputedStyle(media).maxWidth).to.not.equal('none');
      expect(media.getBoundingClientRect().width).to.be.at.most(MEDIA_MAX_PX + 1);
    });

    it('centers the stacked media cell (margin-inline auto)', async () => {
      const el = await fixture(html`
        <div style="width: 80rem; ${TOKENS}">
          <dvfy-section-hero media-position="above">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const host = el.querySelector('dvfy-section-hero');
      const media = el.querySelector('[slot="media"]');
      // Geometry: a capped cell narrower than its full-width track sits centered,
      // so the gap to the host's left edge ≈ the gap to its right edge.
      const hostBox = host.getBoundingClientRect();
      const mediaBox = media.getBoundingClientRect();
      const leftGap = mediaBox.left - hostBox.left;
      const rightGap = hostBox.right - mediaBox.right;
      expect(leftGap).to.be.greaterThan(0);
      expect(Math.abs(leftGap - rightGap)).to.be.lessThan(2);
    });

    it('scales the stacked media DOWN on a narrow viewport without overflowing', async () => {
      const el = await fixture(html`
        <div style="width: 20rem; ${TOKENS}">
          <dvfy-section-hero media-position="above" aspect-ratio="4 / 3">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const host = el.querySelector('dvfy-section-hero');
      const media = el.querySelector('[slot="media"]');
      // Fluid below the cap: media width tracks down, never exceeding the host content box.
      expect(media.getBoundingClientRect().width)
        .to.be.at.most(host.getBoundingClientRect().width + 1);
    });

    it('bounds the 2-column media cell (media-position="right") so it cannot blow up', async () => {
      const el = await fixture(html`
        <div style="width: 80rem; ${TOKENS}">
          <dvfy-section-hero media-position="right" aspect-ratio="4 / 3">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const media = el.querySelector('[slot="media"]');
      // Even in the half-width column on a very wide host the media stays capped.
      expect(media.getBoundingClientRect().width).to.be.at.most(MEDIA_MAX_PX + 1);
    });

    it('exposes --dvfy-hero-media-max as an overridable consumer knob', async () => {
      const el = await fixture(html`
        <div style="width: 80rem; ${TOKENS}">
          <dvfy-section-hero media-position="above" aspect-ratio="4 / 3"
                             style="--dvfy-hero-media-max: 10rem;">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const media = el.querySelector('[slot="media"]');
      // 10rem override = 160px; media must respect it.
      expect(media.getBoundingClientRect().width).to.be.at.most(160 + 1);
    });
  });
});
