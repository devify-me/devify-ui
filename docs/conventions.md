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
