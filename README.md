# @devify/ui

HTML Web Component library with design tokens, HTMX patterns, and PWA support for [Devify.me](https://devify.me) projects.

**Zero build step. No framework. Just HTML, CSS, and ES modules.**

## Live Catalog

Browse all components, themes, and patterns:

```bash
# Clone and serve locally
git clone git@github.com:devify-me/devify-ui.git
cd devify-ui
python3 -m http.server 8090

# Open http://localhost:8090/catalog/
```

The catalog showcases every component with live examples, theme switching (Cyan/Pink, light/dark), and responsive previews.

## Quick Start

```html
<!-- Load tokens + themes -->
<link rel="stylesheet" href="devify.css">

<!-- Load all components -->
<script type="module" src="devify.js"></script>

<!-- Use components -->
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

## Components (30)

### Foundation
`dvfy-button` `dvfy-input` `dvfy-textarea` `dvfy-select` `dvfy-checkbox` `dvfy-radio` `dvfy-switch` `dvfy-badge` `dvfy-tag` `dvfy-avatar` `dvfy-alert` `dvfy-loader`

### Navigation & Wayfinding
`dvfy-dropdown` `dvfy-tooltip` `dvfy-modal` `dvfy-tabs` `dvfy-breadcrumb` `dvfy-pagination` `dvfy-progress` `dvfy-header` `dvfy-hamburger` `dvfy-sidebar` `dvfy-nav`

### Layout & Composition
`dvfy-card` `dvfy-table` `dvfy-toast` `dvfy-empty` `dvfy-section` `dvfy-auth` `dvfy-theme-switcher` `dvfy-avatar-group`

### HTMX Patterns (5)
`dvfy-htmx-form` `dvfy-infinite-scroll` `dvfy-live-search` `dvfy-htmx-table` `dvfy-confirm`

## Component Conventions

- **`dvfy-` prefix** on all element names and CSS classes
- **Light DOM only** (no Shadow DOM) for HTMX compatibility
- **Attributes as API**: `<dvfy-card elevated interactive>`
- **CSS custom properties** for all styling — no hardcoded values
- **Keyboard accessible** — tab navigation, Enter/Space activation, Escape to close
- **Zero build step** — ES modules served directly, no bundler required
- **Container queries** on responsive components (header, hamburger) — adapts to parent width, not viewport

## Theming

### Built-in Themes

| Theme | Attribute | Light | Dark |
|-------|-----------|-------|------|
| Default | `light` / `dark` | Neutral gray | Dark slate |
| Devify Cyan | `devify-cyan` | `devify-cyan-dark` | Cyan primary |
| Devify Pink | `devify-pink` | `devify-pink-dark` | Pink primary |

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

### Responsive Header

```html
<dvfy-header brand="My App" logo="/logo.png" sticky scroll-shrink>
  <a href="/products" data-icon="🚀">Products</a>
  <a href="/pricing" data-icon="💰">Pricing</a>
  <a href="/cart" data-action data-icon="🛒" data-badge="3"></a>
  <dvfy-theme-switcher data-action>
    <option value="devify-cyan">Cyan</option>
  </dvfy-theme-switcher>
</dvfy-header>
```

- Tab-style nav on desktop, 3-stage hamburger on mobile (☰ → > → ✕)
- CSS Container Queries — responds to parent width, not viewport
- Scroll-shrink: header compresses on scroll
- Action badges, theme switcher integration

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
│       └── devify-pink.css # Pink brand (light + dark)
├── components/             # 30 Web Components
│   ├── dvfy-button.js
│   ├── dvfy-input.js
│   ├── dvfy-header.js
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
