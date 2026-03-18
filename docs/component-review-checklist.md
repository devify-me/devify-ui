# Component Review Checklist

Use this checklist when auditing or reviewing a `dvfy-*` component for production readiness.

## Tokens & Styling

- [ ] Uses semantic tokens (`--dvfy-primary-bg`) not primitives (`--dvfy-cyan-500`)
- [ ] Works in both light and dark themes
- [ ] Uses container queries for responsive behavior (not viewport media queries)
- [ ] CSS injected once via static style block pattern
- [ ] No hardcoded colors, font sizes, or spacing values

## Attributes & API

- [ ] JSDoc block present with `@attr`, `@event`, `@slot`, `@cssProperty` tags
- [ ] All public state exposed via HTML attributes
- [ ] `observedAttributes` and `attributeChangedCallback` handle all declared attrs
- [ ] Boolean attributes work as presence/absence (not `="true"/"false"`)
- [ ] Default values are sensible when attributes are omitted

## Accessibility

- [ ] Appropriate ARIA role assigned (e.g., `role="button"`, `role="dialog"`)
- [ ] `aria-label` or `aria-labelledby` for non-text content
- [ ] `aria-expanded`, `aria-selected`, `aria-checked` for interactive states
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- [ ] Focus indicator visible (uses `--dvfy-ring-*` tokens)
- [ ] `aria-disabled` and `disabled` attribute behave consistently

## Keyboard Navigation

- [ ] `Tab` — focusable in correct tab order
- [ ] `Enter` / `Space` — activates primary action
- [ ] `Escape` — closes overlays, dropdowns, modals
- [ ] Arrow keys — navigates within grouped controls (tabs, radio, menu)
- [ ] Focus trap for modals/dialogs (focus stays inside when open)

## Events

- [ ] Uses `CustomEvent` with descriptive names
- [ ] Events bubble (`bubbles: true`)
- [ ] Event `detail` contains relevant data
- [ ] Event listeners cleaned up in `disconnectedCallback`

## WCA Manifest

- [ ] JSDoc tags parse correctly with `npm run analyze`
- [ ] Component appears in `custom-elements.json` with correct attrs/events/slots
- [ ] `DEFAULT_CONTENT` entry exists in `dvfy-component-playground.js`
- [ ] `@example` tag in JSDoc provides meaningful demo HTML

## Dependency Compliance

- [ ] Tier classification matches `COMPONENT_REGISTRY` in `catalog/data.js`
- [ ] Dependencies listed in registry match actual imports
- [ ] Tier rules satisfied (see `docs/taxonomy.md`)
- [ ] No circular dependencies

## Edge Cases

- [ ] Empty/missing content renders gracefully
- [ ] Long text truncates or wraps appropriately
- [ ] Dynamic DOM insertion works (`connectedCallback` handles late attachment)
- [ ] `disconnectedCallback` cleans up listeners, observers, timers
- [ ] Multiple instances on same page don't conflict
- [ ] Component works when attributes are set before/after DOM insertion

## Review Order

Audit in tier order — primitives first because bugs cascade:

| Phase | Tier | Priority (most-depended-on first)                                                                    |
|-------|------|------------------------------------------------------------------------------------------------------|
| 1     | T1   | button, input, checkbox, radio, switch, textarea, section, badge, tag, avatar, alert, loader, progress, tooltip, hamburger |
| 2     | T2   | select, dropdown, modal, table, tabs, card, empty, toast, breadcrumb, pagination, nav, theme-switcher |
| 3     | T3   | sidebar, accordion, header, auth                                                                      |
| 4     | T4   | htmx-form, confirm, infinite-scroll, live-search, htmx-table                                         |
