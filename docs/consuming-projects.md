# Consuming @devify/ui

Guide for projects that use @devify/ui as their frontend component library.

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
