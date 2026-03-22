# Accessibility Guide — @devify/ui (WCAG 2.1 AA)

This document describes how dvfy components meet WCAG 2.1 Level AA requirements and the keyboard interaction patterns each component supports.

---

## Standards & Scope

- **Target:** WCAG 2.1 Level AA
- **ARIA Authoring Practices:** [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) are used as the reference for keyboard and ARIA semantics.
- **Screen readers tested:** NVDA (Firefox), VoiceOver (Safari/macOS), TalkBack (Android)
- **Forced colors:** Windows High Contrast Mode is supported via `tokens/forced-colors.css` (`@media forced-colors: active`).

---

## Keyboard Interaction Patterns

### dvfy-button
| Key | Action |
|-----|--------|
| Tab | Move focus to/from button |
| Enter / Space | Activate button |

ARIA: `aria-disabled`, `aria-busy` updated automatically.

---

### dvfy-tabs
| Key | Action |
|-----|--------|
| Tab | Move focus to the active tab |
| Arrow Left / Right | Cycle through tabs |
| Home / End | Jump to first / last tab |

ARIA: `role="tablist"` on list, `role="tab"` with `aria-selected`, `aria-controls` on buttons; `role="tabpanel"` with `aria-labelledby` on panels.

---

### dvfy-accordion / dvfy-section
| Key | Action |
|-----|--------|
| Tab | Move focus between section headers |
| Enter / Space | Toggle section open/closed |
| Arrow Up / Down | Move focus between sections (within dvfy-accordion) |
| Home / End | Jump to first / last section (within dvfy-accordion) |

ARIA: `role="button"`, `aria-expanded`, `aria-controls` on each summary header.

---

### dvfy-modal
| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Cycle focus within modal (focus trap) |
| Escape | Close modal (unless `required` attribute is set) |

ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title.

---

### dvfy-drawer
| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Navigate content within drawer |
| Escape | Collapse drawer (focus moves to reopen tab) |

ARIA: `role="region"`, `aria-label` from `header` attribute, collapse toggle has `aria-expanded` and `aria-controls`.

---

### dvfy-dropdown
| Key | Action |
|-----|--------|
| Tab | Focus trigger |
| Enter / Space | Open menu |
| Arrow Up / Down | Navigate menu items |
| Escape | Close menu and return focus to trigger |
| Home / End | Jump to first / last item |

ARIA: `role="menu"` on list, `role="menuitem"` on items.

---

### dvfy-select
| Key | Action |
|-----|--------|
| Tab | Focus the combobox |
| Enter / Space | Open listbox |
| Arrow Up / Down | Navigate options |
| Escape | Close listbox |
| Type | Filter options (search) |

ARIA: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"` / `role="option"`.

---

### dvfy-checkbox / dvfy-radio
Use native `<input type="checkbox">` and `<input type="radio">` with a linked `<label>`. No custom ARIA required.

---

### dvfy-switch
| Key | Action |
|-----|--------|
| Tab | Focus switch |
| Space / Enter | Toggle state |

ARIA: `role="switch"`, `aria-checked`, `aria-label` from `label` attribute.

---

### dvfy-slider
Uses native `<input type="range">`. Arrow keys and Page Up/Down provided natively by the browser.

ARIA: `aria-label` on range inputs, `aria-valuemin` / `aria-valuemax` / `aria-valuenow` provided by the browser.

---

### dvfy-tree-view / dvfy-tree-node
| Key | Action |
|-----|--------|
| Tab | Focus the tree widget |
| Arrow Up / Down | Move focus between visible nodes |
| Arrow Right | Expand branch (or move into first child) |
| Arrow Left | Collapse branch (or move to parent) |
| Enter / Space | Activate leaf node or toggle branch |
| Home / End | Jump to first / last visible node |

ARIA: `role="tree"` on container, `role="treeitem"` on nodes, `aria-expanded` on branch nodes, `aria-level` on all nodes.

---

### dvfy-nav
Includes a "Skip to content" link (visible on focus) for keyboard users to bypass navigation.

ARIA: `role="navigation"` on main nav and mobile drawer.

---

### dvfy-pagination
ARIA: `role="navigation"` with `aria-label="Pagination"`, `aria-current="page"` on active button, descriptive `aria-label` on Prev/Next buttons.

---

### dvfy-carousel
| Key | Action |
|-----|--------|
| Tab | Focus the carousel |
| Arrow Left / Right | Scroll to previous / next slide |

ARIA: `role="region"` with `aria-label`, slides use `role="group"` with `aria-roledescription="slide"` and `aria-label="N of total"`.

---

### dvfy-toast
ARIA: `role="alert"` for `danger` and `warning` status (assertive announcement); `role="status"` for `info` and `success` (polite). Container uses `aria-live="polite"`.

---

### dvfy-tooltip
ARIA: `role="tooltip"` on the tip element, `aria-describedby` on the trigger element. Tooltip appears on both hover and keyboard focus.

---

## High Contrast Mode

`tokens/forced-colors.css` is imported via `devify.css` and provides `@media (forced-colors: active)` overrides that:

- Set focus rings to the `Highlight` system colour.
- Ensure button/input backgrounds use `ButtonFace` / `Field` system colours.
- Make switch tracks and selected states use `Highlight` / `HighlightText`.
- Keep toast and tooltip backgrounds on the `Canvas` layer.

Individual components use `forced-color-adjust: none` only where colour is semantically meaningful (e.g., status indicators).

---

## Focus Indicators

All interactive elements expose a visible focus ring via `:focus-visible`:

```css
/* Ring tokens used by all components */
--dvfy-ring-width:  3px;
--dvfy-ring-offset: 2px;
--dvfy-ring-color:  var(--dvfy-primary-bg); /* overridden to Highlight in forced-colors */
```

The ring meets the WCAG 2.1 AA focus appearance requirement (3:1 contrast ratio against adjacent colours).

---

## Reduced Motion

Animations respect `prefers-reduced-motion` via the `--dvfy-duration-*` tokens in `tokens/animation.css`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --dvfy-duration-fast:   0ms;
    --dvfy-duration-normal: 0ms;
    --dvfy-duration-slow:   0ms;
  }
}
```

---

## Component Authoring Checklist

When building a new component, verify:

- [ ] Interactive elements reachable by Tab (or roving tabindex for composite widgets)
- [ ] Keyboard shortcuts follow APG patterns (Arrow keys, Enter, Space, Escape)
- [ ] All controls have an accessible name (`aria-label`, `aria-labelledby`, or native `<label>`)
- [ ] State changes announced (`aria-expanded`, `aria-checked`, `aria-selected`, `aria-current`)
- [ ] Focus is visible (`:focus-visible` ring using `--dvfy-ring-*` tokens)
- [ ] Focus is managed correctly on open/close (modals, drawers, dropdowns)
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] `forced-colors.css` extended if new colour-only semantics are introduced
- [ ] `prefers-reduced-motion` respected (use duration tokens, not hardcoded values)
