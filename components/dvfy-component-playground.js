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
  position: relative;
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

/* Preview area — fills available height, default layout: center */
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

/* Layout: stretch — full-width, vertically centered (inputs, navs, progress) */
dvfy-component-playground .sc__preview-area[data-layout="stretch"] {
  justify-content: stretch;
  flex-wrap: nowrap;
}
dvfy-component-playground .sc__preview-area[data-layout="stretch"] > * {
  width: 100%;
}

/* Layout: fill — component fills entire preview (cards, tables, accordion) */
dvfy-component-playground .sc__preview-area[data-layout="fill"] {
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
  flex-wrap: nowrap;
  overflow: hidden;
}
dvfy-component-playground .sc__preview-area[data-layout="fill"] > * {
  flex: 1;
  min-width: 0;
}

/* Layout: edge — attached to container edges with sibling content (drawer, sidebar) */
dvfy-component-playground .sc__preview-area[data-layout="edge"] {
  padding: 0;
  gap: 0;
  align-items: stretch;
  justify-content: stretch;
  flex-wrap: nowrap;
  overflow: hidden;
}

/* Layout: overlay — centered trigger, component positions itself (modal, toast, tooltip) */
dvfy-component-playground .sc__preview-area[data-layout="overlay"] {
  align-items: center;
  justify-content: center;
}

/* Layout: top-bar — pinned to top with simulated page content below */
dvfy-component-playground .sc__preview-area[data-layout="top-bar"] {
  padding: 0;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow: hidden;
}

/* Layout: inline-group — horizontal flex at natural size, not stretched */
dvfy-component-playground .sc__preview-area[data-layout="inline-group"] {
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
}
dvfy-component-playground .sc__preview-area[data-layout="inline-group"] > * {
  flex: none;
}

/* Layout mode label — aligned with the tab bar, top-right of preview column */
dvfy-component-playground .sc__layout-label {
  position: absolute;
  top: var(--dvfy-space-2);
  right: var(--dvfy-space-2);
  font-family: var(--dvfy-font-mono);
  font-size: var(--dvfy-text-xs);
  color: var(--dvfy-text-muted);
  padding: var(--dvfy-space-1) var(--dvfy-space-2);
  border: var(--dvfy-border-1) solid var(--dvfy-border-muted);
  border-radius: var(--dvfy-radius-md);
  background: var(--dvfy-surface-raised);
  white-space: nowrap;
  pointer-events: none;
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

/** Attributes to hide from playground controls (init-only, not interactive). */
const SKIP_ATTRS = {
  'dvfy-theme-switcher': new Set(['default-theme']),
};

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
  'dvfy-compare-slider': '<svg slot="before" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block"><defs><linearGradient id="sky-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8c8c8"/><stop offset="100%" stop-color="#d5d0ca"/></linearGradient></defs><rect width="400" height="250" fill="url(#sky-b)"/><circle cx="320" cy="55" r="28" fill="#d4c99a" opacity="0.6"/><rect x="0" y="170" width="400" height="80" fill="#b8b0a4"/><rect x="30" y="100" width="50" height="150" rx="2" fill="#8a8478"/><rect x="35" y="108" width="12" height="10" rx="1" fill="#9e978b"/><rect x="53" y="108" width="12" height="10" rx="1" fill="#9e978b"/><rect x="35" y="125" width="12" height="10" rx="1" fill="#9e978b"/><rect x="53" y="125" width="12" height="10" rx="1" fill="#9e978b"/><rect x="35" y="142" width="12" height="10" rx="1" fill="#9e978b"/><rect x="53" y="142" width="12" height="10" rx="1" fill="#9e978b"/><rect x="100" y="70" width="60" height="180" rx="2" fill="#918b7f"/><rect x="108" y="78" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="130" y="78" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="108" y="95" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="130" y="95" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="108" y="112" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="130" y="112" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="108" y="129" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="130" y="129" width="14" height="10" rx="1" fill="#a19b8f"/><rect x="180" y="120" width="55" height="130" rx="2" fill="#87817a"/><rect x="188" y="128" width="12" height="10" rx="1" fill="#9a9488"/><rect x="207" y="128" width="12" height="10" rx="1" fill="#9a9488"/><rect x="188" y="145" width="12" height="10" rx="1" fill="#9a9488"/><rect x="207" y="145" width="12" height="10" rx="1" fill="#9a9488"/><rect x="255" y="90" width="45" height="160" rx="2" fill="#8a847d"/><rect x="262" y="98" width="10" height="8" rx="1" fill="#9a9490"/><rect x="278" y="98" width="10" height="8" rx="1" fill="#9a9490"/><rect x="262" y="113" width="10" height="8" rx="1" fill="#9a9490"/><rect x="278" y="113" width="10" height="8" rx="1" fill="#9a9490"/><rect x="262" y="128" width="10" height="8" rx="1" fill="#9a9490"/><rect x="278" y="128" width="10" height="8" rx="1" fill="#9a9490"/><rect x="315" y="130" width="55" height="120" rx="2" fill="#87817a"/><rect x="323" y="138" width="12" height="10" rx="1" fill="#9a9488"/><rect x="342" y="138" width="12" height="10" rx="1" fill="#9a9488"/><rect x="323" y="155" width="12" height="10" rx="1" fill="#9a9488"/><rect x="342" y="155" width="12" height="10" rx="1" fill="#9a9488"/><circle cx="60" cy="195" r="6" fill="#a09a8e"/><circle cx="200" cy="200" r="6" fill="#a09a8e"/><circle cx="340" cy="195" r="6" fill="#a09a8e"/></svg><svg slot="after" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block"><defs><linearGradient id="sky-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1a3e"/><stop offset="100%" stop-color="#2d1b4e"/></linearGradient></defs><rect width="400" height="250" fill="url(#sky-a)"/><circle cx="320" cy="55" r="28" fill="#f0e68c" opacity="0.9"/><circle cx="320" cy="55" r="22" fill="#1a1a3e"/><circle cx="326" cy="50" r="20" fill="#f0e68c" opacity="0.9"/><rect x="0" y="170" width="400" height="80" fill="#1a1a2e"/><rect x="30" y="100" width="50" height="150" rx="2" fill="#2a2845"/><rect x="35" y="108" width="12" height="10" rx="1" fill="#f5c542" opacity="0.8"/><rect x="53" y="108" width="12" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="35" y="125" width="12" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="53" y="125" width="12" height="10" rx="1" fill="#f5c542" opacity="0.8"/><rect x="35" y="142" width="12" height="10" rx="1" fill="#f5c542" opacity="0.6"/><rect x="53" y="142" width="12" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="100" y="70" width="60" height="180" rx="2" fill="#252340"/><rect x="108" y="78" width="14" height="10" rx="1" fill="#f5c542" opacity="0.9"/><rect x="130" y="78" width="14" height="10" rx="1" fill="#f5c542" opacity="0.6"/><rect x="108" y="95" width="14" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="130" y="95" width="14" height="10" rx="1" fill="#f5c542" opacity="0.8"/><rect x="108" y="112" width="14" height="10" rx="1" fill="#f5c542" opacity="0.7"/><rect x="130" y="112" width="14" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="108" y="129" width="14" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="130" y="129" width="14" height="10" rx="1" fill="#f5c542" opacity="0.9"/><rect x="180" y="120" width="55" height="130" rx="2" fill="#2a2845"/><rect x="188" y="128" width="12" height="10" rx="1" fill="#f5c542" opacity="0.8"/><rect x="207" y="128" width="12" height="10" rx="1" fill="#f5c542" opacity="0.6"/><rect x="188" y="145" width="12" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="207" y="145" width="12" height="10" rx="1" fill="#f5c542" opacity="0.7"/><rect x="255" y="90" width="45" height="160" rx="2" fill="#252340"/><rect x="262" y="98" width="10" height="8" rx="1" fill="#f5c542" opacity="0.9"/><rect x="278" y="98" width="10" height="8" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="262" y="113" width="10" height="8" rx="1" fill="#f5c542" opacity="0.7"/><rect x="278" y="113" width="10" height="8" rx="1" fill="#f5c542" opacity="0.6"/><rect x="262" y="128" width="10" height="8" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="278" y="128" width="10" height="8" rx="1" fill="#f5c542" opacity="0.8"/><rect x="315" y="130" width="55" height="120" rx="2" fill="#2a2845"/><rect x="323" y="138" width="12" height="10" rx="1" fill="#f5c542" opacity="0.8"/><rect x="342" y="138" width="12" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="323" y="155" width="12" height="10" rx="1" fill="#4a90d9" opacity="0.5"/><rect x="342" y="155" width="12" height="10" rx="1" fill="#f5c542" opacity="0.9"/><circle cx="60" cy="195" r="6" fill="#f5c542" opacity="0.4"/><circle cx="200" cy="200" r="6" fill="#f5c542" opacity="0.4"/><circle cx="340" cy="195" r="6" fill="#f5c542" opacity="0.4"/><circle cx="50" cy="20" r="1" fill="#fff" opacity="0.6"/><circle cx="120" cy="35" r="1.2" fill="#fff" opacity="0.5"/><circle cx="180" cy="15" r="0.8" fill="#fff" opacity="0.7"/><circle cx="250" cy="30" r="1" fill="#fff" opacity="0.4"/><circle cx="80" cy="50" r="0.8" fill="#fff" opacity="0.5"/><circle cx="150" cy="45" r="1.2" fill="#fff" opacity="0.6"/><circle cx="220" cy="55" r="0.8" fill="#fff" opacity="0.4"/></svg>',
  'dvfy-carousel': '<dvfy-slide><div style="display:flex;align-items:center;justify-content:center;height:12rem;background:var(--dvfy-primary-bg-subtle);border-radius:var(--dvfy-radius-lg);font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-lg);font-weight:var(--dvfy-weight-semibold);color:var(--dvfy-primary-bg)">Slide 1</div></dvfy-slide><dvfy-slide><div style="display:flex;align-items:center;justify-content:center;height:12rem;background:var(--dvfy-accent-bg-subtle);border-radius:var(--dvfy-radius-lg);font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-lg);font-weight:var(--dvfy-weight-semibold);color:var(--dvfy-accent-bg)">Slide 2</div></dvfy-slide><dvfy-slide><div style="display:flex;align-items:center;justify-content:center;height:12rem;background:var(--dvfy-success-bg-subtle);border-radius:var(--dvfy-radius-lg);font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-lg);font-weight:var(--dvfy-weight-semibold);color:var(--dvfy-success-text)">Slide 3</div></dvfy-slide><dvfy-slide><div style="display:flex;align-items:center;justify-content:center;height:12rem;background:var(--dvfy-warning-bg-subtle);border-radius:var(--dvfy-radius-lg);font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-lg);font-weight:var(--dvfy-weight-semibold);color:var(--dvfy-warning-text)">Slide 4</div></dvfy-slide>',
  'dvfy-progress': '',
  'dvfy-tabs': '<dvfy-tab label="Tab 1"><p style="padding:1rem">First tab content</p></dvfy-tab><dvfy-tab label="Tab 2"><p style="padding:1rem">Second tab content</p></dvfy-tab>',
  'dvfy-dropdown': '<dvfy-button variant="outline">Actions</dvfy-button><div class="dvfy-dropdown__item">Edit</div><div class="dvfy-dropdown__item">Delete</div>',
  'dvfy-tooltip': '<dvfy-button variant="outline" size="sm">Hover me</dvfy-button>',
  'dvfy-modal': '<p>Modal content goes here.</p>',
  'dvfy-breadcrumb': '<a href="#">Home</a><a href="#">Products</a><span>Current</span>',
  'dvfy-pagination': '',
  'dvfy-table': '<table><thead><tr><th data-sort>Name</th><th data-sort>Role</th></tr></thead><tbody><tr><td>Alice</td><td>Engineer</td></tr><tr><td>Bob</td><td>Designer</td></tr></tbody></table>',
  'dvfy-empty': '<dvfy-button variant="outline" size="sm">Clear filters</dvfy-button>',
  'dvfy-auth': '',
  'dvfy-nav': '',
  'dvfy-nav-menu': '<dvfy-nav href="#home">Home</dvfy-nav><dvfy-nav href="#about">About</dvfy-nav><dvfy-nav href="#contact">Contact</dvfy-nav>',
  'dvfy-nav-bar': '<dvfy-nav-menu><dvfy-nav href="#home">Home</dvfy-nav><dvfy-nav href="#about">About</dvfy-nav><dvfy-nav href="#contact">Contact</dvfy-nav></dvfy-nav-menu><dvfy-button variant="default" size="sm">Sign In</dvfy-button>',
  'dvfy-sidebar': '',
  'dvfy-hamburger': '',
  'dvfy-drawer': '<p>Drawer body content. This panel scrolls independently and can be collapsed.</p><p style="margin-top:0.5rem;color:var(--dvfy-text-muted);font-size:var(--dvfy-text-sm)">Try the collapse button in the header.</p>',
  'dvfy-section': '<p>Section content here.</p>',
  'dvfy-theme-switcher': '<option value="devify-cyan">Devify Cyan</option><option value="devify-pink">Devify Pink</option>',
  'dvfy-accordion': '<dvfy-section label="Section One" open><p>First section content.</p></dvfy-section><dvfy-section label="Section Two" collapsed><p>Second section content.</p></dvfy-section><dvfy-section label="Section Three" collapsed><p>Third section content.</p></dvfy-section>',
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
 * @attr {string} layout - Preview layout mode: center | stretch | fill | edge | overlay (default: "center")
 *
 * @slot - Not used
 *
 * @cssprop {color} --dvfy-surface-raised - Card/panel background
 * @cssprop {color} --dvfy-border-muted - Panel borders
 * @cssprop {color} --dvfy-primary-bg - Active tab accent
 */
class DvfyComponentPlayground extends HTMLElement {
  static #styled = false;

  #manifest = null;
  #tags = [];
  #currentTag = null;
  #attrValues = {};       // { attrName: currentValue }
  #cssValues = {};        // { '--dvfy-prop-name': currentValue }
  #contentValue = '';      // current innerHTML for preview
  #loadId = 0;            // Invalidates stale fetches

  connectedCallback() {
    if (!DvfyComponentPlayground.#styled) {
      const s = document.createElement('style');
      s.textContent = PLAYGROUND_STYLES;
      document.head.appendChild(s);
      DvfyComponentPlayground.#styled = true;
    }
    this.#loadManifest();
  }

  static get observedAttributes() { return ['component', 'src', 'layout']; }

  attributeChangedCallback(name) {
    if (!this.isConnected || !this.#manifest) return;
    if (name === 'component' || name === 'layout') {
      const tagName = this.getAttribute('component');
      const tag = this.#tags.find(t => t.name === tagName);
      if (tag) this.#selectComponent(tag);
    }
    if (name === 'src') this.#loadManifest();
  }

  async #loadManifest() {
    const id = ++this.#loadId;
    const src = this.getAttribute('src') || '../custom-elements.json';
    try {
      const res = await fetch(src);
      if (id !== this.#loadId || !this.isConnected) return; // stale
      this.#manifest = await res.json();
      this.#tags = (this.#manifest.tags || [])
        .filter(t => !SKIP_TAGS.has(t.name))
        .sort((a, b) => a.name.localeCompare(b.name));
      this.#build();
    } catch (e) {
      if (id !== this.#loadId || !this.isConnected) return;
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
    this.#cssValues = {};
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

    // Layout mode label — sits at the end of the tab bar
    const layoutLabel = document.createElement('span');
    layoutLabel.className = 'sc__layout-label';
    layoutLabel.textContent = this.getAttribute('layout') || 'center';
    left.appendChild(layoutLabel);

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

    const skipSet = SKIP_ATTRS[this.#currentTag.name];
    const attrs = (this.#currentTag.attributes || [])
      .filter(a => !skipSet?.has(a.name));

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

    // CSS custom property controls — color pickers for @cssprop entries
    const cssProps = (this.#currentTag.cssProperties || [])
      .filter(p => p.type === 'color');
    if (cssProps.length) {
      const cssSep = document.createElement('hr');
      cssSep.style.cssText = 'border:none;border-top:var(--dvfy-border-1) solid var(--dvfy-border-muted);margin:var(--dvfy-space-2) 0';
      wrap.appendChild(cssSep);

      const cssLabel = document.createElement('p');
      cssLabel.style.cssText = 'font-size:var(--dvfy-text-xs);font-weight:var(--dvfy-weight-semibold);color:var(--dvfy-text-muted);text-transform:uppercase;letter-spacing:var(--dvfy-tracking-wider);margin:var(--dvfy-space-2) 0 var(--dvfy-space-1)';
      cssLabel.textContent = 'CSS Properties';
      wrap.appendChild(cssLabel);

      for (const prop of cssProps) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:var(--dvfy-space-2);margin-bottom:var(--dvfy-space-1-5)';

        const color = document.createElement('input');
        color.type = 'color';
        color.style.cssText = 'width:28px;height:28px;padding:0;border:var(--dvfy-border-1) solid var(--dvfy-border-muted);border-radius:var(--dvfy-radius-sm);cursor:pointer;background:none;flex-shrink:0';
        // Read the current computed value to set initial color
        const defaultDesc = prop.description || '';
        color.title = defaultDesc;

        const label = document.createElement('span');
        label.style.cssText = 'font-size:var(--dvfy-text-xs);color:var(--dvfy-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
        label.textContent = prop.name.replace('--dvfy-', '');
        label.title = prop.name;

        color.addEventListener('input', () => {
          this.#cssValues[prop.name] = color.value;
          this.#updatePreview();
        });

        row.appendChild(color);
        row.appendChild(label);
        wrap.appendChild(row);
      }
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

    // Apply layout hint from attribute (set by catalog router from COMPONENT_REGISTRY)
    const layout = this.getAttribute('layout') || 'center';
    area.setAttribute('data-layout', layout);

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
    // SECURITY: innerHTML source is hardcoded DEFAULT_CONTENT or local developer textarea only
    if (this.#contentValue) {
      el.innerHTML = this.#contentValue;  // eslint-disable-line no-unsanitized/property
    }

    // Apply CSS custom property overrides from color picker controls
    for (const [name, value] of Object.entries(this.#cssValues)) {
      if (value) el.style.setProperty(name, value);
    }

    // Edge-attached components need a container context to demonstrate properly
    if (layout === 'edge') {
      this.#renderEdgePreview(area, el);
      return;
    }

    // Top-bar components pin to top with simulated page content below
    if (layout === 'top-bar') {
      this.#renderTopBarPreview(area, el);
      return;
    }

    area.appendChild(el);
  }

  /**
   * Render edge-attached components (drawer, sidebar) inside a flex layout
   * with toggle + sample content area.
   * Uses DOM methods only — all content is hardcoded trusted strings.
   */
  #renderEdgePreview(area, el) {
    const tagName = this.#currentTag.name;

    // Main content area — fills remaining space next to the edge component
    const main = document.createElement('div');
    main.style.flex = '1';
    main.style.padding = 'var(--dvfy-space-4)';
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.gap = 'var(--dvfy-space-3)';
    main.style.minWidth = '0';
    main.style.justifyContent = 'center';
    main.style.alignItems = 'center';

    // Toggle button for collapsible edge components
    if (typeof el.collapsed !== 'undefined' || el.hasAttribute('collapsed')) {
      const label = tagName.replace('dvfy-', '').replace('-', ' ');
      const toggle = document.createElement('dvfy-button');
      toggle.setAttribute('variant', 'outline');
      toggle.setAttribute('size', 'sm');
      toggle.textContent = el.hasAttribute('collapsed') ? `Open ${label}` : `Close ${label}`;
      toggle.addEventListener('click', () => {
        el.collapsed = !el.collapsed;
        toggle.textContent = el.collapsed ? `Open ${label}` : `Close ${label}`;
      });
      main.appendChild(toggle);

      el.addEventListener('toggle', (e) => {
        toggle.textContent = e.detail?.collapsed ? `Open ${label}` : `Close ${label}`;
      });
    }

    const hint = document.createElement('p');
    hint.style.fontSize = 'var(--dvfy-text-sm)';
    hint.style.color = 'var(--dvfy-text-muted)';
    hint.style.textAlign = 'center';
    hint.textContent = 'Main content area';
    main.appendChild(hint);

    // Position: drawer supports left/right/top/bottom, sidebar is typically left/right
    const pos = el.getAttribute('position') || 'right';
    if (pos === 'left') {
      area.appendChild(el);
      area.appendChild(main);
    } else if (pos === 'top') {
      area.style.flexDirection = 'column';
      area.appendChild(el);
      area.appendChild(main);
    } else if (pos === 'bottom') {
      area.style.flexDirection = 'column';
      area.appendChild(main);
      area.appendChild(el);
    } else {
      area.appendChild(main);
      area.appendChild(el);
    }
  }

  /**
   * Render top-bar components (nav-bar) pinned to top of preview
   * with simulated page content below. Uses DOM methods only.
   */
  #renderTopBarPreview(area, el) {
    // Component pinned to top
    area.appendChild(el);

    // Simulated page content below
    const page = document.createElement('div');
    page.style.cssText = 'flex:1;padding:var(--dvfy-space-6);display:flex;flex-direction:column;gap:var(--dvfy-space-4);overflow-y:auto';

    const heading = document.createElement('h3');
    heading.style.cssText = 'font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-xl);font-weight:var(--dvfy-weight-bold);color:var(--dvfy-text-primary);margin:0';
    heading.textContent = 'Page Content';
    page.appendChild(heading);

    const para = document.createElement('p');
    para.style.cssText = 'font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-sm);color:var(--dvfy-text-muted);line-height:var(--dvfy-leading-relaxed);margin:0;max-width:40rem';
    para.textContent = 'This simulated content shows how the navigation bar appears at the top of a page. Resize the preview area or change the breakpoint attribute to see responsive behavior.';
    page.appendChild(para);

    const cards = document.createElement('div');
    cards.style.cssText = 'display:flex;gap:var(--dvfy-space-3);flex-wrap:wrap';
    for (let i = 0; i < 3; i++) {
      const card = document.createElement('div');
      card.style.cssText = 'flex:1;min-width:8rem;padding:var(--dvfy-space-4);background:var(--dvfy-surface-raised);border:var(--dvfy-border-1) solid var(--dvfy-border-muted);border-radius:var(--dvfy-radius-lg)';
      const title = document.createElement('p');
      title.style.cssText = 'font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-sm);font-weight:var(--dvfy-weight-semibold);color:var(--dvfy-text-primary);margin:0 0 var(--dvfy-space-1)';
      title.textContent = ['Dashboard', 'Analytics', 'Settings'][i];
      const desc = document.createElement('p');
      desc.style.cssText = 'font-family:var(--dvfy-font-sans);font-size:var(--dvfy-text-xs);color:var(--dvfy-text-muted);margin:0';
      desc.textContent = 'Sample card content';
      card.appendChild(title);
      card.appendChild(desc);
      cards.appendChild(card);
    }
    page.appendChild(cards);

    area.appendChild(page);
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

    // Include CSS custom property overrides as inline style
    const cssEntries = Object.entries(this.#cssValues).filter(([, v]) => v);
    if (cssEntries.length) {
      const styleStr = cssEntries.map(([k, v]) => `${k}: ${v}`).join('; ');
      html += ` style="${esc(styleStr)}"`;
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
