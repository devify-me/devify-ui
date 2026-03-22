/**
 * <dvfy-carousel> — Native CSS carousel with zero JavaScript navigation.
 *
 * Uses CSS `::scroll-button()` and `::scroll-marker` pseudo-elements (Chrome 135+)
 * for prev/next buttons and pagination dots. Falls back to JS-driven buttons and
 * dots on older browsers — content remains fully accessible via swipe/scroll/keyboard.
 *
 * Usage:
 *   <dvfy-carousel>
 *     <dvfy-slide>Slide 1</dvfy-slide>
 *     <dvfy-slide>Slide 2</dvfy-slide>
 *     <dvfy-slide>Slide 3</dvfy-slide>
 *   </dvfy-carousel>
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
 * <dvfy-carousel peek>
 *   <dvfy-slide><img src="photo1.jpg" alt="Photo 1" style="width:100%;border-radius:var(--dvfy-radius-lg)"></dvfy-slide>
 *   <dvfy-slide><img src="photo2.jpg" alt="Photo 2" style="width:100%;border-radius:var(--dvfy-radius-lg)"></dvfy-slide>
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

/* ── JS Fallback wrapper (browsers without ::scroll-marker support) ── */
.dvfy-carousel-root {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2, 0.5rem);
}
.dvfy-carousel-root dvfy-carousel {
  flex: 1;
  min-width: 0;
}
.dvfy-carousel-root__btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--dvfy-radius-round, 9999px);
  background: var(--dvfy-surface-raised, var(--dvfy-surface-default, #fff));
  border: 1px solid var(--dvfy-border-default);
  color: var(--dvfy-text-primary);
  font-size: var(--dvfy-text-base, 1rem);
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--dvfy-shadow-md);
  transition: background var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              box-shadow var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
.dvfy-carousel-root__btn:hover {
  background: var(--dvfy-surface-overlay, var(--dvfy-surface-muted));
  box-shadow: var(--dvfy-shadow-lg);
}
.dvfy-carousel-root__btn:disabled {
  opacity: 0.3;
  cursor: default;
  box-shadow: none;
}
.dvfy-carousel-root__dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--dvfy-space-1-5, 0.375rem);
  padding-block-start: var(--dvfy-space-2, 0.5rem);
}
.dvfy-carousel-root__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--dvfy-radius-round, 9999px);
  background: var(--dvfy-border-default);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out),
              transform var(--dvfy-duration-fast, 150ms) var(--dvfy-ease-out, ease-out);
}
.dvfy-carousel-root__dot--active {
  background: var(--dvfy-primary-bg);
  transform: scale(1.4);
}
`;

/** True when native ::scroll-marker / ::scroll-button() is NOT available. */
function noScrollMarker() {
  return !CSS.supports('scroll-marker-group', 'after');
}

/**
 * Carousel container. Wraps dvfy-slide elements in a horizontally scrollable
 * snap container. Navigation buttons and pagination dots are rendered entirely
 * by CSS pseudo-elements on Chrome 135+; older browsers get equivalent JS-driven
 * buttons and dots injected alongside the element.
 *
 * @element dvfy-carousel
 */
class DvfyCarousel extends HTMLElement {
  static #styled = false;

  /** WeakSet of instances currently being moved into their fallback wrapper. */
  static #wrapping = new WeakSet();

  connectedCallback() {
    if (!DvfyCarousel.#styled) {
      const s = document.createElement('style');
      s.textContent = CAROUSEL_STYLES;
      document.head.appendChild(s);
      DvfyCarousel.#styled = true;
    }

    // Guard: re-connection triggered by the wrapper insertion — skip re-init.
    if (DvfyCarousel.#wrapping.has(this)) {
      DvfyCarousel.#wrapping.delete(this);
      return;
    }

    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Carousel');
    }
    // Keyboard: left/right arrows scroll the carousel
    this.setAttribute('tabindex', '0');
    this.addEventListener('keydown', this.#onKey);

    // JS fallback: inject wrapper + buttons + dots when CSS API unavailable
    if (noScrollMarker()) {
      // Defer so declarative children are in the DOM before we count slides
      queueMicrotask(() => this.#initFallback());
    }
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKey);
    // Tear down fallback DOM when the carousel is removed
    if (this._fbDots?.isConnected) this._fbDots.remove();
    if (this._fbRoot?.isConnected) {
      const parent = this._fbRoot.parentNode;
      if (parent) {
        parent.insertBefore(this, this._fbRoot);
        this._fbRoot.remove();
      }
    }
    this._fbRoot = null;
    this._fbDots = null;
  }

  // ── Keyboard navigation ───────────────────────────────────────────

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

  // ── JS fallback ───────────────────────────────────────────────────

  #initFallback() {
    if (!this.isConnected) return;

    // Wrapper: flex row with prev | carousel | next
    const root = document.createElement('div');
    root.className = 'dvfy-carousel-root';

    const prev = document.createElement('button');
    prev.className = 'dvfy-carousel-root__btn';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.textContent = '◀';

    const next = document.createElement('button');
    next.className = 'dvfy-carousel-root__btn';
    next.setAttribute('aria-label', 'Next slide');
    next.textContent = '▶';

    // Dots row rendered below the wrapper
    const dotsEl = document.createElement('div');
    dotsEl.className = 'dvfy-carousel-root__dots';
    dotsEl.setAttribute('role', 'tablist');
    dotsEl.setAttribute('aria-label', 'Slide navigation');

    // Move this element into the wrapper (triggers disconnect + reconnect;
    // #wrapping guard prevents re-init on the reconnect).
    DvfyCarousel.#wrapping.add(this);
    this.parentNode.insertBefore(root, this);
    root.append(prev, this, next);
    root.after(dotsEl);

    this._fbRoot = root;
    this._fbDots = dotsEl;

    // Build dots now that slides are accessible
    this.#buildDots(dotsEl);

    prev.addEventListener('click', () =>
      this.scrollBy({ left: -this.offsetWidth * 0.9, behavior: 'smooth' })
    );
    next.addEventListener('click', () =>
      this.scrollBy({ left: this.offsetWidth * 0.9, behavior: 'smooth' })
    );
    this.addEventListener('scroll', () => this.#syncDots(dotsEl), { passive: true });
    this.#syncDots(dotsEl);
  }

  #buildDots(dotsEl) {
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    slides.forEach((slide, i) => {
      const btn = document.createElement('button');
      btn.className = 'dvfy-carousel-root__dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
      btn.addEventListener('click', () =>
        slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
      );
      dotsEl.appendChild(btn);
    });
    this.#syncDots(dotsEl);
  }

  #syncDots(dotsEl) {
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    const dots = Array.from(dotsEl.children);
    if (!slides.length || !dots.length) return;

    // Find slide whose left edge is closest to the current scroll position
    let activeIdx = 0;
    let minDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - this.scrollLeft);
      if (dist < minDist) { minDist = dist; activeIdx = i; }
    });

    dots.forEach((dot, i) => {
      const active = i === activeIdx;
      dot.classList.toggle('dvfy-carousel-root__dot--active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.setAttribute('tabindex', active ? '0' : '-1');
    });
  }
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
