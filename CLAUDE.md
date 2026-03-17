# @devify/ui

HTML Web Component library with design tokens, HTMX patterns, and PWA support.

## Architecture

- **Zero build step** — ES modules + CSS custom properties served directly
- **Light DOM only** — no Shadow DOM, for HTMX compatibility
- **Attributes-as-API** — all state exposed via HTML attributes
- **Three-tier tokens** — Primitives → Semantics → Component overrides
- **Container Queries** — responsive to parent width, not viewport

## Project Structure

```
devify-ui/
├── package.json           # @devify/ui — npm packaging (type: module)
├── devify.css             # Token bundle entry point (import all tokens)
├── devify.js              # Component bundle entry point (import all components)
├── tokens/                # Design tokens (Tier 1 primitives + Tier 2 semantics)
│   ├── colors.css         # 11 color families × 11 steps
│   ├── typography.css     # Font families, sizes, weights
│   ├── spacing.css        # Base-4 scale
│   ├── borders.css        # Radius, width, focus ring
│   ├── elevation.css      # 7-level shadows
│   ├── animation.css      # Durations, easing, reduced-motion
│   ├── layout.css         # Breakpoints, z-index, containers
│   └── themes/            # Tier 2 semantic themes
│       ├── light.css
│       ├── dark.css
│       ├── devify-cyan.css
│       └── devify-pink.css
├── components/            # 30 Web Components (dvfy-*.js)
├── patterns/              # 5 HTMX integration patterns (dvfy-*.js)
└── catalog/               # Live component showcase
    └── index.html
```

## Conventions

- All custom elements use `dvfy-` prefix
- All CSS custom properties use `--dvfy-` prefix
- Components are vanilla JS classes extending HTMLElement
- Each component injects its CSS once via a static style block
- No external runtime dependencies
- Keyboard accessible with ARIA support

## Component Authoring

When creating or modifying components:
1. Use Light DOM (never Shadow DOM)
2. Expose state via HTML attributes (reactive via `attributeChangedCallback`)
3. Use semantic tokens (`--dvfy-primary-bg`) not primitives (`--dvfy-cyan-500`)
4. Support keyboard navigation (Tab, Enter, Space, Escape)
5. Add ARIA roles and labels
6. Add component to `devify.js` barrel file
7. Add demo to `catalog/index.html`

## Tooling Roadmap

- **WCA (web-component-analyzer)** → generates `custom-elements.json` manifest
- **api-viewer-element** → interactive playground in catalog
- **Open WC** → testing (`@open-wc/testing`) and linting (`@open-wc/eslint-config`)
- **No Storybook** — WCA + api-viewer is the chosen path (zero-build, web-standards-first)

## JSDoc Format (Web Component Analyzer compatible)

Every component must have JSDoc with `@attr`, `@event`, `@slot`, `@cssProperty` tags for WCA to generate the `custom-elements.json` manifest.

```javascript
/**
 * Brief one-line description.
 *
 * @attr {string} variant - Description of variant attribute
 * @attr {boolean} disabled - Disable the component
 *
 * @event {CustomEvent} change - Fires when value changes, detail: { value }
 * @event {CustomEvent} submit - Fires on form submit
 *
 * @slot - Default slot for button label
 * @slot icon - Slot for icon element
 *
 * @cssProperty {color} --dvfy-primary-bg - Background color
 *
 * @example
 * <dvfy-button variant="primary" disabled>
 *   <span slot="icon">→</span>
 *   Click me
 * </dvfy-button>
 */
```

## WCA Analyzer

Generates `custom-elements.json` from JSDoc-annotated components (W3C standard manifest).

```bash
# Install dependencies
npm install

# Generate custom-elements.json from all components/patterns
npm run analyze

# Serve locally with api-viewer playground
npm run serve
```

The manifest drives the interactive `<api-viewer>` playground in the catalog (props, events, docs, source view).

## Commands

```bash
# Analyze components and generate custom-elements.json
npm run analyze

# Serve catalog locally (with api-viewer playground)
npm run serve
```
