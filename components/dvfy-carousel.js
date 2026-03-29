/**
 * <dvfy-carousel> — Native CSS carousel with zero JavaScript navigation.
 *
 * Uses CSS `::scroll-button()` and `::scroll-marker` pseudo-elements (Chrome 135+)
 * for prev/next buttons and pagination dots. Falls back gracefully to plain
 * `scroll-snap` on older browsers — content remains fully accessible via swipe/scroll.
 *
 * Usage:
 *   <dvfy-carousel>
 *     <dvfy-slide>Slide 1</dvfy-slide>
 *     <dvfy-slide>Slide 2</dvfy-slide>
 *     <dvfy-slide>Slide 3</dvfy-slide>
 *   </dvfy-carousel>
 *
 * Autoplay (5 s default, or specify ms):
 *   <dvfy-carousel autoplay>...</dvfy-carousel>
 *   <dvfy-carousel autoplay="3000">...</dvfy-carousel>
 *
 * Custom gap:
 *   <dvfy-carousel gap="2rem">...</dvfy-carousel>
 *
 * Partial-slide peek (shows edge of next slide):
 *   <dvfy-carousel peek>
 *     ...slides
 *   </dvfy-carousel>
 *
 * Multi-column (2 slides visible at once):
 *   <dvfy-carousel style="--dvfy-carousel-slide-width: 50%">
 *     ...slides
 *   </dvfy-carousel>
 *
 * @element dvfy-carousel
 *
 * @attr {boolean} peek - Show ~12% of adjacent slides to hint scrollability
 * @attr {boolean|number} autoplay - Auto-advance slides. Value is the interval in ms (default: 5000). Pauses on hover, focus, or user interaction. Disabled when prefers-reduced-motion is active.
 * @attr {string} gap - Gap between slides (e.g. "1rem", "16px"). Maps to --dvfy-carousel-gap.
 * @attr {string} aria-label - Accessible label for the carousel region (default: "Carousel")
 *
 * @slot - <dvfy-slide> elements
 *
 * @cssprop {length} --dvfy-carousel-gap - Gap between slides (default: var(--dvfy-space-4))
 * @cssprop {length} --dvfy-carousel-slide-width - Width of each slide (default: 100%)
 *
 * @example
 * <dvfy-carousel>
 *   <dvfy-slide><dvfy-card padded><h3>Slide One</h3><p>Card content.</p></dvfy-card></dvfy-slide>
 *   <dvfy-slide><dvfy-card padded><h3>Slide Two</h3><p>Card content.</p></dvfy-card></dvfy-slide>
 *   <dvfy-slide><dvfy-card padded><h3>Slide Three</h3><p>Card content.</p></dvfy-card></dvfy-slide>
 * </dvfy-carousel>
 *
 * @example
 * <dvfy-carousel autoplay gap="1rem">
 *   <dvfy-slide><dvfy-card padded><h3>Auto 1</h3></dvfy-card></dvfy-slide>
 *   <dvfy-slide><dvfy-card padded><h3>Auto 2</h3></dvfy-card></dvfy-slide>
 * </dvfy-carousel>
 */

const CAROUSEL_STYLES = `
dvfy-carousel {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  gap: var(--dvfy-carousel-gap, var(--dvfy-space-4, 1rem));
  scroll-marker-group: after;
  outline: none;
}
dvfy-carousel::-webkit-scrollbar { display: none; }

/* ── Peek mode — show ~88% of each slide, hinting that more exists ── */
dvfy-carousel[peek] {
  --dvfy-carousel-slide-width: 88%;
  padding-inline: calc((100% - var(--dvfy-carousel-slide-width, 88%)) / 2);
}

/* ── Prev / Next buttons — Chrome 135+ ::scroll-button() ─────────── */
dvfy-carousel::scroll-button(inline-start),
dvfy-carousel::scroll-button(inline-end) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: var(--dvfy-radius-round);
  background: var(--dvfy-surface-raised, var(--dvfy-surface-default, #fff));
  border: var(--dvfy-border-1, 1px) solid var(--dvfy-border-default);
  color: var(--dvfy-text-primary);
  font-size: var(--dvfy-text-base, 1rem);
  line-height: 1;
  cursor: pointer;
  align-self: center;
  box-shadow: var(--dvfy-shadow-md);
  transition: background var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              box-shadow var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
dvfy-carousel::scroll-button(inline-start) {
  content: "◀" / "Previous slide";
}
dvfy-carousel::scroll-button(inline-end) {
  content: "▶" / "Next slide";
}
dvfy-carousel::scroll-button(inline-start):hover,
dvfy-carousel::scroll-button(inline-end):hover {
  background: var(--dvfy-surface-overlay, var(--dvfy-surface-muted));
  box-shadow: var(--dvfy-shadow-lg);
}
dvfy-carousel::scroll-button(inline-start):disabled,
dvfy-carousel::scroll-button(inline-end):disabled {
  opacity: 0.3;
  cursor: default;
  box-shadow: none;
}

/* ── Pagination dots — Chrome 135+ ::scroll-marker ────────────────── */
dvfy-carousel::scroll-marker-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--dvfy-space-1-5, 0.375rem);
  padding-block-start: var(--dvfy-space-2, 0.5rem);
}

/* ── Slides ──────────────────────────────────────────────────────── */
dvfy-slide {
  display: block;
  scroll-snap-align: start;
  flex: 0 0 var(--dvfy-carousel-slide-width, 100%);
  min-width: 0;
}

dvfy-slide::scroll-marker {
  content: "";
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--dvfy-radius-round, 9999px);
  background: var(--dvfy-border-default);
  transition: background var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              transform var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
dvfy-slide::scroll-marker:target-current {
  background: var(--dvfy-primary-bg);
  transform: scale(1.4);
}
`;

/**
 * Carousel container. Wraps dvfy-slide elements in a horizontally scrollable
 * snap container. Navigation buttons and pagination dots are rendered entirely
 * by CSS pseudo-elements on Chrome 135+; older browsers see a plain swipeable
 * scroll area.
 *
 * @element dvfy-carousel
 */
class DvfyCarousel extends HTMLElement {
  static #styled = false;
  static get observedAttributes() { return ['gap', 'autoplay']; }

  #autoplayTimer = null;
  #userPaused = false;

  connectedCallback() {
    if (!DvfyCarousel.#styled) {
      const s = document.createElement('style');
      s.textContent = CAROUSEL_STYLES;
      document.head.appendChild(s);
      DvfyCarousel.#styled = true;
    }
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Carousel');
    }
    this.setAttribute('tabindex', '0');
    this.addEventListener('keydown', this.#onKey);

    this.#applyGap();
    this.#startAutoplay();

    // Pause autoplay on hover / focus-within
    this.addEventListener('mouseenter', this.#pauseAutoplay);
    this.addEventListener('mouseleave', this.#resumeAutoplay);
    this.addEventListener('focusin', this.#pauseAutoplay);
    this.addEventListener('focusout', this.#resumeAutoplay);
    // Pause when user manually scrolls
    this.addEventListener('pointerdown', this.#onUserInteract);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKey);
    this.removeEventListener('mouseenter', this.#pauseAutoplay);
    this.removeEventListener('mouseleave', this.#resumeAutoplay);
    this.removeEventListener('focusin', this.#pauseAutoplay);
    this.removeEventListener('focusout', this.#resumeAutoplay);
    this.removeEventListener('pointerdown', this.#onUserInteract);
    this.#stopAutoplay();
  }

  attributeChangedCallback(name) {
    if (name === 'gap') this.#applyGap();
    if (name === 'autoplay') {
      this.#stopAutoplay();
      this.#startAutoplay();
    }
  }

  #applyGap() {
    const gap = this.getAttribute('gap');
    if (gap) {
      this.style.setProperty('--dvfy-carousel-gap', gap);
    } else {
      this.style.removeProperty('--dvfy-carousel-gap');
    }
  }

  #startAutoplay() {
    if (!this.hasAttribute('autoplay')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const raw = this.getAttribute('autoplay');
    const delay = raw && /^\d+$/.test(raw) ? Number(raw) : 5000;

    this.#autoplayTimer = setInterval(() => {
      if (this.#userPaused) return;
      this.#advance();
    }, delay);
  }

  #stopAutoplay() {
    clearInterval(this.#autoplayTimer);
    this.#autoplayTimer = null;
  }

  #pauseAutoplay = () => { this.#userPaused = true; };
  #resumeAutoplay = () => { this.#userPaused = false; };
  #onUserInteract = () => { this.#userPaused = true; };

  #advance() {
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    if (slides.length < 2) return;

    const slideWidth = this.offsetWidth;
    const currentIdx = Math.round(this.scrollLeft / slideWidth);
    const nextIdx = (currentIdx + 1) % slides.length;
    this.scrollTo({ left: nextIdx * slideWidth, behavior: 'smooth' });
  }

  #onKey = (e) => {
    const amount = this.offsetWidth * 0.9;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.scrollBy({ left: amount, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.scrollBy({ left: -amount, behavior: 'smooth' });
    }
  };
}

/**
 * Individual slide within a dvfy-carousel container.
 *
 * @element dvfy-slide
 *
 * @slot - Slide content (images, cards, text, etc.)
 */
class DvfySlide extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-roledescription')) {
      this.setAttribute('aria-roledescription', 'slide');
    }
    if (!this.hasAttribute('aria-label')) {
      // Defer label assignment so all siblings are in the DOM
      queueMicrotask(() => this.#updateLabel());
    }
  }

  #updateLabel() {
    const siblings = Array.from(
      this.closest('dvfy-carousel')?.querySelectorAll(':scope > dvfy-slide') ?? []
    );
    const idx = siblings.indexOf(this);
    if (idx >= 0) {
      this.setAttribute('aria-label', `${idx + 1} of ${siblings.length}`);
    }
  }
}

customElements.define('dvfy-carousel', DvfyCarousel);
customElements.define('dvfy-slide', DvfySlide);
