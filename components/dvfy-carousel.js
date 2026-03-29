/**
 * <dvfy-carousel> — Native CSS carousel with JS fallback.
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
 * Autoplay (5 seconds default, or specify seconds):
 *   <dvfy-carousel autoplay="5">...</dvfy-carousel>
 *   <dvfy-carousel autoplay="10">...</dvfy-carousel>
 *
 * Gap between slides:
 *   <dvfy-carousel gap>...</dvfy-carousel>
 *
 * Images from data:
 *   <dvfy-carousel images='[{"src":"a.jpg","alt":"A"},{"src":"b.jpg","alt":"B"}]'></dvfy-carousel>
 *   <dvfy-carousel images='["a.jpg","b.jpg","c.jpg"]'></dvfy-carousel>
 *
 * Dot position:
 *   <dvfy-carousel dot-position="top">...</dvfy-carousel>
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
 * @attr {number} autoplay - Seconds between slides. 0 or empty = off. Pauses on hover and focus. Disabled when prefers-reduced-motion is active.
 * @attr {boolean} gap - Add gap between slides
 * @attr {string} dot-position - Dot placement: bottom | top | left | right (default: "bottom")
 * @attr {string} images - JSON array of URLs or src/alt objects, e.g. ["a.jpg"] or [{ src, alt }]
 * @attr {string} aria-label - Accessible label for the carousel region (default: "Carousel")
 *
 * @slot - <dvfy-slide> elements (ignored when images attr is set)
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
 * <dvfy-carousel autoplay="5" dot-position="top" gap>
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
  gap: 0;
  scroll-marker-group: after;
  outline: none;
}
dvfy-carousel[gap] {
  gap: var(--dvfy-carousel-gap, var(--dvfy-space-4, 1rem));
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

/* ── Dot position (native path) ─────────────────────────────────── */
dvfy-carousel[dot-position="top"] { scroll-marker-group: before; }
dvfy-carousel[dot-position="top"]::scroll-marker-group {
  padding-block-start: 0;
  padding-block-end: var(--dvfy-space-2, 0.5rem);
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
dvfy-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--dvfy-radius-lg, 0.5rem);
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

/* ── JS Fallback (browsers without ::scroll-marker support) ──────── */
.dvfy-carousel-wrap {
  width: 100%;
}
.dvfy-carousel-wrap[data-dot-position="left"],
.dvfy-carousel-wrap[data-dot-position="right"] {
  display: flex;
}

.dvfy-carousel-nav {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2, 0.5rem);
}
.dvfy-carousel-nav dvfy-carousel {
  flex: 1;
  min-width: 0;
}
.dvfy-carousel-nav__btn {
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
.dvfy-carousel-nav__btn:hover {
  background: var(--dvfy-surface-overlay, var(--dvfy-surface-muted));
  box-shadow: var(--dvfy-shadow-lg);
}

/* ── Dots (JS fallback) ──────────────────────────────────────────── */
.dvfy-carousel-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--dvfy-space-1-5, 0.375rem);
  padding: var(--dvfy-space-2, 0.5rem) 0;
}
.dvfy-carousel-wrap[data-dot-position="left"] .dvfy-carousel-dots,
.dvfy-carousel-wrap[data-dot-position="right"] .dvfy-carousel-dots {
  flex-direction: column;
  padding: 0 var(--dvfy-space-2, 0.5rem);
}
.dvfy-carousel-dots__dot {
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
.dvfy-carousel-dots__dot--active {
  background: var(--dvfy-primary-bg);
  transform: scale(1.4);
}

/* ── Autoplay progress bar ──────────────────────────────────────── */
.dvfy-carousel-progress {
  height: 2px;
  background: var(--dvfy-primary-bg);
  width: 0;
  transition: none;
  pointer-events: none;
}
`;

/** True when native ::scroll-marker / ::scroll-button() is NOT available. */
function needsFallback() {
  return !CSS.supports('scroll-marker-group', 'after');
}

/**
 * Carousel container. Wraps dvfy-slide elements in a horizontally scrollable
 * snap container. Navigation buttons and pagination dots are rendered entirely
 * by CSS pseudo-elements on Chrome 135+; older browsers get equivalent JS-driven
 * buttons and dots injected alongside the element.
 *
 * @element dvfy-carousel
 *
 * @attr {boolean} peek - Show ~12% of adjacent slides to hint scrollability
 * @attr {number} autoplay - Seconds between slides, 0 = off
 * @attr {boolean} gap - Add gap between slides
 * @attr {string} dot-position - Dot placement: bottom | top | left | right (default: "bottom")
 * @attr {string} images - JSON array of URLs or objects with src/alt
 */
class DvfyCarousel extends HTMLElement {
  static #styled = false;
  /** Guard against re-init when the DOM wrapper triggers reconnect. */
  static #wrapping = new WeakSet();

  static get observedAttributes() { return ['autoplay', 'dot-position', 'images']; }

  #autoplayTimer = null;
  #userPaused = false;
  #progressEl = null;
  #progressRaf = null;
  #progressStart = 0;
  #autoplayMs = 0;
  #wrap = null;   // outer wrapper (.dvfy-carousel-wrap)
  #nav = null;    // flex row (.dvfy-carousel-nav)
  #dots = null;   // dots container (.dvfy-carousel-dots)

  connectedCallback() {
    if (!DvfyCarousel.#styled) {
      const s = document.createElement('style');
      s.textContent = CAROUSEL_STYLES;
      document.head.appendChild(s);
      DvfyCarousel.#styled = true;
    }

    if (DvfyCarousel.#wrapping.has(this)) {
      DvfyCarousel.#wrapping.delete(this);
      return;
    }

    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Carousel');
    }
    this.setAttribute('tabindex', '0');
    this.addEventListener('keydown', this.#onKey);

    if (this.hasAttribute('images')) this.#buildFromImages();

    this.addEventListener('mouseenter', this.#pauseAutoplay);
    this.addEventListener('mouseleave', this.#resumeAutoplay);
    this.addEventListener('focusin', this.#pauseAutoplay);
    this.addEventListener('focusout', this.#resumeAutoplay);
    this.addEventListener('pointerdown', this.#onUserInteract);

    if (needsFallback()) {
      queueMicrotask(() => {
        this.#initFallback();
        this.#startAutoplay();
      });
    } else {
      this.#startAutoplay();
    }
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKey);
    this.removeEventListener('mouseenter', this.#pauseAutoplay);
    this.removeEventListener('mouseleave', this.#resumeAutoplay);
    this.removeEventListener('focusin', this.#pauseAutoplay);
    this.removeEventListener('focusout', this.#resumeAutoplay);
    this.removeEventListener('pointerdown', this.#onUserInteract);
    this.#stopAutoplay();

    if (this.#progressEl?.isConnected) this.#progressEl.remove();
    this.#progressEl = null;
    if (this.#dots?.isConnected) this.#dots.remove();
    if (this.#wrap?.isConnected) {
      const parent = this.#wrap.parentNode;
      if (parent) {
        parent.insertBefore(this, this.#wrap);
        this.#wrap.remove();
      }
    }
    this.#wrap = null;
    this.#nav = null;
    this.#dots = null;
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'images') this.#buildFromImages();
    if (name === 'autoplay') {
      this.#stopAutoplay();
      this.#startAutoplay();
    }
    if (name === 'dot-position') this.#updateDotPosition();
  }

  // ── Images ───────────────────────────────────────────────────────

  #buildFromImages() {
    const raw = this.getAttribute('images');
    if (!raw) return;

    let items;
    try { items = JSON.parse(raw); } catch { return; }
    if (!Array.isArray(items) || !items.length) return;

    // Clear previously generated slides
    this.querySelectorAll(':scope > dvfy-slide[data-generated]').forEach(s => s.remove());

    for (const item of items) {
      const slide = document.createElement('dvfy-slide');
      slide.setAttribute('data-generated', '');
      const img = document.createElement('img');
      if (typeof item === 'string') {
        img.src = item;
        img.alt = '';
      } else {
        img.src = item.src || '';
        img.alt = item.alt || '';
      }
      slide.appendChild(img);
      this.appendChild(slide);
    }
  }

  // ── Autoplay ─────────────────────────────────────────────────────

  #startAutoplay() {
    const raw = parseFloat(this.getAttribute('autoplay'));
    if (!raw || raw <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.#autoplayMs = raw * 1000;
    this.#ensureProgressBar();
    this.#resetProgress();

    this.#autoplayTimer = setInterval(() => {
      if (this.#userPaused) return;
      this.#advance();
      this.#resetProgress();
    }, this.#autoplayMs);
  }

  #stopAutoplay() {
    clearInterval(this.#autoplayTimer);
    this.#autoplayTimer = null;
    if (this.#progressRaf) cancelAnimationFrame(this.#progressRaf);
    this.#progressRaf = null;
    if (this.#progressEl?.isConnected) this.#progressEl.remove();
    this.#progressEl = null;
  }

  #ensureProgressBar() {
    if (this.#progressEl) return;
    this.#progressEl = document.createElement('div');
    this.#progressEl.className = 'dvfy-carousel-progress';
    // Insert after the nav row, before the dots
    const container = this.#wrap || this.parentElement;
    if (container && this.#nav) {
      this.#nav.after(this.#progressEl);
    } else if (container) {
      container.appendChild(this.#progressEl);
    }
  }

  #resetProgress() {
    this.#progressStart = Date.now();
    if (this.#progressRaf) cancelAnimationFrame(this.#progressRaf);
    this.#tickProgress();
  }

  #tickProgress = () => {
    if (!this.#progressEl || !this.#autoplayMs) return;
    if (this.#userPaused) {
      this.#progressRaf = requestAnimationFrame(this.#tickProgress);
      return;
    }
    const elapsed = Date.now() - this.#progressStart;
    const pct = Math.min(elapsed / this.#autoplayMs, 1) * 100;
    this.#progressEl.style.width = `${pct}%`;
    if (pct < 100) this.#progressRaf = requestAnimationFrame(this.#tickProgress);
  };

  #pauseAutoplay = () => {
    this.#userPaused = true;
    // Freeze progress — store remaining time
    this.#pausedAt = Date.now();
  };

  #resumeAutoplay = () => {
    if (this.#userPaused && this.#pausedAt) {
      // Shift start forward by paused duration so progress resumes
      this.#progressStart += Date.now() - this.#pausedAt;
    }
    this.#userPaused = false;
    this.#pausedAt = 0;
    this.#tickProgress();
  };

  #pausedAt = 0;
  #onUserInteract = () => { this.#pauseAutoplay(); };

  #advance() {
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    if (slides.length < 2) return;

    const currentIdx = this.#getActiveIndex();
    const nextIdx = (currentIdx + 1) % slides.length;
    slides[nextIdx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  // ── Keyboard ─────────────────────────────────────────────────────

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

  // ── Active slide index ───────────────────────────────────────────

  #getActiveIndex() {
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    if (!slides.length) return 0;
    const carouselLeft = this.getBoundingClientRect().left;
    let idx = 0;
    let min = Infinity;
    slides.forEach((slide, i) => {
      const d = Math.abs(slide.getBoundingClientRect().left - carouselLeft);
      if (d < min) { min = d; idx = i; }
    });
    return idx;
  }

  // ── JS Fallback ──────────────────────────────────────────────────

  #initFallback() {
    if (!this.isConnected) return;

    const dotPos = this.getAttribute('dot-position') || 'bottom';

    // Outer wrapper for dot positioning
    const wrap = document.createElement('div');
    wrap.className = 'dvfy-carousel-wrap';
    wrap.dataset.dotPosition = dotPos;

    // Nav row: prev | carousel | next
    const nav = document.createElement('div');
    nav.className = 'dvfy-carousel-nav';

    const prev = document.createElement('button');
    prev.className = 'dvfy-carousel-nav__btn';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.textContent = '◀';

    const next = document.createElement('button');
    next.className = 'dvfy-carousel-nav__btn';
    next.setAttribute('aria-label', 'Next slide');
    next.textContent = '▶';

    // Dots
    const dots = document.createElement('div');
    dots.className = 'dvfy-carousel-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Slide navigation');

    // Move carousel into wrapper (triggers disconnect/reconnect — guard prevents re-init)
    DvfyCarousel.#wrapping.add(this);
    this.parentNode.insertBefore(wrap, this);
    nav.append(prev, this, next);

    // Place dots according to position
    if (dotPos === 'top' || dotPos === 'left') {
      wrap.append(dots, nav);
    } else {
      wrap.append(nav, dots);
    }

    this.#wrap = wrap;
    this.#nav = nav;
    this.#dots = dots;

    this.#buildDots();

    prev.addEventListener('click', () =>
      this.scrollBy({ left: -this.offsetWidth * 0.9, behavior: 'smooth' })
    );
    next.addEventListener('click', () =>
      this.scrollBy({ left: this.offsetWidth * 0.9, behavior: 'smooth' })
    );
    this.addEventListener('scroll', () => this.#syncDots(), { passive: true });
  }

  #buildDots() {
    if (!this.#dots) return;
    this.#dots.textContent = '';
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    slides.forEach((slide, i) => {
      const btn = document.createElement('button');
      btn.className = 'dvfy-carousel-dots__dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
      btn.addEventListener('click', () =>
        slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
      );
      this.#dots.appendChild(btn);
    });
    this.#syncDots();
  }

  #syncDots() {
    if (!this.#dots) return;
    const dots = Array.from(this.#dots.children);
    if (!dots.length) return;
    const activeIdx = this.#getActiveIndex();
    dots.forEach((dot, i) => {
      const active = i === activeIdx;
      dot.classList.toggle('dvfy-carousel-dots__dot--active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.setAttribute('tabindex', active ? '0' : '-1');
    });
  }

  // ── Dot position ─────────────────────────────────────────────────

  #updateDotPosition() {
    if (!this.#wrap || !this.#dots || !this.#nav) return;
    const pos = this.getAttribute('dot-position') || 'bottom';
    this.#wrap.dataset.dotPosition = pos;
    if (pos === 'top' || pos === 'left') {
      this.#wrap.insertBefore(this.#dots, this.#nav);
    } else {
      this.#wrap.appendChild(this.#dots);
    }
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
