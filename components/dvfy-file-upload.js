import { injectStyles } from '../utils/styles.js';

const STYLES = `
dvfy-file-upload {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-3);
  font-family: var(--dvfy-font-sans);
  width: 100%;
  box-sizing: border-box;
}

/* ── Drop zone ── */
dvfy-file-upload .dvfy-fu__zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-8) var(--dvfy-space-6);
  border: var(--dvfy-border-2) dashed var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-xl);
  background: var(--dvfy-surface-muted);
  cursor: pointer;
  transition:
    border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
    background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  text-align: center;
  outline: none;
  user-select: none;
}

dvfy-file-upload .dvfy-fu__zone:hover,
dvfy-file-upload .dvfy-fu__zone:focus-visible {
  border-color: var(--dvfy-primary-text);
  background: var(--dvfy-primary-bg-subtle);
}

dvfy-file-upload[state="dragover"] .dvfy-fu__zone {
  border-color: var(--dvfy-primary-text);
  background: var(--dvfy-primary-bg-subtle);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 35%, transparent);
}

dvfy-file-upload[state="error"] .dvfy-fu__zone {
  border-color: var(--dvfy-danger-text);
  background: var(--dvfy-danger-bg-subtle);
}

dvfy-file-upload[state="success"] .dvfy-fu__zone {
  border-color: var(--dvfy-success-text);
  background: var(--dvfy-success-bg-subtle);
}

dvfy-file-upload[disabled] .dvfy-fu__zone {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Drop zone icon ── */
dvfy-file-upload .dvfy-fu__icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}

dvfy-file-upload[state="dragover"] .dvfy-fu__icon { color: var(--dvfy-primary-text); }
dvfy-file-upload[state="error"]    .dvfy-fu__icon { color: var(--dvfy-danger-text); }
dvfy-file-upload[state="success"]  .dvfy-fu__icon { color: var(--dvfy-success-text); }

/* ── Drop zone text ── */
dvfy-file-upload .dvfy-fu__heading {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-semibold);
  color: var(--dvfy-text-primary);
  margin: 0;
}

dvfy-file-upload .dvfy-fu__browse {
  color: var(--dvfy-primary-text);
  font-weight: var(--dvfy-weight-medium);
  text-decoration: underline;
  text-underline-offset: 2px;
}

dvfy-file-upload .dvfy-fu__sub {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  margin: 0;
}

/* ── Error message ── */
dvfy-file-upload .dvfy-fu__error {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-danger-text);
  display: none;
}

dvfy-file-upload .dvfy-fu__error[aria-live] { display: block; }
dvfy-file-upload .dvfy-fu__error:empty { display: none !important; }

/* ── Progress bar ── */
dvfy-file-upload .dvfy-fu__progress {
  display: none;
  flex-direction: column;
  gap: var(--dvfy-space-1);
}

dvfy-file-upload[state="uploading"] .dvfy-fu__progress { display: flex; }

dvfy-file-upload .dvfy-fu__progress-label {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  display: flex;
  justify-content: space-between;
}

dvfy-file-upload .dvfy-fu__progress-track {
  height: 4px;
  border-radius: var(--dvfy-radius-full);
  background: var(--dvfy-border-muted);
  overflow: hidden;
}

dvfy-file-upload .dvfy-fu__progress-fill {
  height: 100%;
  border-radius: var(--dvfy-radius-full);
  background: var(--dvfy-primary-text);
  width: 0%;
  transition: width var(--dvfy-duration-normal) var(--dvfy-ease-out);
}

/* ── File list ── */
dvfy-file-upload .dvfy-fu__list {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

dvfy-file-upload .dvfy-fu__list:empty { display: none; }

dvfy-file-upload .dvfy-fu__file {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  border-radius: var(--dvfy-radius-lg);
  background: var(--dvfy-surface-muted);
  border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}

dvfy-file-upload .dvfy-fu__file-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--dvfy-text-muted);
  flex-shrink: 0;
}

dvfy-file-upload .dvfy-fu__file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-0-5);
}

dvfy-file-upload .dvfy-fu__file-name {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

dvfy-file-upload .dvfy-fu__file-size {
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
}

dvfy-file-upload .dvfy-fu__file-remove {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: var(--dvfy-space-1);
  cursor: pointer;
  color: var(--dvfy-text-muted);
  border-radius: var(--dvfy-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  line-height: 0;
}

dvfy-file-upload .dvfy-fu__file-remove:hover {
  color: var(--dvfy-danger-text);
  background: var(--dvfy-danger-bg-subtle);
}

dvfy-file-upload .dvfy-fu__file-remove:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

dvfy-file-upload[disabled] .dvfy-fu__file-remove {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
`;

/**
 * Drag-and-drop file upload zone with validation and file list preview.
 *
 * @element dvfy-file-upload
 *
 * @attr {string} accept - Accepted MIME types or extensions (e.g. "image/*,.pdf")
 * @attr {boolean} multiple - Allow selecting multiple files
 * @attr {number} max-size - Maximum file size in MB (e.g. "5" for 5 MB)
 * @attr {string} state - Visual state: idle | dragover | uploading | success | error (default: "idle")
 * @attr {number} progress - Upload progress 0–100 (shown when state="uploading")
 * @attr {boolean} disabled - Disable the drop zone
 * @attr {string} label - Accessible label for the drop zone
 *
 * @event {CustomEvent} dvfy-files-selected - Fires when files are selected/dropped, detail: { files: File[] }
 * @event {CustomEvent} dvfy-file-removed - Fires when a file is removed, detail: { file: File, index: number }
 *
 * @cssProperty {color} --dvfy-fu-zone-border - Drop zone border color override
 * @cssProperty {color} --dvfy-fu-zone-bg - Drop zone background override
 *
 * @example
 * <dvfy-file-upload accept="image/*" multiple max-size="5"></dvfy-file-upload>
 */
class DvfyFileUpload extends HTMLElement {
  /** @type {File[]} */
  #files = [];

  connectedCallback() {
    injectStyles('dvfy-file-upload', STYLES);
    if (!this.hasAttribute('state')) this.setAttribute('state', 'idle');
    this.#build();
  }

  disconnectedCallback() {
    this.#files = [];
  }

  static get observedAttributes() {
    return ['accept', 'multiple', 'max-size', 'state', 'progress', 'disabled'];
  }

  attributeChangedCallback(name, _old, newVal) {
    if (!this.isConnected) return;
    if (name === 'progress') {
      const fill = this.querySelector('.dvfy-fu__progress-fill');
      const pct  = this.querySelector('.dvfy-fu__progress-pct');
      const val  = Math.max(0, Math.min(100, Number(newVal) || 0));
      if (fill) fill.style.width = `${val}%`;
      if (pct)  pct.textContent  = `${val}%`;
      return;
    }
    if (name === 'state') {
      this.#updateZoneIcon();
      this.#updateSubtext();
      return;
    }
    if (name === 'multiple') {
      const input = this.querySelector('.dvfy-fu__input');
      if (input) input.multiple = this.hasAttribute('multiple');
      return;
    }
    if (name === 'accept') {
      const input = this.querySelector('.dvfy-fu__input');
      if (input) input.accept = newVal || '';
      return;
    }
  }

  // ── Build ────────────────────────────────────────────────────────────────

  #build() {
    this.textContent = '';

    const input = this.#buildFileInput();
    this.appendChild(input);
    this.appendChild(this.#buildDropZone(input));

    // Error message
    const err = document.createElement('p');
    err.className = 'dvfy-fu__error';
    err.setAttribute('role', 'alert');
    err.setAttribute('aria-live', 'polite');
    this.appendChild(err);

    this.appendChild(this.#buildProgressBar());

    // File list
    const list = document.createElement('ul');
    list.className = 'dvfy-fu__list';
    list.setAttribute('aria-label', 'Selected files');
    this.appendChild(list);

    // Re-render any pre-existing files
    this.#files.forEach((f, i) => this.#appendFileItem(list, f, i));
  }

  #buildFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'dvfy-fu__input';
    input.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip:rect(0,0,0,0);pointer-events:none;';
    if (this.hasAttribute('multiple')) input.multiple = true;
    const accept = this.getAttribute('accept');
    if (accept) input.accept = accept;
    input.setAttribute('aria-hidden', 'true');
    input.addEventListener('change', () => {
      if (input.files?.length) this.#handleFiles(Array.from(input.files));
      input.value = '';
    });
    return input;
  }

  #buildDropZone(input) {
    const zone = document.createElement('div');
    zone.className = 'dvfy-fu__zone';
    zone.setAttribute('role', 'button');
    zone.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    zone.setAttribute('aria-label', this.getAttribute('label') || 'Upload files: drag and drop or click to browse');
    zone.setAttribute('aria-disabled', this.hasAttribute('disabled') ? 'true' : 'false');

    zone.appendChild(this.#buildUploadIcon());

    const heading = document.createElement('p');
    heading.className = 'dvfy-fu__heading';
    heading.textContent = 'Drag & drop files or ';
    const browseSpan = document.createElement('span');
    browseSpan.className = 'dvfy-fu__browse';
    browseSpan.textContent = 'browse';
    heading.appendChild(browseSpan);
    zone.appendChild(heading);

    const sub = document.createElement('p');
    sub.className = 'dvfy-fu__sub';
    sub.textContent = this.#buildSubtext();
    zone.appendChild(sub);

    zone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      if (!this.hasAttribute('disabled')) this.setAttribute('state', 'dragover');
    });
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget)) {
        if (this.getAttribute('state') === 'dragover') this.setAttribute('state', 'idle');
      }
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (this.hasAttribute('disabled')) return;
      if (this.getAttribute('state') === 'dragover') this.setAttribute('state', 'idle');
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) this.#handleFiles(dropped);
    });
    zone.addEventListener('click', () => {
      if (!this.hasAttribute('disabled')) input.click();
    });
    zone.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !this.hasAttribute('disabled')) {
        e.preventDefault();
        input.click();
      }
    });

    return zone;
  }

  #buildProgressBar() {
    const progressWrap = document.createElement('div');
    progressWrap.className = 'dvfy-fu__progress';
    progressWrap.setAttribute('aria-hidden', 'true');

    const progressLabel = document.createElement('div');
    progressLabel.className = 'dvfy-fu__progress-label';

    const uploadingText = document.createElement('span');
    uploadingText.textContent = 'Uploading\u2026';

    const pct = document.createElement('span');
    pct.className = 'dvfy-fu__progress-pct';
    pct.textContent = `${Math.max(0, Math.min(100, Number(this.getAttribute('progress')) || 0))}%`;

    progressLabel.appendChild(uploadingText);
    progressLabel.appendChild(pct);

    const track = document.createElement('div');
    track.className = 'dvfy-fu__progress-track';
    const fill = document.createElement('div');
    fill.className = 'dvfy-fu__progress-fill';
    fill.style.width = `${Math.max(0, Math.min(100, Number(this.getAttribute('progress')) || 0))}%`;
    track.appendChild(fill);

    progressWrap.appendChild(progressLabel);
    progressWrap.appendChild(track);
    return progressWrap;
  }

  // ── File handling ─────────────────────────────────────────────────────────

  #handleFiles(incoming) {
    const accepted = this.#validate(incoming);
    if (!accepted.length) return;

    if (this.hasAttribute('multiple')) {
      const existing = new Set(this.#files.map(f => `${f.name}-${f.size}`));
      const fresh = accepted.filter(f => !existing.has(`${f.name}-${f.size}`));
      this.#files.push(...fresh);
    } else {
      this.#files = accepted.slice(0, 1);
    }

    this.#renderFileList();
    this.#clearError();

    this.dispatchEvent(new CustomEvent('dvfy-files-selected', {
      bubbles: true,
      composed: true,
      detail: { files: [...this.#files] },
    }));
  }

  #validate(files) {
    const maxSizeMB = Number(this.getAttribute('max-size')) || 0;
    const accept = this.getAttribute('accept') || '';
    const errors = [];
    const valid = [];

    for (const file of files) {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`"${file.name}" exceeds the ${maxSizeMB}\u202fMB size limit.`);
        continue;
      }
      if (accept && !this.#matchesAccept(file, accept)) {
        errors.push(`"${file.name}" is not an accepted file type.`);
        continue;
      }
      valid.push(file);
    }

    if (errors.length) {
      this.#setError(errors[0]);
      if (!valid.length) this.setAttribute('state', 'error');
    }

    return valid;
  }

  #matchesAccept(file, accept) {
    return accept.split(',').map(s => s.trim()).some((token) => {
      if (token.endsWith('/*')) return file.type.startsWith(token.slice(0, -1));
      if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token.toLowerCase());
      return file.type === token;
    });
  }

  // ── Rendering helpers ─────────────────────────────────────────────────────

  #renderFileList() {
    const list = this.querySelector('.dvfy-fu__list');
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    this.#files.forEach((f, i) => this.#appendFileItem(list, f, i));
  }

  #appendFileItem(list, file, index) {
    const li = document.createElement('li');
    li.className = 'dvfy-fu__file';

    const fileIcon = this.#buildFileIcon();
    fileIcon.classList.add('dvfy-fu__file-icon');
    li.appendChild(fileIcon);

    const info = document.createElement('div');
    info.className = 'dvfy-fu__file-info';

    const name = document.createElement('span');
    name.className = 'dvfy-fu__file-name';
    name.textContent = file.name;
    name.title = file.name;

    const size = document.createElement('span');
    size.className = 'dvfy-fu__file-size';
    size.textContent = this.#formatBytes(file.size);

    info.appendChild(name);
    info.appendChild(size);
    li.appendChild(info);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'dvfy-fu__file-remove';
    removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
    removeBtn.appendChild(this.#buildXIcon());
    removeBtn.addEventListener('click', () => this.#removeFile(index));
    li.appendChild(removeBtn);

    list.appendChild(li);
  }

  #removeFile(index) {
    const file = this.#files[index];
    this.#files.splice(index, 1);
    this.#renderFileList();

    this.dispatchEvent(new CustomEvent('dvfy-file-removed', {
      bubbles: true,
      composed: true,
      detail: { file, index },
    }));
  }

  #updateZoneIcon() {
    const zone = this.querySelector('.dvfy-fu__zone');
    if (!zone) return;
    const existing = zone.querySelector('.dvfy-fu__icon');
    if (!existing) return;
    const state = this.getAttribute('state') || 'idle';
    let newIcon;
    if (state === 'success') newIcon = this.#buildCheckIcon();
    else if (state === 'error') newIcon = this.#buildXCircleIcon();
    else newIcon = this.#buildUploadIcon();
    zone.replaceChild(newIcon, existing);
  }

  #updateSubtext() {
    const sub = this.querySelector('.dvfy-fu__sub');
    if (sub) sub.textContent = this.#buildSubtext();
  }

  #buildSubtext() {
    const parts = [];
    const accept = this.getAttribute('accept');
    const maxSize = this.getAttribute('max-size');
    if (accept) {
      const types = accept.split(',').map(s => s.trim().replace('/*', ' files')).join(', ');
      parts.push(types);
    }
    if (maxSize) parts.push(`Max ${maxSize}\u202fMB`);
    if (!parts.length) parts.push('Any file type');
    return parts.join(' \u00b7 ');
  }

  #setError(msg) {
    const err = this.querySelector('.dvfy-fu__error');
    if (err) err.textContent = msg;
  }

  #clearError() {
    const err = this.querySelector('.dvfy-fu__error');
    if (err) err.textContent = '';
    if (this.getAttribute('state') === 'error') this.setAttribute('state', 'idle');
  }

  #formatBytes(bytes) {
    if (bytes < 1024) return `${bytes}\u202fB`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}\u202fKB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}\u202fMB`;
  }

  // ── SVG helpers ───────────────────────────────────────────────────────────

  #makeSvg(cls) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', cls || 'dvfy-fu__icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  }

  #addPath(svg, d) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    return p;
  }

  #buildUploadIcon() {
    const svg = this.#makeSvg('dvfy-fu__icon');
    this.#addPath(svg, 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
    this.#addPath(svg, 'M17 8l-5-5-5 5');
    this.#addPath(svg, 'M12 3v12');
    return svg;
  }

  #buildFileIcon() {
    const svg = this.#makeSvg('dvfy-fu__icon');
    this.#addPath(svg, 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');
    this.#addPath(svg, 'M14 2v6h6');
    this.#addPath(svg, 'M16 13H8');
    this.#addPath(svg, 'M16 17H8');
    this.#addPath(svg, 'M10 9H8');
    return svg;
  }

  #buildCheckIcon() {
    const svg = this.#makeSvg('dvfy-fu__icon');
    this.#addPath(svg, 'M20 6L9 17l-5-5');
    return svg;
  }

  #buildXCircleIcon() {
    const svg = this.#makeSvg('dvfy-fu__icon');
    this.#addPath(svg, 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z');
    this.#addPath(svg, 'M15 9l-6 6');
    this.#addPath(svg, 'M9 9l6 6');
    return svg;
  }

  #buildXIcon() {
    const svg = this.#makeSvg(null);
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('stroke-width', '2');
    const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l1.setAttribute('x1', '18'); l1.setAttribute('y1', '6');
    l1.setAttribute('x2', '6');  l1.setAttribute('y2', '18');
    const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l2.setAttribute('x1', '6');  l2.setAttribute('y1', '6');
    l2.setAttribute('x2', '18'); l2.setAttribute('y2', '18');
    svg.appendChild(l1);
    svg.appendChild(l2);
    return svg;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Returns a copy of the currently selected files */
  get files() { return [...this.#files]; }

  /** Clears all selected files and resets state to idle */
  reset() {
    this.#files = [];
    this.#renderFileList();
    this.#clearError();
    this.setAttribute('state', 'idle');
  }

  /** Sets upload progress percentage (0–100) */
  setProgress(value) {
    this.setAttribute('progress', String(value));
  }
}

customElements.define('dvfy-file-upload', DvfyFileUpload);
