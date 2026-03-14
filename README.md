# @devify/ui

HTML Web Component library with design tokens, HTMX patterns, and PWA support for Devify.me projects.

## Architecture

Three-tier token system following [UI Collective](https://uicollective.co/) methodology:

| Tier | Purpose | Location | Naming |
|------|---------|----------|--------|
| **1. Primitives** | Raw values, context-agnostic | `tokens/*.css` | `--dvfy-blue-500`, `--dvfy-space-4` |
| **2. Semantics** | Role-based aliases | `tokens/themes/*.css` | `--dvfy-primary-bg`, `--dvfy-text-secondary` |
| **3. Component** | Scoped overrides | `components/*.js` | In component CSS only |

## Quick Start

```html
<!-- Load all tokens -->
<link rel="stylesheet" href="devify.css">

<!-- Load components -->
<script type="module" src="devify.js"></script>

<!-- Use -->
<dvfy-button variant="primary">Save</dvfy-button>
```

## Theming

### Dark Mode

Automatic via `prefers-color-scheme`, or explicit:

```html
<body data-theme="dark">
```

### Project Branding

Create a theme file that overrides semantic tokens:

```css
/* themes/nonna.css */
[data-theme="nonna"] {
  --dvfy-primary-bg: #D4553A;        /* Tomato red */
  --dvfy-primary-bg-hover: #B8432C;
  --dvfy-surface-page: #FFF8F0;      /* Warm cream */
  --dvfy-font-sans: 'Playfair Display', serif;
}
```

### Token Reference

See `tokens/` directory. Each file is documented with scale explanation and usage guidance.

## Component Convention

- All components use `dvfy-` prefix
- Light DOM (no Shadow DOM) for HTMX compatibility
- Attributes as API: `<dvfy-card elevated interactive>`
- ES modules, zero build step required

## Project-Local Components

When building project-specific components:
1. Use project prefix (e.g., `nonna-recipe-card`)
2. Build in project's `static/js/components/`
3. When used in 2+ projects, promote to `@devify/ui` with `dvfy-` prefix

## License

MIT
