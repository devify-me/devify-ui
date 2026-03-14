/**
 * <dvfy-avatar> — User avatar with image + fallback initials
 *
 * Attributes:
 *   src:    image URL
 *   name:   user name (for initials fallback)
 *   size:   sm | md | lg (default: "md")
 *   status: online | offline | busy
 *
 * Usage:
 *   <dvfy-avatar src="/photos/user.jpg" name="Jorge Garcia" status="online"></dvfy-avatar>
 *   <dvfy-avatar name="Jane Doe" size="lg"></dvfy-avatar>
 */

const STYLES = `
dvfy-avatar {
  display: inline-flex;
  position: relative;
  flex-shrink: 0;
}

dvfy-avatar .dvfy-avatar__img,
dvfy-avatar .dvfy-avatar__initials {
  border-radius: var(--dvfy-radius-round);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--dvfy-font-sans);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-neutral-0);
  background: var(--dvfy-neutral-400);
}

/* Sizes */
dvfy-avatar[size="sm"] .dvfy-avatar__img,
dvfy-avatar[size="sm"] .dvfy-avatar__initials { width: 2rem; height: 2rem; font-size: var(--dvfy-text-xs); }
dvfy-avatar:not([size]) .dvfy-avatar__img,
dvfy-avatar:not([size]) .dvfy-avatar__initials,
dvfy-avatar[size="md"] .dvfy-avatar__img,
dvfy-avatar[size="md"] .dvfy-avatar__initials { width: 2.5rem; height: 2.5rem; font-size: var(--dvfy-text-sm); }
dvfy-avatar[size="lg"] .dvfy-avatar__img,
dvfy-avatar[size="lg"] .dvfy-avatar__initials { width: 3.5rem; height: 3.5rem; font-size: var(--dvfy-text-lg); }

/* Status dot */
dvfy-avatar .dvfy-avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: var(--dvfy-radius-round);
  border: 2px solid var(--dvfy-surface-primary);
}
dvfy-avatar[size="lg"] .dvfy-avatar__status { width: 0.75rem; height: 0.75rem; }

dvfy-avatar .dvfy-avatar__status[data-status="online"] { background: var(--dvfy-success-text); }
dvfy-avatar .dvfy-avatar__status[data-status="offline"] { background: var(--dvfy-neutral-400); }
dvfy-avatar .dvfy-avatar__status[data-status="busy"] { background: var(--dvfy-danger-text); }
`;

class DvfyAvatar extends HTMLElement {
  static #styled = false;

  connectedCallback() {
    if (!DvfyAvatar.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyAvatar.#styled = true;
    }
    this.#build();
  }

  static get observedAttributes() { return ['src', 'name', 'size', 'status']; }

  attributeChangedCallback() {
    if (this.isConnected) this.#build();
  }

  #build() {
    this.textContent = '';

    const src = this.getAttribute('src');
    const name = this.getAttribute('name') || '';
    const status = this.getAttribute('status');

    if (src) {
      const img = document.createElement('img');
      img.className = 'dvfy-avatar__img';
      img.src = src;
      img.alt = name;
      img.addEventListener('error', () => {
        img.remove();
        this.#showInitials(name);
      });
      this.appendChild(img);
    } else {
      this.#showInitials(name);
    }

    if (status) {
      const dot = document.createElement('span');
      dot.className = 'dvfy-avatar__status';
      dot.dataset.status = status;
      this.appendChild(dot);
    }
  }

  #showInitials(name) {
    // Don't add if already present
    if (this.querySelector('.dvfy-avatar__initials')) return;
    const el = document.createElement('span');
    el.className = 'dvfy-avatar__initials';
    el.textContent = this.#getInitials(name);
    // Insert before status dot if present
    const dot = this.querySelector('.dvfy-avatar__status');
    if (dot) {
      this.insertBefore(el, dot);
    } else {
      this.appendChild(el);
    }
  }

  #getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}

customElements.define('dvfy-avatar', DvfyAvatar);
