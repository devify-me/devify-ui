/**
 * <dvfy-component-playground> — Interactive component playground
 *
 * Loads the WCA custom-elements.json manifest, renders a component picker,
 * auto-generates controls from attribute metadata, and provides live Preview,
 * Code, and API tabs.
 *
 * @element dvfy-component-playground
 *
 * @attr {string} component - Tag name to showcase (shows picker if omitted)
 * @attr {string} src - Path to custom-elements.json (default: "../custom-elements.json")
 *
 * @slot - Not used
 *
 * @cssprop {color} --dvfy-surface-raised - Card/panel background
 * @cssprop {color} --dvfy-border-muted - Panel borders
 * @cssprop {color} --dvfy-primary-bg - Active tab accent
 */

const PLAYGROUND_STYLES = `
dvfy-component-playground {
  display: block;
  font-family: var(--dvfy-font-sans);
  container-type: inline-size;
}

/* Picker row */
dvfy-component-playground .sc__picker {
  margin-bottom: var(--dvfy-space-4);
}

/* Main layout — preview fills space, drawer on right */
dvfy-component-playground .sc__body {
  display: flex;
  gap: 0;
  position: relative;
  height: calc(100vh - 10rem);
  min-height: 400px;
}

/* Preview column — takes all remaining space */
dvfy-component-playground .sc__preview-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Stretch tabs to fill preview column */
dvfy-component-playground .sc__preview-col dvfy-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}
dvfy-component-playground .sc__preview-col dvfy-tab[active] {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Preview area — fills available height */
dvfy-component-playground .sc__preview-area {
  position: relative;
  flex: 1;
  padding: var(--dvfy-space-6);
  background: var(--dvfy-surface-sunken);
  border: var(--dvfy-border-1) dashed var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--dvfy-space-3);
}

/* Code block wrapper */
dvfy-component-playground .sc__code-wrap {
  position: relative;
}
dvfy-component-playground .sc__code-copy {
  position: absolute;
  top: var(--dvfy-space-2);
  right: var(--dvfy-space-2);
  z-index: 1;
}

/* Code block */
dvfy-component-playground .sc__code {
  background: var(--dvfy-surface-sunken);
  border-radius: var(--dvfy-radius-lg);
  padding: var(--dvfy-space-4);
  font-family: var(--dvfy-font-mono);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}

/* ── Right drawer ── */
dvfy-component-playground .sc__drawer {
  width: clamp(200px, 40%, 320px);
  flex-shrink: 0;
  border-left: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  background: var(--dvfy-surface-raised);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width var(--dvfy-duration-normal, 200ms) var(--dvfy-ease-out, ease-out);
}
dvfy-component-playground .sc__drawer[data-collapsed] {
  width: 0;
  border-left: none;
}

/* Drawer header with toggle */
dvfy-component-playground .sc__drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dvfy-space-3) var(--dvfy-space-4);
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  flex-shrink: 0;
}
/* Toggle button inside drawer header — collapses the drawer */
dvfy-component-playground .sc__drawer-toggle {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  border-radius: var(--dvfy-radius-md);
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-secondary);
  cursor: pointer;
  font-size: var(--dvfy-text-xs);
  line-height: 1;
  flex-shrink: 0;
  transition: background var(--dvfy-duration-fast, 100ms);
}
dvfy-component-playground .sc__drawer-toggle:hover {
  background: var(--dvfy-surface-sunken);
}

/* Re-open tab — visible only when drawer is collapsed */
dvfy-component-playground .sc__drawer-reopen {
  position: absolute;
  top: var(--dvfy-space-2);
  right: 0;
  z-index: 2;
  writing-mode: vertical-rl;
  padding: var(--dvfy-space-2) var(--dvfy-space-1);
  border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  border-right: none;
  border-radius: var(--dvfy-radius-md) 0 0 var(--dvfy-radius-md);
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-secondary);
  cursor: pointer;
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wider);
  line-height: 1;
  transition: background var(--dvfy-duration-fast, 100ms);
  display: none;
}
dvfy-component-playground .sc__drawer-reopen[data-visible] {
  display: block;
}
dvfy-component-playground .sc__drawer-reopen:hover {
  background: var(--dvfy-surface-sunken);
}

/* Scrollable controls area */
dvfy-component-playground .sc__drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--dvfy-space-4);
}

/* Controls panel */
dvfy-component-playground .sc__controls {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-3);
}
dvfy-component-playground .sc__controls-title {
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wider);
  color: var(--dvfy-text-muted);
  margin: 0;
}

/* Narrow containers: stack vertically, drawer becomes bottom panel */
@container (max-width: 360px) {
  dvfy-component-playground .sc__body {
    flex-direction: column;
    height: auto;
  }
  dvfy-component-playground .sc__drawer {
    width: 100% !important;
    border-left: none;
    border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
    max-height: 50vh;
  }
  dvfy-component-playground .sc__drawer[data-collapsed] {
    max-height: 0;
    border-top: none;
  }
}

/* API tables */
dvfy-component-playground .sc__api-section {
  margin-bottom: var(--dvfy-space-4);
}
dvfy-component-playground .sc__api-title {
  font-size: var(--dvfy-text-xs);
  font-weight: var(--dvfy-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wider);
  color: var(--dvfy-text-muted);
  margin: 0 0 var(--dvfy-space-2) 0;
}
dvfy-component-playground .sc__api-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--dvfy-text-sm);
}
dvfy-component-playground .sc__api-table th {
  text-align: left;
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  background: var(--dvfy-surface-sunken);
  color: var(--dvfy-text-secondary);
  font-weight: var(--dvfy-weight-medium);
  font-size: var(--dvfy-text-xs);
  text-transform: uppercase;
  letter-spacing: var(--dvfy-tracking-wider);
}
dvfy-component-playground .sc__api-table td {
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-muted);
}
dvfy-component-playground .sc__api-table td:first-child {
  font-family: var(--dvfy-font-mono);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-link);
  white-space: nowrap;
}
dvfy-component-playground .sc__api-table td:nth-child(2) {
  font-family: var(--dvfy-font-mono);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  white-space: nowrap;
}
dvfy-component-playground .sc__api-empty {
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
  font-style: italic;
}
`;

/* ── Skip list: components that aren't useful to showcase standalone ── */
const SKIP_TAGS = new Set([
  'dvfy-tab',
  'dvfy-sidebar-section',
  'dvfy-avatar-group',
  'dvfy-toast',
  'dvfy-component-playground',
]);

/*
 * ── Default innerHTML per component ──
 *
 * SECURITY NOTE: All values in this map are hardcoded string literals authored
 * by the library maintainers. They are NEVER derived from user input, URL
 * parameters, or external data. The content is injected via innerHTML into a
 * preview sandbox that only the local developer sees (the catalog is served on
 * localhost / Tailscale). This is safe because:
 *   1. The data source is trusted (this source file).
 *   2. There is no path for untrusted input to reach these values.
 *   3. The catalog is not publicly accessible.
 */
const DEFAULT_CONTENT = {
  'dvfy-button': 'Click me',
  'dvfy-input': '',
  'dvfy-textarea': '',
  'dvfy-select': '<option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option>',
  'dvfy-checkbox': '<dvfy-checkbox label="Accept terms" name="terms"></dvfy-checkbox>\n<dvfy-checkbox label="Select all" indeterminate></dvfy-checkbox>\n<dvfy-checkbox label="Small option" size="sm"></dvfy-checkbox>\n<dvfy-checkbox label="Large option" size="lg" checked></dvfy-checkbox>\n<dvfy-checkbox label="Disabled" disabled checked></dvfy-checkbox>',
  'dvfy-radio': '',
  'dvfy-switch': '',
  'dvfy-slider': '<dvfy-slider label="Volume" value="50" show-value></dvfy-slider>\n<dvfy-slider label="Opacity" min="0" max="1" step="0.01" value="0.5" variant="oval" show-value></dvfy-slider>\n<dvfy-slider label="Knobs Only" value="40" no-fill show-value></dvfy-slider>\n<dvfy-slider label="Price Range" min="0" max="1000" value="200" value-end="800" range show-value></dvfy-slider>\n<dvfy-slider label="Range (no fill)" min="0" max="100" value="25" value-end="75" range no-fill show-value></dvfy-slider>\n<dvfy-slider label="Rating" min="0" max="10" steps="10" value="5" show-value></dvfy-slider>\n<dvfy-slider label="Disabled" value="30" disabled show-value></dvfy-slider>',
  'dvfy-badge': 'Status',
  'dvfy-tag': 'Label',
  'dvfy-avatar': '',
  'dvfy-alert': 'This is an alert message.',
  'dvfy-loader': '',
  'dvfy-card': '<h3 style="margin-bottom:0.5rem">Card Title</h3><p style="color:var(--dvfy-text-secondary);font-size:var(--dvfy-text-sm)">Card content goes here.</p>',
  'dvfy-progress': '',
  'dvfy-tabs': '<dvfy-tab label="Tab 1"><p style="padding:1rem">First tab content</p></dvfy-tab><dvfy-tab label="Tab 2"><p style="padding:1rem">Second tab content</p></dvfy-tab>',
  'dvfy-dropdown': '<dvfy-button variant="outline">Actions</dvfy-button><div class="dvfy-dropdown__item">Edit</div><div class="dvfy-dropdown__item">Delete</div>',
  'dvfy-tooltip': '<dvfy-button variant="outline" size="sm">Hover me</dvfy-button>',
  'dvfy-modal': '<p>Modal content goes here.</p>',
  'dvfy-breadcrumb': '<a href="#">Home</a><a href="#">Products</a><span>Current</span>',
  'dvfy-pagination': '',
  'dvfy-table': '<table><thead><tr><th data-sort>Name</th><th data-sort>Role</th></tr></thead><tbody><tr><td>Alice</td><td>Engineer</td></tr><tr><td>Bob</td><td>Designer</td></tr></tbody></table>',
  'dvfy-empty': '',
  'dvfy-auth': '',
  'dvfy-nav': '<a href="#home">Home</a><a href="#about">About</a><a href="#contact">Contact</a><dvfy-button variant="default" size="sm">Sign In</dvfy-button>',
  'dvfy-sidebar': '',
  'dvfy-hamburger': '',
  'dvfy-drawer': '<p>Drawer body content. This panel scrolls independently and can be collapsed.</p><p style="margin-top:0.5rem;color:var(--dvfy-text-muted);font-size:var(--dvfy-text-sm)">Try the collapse button in the header.</p>',
  'dvfy-section': '<p>Section content here.</p>',
  'dvfy-theme-switcher': '<option value="devify-cyan">Cyan</option><option value="devify-pink">Pink</option>',
  'dvfy-accordion': '<dvfy-section label="Section One" open><p>First section content.</p></dvfy-section><dvfy-section label="Section Two" collapsed><p>Second section content.</p></dvfy-section><dvfy-section label="Section Three" collapsed><p>Third section content.</p></dvfy-section>',
  'dvfy-carousel': '<dvfy-slide style="background:var(--dvfy-primary-bg);color:#fff;border-radius:var(--dvfy-radius-lg);padding:var(--dvfy-space-8);display:flex;align-items:center;justify-content:center;min-height:160px;font-size:var(--dvfy-text-xl);font-weight:var(--dvfy-weight-semibold)">Slide 1</dvfy-slide><dvfy-slide style="background:var(--dvfy-surface-raised);border:1px solid var(--dvfy-border-default);border-radius:var(--dvfy-radius-lg);padding:var(--dvfy-space-8);display:flex;align-items:center;justify-content:center;min-height:160px;font-size:var(--dvfy-text-xl);font-weight:var(--dvfy-weight-semibold)">Slide 2</dvfy-slide><dvfy-slide style="background:var(--dvfy-surface-raised);border:1px solid var(--dvfy-border-default);border-radius:var(--dvfy-radius-lg);padding:var(--dvfy-space-8);display:flex;align-items:center;justify-content:center;min-height:160px;font-size:var(--dvfy-text-xl);font-weight:var(--dvfy-weight-semibold)">Slide 3</dvfy-slide>',
  'dvfy-page-transition': '<dvfy-page-transition animation="fade"><dvfy-card padded><h3 style="margin:0 0 0.5rem">Fade Transition</h3><p style="margin:0;color:var(--dvfy-text-secondary);font-size:var(--dvfy-text-sm)">MPA: add mpa attr to activate cross-page transitions.</p></dvfy-card></dvfy-page-transition>',
  'dvfy-scroll-reveal': '<div style="height:150px;overflow-y:auto;border:1px solid var(--dvfy-border-default);border-radius:var(--dvfy-radius-lg);padding:var(--dvfy-space-4)"><div style="height:200px;display:flex;align-items:end;color:var(--dvfy-text-muted);font-size:var(--dvfy-text-sm)">Scroll down</div><dvfy-scroll-reveal animation="fade-up"><dvfy-card padded><h3 style="margin:0 0 0.5rem">Revealed Card</h3><p style="margin:0;color:var(--dvfy-text-secondary);font-size:var(--dvfy-text-sm)">This card fades up as you scroll into view.</p></dvfy-card></dvfy-scroll-reveal><div style="height:200px"></div></div>',
  'dvfy-tree-view': '<dvfy-tree-view><dvfy-tree-node label="Documents" icon="\uD83D\uDCC1" expanded><dvfy-tree-node label="README.md" icon="\uD83D\uDCC4" href="#readme"></dvfy-tree-node><dvfy-tree-node label="Images" icon="\uD83D\uDCC1"><dvfy-tree-node label="logo.png" icon="\uD83D\uDDBC\uFE0F" href="#logo"></dvfy-tree-node><dvfy-tree-node label="banner.jpg" icon="\uD83D\uDDBC\uFE0F" href="#banner"></dvfy-tree-node></dvfy-tree-node></dvfy-tree-node><dvfy-tree-node label="Settings" icon="\u2699\uFE0F" href="#settings"></dvfy-tree-node></dvfy-tree-view>',
};

/* ── Utilities ── */

/**
 * Parse enum values from a description string like "variant: default | subtle | outline"
 * or "Size: sm | md | lg (default: \"md\")"
 */
function parseEnumValues(description) {
  if (!description) return null;
  // Match patterns like: "value1 | value2 | value3" or "value1|value2|value3"
  const pipeMatch = description.match(/(?:^|:\s*)([\w-]+(?:\s*\|\s*[\w-]+)+)/);
  if (pipeMatch) {
    return pipeMatch[1].split(/\s*\|\s*/).map(v => v.trim()).filter(Boolean);
  }
  return null;
}

/**
 * Parse default value from description like '(default: "md")' or "(default: md)"
 */
function parseDefault(description) {
  if (!description) return null;
  const m = description.match(/\(default:\s*"?([^")]+)"?\)/i);
  return m ? m[1].trim() : null;
}

/** Escape HTML for display in code/API tables */
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

class DvfyComponentPlayground extends HTMLElement {
  static #styled = false;

  #manifest = null;
  #tags = [];
  #currentTag = null;
  #attrValues = {};       // { attrName: currentValue }
  #contentValue = '';      // current innerHTML for preview

  connectedCallback() {
    if (!DvfyComponentPlayground.#styled) {
      const s = document.createElement('style');
      s.textContent = PLAYGROUND_STYLES;
      document.head.appendChild(s);
      DvfyComponentPlayground.#styled = true;
    }
    this.#loadManifest();
  }

  static get observedAttributes() { return ['component', 'src']; }

  attributeChangedCallback(name) {
    if (!this.isConnected || !this.#manifest) return;
    if (name === 'component') {
      const tagName = this.getAttribute('component');
      const tag = this.#tags.find(t => t.name === tagName);
      if (tag) this.#selectComponent(tag);
    }
    if (name === 'src') this.#loadManifest();
  }

  async #loadManifest() {
    const src = this.getAttribute('src') || '../custom-elements.json';
    try {
      const res = await fetch(src);
      this.#manifest = await res.json();
      this.#tags = (this.#manifest.tags || [])
        .filter(t => !SKIP_TAGS.has(t.name))
        .sort((a, b) => a.name.localeCompare(b.name));
      this.#build();
    } catch (e) {
      this.textContent = '';
      const err = document.createElement('dvfy-alert');
      err.setAttribute('status', 'danger');
      err.setAttribute('title', 'Failed to load manifest');
      err.textContent = `Could not fetch ${src}: ${e.message}`;
      this.appendChild(err);
    }
  }

  #build() {
    this.textContent = '';

    // ── Picker (hidden when component attr is set — sidebar navigates instead) ──
    const hasComponentAttr = this.hasAttribute('component');
    if (!hasComponentAttr) {
      const pickerWrap = document.createElement('div');
      pickerWrap.className = 'sc__picker';

      const select = document.createElement('dvfy-select');
      select.setAttribute('label', 'Component');
      select.setAttribute('placeholder', 'Pick a component...');
      select.setAttribute('searchable', '');

      for (const tag of this.#tags) {
        const opt = document.createElement('option');
        opt.value = tag.name;
        opt.textContent = `<${tag.name}>`;
        select.appendChild(opt);
      }

      select.addEventListener('change', (e) => {
        const tagName = e.detail?.value || e.target?.value;
        const tag = this.#tags.find(t => t.name === tagName);
        if (tag) this.#selectComponent(tag);
      });
      pickerWrap.appendChild(select);
      this.appendChild(pickerWrap);
    }

    // ── Body (populated by selectComponent) ──
    const body = document.createElement('div');
    body.className = 'sc__body';
    body.setAttribute('data-sc-body', '');
    this.appendChild(body);

    // Auto-select if component attr is set
    const initial = this.getAttribute('component');
    if (initial) {
      const tag = this.#tags.find(t => t.name === initial);
      if (tag) this.#selectComponent(tag);
    }
  }

  #selectComponent(tag) {
    this.#currentTag = tag;
    this.#attrValues = {};
    this.#contentValue = tag.name in DEFAULT_CONTENT ? DEFAULT_CONTENT[tag.name] : 'Sample content';

    // Init all attributes — booleans respect (default: true) from description
    if (tag.attributes) {
      for (const attr of tag.attributes) {
        if (attr.type === 'boolean') {
          this.#attrValues[attr.name] = parseDefault(attr.description) === 'true';
        } else {
          this.#attrValues[attr.name] = '';
        }
      }
    }

    const body = this.querySelector('[data-sc-body]');
    if (!body) return;
    body.textContent = '';

    // ── Left: tabs (Preview / Code / API) — fills remaining space ──
    const left = document.createElement('div');
    left.className = 'sc__preview-col';

    const tabs = document.createElement('dvfy-tabs');
    const previewTab = document.createElement('dvfy-tab');
    previewTab.setAttribute('label', 'Preview');
    const previewArea = document.createElement('div');
    previewArea.className = 'sc__preview-area';
    previewArea.setAttribute('data-sc-preview', '');
    previewTab.appendChild(previewArea);
    tabs.appendChild(previewTab);

    const codeTab = document.createElement('dvfy-tab');
    codeTab.setAttribute('label', 'Code');
    const codeWrap = document.createElement('div');
    codeWrap.className = 'sc__code-wrap';
    const copyBtn = document.createElement('dvfy-button');
    copyBtn.setAttribute('variant', 'ghost');
    copyBtn.setAttribute('size', 'sm');
    copyBtn.className = 'sc__code-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      const code = this.querySelector('[data-sc-code]');
      if (code) {
        navigator.clipboard.writeText(code.textContent).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        });
      }
    });
    codeWrap.appendChild(copyBtn);
    const codeBlock = document.createElement('pre');
    codeBlock.className = 'sc__code';
    codeBlock.setAttribute('data-sc-code', '');
    codeWrap.appendChild(codeBlock);
    codeTab.appendChild(codeWrap);
    tabs.appendChild(codeTab);

    const apiTab = document.createElement('dvfy-tab');
    apiTab.setAttribute('label', 'API');
    const apiContent = document.createElement('div');
    apiContent.setAttribute('data-sc-api', '');
    apiTab.appendChild(apiContent);
    tabs.appendChild(apiTab);

    left.appendChild(tabs);
    body.appendChild(left);

    // ── Right: collapsible drawer with scrollable controls ──
    const drawer = document.createElement('div');
    drawer.className = 'sc__drawer';
    drawer.setAttribute('data-sc-drawer', '');

    // Re-open tab (visible when collapsed)
    const reopen = document.createElement('button');
    reopen.className = 'sc__drawer-reopen';
    reopen.textContent = 'Controls';
    reopen.setAttribute('aria-label', 'Open controls panel');
    reopen.addEventListener('click', () => {
      drawer.removeAttribute('data-collapsed');
      reopen.removeAttribute('data-visible');
    });
    body.appendChild(reopen);

    // Drawer header with title + collapse button
    const drawerHeader = document.createElement('div');
    drawerHeader.className = 'sc__drawer-header';
    const title = document.createElement('p');
    title.className = 'sc__controls-title';
    title.textContent = 'Controls';
    drawerHeader.appendChild(title);

    const toggle = document.createElement('button');
    toggle.className = 'sc__drawer-toggle';
    toggle.setAttribute('aria-label', 'Collapse controls panel');
    toggle.setAttribute('title', 'Collapse controls');
    toggle.textContent = '\u00D7'; // ×
    toggle.addEventListener('click', () => {
      drawer.setAttribute('data-collapsed', '');
      reopen.setAttribute('data-visible', '');
    });
    drawerHeader.appendChild(toggle);
    drawer.appendChild(drawerHeader);

    // Scrollable body
    const drawerBody = document.createElement('div');
    drawerBody.className = 'sc__drawer-body';
    const controlsWrap = document.createElement('div');
    controlsWrap.className = 'sc__controls';
    controlsWrap.setAttribute('data-sc-controls', '');
    drawerBody.appendChild(controlsWrap);
    drawer.appendChild(drawerBody);

    body.appendChild(drawer);

    // Populate
    this.#buildControls();
    this.#updatePreview();
    this.#updateCode();
    this.#updateAPI();
  }

  #buildControls() {
    const wrap = this.querySelector('[data-sc-controls]');
    if (!wrap || !this.#currentTag) return;
    wrap.textContent = '';

    const attrs = this.#currentTag.attributes || [];

    for (const attr of attrs) {
      const enumVals = parseEnumValues(attr.description);
      const isBool = attr.type === 'boolean';

      if (isBool) {
        // Boolean → dvfy-switch
        const sw = document.createElement('dvfy-switch');
        sw.setAttribute('label', attr.name);
        if (attr.description) sw.setAttribute('description', attr.description);
        if (this.#attrValues[attr.name]) sw.setAttribute('checked', '');
        sw.addEventListener('change', () => {
          this.#attrValues[attr.name] = sw.hasAttribute('checked');
          this.#updatePreview();
          this.#updateCode();
        });
        wrap.appendChild(sw);

      } else if (enumVals) {
        // Enum → dvfy-select
        const sel = document.createElement('dvfy-select');
        sel.setAttribute('label', attr.name);
        const def = parseDefault(attr.description);
        if (def) sel.setAttribute('placeholder', def);

        // Add empty option for "unset"
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '(default)';
        sel.appendChild(emptyOpt);

        for (const v of enumVals) {
          const opt = document.createElement('option');
          opt.value = v;
          opt.textContent = v;
          sel.appendChild(opt);
        }
        sel.addEventListener('change', (e) => {
          this.#attrValues[attr.name] = e.detail?.value || '';
          this.#updatePreview();
          this.#updateCode();
        });
        wrap.appendChild(sel);

      } else if (attr.type === 'number') {
        // Number → dvfy-input[type=number]
        const inp = document.createElement('dvfy-input');
        inp.setAttribute('label', attr.name);
        inp.setAttribute('type', 'number');
        inp.setAttribute('placeholder', parseDefault(attr.description) || '');
        if (attr.description) inp.setAttribute('help', attr.description);
        inp.addEventListener('input', (e) => {
          const val = e.target?.value ?? inp.querySelector('input')?.value ?? '';
          this.#attrValues[attr.name] = val;
          this.#updatePreview();
          this.#updateCode();
        });
        wrap.appendChild(inp);

      } else {
        // String → dvfy-input
        const inp = document.createElement('dvfy-input');
        inp.setAttribute('label', attr.name);
        inp.setAttribute('placeholder', parseDefault(attr.description) || '');
        if (attr.description) inp.setAttribute('help', attr.description);
        inp.addEventListener('input', (e) => {
          const val = e.target?.value ?? inp.querySelector('input')?.value ?? '';
          this.#attrValues[attr.name] = val;
          this.#updatePreview();
          this.#updateCode();
        });
        wrap.appendChild(inp);
      }
    }

    // Content control (innerHTML) — only if component uses content
    const content = DEFAULT_CONTENT[this.#currentTag.name];
    if (content !== undefined && content !== '') {
      const sep = document.createElement('hr');
      sep.style.cssText = 'border:none;border-top:var(--dvfy-border-1) solid var(--dvfy-border-muted);margin:var(--dvfy-space-2) 0';
      wrap.appendChild(sep);

      const ta = document.createElement('dvfy-textarea');
      ta.setAttribute('label', 'Content (innerHTML)');
      ta.setAttribute('placeholder', 'Inner text...');
      ta.setAttribute('rows', '2');
      // Set initial value on the actual textarea after it connects
      requestAnimationFrame(() => {
        const native = ta.querySelector('textarea');
        if (native) native.value = this.#contentValue;
      });
      ta.addEventListener('input', (e) => {
        const val = e.target?.value ?? ta.querySelector('textarea')?.value ?? '';
        this.#contentValue = val;
        this.#updatePreview();
        this.#updateCode();
      });
      wrap.appendChild(ta);
    }
  }

  /**
   * Renders the live preview element.
   *
   * SECURITY NOTE on innerHTML usage below:
   * The content set via innerHTML comes from exactly two sources:
   *   1. The DEFAULT_CONTENT map — hardcoded trusted literals defined above.
   *   2. The "Content (innerHTML)" textarea — typed by the developer using
   *      the catalog locally. This catalog is served on localhost / Tailscale
   *      only (never public). The developer is effectively editing their own
   *      preview — this is equivalent to typing into browser DevTools.
   * There is no URL parameter, query string, or external data path that feeds
   * into this value. XSS requires an attacker-controlled input vector, which
   * does not exist here.
   */
  #updatePreview() {
    const area = this.querySelector('[data-sc-preview]');
    if (!area || !this.#currentTag) return;
    area.textContent = '';
    area.removeAttribute('style'); // reset any per-component overrides

    const el = document.createElement(this.#currentTag.name);

    // Apply attribute values
    for (const [name, value] of Object.entries(this.#attrValues)) {
      if (value === true) {
        el.setAttribute(name, '');
      } else if (value === false || value === '' || value == null) {
        // don't set
      } else {
        el.setAttribute(name, value);
      }
    }

    // Set content — sourced from trusted DEFAULT_CONTENT or local developer input only
    if (this.#contentValue) {
      el.innerHTML = this.#contentValue;  // eslint-disable-line no-unsanitized/property
    }

    // Layout components need a container context to demonstrate properly
    if (this.#currentTag.name === 'dvfy-drawer') {
      this.#renderDrawerPreview(area, el);
      return;
    }

    area.appendChild(el);
  }

  /**
   * Render dvfy-drawer inside a flex layout with toggle + sample content.
   * Uses DOM methods only — all content is hardcoded trusted strings.
   */
  #renderDrawerPreview(area, drawer) {
    // Override preview area to be a flex row filling the space
    area.style.display = 'flex';
    area.style.gap = '0';
    area.style.padding = '0';
    area.style.position = 'relative';
    area.style.alignItems = 'stretch';
    area.style.justifyContent = 'stretch';

    // Main content area
    const main = document.createElement('div');
    main.style.flex = '1';
    main.style.padding = 'var(--dvfy-space-4)';
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.gap = 'var(--dvfy-space-3)';
    main.style.minWidth = '0';
    main.style.justifyContent = 'center';
    main.style.alignItems = 'center';

    const toggle = document.createElement('dvfy-button');
    toggle.setAttribute('variant', 'outline');
    toggle.setAttribute('size', 'sm');
    toggle.textContent = drawer.hasAttribute('collapsed') ? 'Open Drawer' : 'Close Drawer';
    toggle.addEventListener('click', () => {
      drawer.collapsed = !drawer.collapsed;
      toggle.textContent = drawer.collapsed ? 'Open Drawer' : 'Close Drawer';
    });
    main.appendChild(toggle);

    const hint = document.createElement('p');
    hint.style.fontSize = 'var(--dvfy-text-sm)';
    hint.style.color = 'var(--dvfy-text-muted)';
    hint.style.textAlign = 'center';
    hint.textContent = 'Main content area';
    main.appendChild(hint);

    // Keep button label in sync with drawer events
    drawer.addEventListener('toggle', (e) => {
      toggle.textContent = e.detail.collapsed ? 'Open Drawer' : 'Close Drawer';
    });

    const pos = drawer.getAttribute('position') || 'right';
    if (pos === 'left') {
      area.appendChild(drawer);
      area.appendChild(main);
    } else if (pos === 'top') {
      area.style.flexDirection = 'column';
      area.appendChild(drawer);
      area.appendChild(main);
    } else if (pos === 'bottom') {
      area.style.flexDirection = 'column';
      area.appendChild(main);
      area.appendChild(drawer);
    } else {
      area.appendChild(main);
      area.appendChild(drawer);
    }
  }

  #updateCode() {
    const block = this.querySelector('[data-sc-code]');
    if (!block || !this.#currentTag) return;

    let html = `<${this.#currentTag.name}`;

    for (const [name, value] of Object.entries(this.#attrValues)) {
      if (value === true) {
        html += ` ${name}`;
      } else if (value && value !== '') {
        html += ` ${name}="${esc(value)}"`;
      }
    }

    html += '>';

    if (this.#contentValue) {
      // Show content indented for readability
      const lines = this.#contentValue.split('\n');
      if (lines.length > 1 || this.#contentValue.length > 40) {
        html += '\n  ' + lines.join('\n  ') + '\n';
      } else {
        html += this.#contentValue;
      }
    }

    html += `</${this.#currentTag.name}>`;

    block.textContent = html;
  }

  #updateAPI() {
    const container = this.querySelector('[data-sc-api]');
    if (!container || !this.#currentTag) return;
    container.textContent = '';

    const tag = this.#currentTag;

    // Description
    if (tag.description) {
      const desc = document.createElement('p');
      desc.style.cssText = 'font-size:var(--dvfy-text-sm);color:var(--dvfy-text-secondary);margin:0 0 var(--dvfy-space-4) 0';
      desc.textContent = tag.description;
      container.appendChild(desc);
    }

    // Attributes table
    this.#renderAPITable(container, 'Attributes', tag.attributes, [
      { label: 'Name', get: a => esc(a.name) },
      { label: 'Type', get: a => esc(a.type || '\u2014') },
      { label: 'Description', get: a => esc(a.description || '\u2014') },
    ]);

    // Events table
    if (tag.events?.length) {
      this.#renderAPITable(container, 'Events', tag.events, [
        { label: 'Name', get: e => esc(e.name) },
        { label: 'Description', get: e => esc(e.description || '\u2014') },
      ]);
    }

    // CSS Custom Properties
    if (tag.cssProperties?.length) {
      this.#renderAPITable(container, 'CSS Custom Properties', tag.cssProperties, [
        { label: 'Property', get: p => esc(p.name) },
        { label: 'Type', get: p => esc(p.type || 'color') },
        { label: 'Description', get: p => esc(p.description || '\u2014') },
      ]);
    }

    // Slots
    if (tag.slots?.length) {
      this.#renderAPITable(container, 'Slots', tag.slots, [
        { label: 'Name', get: s => esc(s.name || '(default)') },
        { label: 'Description', get: s => esc(s.description || '\u2014') },
      ]);
    }
  }

  /**
   * Renders an API documentation table using DOM methods.
   *
   * SECURITY NOTE: Cell content uses innerHTML with values that have been
   * escaped via esc() (HTML entity encoding). The raw data comes from our
   * own WCA-generated custom-elements.json manifest — a build artifact from
   * our source code, not user input.
   */
  #renderAPITable(container, title, items, cols) {
    const section = document.createElement('div');
    section.className = 'sc__api-section';

    const h = document.createElement('p');
    h.className = 'sc__api-title';
    h.textContent = title;
    section.appendChild(h);

    if (!items || !items.length) {
      const empty = document.createElement('p');
      empty.className = 'sc__api-empty';
      empty.textContent = 'None';
      section.appendChild(empty);
      container.appendChild(section);
      return;
    }

    const table = document.createElement('table');
    table.className = 'sc__api-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const col of cols) {
      const th = document.createElement('th');
      th.textContent = col.label;
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const item of items) {
      const row = document.createElement('tr');
      for (const col of cols) {
        const td = document.createElement('td');
        // Content from WCA manifest, escaped via esc() in col.get()
        td.innerHTML = col.get(item);  // eslint-disable-line no-unsanitized/property
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    section.appendChild(table);
    container.appendChild(section);
  }
}

customElements.define('dvfy-component-playground', DvfyComponentPlayground);
