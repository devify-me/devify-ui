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
├── components/            # 48 Web Components (dvfy-*.js)
├── patterns/              # 5 HTMX integration patterns (dvfy-*.js)
└── catalog/               # Design System Explorer
    ├── index.html         # Shell: header + sidebar + main layout
    ├── catalog.js         # Entry point: init sidebar, router, theme observer
    ├── router.js          # Hash-based routing + view dispatch
    ├── sidebar.js         # Sidebar construction + search filtering
    ├── data.js            # Taxonomy (TIERS, DOMAINS, COMPONENT_REGISTRY), tokens, patterns
    ├── tokens.js          # Token showcase renderers (colors, typography, etc.)
    ├── brand.js           # Live-editable brand settings sandbox
    └── overview.js        # Landing page renderer
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
7. Add entry to `COMPONENT_REGISTRY` in `catalog/data.js` with tier, domain, and deps (see `docs/taxonomy.md` for classification rules)
8. Add `DEFAULT_CONTENT` entry in `components/dvfy-component-playground.js`
9. Run `npm run analyze` to regenerate manifest

## Tooling Roadmap

- **WCA (web-component-analyzer)** → generates `custom-elements.json` manifest from JSDoc
- **`dvfy-component-playground`** → interactive playground in catalog (picker, live controls, preview, code gen, API docs)
- **Open WC** → testing (`@open-wc/testing`) and linting (`@open-wc/eslint-config`)
- **No Storybook** — WCA + inline viewer is the chosen path (zero-build, web-standards-first)

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

Generates `custom-elements.json` from JSDoc-annotated components (W3C community standard manifest).

```bash
npm install
npm run analyze    # generate custom-elements.json
npm run serve      # serve catalog at localhost:8090
```

The manifest drives the **Playground** in the catalog via `<dvfy-component-playground>` — an interactive playground that auto-generates controls from the manifest, provides live preview, generated code, and API docs. No external playground dependency needed.

## Design System Explorer (Catalog)

The catalog (`catalog/index.html`) is a full Design System Explorer with:
- **Sidebar navigation** with search, organized by: Tokens, Components (by category), HTMX Patterns, Brand Settings
- **Hash-based routing** (`#tokens/colors`, `#components/dvfy-button`, `#patterns/dvfy-confirm`, `#brand`, `#overview`)
- **Token showcases** — live computed values from active theme (colors grid, typography samples, spacing bars, elevation cards)
- **Component views** — `dvfy-component-playground` with `component` attr set (picker hidden, sidebar navigates)
- **Brand Settings** — live-edit semantic tokens with color pickers, reset per section, export as CSS theme block

### Adding a new component

Use the `/new-component dvfy-{name}` Claude Code skill — it handles all steps:
1. Researches similar existing components and plans the new one
2. Creates `components/dvfy-{name}.js` with full implementation
3. Adds import to `devify.js`
4. Adds `DEFAULT_CONTENT` entry (demo HTML) in `components/dvfy-component-playground.js`
5. Adds tag to `COMPONENT_CATEGORIES` in `catalog/data.js`
6. Runs `npm run analyze` to regenerate `custom-elements.json`

## Versioning & Releases

`@devify/ui` uses [Semantic Versioning](https://semver.org/). See `docs/releasing.md` for the full release checklist and breaking-change policy.

- Patch (`0.0.x`) — bug fixes, backwards-compatible
- Minor (`0.x.0`) — new components/tokens; may include breaking changes pre-1.0
- Major (`x.0.0`) — breaking changes post-1.0

Keep `CHANGELOG.md` updated: move `[Unreleased]` items to a new version section on each release.

## Commands

```bash
# Analyze components and generate custom-elements.json
npm run analyze

# Serve catalog locally (with api-viewer playground)
npm run serve
```

## Catalog Service

The catalog runs as a systemd user unit on sergio, bound to the Tailscale IP:

```bash
systemctl --user status devify-catalog    # check status
systemctl --user restart devify-catalog   # restart after changes
```

Accessible at `sergio-1:8090` from the tailnet.
