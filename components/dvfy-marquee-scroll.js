/**
 * <dvfy-marquee-scroll> — Velocity-driven scroll-accelerated marquee
 *
 * Content loops horizontally. Page-scroll velocity temporarily boosts marquee
 * speed; the boost decays back to base speed via linear interpolation (lerp).
 *
 * Attributes:
 *   speed:      number  — Base pixels per frame (default: 1)
 *   direction:  string  — left | right (default: "left")
 *   multiplier: number  — Scroll velocity → speed multiplier (default: 3)
 *   gap:        string  — CSS column-gap between looped content copies (default: "4rem")
 *
 * CSS Custom Properties:
 *   --dvfy-marquee-bg       Background color; also used for edge-fade (default: transparent)
 *   --dvfy-marquee-gap      Gap between content copies (default: 4rem)
 *   --dvfy-marquee-padding  Block padding (default: var(--dvfy-space-4, 1rem))
 *   --dvfy-marquee-fade     Edge-fade width; set to 0 to disable (default: 4rem)
 *
 * Usage:
 *   <dvfy-marquee-scroll>
 *     <span>Design Systems</span>
 *     <span>Web Components</span>
 *     <span>Zero Build</span>
 *   </dvfy-marquee-scroll>
 *
 *   <dvfy-marquee-scroll direction="right" speed="1.5" multiplier="5">
 *     <strong>Scroll down to accelerate →</strong>
 *   </dvfy-marquee-scroll>
 */

const STYLES = `
dvfy-marquee-scroll {
  display: block;
  overflow: hidden;
  position: relative;
  padding-block: var(--dvfy-marquee-padding, var(--dvfy-space-4, 1rem));
  background: var(--dvfy-marquee-bg, transparent);
}

/* Optional edge fades — only visible when --dvfy-marquee-bg is set */
dvfy-marquee-scroll::before,
dvfy-marquee-scroll::after {
  content: '';
  position: absolute;
  inset-block: 0;
  width: var(--dvfy-marquee-fade, 4rem);
  z-index: 1;
  pointer-events: none;
}

dvfy-marquee-scroll::before {
  inset-inline-start: 0;
  background: linear-gradient(to right, var(--dvfy-marquee-bg, transparent), transparent);
}

dvfy-marquee-scroll::after {
  inset-inline-end: 0;
  background: linear-gradient(to left, var(--dvfy-marquee-bg, transparent), transparent);
}

dvfy-marquee-scroll .dvfy-marquee-track {
  display: flex;
  align-items: center;
  width: max-content;
  will-change: transform;
}

dvfy-marquee-scroll .dvfy-marquee-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--dvfy-marquee-gap, 4rem);
  padding-inline-end: var(--dvfy-marquee-gap, 4rem);
}
`;

/**
 * Velocity-driven scroll-accelerated marquee. Content loops continuously;
 * scrolling the page temporarily accelerates the marquee, with smooth lerp
 * deceleration back to base speed.
 *
 * @element dvfy-marquee-scroll
 *
 * @attr {number} speed - Base scroll speed in px/frame (default: 1)
 * @attr {string} direction - Scroll direction: left | right (default: "left")
 * @attr {number} multiplier - Scroll velocity to speed multiplier (default: 3)
 * @attr {string} gap - CSS gap between looped content copies (default: "4rem")
 *
 * @slot - Content to be looped in the marquee
 *
 * @cssprop {color} --dvfy-marquee-bg - Background and edge-fade color
 * @cssprop {length} --dvfy-marquee-gap - Gap between content copies (default: 4rem)
 * @cssprop {length} --dvfy-marquee-padding - Block padding (default: 1rem)
 * @cssprop {length} --dvfy-marquee-fade - Edge fade overlay width (default: 4rem)
 */
class DvfyMarqueeScroll extends HTMLElement {
  static #styled = false;

  /** @type {HTMLElement|null} */
  #track = null;

  /** @type {number} Current translateX position in px */
  #position = 0;

  /** @type {number} Scroll velocity contribution (px/frame equivalent) */
  #velocity = 0;

  /** @type {number|null} requestAnimationFrame handle */
  #rafId = null;

  /** @type {number} Width of a single content copy including trailing gap (px) */
  #singleWidth = 0;

  /** @type {number} Last window.scrollY reading */
  #lastScrollY = 0;

  /** @type {number} Timestamp of last scroll event */
  #lastScrollTime = 0;

  /** @type {boolean} True when prefers-reduced-motion is active */
  #reducedMotion = false;

  /** @type {MediaQueryList} */
  #motionQuery = null;

  connectedCallback() {
    if (!DvfyMarqueeScroll.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyMarqueeScroll.#styled = true;
    }

    this.#render();
    this.#setupMotionQuery();
    this.#lastScrollY = window.scrollY;
    this.#lastScrollTime = performance.now();
    window.addEventListener('scroll', this.#onScroll, { passive: true });
    this.#startLoop();
  }

  disconnectedCallback() {
    this.#stopLoop();
    window.removeEventListener('scroll', this.#onScroll);
    if (this.#motionQuery) {
      this.#motionQuery.removeEventListener('change', this.#onMotionChange);
    }
  }

  static get observedAttributes() {
    return ['speed', 'direction', 'multiplier', 'gap'];
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'gap') {
      this.#syncGapAttr();
      requestAnimationFrame(() => this.#measureTrack());
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  #render() {
    // Capture original children before clearing DOM
    const originalNodes = [...this.childNodes];

    // Accessible screen-reader label from original text content
    const srLabel = document.createElement('span');
    srLabel.style.cssText =
      'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    srLabel.textContent = this.textContent.trim();

    // Build track with 2 copies for seamless looping
    const track = document.createElement('div');
    track.className = 'dvfy-marquee-track';
    track.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 2; i++) {
      const item = document.createElement('div');
      item.className = 'dvfy-marquee-item';
      for (const node of originalNodes) {
        item.appendChild(node.cloneNode(true));
      }
      track.appendChild(item);
    }

    // Clear element using DOM methods (avoids innerHTML with untrusted content)
    while (this.firstChild) this.removeChild(this.firstChild);

    this.appendChild(srLabel);
    this.appendChild(track);
    this.#track = track;

    this.#syncGapAttr();
  }

  #syncGapAttr() {
    const gap = this.getAttribute('gap');
    if (gap) this.style.setProperty('--dvfy-marquee-gap', gap);
    else this.style.removeProperty('--dvfy-marquee-gap');
  }

  #measureTrack() {
    if (!this.#track || this.#track.children.length < 2) return;
    // offsetLeft of the second copy = firstCopyWidth + gap = one loop stride
    this.#singleWidth = (this.#track.children[1]).offsetLeft;
  }

  #setupMotionQuery() {
    this.#motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.#reducedMotion = this.#motionQuery.matches;
    this.#motionQuery.addEventListener('change', this.#onMotionChange);
  }

  #onMotionChange = (e) => {
    this.#reducedMotion = e.matches;
  };

  #onScroll = () => {
    const now = performance.now();
    const scrollY = window.scrollY;
    const dt = now - this.#lastScrollTime;

    if (dt > 0) {
      // Normalise to ~60fps frame: (delta_px / delta_ms) * 16.67ms
      const rawVelocity = ((scrollY - this.#lastScrollY) / dt) * 16.67;
      this.#velocity = rawVelocity;
    }

    this.#lastScrollY = scrollY;
    this.#lastScrollTime = now;
  };

  #startLoop() {
    if (this.#rafId !== null) return;

    // Defer first tick to allow layout + measurement
    requestAnimationFrame(() => {
      this.#measureTrack();
      // Right-direction starts offset so the loop resets forward naturally
      if (this.getAttribute('direction') === 'right') {
        this.#position = -this.#singleWidth;
      }
      this.#rafId = requestAnimationFrame(this.#tick);
    });
  }

  #stopLoop() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  /** Lerp decay coefficient per frame (~95% decay over ~20 frames at 60fps) */
  static #DECAY = 0.08;

  #tick = () => {
    if (!this.isConnected) return;

    // Re-measure if not yet available
    if (this.#singleWidth === 0) this.#measureTrack();

    // Decay velocity toward zero each frame
    this.#velocity *= (1 - DvfyMarqueeScroll.#DECAY);

    if (!this.#reducedMotion && this.#singleWidth > 0) {
      const base = Math.max(0, parseFloat(this.getAttribute('speed') ?? '1') || 1);
      const mult = Math.max(0, parseFloat(this.getAttribute('multiplier') ?? '3') || 3);
      const isRight = this.getAttribute('direction') === 'right';

      // Scroll boost is always additive (absolute value), direction-independent
      const effectiveSpeed = base + Math.abs(this.#velocity) * mult;

      if (isRight) {
        this.#position += effectiveSpeed;
        if (this.#position >= 0) this.#position -= this.#singleWidth;
      } else {
        this.#position -= effectiveSpeed;
        if (this.#position <= -this.#singleWidth) this.#position += this.#singleWidth;
      }

      this.#track.style.transform = `translateX(${this.#position}px)`;
    }

    this.#rafId = requestAnimationFrame(this.#tick);
  };
}

customElements.define('dvfy-marquee-scroll', DvfyMarqueeScroll);
