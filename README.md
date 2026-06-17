# @devify/ui

HTML Web Component library with design tokens, HTMX patterns, and PWA support for [Devify.me](https://devify.me) projects.

**Zero build step. No framework. Just HTML, CSS, and ES modules.**

## Live Catalog

Browse all components, themes, and patterns:

```bash
# Clone and serve locally
git clone git@github.com:devify-me/devify-ui.git
cd devify-ui

# Install and serve
npm install
npm run serve

# Open http://localhost:8090/catalog/
```

The catalog showcases every component with:
- Live interactive examples
- Theme switching (Cyan/Pink, light/dark)
- Responsive previews
- **Interactive API Viewer** — prop playground, live documentation, source code view (powered by `<api-viewer>` and `custom-elements.json`)

## Devify Integration and Scope

This is a tool in the `~/devify/` company boundary (see root `devify/README.md` for the full structure: studio/ OS, tools/ platform, projects/ portfolio, jobs/ + reports/ for recurrent company-wide ops).

- **Scope**: Per `studio/shared/sergio-layout.md` "Scope Rules for Layers", this is "tools work" or "platform work" (development/maintenance of shared tooling). It is *not* automatically "studio work" (to avoid scope creep into the standards layer). Studio coordination happens when changes impact VEmployee consistency, standards, or company ops (via learn/ proposals, devify-hr, or executive/ orchestration). Studio-scoped VEmployees can be assigned *into* this tools/ context while loading studio/ standards.
- **Standards**: Governed by `studio/` (the enduring OS / Corporate HQ). Load relevant standards from `studio/docs/operating-model/`, department docs when working here. All work should follow Operational DNA (G&P, Verification Before Completion, tasks/todo.md, learn synthesis, etc.).
- **VEmployee Model**: Studio-scoped personas can be reliably assigned here because of consistent internal structures. See `studio/docs/operating-model/vemployee-operating-model.md`.
- **Recurrent company work**: See root `jobs/` (e.g. for cross-tool analysis, cleanups) and `reports/`. Use `studio/skills/learn/SKILL.md` for upward synthesis to studio/ when broadly applicable.

See `studio/` for the full constitution and `devify/jobs/README.md` for company ops.

## Quick Start

### Via npm

```bash
npm install @devify/ui
```

```html
<!-- Load tokens + themes -->
<link rel="stylesheet" href="node_modules/@devify/ui/devify.css">

<!-- Load all components -->
<script type="module" src="node_modules/@devify/ui/devify.js"></script>
```

Or import individual components:

```js
import '@devify/ui/components/dvfy-button.js';
import '@devify/ui/components/dvfy-input.js';
```

### Via HTML (no npm)

```html
<!-- Load tokens + themes -->
<link rel="stylesheet" href="devify.css">

<!-- Load all components -->
<script type="module" src="devify.js"></script>
```

### Use components

```html
<dvfy-button variant="primary">Save</dvfy-button>
<dvfy-input label="Email" type="email" name="email" required></dvfy-input>
<dvfy-badge status="success">Active</dvfy-badge>
```

## Architecture

Three-tier token system following [UI Collective](https://uicollective.co/) methodology:

| Tier | Purpose | Location | Naming |
|------|---------|----------|--------|
| **1. Primitives** | Raw values, context-agnostic | `tokens/*.css` | `--dvfy-brand-500`, `--dvfy-space-4` |
| **2. Semantics** | Role-based aliases | `tokens/themes/*.css` | `--dvfy-primary-bg`, `--dvfy-text-secondary` |
| **3. Component** | Scoped overrides | `components/*.js` | In component CSS only |

### Brand Colors (Devify.me)

| Role | Color | Token |
|------|-------|-------|
| Primary | Cyan `#00E5E5` | `--dvfy-cyan-*` |
| Accent | Hot Pink `#FF3CAC` | `--dvfy-brand-*` |
| Dark | Indigo `#1A1040` | `--dvfy-indigo-*` |

## Components (54)

### Forms
`dvfy-button` `dvfy-input` `dvfy-textarea` `dvfy-select` `dvfy-checkbox` `dvfy-radio` `dvfy-switch` `dvfy-slider` `dvfy-date-picker` `dvfy-file-upload` `dvfy-live-search` [server] `dvfy-htmx-form` [server]

### Data Display
`dvfy-badge` `dvfy-tag` `dvfy-avatar` `dvfy-card` `dvfy-gradient-card` `dvfy-spotlight-card` `dvfy-table` `dvfy-empty` `dvfy-progress` `dvfy-scroll-progress` `dvfy-compare` `dvfy-marquee-scroll` `dvfy-carousel` `dvfy-htmx-table` [server]

### Feedback & Overlays
`dvfy-alert` `dvfy-loader` `dvfy-toast` `dvfy-modal` `dvfy-hovercard` `dvfy-confirm` [server]

### Navigation & Wayfinding
`dvfy-dropdown` `dvfy-tooltip` `dvfy-tabs` `dvfy-breadcrumb` `dvfy-pagination` `dvfy-hamburger` `dvfy-sidebar` `dvfy-nav` `dvfy-tree-view` `dvfy-tree-node`

### Layout
`dvfy-drawer` `dvfy-section` `dvfy-accordion` `dvfy-page-section` `dvfy-campaign-layout`

> **Campaign vs site layout.** Use `dvfy-campaign-layout` for **landing / campaign pages**: it
> is the no-nav page shell that honors Gardner's 1:1 attention ratio *by construction* — it
> deliberately omits the nav menu so the only clickable links are the CTA(s) toward the single
> goal (optional non-leaking brand mark only). Use `dvfy-nav-bar` for **app pages**, where a
> multi-link nav menu is the right affordance. A landing page should never carry the site nav.

### Visual Effects
`dvfy-scroll-reveal` `dvfy-scramble-hover` `dvfy-text-vortex` `dvfy-page-transition` `dvfy-transition-root`

### Utility
`dvfy-theme-switcher` `dvfy-auth` `dvfy-component-playground` `dvfy-infinite-scroll` [server]

## Component Conventions

- **`dvfy-` prefix** on all element names and CSS classes
- **Light DOM only** (no Shadow DOM) for HTMX compatibility
- **Attributes as API**: `<dvfy-card elevated interactive>`
- **CSS custom properties** for all styling — no hardcoded values
- **Keyboard accessible** — tab navigation, Enter/Space activation, Escape to close
- **Zero build step** — ES modules served directly, no bundler required
- **Container queries** on responsive components — adapts to parent width, not viewport

## Theming

### Built-in Themes

| Theme | Attribute | Light | Dark |
|-------|-----------|-------|------|
| Default | `light` / `dark` | Neutral gray | Dark slate |
| Devify Cyan | `devify-cyan` | `devify-cyan-dark` | Cyan primary |
| Devify Pink | `devify-pink` | `devify-pink-dark` | Pink primary |
| Renting Ideal | `renting-ideal` | `renting-ideal-dark` | Sage-green primary (named brand artifact) |

### Theme Switcher

```html
<dvfy-theme-switcher default-theme="devify-cyan">
  <option value="devify-cyan">Cyan</option>
  <option value="devify-pink">Pink</option>
</dvfy-theme-switcher>
```

Dropdown (multiple themes) + dark/light toggle. Single theme: only the toggle shows.

### Dark Mode

Automatic via `prefers-color-scheme`, or explicit:

```html
<html data-theme="devify-cyan-dark">
```

### Custom Project Theme

Create a theme file that overrides semantic tokens:

```css
/* themes/nonna.css */
[data-theme="nonna"] {
  --dvfy-primary-bg: #D4553A;
  --dvfy-primary-bg-hover: #B8432C;
  --dvfy-surface-page: #FFF8F0;
  --dvfy-font-brand: 'Playfair Display', serif;
}
[data-theme="nonna-dark"] {
  --dvfy-primary-bg: #E85D3A;
  --dvfy-surface-page: #1A0F0A;
  /* ... dark overrides ... */
}
```

## Key Features

### Auth Forms

```html
<!-- Inline -->
<dvfy-auth mode="signin" logo="/logo.svg" action="/auth/login"
  oauth-google="/auth/google" forgot-url="/forgot" signup-url="/register">
</dvfy-auth>

<!-- Modal -->
<dvfy-auth id="login" mode="signin" modal logo="/logo.svg" action="/auth/login">
</dvfy-auth>
<dvfy-button onclick="document.getElementById('login').open()">Sign In</dvfy-button>
```

### HTMX Patterns

Pre-wired HTMX interactions — loading states, error handling, toast feedback:

```html
<dvfy-htmx-form action="/api/contact" method="post" success-message="Sent!">
  <dvfy-input label="Email" type="email" name="email" required></dvfy-input>
  <dvfy-button type="submit">Send</dvfy-button>
</dvfy-htmx-form>

<dvfy-confirm title="Delete?" message="This cannot be undone." variant="danger">
  <dvfy-button variant="danger" hx-delete="/api/item/1">Delete</dvfy-button>
</dvfy-confirm>
```

### Collapsible Sections

```html
<!-- Open by default -->
<dvfy-section label="Details" icon="📋">
  <p>Content here</p>
</dvfy-section>

<!-- Collapsed -->
<dvfy-section label="Advanced" collapsed>
  <p>Hidden until clicked</p>
</dvfy-section>
```

## Project-Local Components

When building project-specific components:

1. Use project prefix (e.g., `nonna-recipe-card`)
2. Build in project's `static/js/components/`
3. When used in 2+ projects, promote to `@devify/ui` with `dvfy-` prefix

## File Structure

```
devify-ui/
├── devify.css              # Token bundle (import this)
├── devify.js               # Component bundle (import this)
├── tokens/
│   ├── colors.css          # 9 color families × 11 steps
│   ├── typography.css      # Font families, sizes, weights
│   ├── spacing.css         # Base-4 scale (numeric + semantic)
│   ├── borders.css         # Radius, width, focus ring
│   ├── elevation.css       # 7-level shadows
│   ├── animation.css       # Durations, easing, reduced-motion
│   ├── layout.css          # Breakpoints, z-index, containers
│   └── themes/
│       ├── light.css       # Default light theme
│       ├── dark.css        # Default dark theme
│       ├── devify-cyan.css # Cyan brand (light + dark)
│       ├── devify-pink.css # Pink brand (light + dark)
│       ├── renting-ideal.css        # Renting Ideal brand — generated, read-only
│       └── renting-ideal.brand.json # ↑ its seed/brief (regenerate, never hand-edit)
├── components/             # 48 Web Components
│   ├── dvfy-button.js
│   ├── dvfy-input.js
│   └── ...
├── patterns/               # 5 HTMX integration patterns
│   ├── dvfy-htmx-form.js
│   ├── dvfy-confirm.js
│   └── ...
└── catalog/
    └── index.html          # Live component catalog
```

## License

MIT
