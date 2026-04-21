import { sanitizeSrc } from '../utils/url.js';
import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-avatar> — User avatar with image + fallback initials
 *
 * Attributes:
 *   src:         image URL
 *   name:        user name (for initials fallback)
 *   size:        sm | md | lg (default: "md")
 *   status:      online | offline | busy
 *   interactive: boolean — adds hover effect and cursor pointer
 *
 * Events:
 *   avatar-click — dispatched when interactive avatar is clicked
 *
 * <dvfy-avatar-group> — Overlapping avatar stack
 *
 * Attributes:
 *   max: number — max avatars to show before "+N" overflow
 *
 * Usage:
 *   <dvfy-avatar src="/photos/user.jpg" name="Jorge Garcia" status="online"></dvfy-avatar>
 *   <dvfy-avatar name="Jane Doe" size="lg" interactive></dvfy-avatar>
 *   <dvfy-avatar-group max="3">
 *     <dvfy-avatar name="A B"></dvfy-avatar>
 *     <dvfy-avatar name="C D"></dvfy-avatar>
 *     <dvfy-avatar name="E F"></dvfy-avatar>
 *     <dvfy-avatar name="G H"></dvfy-avatar>
 *   </dvfy-avatar-group>
 */

const STYLES = `
dvfy-avatar {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dvfy-space-1-5);
  flex-shrink: 0;
}

dvfy-avatar .dvfy-avatar__visual {
  position: relative;
  display: inline-flex;
}

dvfy-avatar[interactive] .dvfy-avatar__visual {
  cursor: pointer;
  transition: transform var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
  border-radius: var(--dvfy-radius-round);
}
dvfy-avatar[interactive]:hover .dvfy-avatar__visual {
  transform: scale(1.08);
  box-shadow: var(--dvfy-shadow-md);
  background: var(--dvfy-elevation-md-bg);
}

dvfy-avatar .dvfy-avatar__label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
  white-space: nowrap;
}

/* Label position (top = default: label DOM-first, visual below) */
dvfy-avatar[label-position="bottom"] .dvfy-avatar__label { order: 1; }
dvfy-avatar[label-position="left"] { flex-direction: row; align-items: center; }
dvfy-avatar[label-position="right"] { flex-direction: row; align-items: center; }
dvfy-avatar[label-position="right"] .dvfy-avatar__label { order: 1; }

dvfy-avatar .dvfy-avatar__img,
dvfy-avatar .dvfy-avatar__initials {
  border-radius: var(--dvfy-radius-round);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--dvfy-font-sans);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-inverse);
  background: var(--dvfy-text-muted);
}

/* Size: xs */
dvfy-avatar[size="xs"] .dvfy-avatar__img,
dvfy-avatar[size="xs"] .dvfy-avatar__initials { width: 1.5rem; height: 1.5rem; font-size: var(--dvfy-text-xs); }
/* Size: sm */
dvfy-avatar[size="sm"] .dvfy-avatar__img,
dvfy-avatar[size="sm"] .dvfy-avatar__initials { width: 2rem; height: 2rem; font-size: var(--dvfy-text-xs); }
/* Size: md (default) */
dvfy-avatar:not([size]) .dvfy-avatar__img,
dvfy-avatar:not([size]) .dvfy-avatar__initials,
dvfy-avatar[size="md"] .dvfy-avatar__img,
dvfy-avatar[size="md"] .dvfy-avatar__initials { width: 2.5rem; height: 2.5rem; font-size: var(--dvfy-text-sm); }
/* Size: lg */
dvfy-avatar[size="lg"] .dvfy-avatar__img,
dvfy-avatar[size="lg"] .dvfy-avatar__initials { width: 3.5rem; height: 3.5rem; font-size: var(--dvfy-text-lg); }
/* Size: xl */
dvfy-avatar[size="xl"] .dvfy-avatar__img,
dvfy-avatar[size="xl"] .dvfy-avatar__initials { width: 4.5rem; height: 4.5rem; font-size: var(--dvfy-text-xl); }

/* Status dot */
dvfy-avatar .dvfy-avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: var(--dvfy-radius-round);
  border: 2px solid var(--dvfy-surface-raised);
}
dvfy-avatar[size="xs"] .dvfy-avatar__status { width: 0.5rem; height: 0.5rem; border-width: 1.5px; }
dvfy-avatar[size="lg"] .dvfy-avatar__status { width: 0.75rem; height: 0.75rem; }
dvfy-avatar[size="xl"] .dvfy-avatar__status { width: 0.875rem; height: 0.875rem; }

dvfy-avatar .dvfy-avatar__status[data-status="online"] { background: var(--dvfy-success-text); }
dvfy-avatar .dvfy-avatar__status[data-status="offline"] { background: var(--dvfy-text-muted); }
dvfy-avatar .dvfy-avatar__status[data-status="busy"] { background: var(--dvfy-danger-text); }

/* Avatar group */
dvfy-avatar-group {
  display: inline-flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  align-items: center;
}
dvfy-avatar-group dvfy-avatar {
  margin-left: -0.5rem;
}
dvfy-avatar-group dvfy-avatar .dvfy-avatar__visual {
  border: 2px solid var(--dvfy-surface-page);
  border-radius: var(--dvfy-radius-round);
}
dvfy-avatar-group dvfy-avatar:last-of-type {
  margin-left: 0;
}
dvfy-avatar-group .dvfy-avatar-group__overflow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--dvfy-radius-round);
  background: var(--dvfy-text-muted);
  color: var(--dvfy-text-inverse);
  font-family: var(--dvfy-font-sans);
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  margin-left: -0.5rem;
  border: 2px solid var(--dvfy-surface-page);
  flex-shrink: 0;
}
`;

/**
 * User avatar with image and initials fallback.
 *
 * @element dvfy-avatar
 *
 * @attr {string} src - Image URL
 * @attr {string} name - User name (used for initials fallback and alt text)
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {string} status - Status indicator dot: online | offline | busy
 * @attr {boolean} interactive - Add hover effect and dispatch click event
 * @attr {string} label - Visible text label beside or below the avatar
 * @attr {string} label-position - top | right | bottom | left (default: "top")
 *
 * @event {CustomEvent} avatar-click - Interactive avatar clicked, detail: { name, src }
 *
 * @cssprop {color} --dvfy-neutral-400 - Initials background color
 * @cssprop {color} --dvfy-success-text - Online status dot color
 * @cssprop {color} --dvfy-danger-text - Busy status dot color
 */
class DvfyAvatar extends HTMLElement {
  static #STRUCTURAL = new Set(['src', 'interactive']);

  #pendingRender = false;
  #initialized = false;

  connectedCallback() {
    injectStyles('dvfy-avatar', STYLES);
    this.#build();
    this.#initialized = true;
  }

  static get observedAttributes() { return ['src', 'name', 'size', 'status', 'interactive', 'label', 'label-position']; }

  #scheduleRender() {
    if (!this.#pendingRender) {
      this.#pendingRender = true;
      queueMicrotask(() => {
        this.#pendingRender = false;
        this.#build();
        this.#initialized = true;
      });
    }
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (!this.#initialized) return;

    if (DvfyAvatar.#STRUCTURAL.has(name)) {
      this.#scheduleRender();
      return;
    }

    switch (name) {
      case 'name':
        this.#updateName();
        break;
      case 'status':
        this.#updateStatus();
        break;
      case 'label':
        this.#updateLabel();
        break;
      case 'size':
      case 'label-position':
        // Handled entirely by CSS attribute selectors
        break;
    }
  }

  #updateName() {
    const name = this.getAttribute('name') || '';
    const initials = this.querySelector('.dvfy-avatar__initials');
    if (initials) initials.textContent = this.#getInitials(name);
    const img = this.querySelector('.dvfy-avatar__img');
    if (img) img.alt = name;
    if (this.hasAttribute('interactive') && !this.getAttribute('aria-label')?.length) {
      this.setAttribute('aria-label', this.getAttribute('label') || name || 'User avatar');
    }
  }

  #updateStatus() {
    const status = this.getAttribute('status');
    const visual = this.querySelector('.dvfy-avatar__visual');
    if (!visual) { this.#scheduleRender(); return; }
    const existing = visual.querySelector('.dvfy-avatar__status');
    if (!status) {
      if (existing) existing.remove();
      return;
    }
    if (existing) {
      existing.dataset.status = status;
    } else {
      const dot = document.createElement('span');
      dot.className = 'dvfy-avatar__status';
      dot.dataset.status = status;
      visual.appendChild(dot);
    }
  }

  #updateLabel() {
    const label = this.getAttribute('label');
    const existing = this.querySelector('.dvfy-avatar__label');
    if (label && existing) {
      existing.textContent = label;
    } else {
      this.#scheduleRender();
    }
  }

  #build() {
    this.textContent = '';

    const src = this.getAttribute('src');
    const name = this.getAttribute('name') || '';
    const status = this.getAttribute('status');
    const interactive = this.hasAttribute('interactive');
    const label = this.getAttribute('label');

    // Label (top by default — DOM-first so it renders above)
    if (label) {
      const lbl = document.createElement('span');
      lbl.className = 'dvfy-avatar__label';
      lbl.textContent = label;
      this.appendChild(lbl);
    }

    // Visual wrapper (holds image/initials + status dot)
    const visual = document.createElement('span');
    visual.className = 'dvfy-avatar__visual';

    if (src) {
      const img = document.createElement('img');
      img.className = 'dvfy-avatar__img';
      img.src = sanitizeSrc(src);
      img.alt = name;
      img.addEventListener('error', () => {
        img.remove();
        const el = document.createElement('span');
        el.className = 'dvfy-avatar__initials';
        el.textContent = this.#getInitials(name);
        const dot = visual.querySelector('.dvfy-avatar__status');
        dot ? visual.insertBefore(el, dot) : visual.appendChild(el);
      });
      visual.appendChild(img);
    } else {
      const el = document.createElement('span');
      el.className = 'dvfy-avatar__initials';
      el.textContent = this.#getInitials(name);
      visual.appendChild(el);
    }

    if (status) {
      const dot = document.createElement('span');
      dot.className = 'dvfy-avatar__status';
      dot.dataset.status = status;
      visual.appendChild(dot);
    }

    this.appendChild(visual);

    // Interactive: keyboard + click support
    if (interactive) {
      if (!this.getAttribute('role')) this.setAttribute('role', 'button');
      if (!this.getAttribute('tabindex')) this.setAttribute('tabindex', '0');
      if (!this.getAttribute('aria-label')) {
        this.setAttribute('aria-label', label || name || 'User avatar');
      }
      this.addEventListener('click', this.#handleClick);
      this.addEventListener('keydown', this.#handleKey);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKey);
  }

  #handleClick = () => {
    this.dispatchEvent(new CustomEvent('avatar-click', {
      bubbles: true,
      detail: { name: this.getAttribute('name') || '', src: this.getAttribute('src') || '' }
    }));
  };

  #handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#handleClick();
    }
  };

  #getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}

/**
 * Overlapping avatar stack with overflow indicator.
 *
 * @element dvfy-avatar-group
 *
 * @attr {number} max - Maximum avatars to show before "+N" overflow badge
 */
class DvfyAvatarGroup extends HTMLElement {
  static get observedAttributes() { return ['max']; }

  connectedCallback() {
    // Defer to let child avatars render first
    requestAnimationFrame(() => this.#arrange());
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      requestAnimationFrame(() => this.#arrange());
    }
  }

  #arrange() {
    const max = parseInt(this.getAttribute('max') || '0', 10);
    if (!max || max <= 0) return;

    // Remove any existing overflow indicator
    const existing = this.querySelector('.dvfy-avatar-group__overflow');
    if (existing) existing.remove();

    const avatars = Array.from(this.querySelectorAll('dvfy-avatar'));
    if (avatars.length <= max) {
      // Show all
      for (const av of avatars) av.style.display = '';
      return;
    }

    // Hide excess avatars
    const overflow = avatars.length - max;
    for (let i = 0; i < avatars.length; i++) {
      avatars[i].style.display = i < max ? '' : 'none';
    }

    // Add overflow indicator — inserted as first child since flex-direction is row-reverse
    const badge = document.createElement('span');
    badge.className = 'dvfy-avatar-group__overflow';
    badge.textContent = `+${overflow}`;
    this.insertBefore(badge, this.firstChild);
  }
}

customElements.define('dvfy-avatar', DvfyAvatar);
customElements.define('dvfy-avatar-group', DvfyAvatarGroup);
