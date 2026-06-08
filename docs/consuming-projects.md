# Consuming @devify/ui

Guide for projects that use @devify/ui as their frontend component library.

## Your brand is a separate input — author it here first

An outstanding app starts from an outstanding, on-standard **design foundation** (colors, typography, spacing, corners, elevation, motion). That foundation is **a separate input you author in `@devify/ui` and consume as tokens — not something you invent per project.** Hand-rolled, per-project styling (raw hex, ad-hoc utility classes, copied component CSS) is the anti-pattern that drifts off-brand and breaks the enforced token loop.

**Author your brand here:**

- **Today** — run the live catalog (`npm run serve` → `http://localhost:8090/catalog/`) and use the **Colors**, **Typography**, and **Themes** editors to pick brand colors, fonts, and generate a theme. Consume the resulting `--dvfy-*` tokens (the `tokens/` CSS + your generated theme) in your project.
- **Forthcoming** — a standardized, deterministic **Brand Book generator** turns a small brand brief into a complete, read-only token set (the factory's primary input). See the design spec: `docs/specs/2026-06-06-brand-book-generator-design.md`. When it ships, generating your brand book here and providing it as your project's pinned brand input becomes the supported path (per the studio *Tool Interface Contracts* standard).

Consume the brand as tokens; theme via `data-theme` on `<html>`. Everything below is how you then use the components against that foundation.

## Component API Discovery

The `custom-elements.json` manifest is the source of truth for all component APIs. It's auto-generated from JSDoc annotations by `npm run analyze` and vendored with the library.

After running `devify ui:update`, the manifest is available at:
```
static/js/custom-elements.json
```

### What the manifest contains

For each `dvfy-*` component:
- **Attributes** — name, type, description, default value
- **Events** — name, detail shape
- **Slots** — named and default slots
- **CSS Custom Properties** — themeable properties with types
- **Description** — what the component does

### Looking up a component

```bash
# Find all components
jq '.tags[].name' custom-elements.json

# Look up a specific component's attributes
jq '.tags[] | select(.name == "dvfy-button") | .attributes' custom-elements.json

# Find components with a specific attribute
jq '.tags[] | select(.attributes[]?.name == "variant") | .name' custom-elements.json
```

## Common Attribute Confusion

| Wrong | Right | Component |
|-------|-------|-----------|
| `type="primary"` | `variant="primary"` | dvfy-button |
| `variant="info"` | `status="info"` | dvfy-alert |
| `opened` | `open` | dvfy-drawer, dvfy-hamburger |
| `collapsed="true"` | `collapsed` | dvfy-drawer, dvfy-section |
| `text="..."` | `label="..."` | dvfy-input, dvfy-checkbox, dvfy-radio |

Boolean attributes are present/absent — not `"true"`/`"false"`. Write `<dvfy-drawer collapsed>`, not `<dvfy-drawer collapsed="true">`.

## Correct vs Incorrect Usage

### Use components, not raw HTML

```html
<!-- Wrong: raw HTML -->
<input type="text" class="form-input" />
<button class="btn btn-primary">Save</button>

<!-- Right: dvfy-* components -->
<dvfy-input label="Name" placeholder="Enter name"></dvfy-input>
<dvfy-button variant="primary">Save</dvfy-button>
```

### Configure via attributes, not CSS overrides

```html
<!-- Wrong: CSS override -->
<style>.my-alert { background: red !important; }</style>
<dvfy-alert class="my-alert">Error</dvfy-alert>

<!-- Right: attribute API -->
<dvfy-alert status="danger" title="Error">Something failed</dvfy-alert>
```

### Don't reach into component internals

```js
// Wrong: querying internal DOM
document.querySelector('dvfy-nav-bar .dvfy-nav-bar__bar');

// Right: use the component's public API (attributes, events, methods)
document.querySelector('dvfy-nav-bar').setAttribute('brand', 'MyApp');
```

## When the Component Doesn't Support What You Need

1. **Check all available attributes** — the manifest may have what you need under a different name
2. **Check CSS custom properties** — many visual customizations are exposed as `--dvfy-*` properties
3. **If genuinely unsupported:**
   - Is this a general need (other products would benefit)? File an issue in [devify-ui](https://github.com/devify-me/devify-ui/issues) and use a temporary project-local workaround labeled `FIXME(devify-ui#N)`
   - Is this project-specific? Build a project-local component with your project's prefix (not `dvfy-`)
4. **Never:** override component internals with `!important`, `querySelector` into `dvfy-*` class names, or copy component CSS into project stylesheets

## Template CLAUDE.md Section

Add this to your consuming project's CLAUDE.md:

```markdown
## @devify/ui Usage

Before writing any HTML form element, feedback element, or navigation element:
1. Check if a `dvfy-*` component exists — reference `static/js/custom-elements.json`
2. Use the manifest to verify correct attribute names (e.g., `status` vs `variant`)
3. Never override component internals with CSS `!important` or JS `querySelector` into `dvfy-*` class names
4. If the component doesn't support what you need, file an issue in devify-ui — don't work around it
```

## Audit Checklist

Grep your templates for common anti-patterns:

```bash
# Raw HTML elements that should be dvfy-* components
grep -rn '<input\b\|<select\b\|<textarea\b\|<button\b' templates/

# CSS !important targeting dvfy-* classes
grep -rn '!important' static/css/ | grep 'dvfy-'

# JS reaching into component internals
grep -rn 'querySelector.*dvfy-.*__' static/js/ templates/

# Attribute names that don't exist in the manifest
# (manual: compare template attrs against custom-elements.json)
```
