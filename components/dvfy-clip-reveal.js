/**
 * <dvfy-clip-reveal> — CSS shape() organic clip-path morph animation
 *
 * Reveals content via animated clip-path morphing. Uses the CSS 2026 `shape()`
 * function for organic, curved clip boundaries. Falls back to polygon()/circle()
 * for unsupported browsers (Firefox).
 *
 * Shape presets:
 *   blob          — organic curved blob that expands from a central point
 *   wave          — wavy curtain sweeps down from top
 *   diagonal      — geometric wipe from top-left corner
 *   circle-expand — radial reveal from center
 *
 * Browser support:
 *   shape(): Chrome (shipped), Safari 18.4+ (shipped). Firefox: polygon fallback.
 *   prefers-reduced-motion: animation skipped, content shown immediately.
 *
 * Usage:
 *   <dvfy-clip-reveal preset="blob" trigger="visible">
 *     <img src="..." alt="...">
 *   </dvfy-clip-reveal>
 *
 *   <!-- Manual trigger: add [animate] attribute to play -->
 *   <dvfy-clip-reveal preset="wave" trigger="manual" id="hero">
 *     <h1>Big Headline</h1>
 *   </dvfy-clip-reveal>
 *   <button onclick="document.getElementById('hero').play()">Reveal</button>
 */

const STYLES = `
/* ── Base ── */
dvfy-clip-reveal {
  display: block;
}

/* ── Reduced motion: show content immediately, no animation ── */
@media (prefers-reduced-motion: reduce) {
  dvfy-clip-reveal { clip-path: none !important; animation: none !important; }
}

/* ── Initial clipped states (browsers with shape() support) ── */
@supports (clip-path: shape(from 0% 0%, close)) {
  dvfy-clip-reveal[data-preset="blob"]:not([data-played]) {
    clip-path: shape(
      from 50% 45%,
      curve to 55% 50% with 55% 45% / 55% 50%,
      curve to 50% 55% with 55% 55% / 50% 55%,
      curve to 45% 50% with 45% 55% / 45% 50%,
      curve to 50% 45% with 45% 45% / 50% 45%,
      close
    );
  }
  dvfy-clip-reveal[data-preset="wave"]:not([data-played]) {
    clip-path: shape(
      from 0% 0%,
      hline 100%,
      vline 2%,
      curve to 75% 4% with 88% 8% / 82% 2%,
      curve to 50% 2% with 68% 2% / 58% 0%,
      curve to 25% 4% with 42% 4% / 32% 2%,
      curve to 0% 2% with 18% 6% / 8% 0%,
      close
    );
  }
  dvfy-clip-reveal[data-preset="diagonal"]:not([data-played]) {
    clip-path: shape(
      from 0% 0%,
      line to 0% 0%,
      line to 0% 0%,
      line to 0% 0%,
      close
    );
  }
}

/* ── Initial clipped states (fallback for unsupported browsers) ── */
@supports not (clip-path: shape(from 0% 0%, close)) {
  dvfy-clip-reveal[data-preset="blob"]:not([data-played]) {
    clip-path: circle(0% at 50% 50%);
  }
  dvfy-clip-reveal[data-preset="wave"]:not([data-played]) {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
  }
  dvfy-clip-reveal[data-preset="diagonal"]:not([data-played]) {
    clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  }
}

/* circle-expand always uses circle() */
dvfy-clip-reveal[data-preset="circle-expand"]:not([data-played]) {
  clip-path: circle(0% at 50% 50%);
}

/* ── Animation declarations ── */
dvfy-clip-reveal[animate] {
  animation-fill-mode: both;
  animation-timing-function: var(--dvfy-clip-easing, cubic-bezier(0.4, 0, 0.2, 1));
  animation-duration: var(--dvfy-clip-duration, 800ms);
}

dvfy-clip-reveal[animate][data-preset="blob"]          { animation-name: dvfy-clip-blob; }
dvfy-clip-reveal[animate][data-preset="wave"]          { animation-name: dvfy-clip-wave; }
dvfy-clip-reveal[animate][data-preset="diagonal"]      { animation-name: dvfy-clip-diagonal; }
dvfy-clip-reveal[animate][data-preset="circle-expand"] { animation-name: dvfy-clip-circle-expand; }

/* ── Keyframes: shape() organic morph ── */
@supports (clip-path: shape(from 0% 0%, close)) {
  @keyframes dvfy-clip-blob {
    from {
      clip-path: shape(
        from 50% 45%,
        curve to 55% 50% with 55% 45% / 55% 50%,
        curve to 50% 55% with 55% 55% / 50% 55%,
        curve to 45% 50% with 45% 55% / 45% 50%,
        curve to 50% 45% with 45% 45% / 50% 45%,
        close
      );
    }
    to {
      clip-path: shape(
        from 20% 5%,
        curve to 80% 0% with 45% -8% / 75% -5%,
        curve to 100% 65% with 110% 20% / 108% 60%,
        curve to 50% 100% with 98% 88% / 75% 108%,
        curve to 0% 40% with 20% 105% / -5% 70%,
        close
      );
    }
  }

  @keyframes dvfy-clip-wave {
    from {
      clip-path: shape(
        from 0% 0%,
        hline 100%,
        vline 2%,
        curve to 75% 4% with 88% 8% / 82% 2%,
        curve to 50% 2% with 68% 2% / 58% 0%,
        curve to 25% 4% with 42% 4% / 32% 2%,
        curve to 0% 2% with 18% 6% / 8% 0%,
        close
      );
    }
    to {
      clip-path: shape(
        from 0% 0%,
        hline 100%,
        vline 98%,
        curve to 75% 100% with 88% 107% / 82% 96%,
        curve to 50% 98% with 68% 98% / 58% 93%,
        curve to 25% 100% with 42% 102% / 32% 96%,
        curve to 0% 98% with 18% 104% / 8% 97%,
        close
      );
    }
  }

  @keyframes dvfy-clip-diagonal {
    from {
      clip-path: shape(
        from 0% 0%,
        line to 0% 0%,
        line to 0% 0%,
        line to 0% 0%,
        close
      );
    }
    to {
      clip-path: shape(
        from 0% 0%,
        line to 100% 0%,
        line to 100% 100%,
        line to 0% 100%,
        close
      );
    }
  }
}

/* ── Keyframes: polygon/circle fallback ── */
@supports not (clip-path: shape(from 0% 0%, close)) {
  @keyframes dvfy-clip-blob {
    from { clip-path: circle(0% at 50% 50%); }
    to   { clip-path: circle(150% at 50% 50%); }
  }
  @keyframes dvfy-clip-wave {
    from { clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); }
    to   { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
  }
  @keyframes dvfy-clip-diagonal {
    from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
    to   { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
  }
}

/* ── circle-expand always uses circle() ── */
@keyframes dvfy-clip-circle-expand {
  from { clip-path: circle(0% at 50% 50%); }
  to   { clip-path: circle(150% at 50% 50%); }
}
`;

/**
 * Organic clip-path reveal animation using CSS `shape()`.
 *
 * @element dvfy-clip-reveal
 *
 * @attr {string} preset - Shape preset: blob | wave | diagonal | circle-expand (default: blob)
 * @attr {string} trigger - When to play: visible | auto | manual (default: visible)
 * @attr {number} duration - Animation duration in ms (default: 800)
 * @attr {string} easing - CSS easing function (default: cubic-bezier(0.4, 0, 0.2, 1))
 * @attr {boolean} animate - Set to trigger animation (manual trigger)
 *
 * @fires clip-reveal-start - Fires when animation begins
 * @fires clip-reveal-end - Fires when animation completes
 *
 * @slot - Content to reveal
 *
 * @cssprop {time} --dvfy-clip-duration - Animation duration override
 * @cssprop {string} --dvfy-clip-easing - Animation easing override
 *
 * @example
 * <dvfy-clip-reveal preset="blob" trigger="visible">
 *   <img src="photo.jpg" alt="A scenic view">
 * </dvfy-clip-reveal>
 *
 * @example
 * <dvfy-clip-reveal preset="wave" trigger="manual" id="hero">
 *   <h1>Big Headline</h1>
 * </dvfy-clip-reveal>
 */
class DvfyClipReveal extends HTMLElement {
  static #styled = false;

  /** @type {IntersectionObserver|null} */
  #observer = null;
  /** @type {boolean} Whether the animation has already played */
  #hasPlayed = false;

  connectedCallback() {
    if (!DvfyClipReveal.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyClipReveal.#styled = true;
    }

    this.#applyPreset();
    this.#applyTokens();
    this.#attachTrigger();

    // Support [animate] set in HTML markup
    if (this.hasAttribute('animate') && !this.#hasPlayed) {
      this.#play();
    }
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  static get observedAttributes() {
    return ['preset', 'trigger', 'duration', 'easing', 'animate'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;

    if (name === 'preset') {
      this.#applyPreset();
    } else if (name === 'duration' || name === 'easing') {
      this.#applyTokens();
    } else if (name === 'trigger') {
      this.#observer?.disconnect();
      this.#observer = null;
      this.#attachTrigger();
    } else if (name === 'animate') {
      if (newValue !== null && !this.#hasPlayed) {
        this.#play();
      }
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Play the reveal animation */
  play() {
    this.#hasPlayed = false; // allow replay via public API
    this.setAttribute('animate', '');
  }

  /** Reset to hidden state (allows re-triggering) */
  reset() {
    this.#hasPlayed = false;
    this.removeAttribute('animate');
    this.removeAttribute('data-played');
    this.style.clipPath = '';
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  #applyPreset() {
    const preset = this.getAttribute('preset') || 'blob';
    this.dataset.preset = preset;
  }

  #applyTokens() {
    const duration = this.getAttribute('duration');
    const easing = this.getAttribute('easing');

    if (duration) {
      this.style.setProperty('--dvfy-clip-duration', `${parseFloat(duration)}ms`);
    } else {
      this.style.removeProperty('--dvfy-clip-duration');
    }

    if (easing) {
      this.style.setProperty('--dvfy-clip-easing', easing);
    } else {
      this.style.removeProperty('--dvfy-clip-easing');
    }
  }

  #attachTrigger() {
    const trigger = this.getAttribute('trigger') || 'visible';

    if (trigger === 'visible') {
      this.#setupObserver();
    } else if (trigger === 'auto') {
      requestAnimationFrame(() => {
        if (this.isConnected && !this.#hasPlayed) this.#play();
      });
    }
    // 'manual': wait for [animate] attr or play() call
  }

  #setupObserver() {
    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.#hasPlayed) {
            this.#play();
            this.#observer.disconnect();
            this.#observer = null;
          }
        }
      },
      { rootMargin: '-5% 0px -5% 0px', threshold: 0.1 },
    );
    this.#observer.observe(this);
  }

  #play() {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setAttribute('data-played', '');
      this.style.clipPath = 'none';
      return;
    }

    this.#hasPlayed = true;
    this.setAttribute('animate', '');
    this.dispatchEvent(new CustomEvent('clip-reveal-start', { bubbles: true }));

    const onEnd = () => {
      this.style.clipPath = 'none';
      this.removeAttribute('animate');
      this.setAttribute('data-played', '');
      this.dispatchEvent(new CustomEvent('clip-reveal-end', { bubbles: true }));
    };

    this.addEventListener('animationend', onEnd, { once: true });
  }
}

customElements.define('dvfy-clip-reveal', DvfyClipReveal);
