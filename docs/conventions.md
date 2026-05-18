# UI Conventions

Shared design decisions that apply across @devify/ui components.

## Hamburger Animation by Drawer Position

When a hamburger menu controls a drawer, the close animation should match the drawer's slide direction for visual coherence.

| Drawer position | Default hamburger animation | Rationale |
|-----------------|----------------------------|-----------|
| right, top      | `x-rotate-l` (spin left)   | Visual flow toward closing direction |
| left, bottom    | `x-rotate-r` (spin right)  | Visual flow toward closing direction |

### Where applied

- `dvfy-nav-bar` — automatically selects the default animation based on `drawer-position` when no explicit `animation` attribute is set.

### Override

Set the `animation` attribute explicitly to override the convention:

```html
<!-- Uses convention: right drawer → x-rotate-l -->
<dvfy-nav-bar>...</dvfy-nav-bar>

<!-- Override: force x animation regardless of drawer position -->
<dvfy-nav-bar animation="x">...</dvfy-nav-bar>
```

## Component Playground Modes

`dvfy-component-playground` supports three modes, distinguished by which attributes are set:

| Mode | `manifest` | `src` | `tag` / `component` | Use case |
|---|---|---|---|---|
| Library catalog | required | — | required | Tag is already defined globally (via `devify.js` barrel); manifest drives controls and API docs. What the catalog uses. |
| Project (registered) | required | required | required | Project ships its own manifest; `src` dynamically imports the component file before rendering. |
| WIP / sandbox | — | required | required | Authoring a component before it has a manifest entry. Renders preview only; controls drawer is hidden. |

`tag` is the preferred attribute name. `component` is retained as a legacy alias.

### Examples

**Library catalog** (used by `catalog/router.js`):

```html
<dvfy-component-playground
  manifest="../custom-elements.json"
  tag="dvfy-button">
</dvfy-component-playground>
```

**Project component with manifest**:

```html
<dvfy-component-playground
  manifest="../rueda/custom-elements.json"
  src="../rueda/components/rueda-class-card.js"
  tag="rueda-class-card">
</dvfy-component-playground>
```

**WIP / sandbox** (no manifest yet):

```html
<dvfy-component-playground
  src="./my-new-thing.js"
  tag="my-new-thing">
</dvfy-component-playground>
```

### Shareable preview link

`catalog/wip.html` reads `src`, `tag`, and `manifest` from URL query parameters and constructs the playground from them. Convenient for sharing a WIP preview during iteration:

```
http://sergio:8090/catalog/wip.html?src=../components/my-new-thing.js&tag=my-new-thing
```

Paths in `src` and `manifest` are resolved relative to the consuming page, not the playground's own module location.

## Static Checks

Two scripts enforce token discipline and component-preference at lint time:

### `npm run check:tokens` — no hardcoded color literals

Scans CSS template literals in `components/` and `patterns/` for raw color values (hex, rgb/rgba, hsl/hsla). All colors must flow through `--dvfy-*` semantic tokens so theming works.

**Allowlisting** (use the lightest mechanism that fits):

1. **Inline same-line** — for one-off legitimate cases (e.g. `@property` `initial-value`, `var()` fallbacks where CSS spec requires a literal):
   ```css
   --my-default: rgba(255, 255, 255, 0.06); /* allow-hardcoded: var() fallback requires literal */
   ```
   or in JS comments before/on the line: `// allow-hardcoded: <reason>`.

2. **Block** — for multi-line CSS regions:
   ```css
   /* allow-hardcoded-start: @property initial-value (CSS spec) */
   @property --foo { initial-value: #7c3aed; }
   /* allow-hardcoded-end */
   ```

3. **File-baseline** — `scripts/.hardcoded-allowlist.json` tracks tech-debt cleanup across PRs. Each entry pairs a file with a single occurrence of a value:
   ```json
   [
     { "file": "components/dvfy-stepper.js", "value": "#fff", "reason": "see #331 — pending cleanup" }
   ]
   ```
   The script warns about stale entries; remove them as violations are fixed.

Pass `--strict` to also flag raw `px`/`em`/`rem` lengths (most are legitimate font-relative scaling — off by default).

### `npm run check:dvfy-pref` — prefer `<dvfy-*>` over native

Flags `document.createElement('button')` (and `select`) in components where a `dvfy-*` equivalent exists. The corresponding `dvfy-X.js` file is exempt — it legitimately renders the native element.

Allowlists work the same way: `// allow-dvfy-pref: <reason>` inline or `scripts/.dvfy-preference-allowlist.json` for tracked cleanup.
