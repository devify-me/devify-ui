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
 * @attr {string} dot-position - Dot placement: bottom | top | left | right (default: "bottom")
 * @attr {number} autoplay - Auto-advance interval in seconds; 0 or omitted = off
 * @attr {boolean} fullscreen - Display carousel in fullscreen mode with dark backdrop
 * @attr {boolean} expandable - Show expand button that enters fullscreen mode on click
 * @attr {string} images - JSON array of image URLs or objects with src and alt properties
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
 * <dvfy-carousel peek autoplay="5" images='[{"src":"photo1.jpg","alt":"Photo 1"},{"src":"photo2.jpg","alt":"Photo 2"}]'>
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
dvfy-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--dvfy-radius-lg, 0.5rem);
  display: block;
  user-select: none;
  -webkit-user-drag: none;
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
.dvfy-carousel-wrap {
  position: relative;
  width: 100%;
}
.dvfy-carousel-wrap[data-dot-position="left"],
.dvfy-carousel-wrap[data-dot-position="right"] {
  display: flex;
}
.dvfy-carousel-wrap[data-dot-position="left"] { flex-direction: row; }
.dvfy-carousel-wrap[data-dot-position="right"] { flex-direction: row; }

.dvfy-carousel-root {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2, 0.5rem);
  flex: 1;
  min-width: 0;
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
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--dvfy-primary-bg);
  transition: width 100ms linear;
  pointer-events: none;
  z-index: 1;
}

/* ── Fullscreen mode ────────────────────────────────────────────── */
.dvfy-carousel-fullscreen {
  position: fixed;
  inset: 0;
  z-index: var(--dvfy-z-modal, 1000);
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--dvfy-space-6, 1.5rem);
}
.dvfy-carousel-fullscreen dvfy-carousel {
  max-width: 100%;
  max-height: 80vh;
}
.dvfy-carousel-fullscreen dvfy-slide {
  display: flex;
  align-items: center;
  justify-content: center;
}
.dvfy-carousel-fullscreen dvfy-slide img {
  max-height: 80vh;
  object-fit: contain;
}
.dvfy-carousel-fullscreen__close {
  position: absolute;
  top: var(--dvfy-space-4, 1rem);
  right: var(--dvfy-space-4, 1rem);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--dvfy-radius-round, 9999px);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: var(--dvfy-text-lg, 1.125rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--dvfy-duration-fast, 150ms);
}
.dvfy-carousel-fullscreen__close:hover { background: rgba(255, 255, 255, 0.25); }

/* Expand button */
.dvfy-carousel-expand {
  position: absolute;
  top: var(--dvfy-space-2, 0.5rem);
  right: var(--dvfy-space-2, 0.5rem);
  width: 2rem;
  height: 2rem;
  border-radius: var(--dvfy-radius-md, 0.375rem);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  font-size: var(--dvfy-text-sm, 0.875rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--dvfy-duration-fast, 150ms);
  z-index: 1;
}
.dvfy-carousel-wrap:hover .dvfy-carousel-expand { opacity: 1; }
`;

/** True when native ::scroll-marker / ::scroll-button() is NOT available. */
function noScrollMarker() {
  return !CSS.supports('scroll-marker-group', 'after');
}

/** Check reduced motion preference */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
 * @attr {string} dot-position - Dot placement: bottom | top | left | right (default: "bottom")
 * @attr {number} autoplay - Auto-advance interval in seconds; 0 or omitted = off
 * @attr {boolean} fullscreen - Display carousel in fullscreen mode with dark backdrop
 * @attr {boolean} expandable - Show expand button that enters fullscreen mode on click
 * @attr {string} images - JSON array of image URLs or objects with src and alt properties
 * @attr {string} aria-label - Accessible label for the carousel region (default: "Carousel")
 */
class DvfyCarousel extends HTMLElement {
  static #styled = false;

  /** WeakSet of instances currently being moved into their fallback wrapper. */
  static #wrapping = new WeakSet();

  #autoplayTimer = null;
  #progressEl = null;
  #progressStart = 0;
  #progressRaf = null;
  #fullscreenEl = null;
  #expandBtn = null;

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

    // Generate slides from images attribute if present
    if (this.hasAttribute('images')) {
      this.#buildFromImages();
    }

    // JS fallback: inject wrapper + buttons + dots when CSS API unavailable
    if (noScrollMarker()) {
      // Defer so declarative children are in the DOM before we count slides
      queueMicrotask(() => this.#initFallback());
    }

    // Autoplay
    queueMicrotask(() => this.#initAutoplay());

    // Expandable button
    queueMicrotask(() => this.#initExpandable());
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKey);
    this.#stopAutoplay();
    this.#exitFullscreen();

    if (this.#expandBtn?.isConnected) this.#expandBtn.remove();
    this.#expandBtn = null;

    // Tear down fallback DOM when the carousel is removed
    if (this._fbDots?.isConnected) this._fbDots.remove();
    if (this._fbWrap?.isConnected) {
      const parent = this._fbWrap.parentNode;
      if (parent) {
        parent.insertBefore(this, this._fbWrap);
        this._fbWrap.remove();
      }
    }
    this._fbRoot = null;
    this._fbDots = null;
    this._fbWrap = null;
  }

  static get observedAttributes() { return ['autoplay', 'fullscreen', 'dot-position', 'images']; }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'autoplay') {
      this.#stopAutoplay();
      this.#initAutoplay();
    }
    if (name === 'fullscreen') {
      if (this.hasAttribute('fullscreen')) this.#enterFullscreen();
      else this.#exitFullscreen();
    }
    if (name === 'dot-position') {
      this.#updateDotPosition();
    }
    if (name === 'images') {
      this.#buildFromImages();
    }
  }

  // ── Image data ─────────────────────────────────────────────────────

  #buildFromImages() {
    const raw = this.getAttribute('images');
    if (!raw) return;

    let items;
    try {
      items = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(items) || !items.length) return;

    // Clear existing generated slides
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

  // ── Keyboard navigation ───────────────────────────────────────────

  #onKey = (e) => {
    if (e.key === 'Escape' && this.hasAttribute('fullscreen')) {
      e.preventDefault();
      this.removeAttribute('fullscreen');
      return;
    }
    const amount = this.offsetWidth * 0.9;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.scrollBy({ left: amount, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.scrollBy({ left: -amount, behavior: 'smooth' });
    }
  };

  // ── Autoplay ──────────────────────────────────────────────────────

  #initAutoplay() {
    const seconds = parseFloat(this.getAttribute('autoplay'));
    if (!seconds || seconds <= 0 || prefersReducedMotion()) return;

    const ms = seconds * 1000;

    // Pause on hover/focus
    this.addEventListener('mouseenter', this.#pauseAutoplay);
    this.addEventListener('focusin', this.#pauseAutoplay);
    this.addEventListener('mouseleave', this.#resumeAutoplay);
    this.addEventListener('focusout', this.#resumeAutoplay);

    this.#startAutoplayTimer(ms);
  }

  #startAutoplayTimer(ms) {
    this.#stopAutoplayTimer();
    this.#progressStart = Date.now();

    // Create progress bar if not exists
    const wrap = this._fbWrap || this.parentElement;
    if (wrap && !this.#progressEl) {
      this.#progressEl = document.createElement('div');
      this.#progressEl.className = 'dvfy-carousel-progress';
      // Place progress bar inside the carousel-root or wrap
      const root = this._fbRoot || wrap;
      if (root.style) root.style.position = 'relative';
      root.appendChild(this.#progressEl);
    }

    this.#autoplayTimer = setInterval(() => this.#advanceSlide(), ms);
    this.#animateProgress(ms);
  }

  #stopAutoplayTimer() {
    if (this.#autoplayTimer) {
      clearInterval(this.#autoplayTimer);
      this.#autoplayTimer = null;
    }
    if (this.#progressRaf) {
      cancelAnimationFrame(this.#progressRaf);
      this.#progressRaf = null;
    }
  }

  #stopAutoplay() {
    this.#stopAutoplayTimer();
    this.removeEventListener('mouseenter', this.#pauseAutoplay);
    this.removeEventListener('focusin', this.#pauseAutoplay);
    this.removeEventListener('mouseleave', this.#resumeAutoplay);
    this.removeEventListener('focusout', this.#resumeAutoplay);
    if (this.#progressEl?.isConnected) this.#progressEl.remove();
    this.#progressEl = null;
  }

  #pauseAutoplay = () => {
    this.#stopAutoplayTimer();
    if (this.#progressEl) this.#progressEl.style.width = '0';
  };

  #resumeAutoplay = () => {
    const seconds = parseFloat(this.getAttribute('autoplay'));
    if (seconds > 0 && !prefersReducedMotion()) {
      this.#startAutoplayTimer(seconds * 1000);
    }
  };

  #advanceSlide() {
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    if (!slides.length) return;

    const currentIdx = this.#getActiveIndex();
    const nextIdx = (currentIdx + 1) % slides.length;
    slides[nextIdx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });

    // Reset progress
    const seconds = parseFloat(this.getAttribute('autoplay'));
    if (seconds > 0) {
      this.#progressStart = Date.now();
      this.#animateProgress(seconds * 1000);
    }
  }

  #animateProgress(ms) {
    if (this.#progressRaf) cancelAnimationFrame(this.#progressRaf);
    const tick = () => {
      if (!this.#progressEl) return;
      const elapsed = Date.now() - this.#progressStart;
      const pct = Math.min(elapsed / ms, 1) * 100;
      this.#progressEl.style.width = `${pct}%`;
      if (pct < 100) this.#progressRaf = requestAnimationFrame(tick);
    };
    this.#progressRaf = requestAnimationFrame(tick);
  }

  // ── Fullscreen ────────────────────────────────────────────────────

  #enterFullscreen() {
    if (this.#fullscreenEl) return;

    const overlay = document.createElement('div');
    overlay.className = 'dvfy-carousel-fullscreen';

    const close = document.createElement('button');
    close.className = 'dvfy-carousel-fullscreen__close';
    close.setAttribute('aria-label', 'Exit fullscreen');
    close.textContent = '✕';
    close.addEventListener('click', () => this.removeAttribute('fullscreen'));

    // Clone slides into fullscreen overlay
    const clone = this.cloneNode(true);
    clone.removeAttribute('fullscreen');
    clone.removeAttribute('expandable');
    clone.removeAttribute('tabindex');

    overlay.append(close, clone);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.removeAttribute('fullscreen');
    });

    // Close on Escape
    this.#fsKeyHandler = (e) => {
      if (e.key === 'Escape') this.removeAttribute('fullscreen');
    };
    document.addEventListener('keydown', this.#fsKeyHandler);

    document.body.appendChild(overlay);
    this.#fullscreenEl = overlay;
    close.focus();
  }

  #fsKeyHandler = null;

  #exitFullscreen() {
    if (this.#fullscreenEl?.isConnected) {
      this.#fullscreenEl.remove();
    }
    this.#fullscreenEl = null;
    if (this.#fsKeyHandler) {
      document.removeEventListener('keydown', this.#fsKeyHandler);
      this.#fsKeyHandler = null;
    }
  }

  // ── Expandable button ─────────────────────────────────────────────

  #initExpandable() {
    if (!this.hasAttribute('expandable') || this.#expandBtn) return;

    const wrap = this._fbWrap || this.parentElement;
    if (!wrap) return;

    const btn = document.createElement('button');
    btn.className = 'dvfy-carousel-expand';
    btn.setAttribute('aria-label', 'Expand to fullscreen');
    btn.textContent = '⛶';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setAttribute('fullscreen', '');
    });

    // Expandable button needs a positioned parent
    const target = this._fbWrap || this;
    if (target !== this) {
      target.style.position = 'relative';
      target.appendChild(btn);
    } else {
      // No fallback wrapper — wrap just for the button
      if (this.parentElement) {
        const span = document.createElement('span');
        span.style.position = 'relative';
        span.style.display = 'block';
        this.parentElement.insertBefore(span, this);
        span.appendChild(this);
        span.appendChild(btn);
      }
    }
    this.#expandBtn = btn;
  }

  // ── Dot position ──────────────────────────────────────────────────

  #updateDotPosition() {
    const pos = this.getAttribute('dot-position') || 'bottom';
    if (this._fbWrap) {
      this._fbWrap.dataset.dotPosition = pos;
    }
    // Move dots element for top vs bottom in fallback
    if (this._fbDots && this._fbRoot && this._fbWrap) {
      if (pos === 'top') {
        this._fbWrap.insertBefore(this._fbDots, this._fbRoot);
      } else if (pos === 'left' || pos === 'right') {
        // Dots beside the root
        if (pos === 'left') {
          this._fbWrap.insertBefore(this._fbDots, this._fbRoot);
        } else {
          this._fbWrap.appendChild(this._fbDots);
        }
      } else {
        // bottom (default) — dots after root
        this._fbRoot.after(this._fbDots);
      }
    }
  }

  // ── Helper ────────────────────────────────────────────────────────

  #getActiveIndex() {
    const slides = Array.from(this.querySelectorAll(':scope > dvfy-slide'));
    let activeIdx = 0;
    let minDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - this.scrollLeft);
      if (dist < minDist) { minDist = dist; activeIdx = i; }
    });
    return activeIdx;
  }

  // ── JS fallback ───────────────────────────────────────────────────

  #initFallback() {
    if (!this.isConnected) return;

    const dotPos = this.getAttribute('dot-position') || 'bottom';

    // Outer wrap for dot positioning
    const wrap = document.createElement('div');
    wrap.className = 'dvfy-carousel-wrap';
    wrap.dataset.dotPosition = dotPos;

    // Inner: flex row with prev | carousel | next
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

    // Dots
    const dotsEl = document.createElement('div');
    dotsEl.className = 'dvfy-carousel-dots';
    dotsEl.setAttribute('role', 'tablist');
    dotsEl.setAttribute('aria-label', 'Slide navigation');

    // Move this element into the wrapper
    DvfyCarousel.#wrapping.add(this);
    this.parentNode.insertBefore(wrap, this);
    root.append(prev, this, next);

    // Place dots according to position
    if (dotPos === 'top') {
      wrap.append(dotsEl, root);
    } else if (dotPos === 'left') {
      wrap.append(dotsEl, root);
    } else if (dotPos === 'right') {
      wrap.append(root, dotsEl);
    } else {
      wrap.append(root, dotsEl);
    }

    this._fbWrap = wrap;
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
      btn.className = 'dvfy-carousel-dots__dot';
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

    const activeIdx = this.#getActiveIndex();

    dots.forEach((dot, i) => {
      const active = i === activeIdx;
      dot.classList.toggle('dvfy-carousel-dots__dot--active', active);
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
