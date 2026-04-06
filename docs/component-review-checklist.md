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

## Form Control Validation States (if applicable)

For form controls (dvfy-input, dvfy-select, dvfy-textarea, dvfy-date-picker) and field groups:

- [ ] `state` attribute added to `observedAttributes` array
- [ ] `attributeChangedCallback` includes state case that triggers re-render
- [ ] Light DOM children with `slot="error-message"`, `slot="warning-message"`, `slot="success-message"` are preserved during builds
- [ ] `#build()` method saves slotted children before clearing (`textContent = ''`)
- [ ] `#build()` method re-attaches slotted children before message rendering
- [ ] `#appendMessages()` or equivalent method renders messages based on state:
  - Error messages get `role="alert"` (assertive announcement)
  - Warning/success messages get `role="status"` (polite announcement)
  - Backward compatibility with legacy `error` attribute maintained
- [ ] CSS includes state selectors for error/warning/success with proper tokens:
  - Border color: `--dvfy-input-error` (error), `--dvfy-warning-border` (warning), `--dvfy-success-border` (success)
  - Focus ring matches state color
  - Message text color uses semantic tokens (`--dvfy-danger-text`, `--dvfy-warning-text`, `--dvfy-success-text`)
- [ ] All state variations pass WCAG 2.1 AA color contrast (90/90 via `npm run contrast:ci`)
- [ ] JSDoc includes `@attr state` and three `@slot` entries (error/warning/success-message)

**For dvfy-field-group specifically:**
- [ ] Semantic `<fieldset>` + `<legend>` structure
- [ ] `label` attribute rendered as legend
- [ ] `help` attribute rendered below legend
- [ ] Default slot preserves child form controls
- [ ] Group-level message slots (error/warning/success-message) for cross-field validation
- [ ] `aria-describedby` links fieldset to group-level error message when `state` is set
- [ ] Tests verify fieldset/legend structure, slot rendering, state transitions, message display (see `components/dvfy-field-group.test.js` and `components/dvfy-field-group.a11y.test.js`)

## Accessibility

- [ ] Appropriate ARIA role assigned (e.g., `role="button"`, `role="dialog"`)
- [ ] `aria-label` or `aria-labelledby` for non-text content
- [ ] `aria-expanded`, `aria-selected`, `aria-checked` for interactive states
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- [ ] Focus indicator visible (uses `--dvfy-ring-*` tokens)
- [ ] `aria-disabled` and `disabled` attribute behave consistently
- [ ] Functional test includes `await checkA11y(el)` at end of each test case
- [ ] If component is interactive (modal, dropdown, nav, tabs): dedicated `*.a11y.test.js` file with focus trap, keyboard nav, ARIA attribute tests
- [ ] Any axe violations intentionally suppressed are documented with reason (see `docs/a11y-testing-guide.md`)

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

## Accessibility Testing

- [ ] All functional tests call `await checkA11y(el)` at the end (see `docs/a11y-testing-guide.md` for pattern)
- [ ] axe-core violations resolved OR intentionally suppressed with documented reason
- [ ] If interactive (modal, dropdown, nav, tabs): create dedicated `ComponentName.a11y.test.js` file with:
  - Focus management tests (initial focus, focus trap, focus restore)
  - Keyboard navigation tests (Tab, Escape, Arrow keys)
  - ARIA attribute tests (role, aria-expanded, aria-checked, etc.)
- [ ] Component passes WCAG 2.1 AA compliance (see `docs/wcag-compliance.md` for status)

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

| Phase | Tier | Components                                                                                           |
|-------|------|------------------------------------------------------------------------------------------------------|
| 1     | T1   | button, input (+ validation states), checkbox, radio, switch, textarea (+ validation states), section, badge, tag, avatar, alert, loader, progress, tooltip, hamburger, select (+ validation states), date-picker (+ validation states), dropdown, tabs, card, empty, toast, breadcrumb, pagination, sidebar, carousel, and remaining primitives |
| 2     | T2   | drawer, table, modal, nav, theme-switcher, accordion, component-playground, field-group (+ validation states)                            |
| 3     | T3   | auth, htmx-form, confirm                                                                             |
