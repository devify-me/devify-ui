# New Component Checklist

Use this checklist when creating a new `dvfy-*` component from scratch.
For auditing existing components, use `docs/component-review-checklist.md`.

## Step 1 — Plan

- [ ] Chose a name following `dvfy-<noun>[-<qualifier>]` convention
- [ ] Determined tier (1–4) using the decision tree in `docs/taxonomy.md`
- [ ] Listed all HTML attributes the component will expose
- [ ] Listed all `CustomEvent` names the component will fire
- [ ] Listed all named slots (plus default slot if applicable)
- [ ] Confirmed dependencies are allowed by the tier rules

## Step 2 — Implement

- [ ] File created at `components/dvfy-<name>.js`
- [ ] Class name is PascalCase with no prefix (e.g., `SpinnerRing`)
- [ ] `customElements.define('dvfy-<name>', ClassName)` at the bottom
- [ ] Uses Light DOM only — no `attachShadow()`
- [ ] Styles injected once via `static #styleInjected` flag pattern
- [ ] All styles use `--dvfy-*` semantic tokens — no hardcoded values

## Step 3 — API

- [ ] `static get observedAttributes()` declares all reactive attrs
- [ ] `attributeChangedCallback` re-renders on every relevant change
- [ ] Boolean attributes work via presence/absence (not `="true"/"false"`)
- [ ] Default attribute values are sensible when omitted
- [ ] `disconnectedCallback` removes event listeners, observers, timers

## Step 4 — Accessibility

- [ ] Appropriate `role` attribute set (e.g., `button`, `dialog`, `status`)
- [ ] Non-text content has `aria-label` or `aria-labelledby`
- [ ] Interactive states use `aria-expanded`, `aria-selected`, `aria-checked`
- [ ] Focus indicator uses `--dvfy-ring-*` tokens
- [ ] `Tab` — component is focusable in correct document order
- [ ] `Enter`/`Space` — activates primary action
- [ ] `Escape` — closes overlays or cancels action (if applicable)
- [ ] Arrow keys — navigates grouped controls (if applicable)
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 UI)

## Step 5 — Events

- [ ] Events use `CustomEvent` with a descriptive past-tense name
- [ ] All events dispatch with `bubbles: true`
- [ ] Event `detail` contains the relevant data payload
- [ ] Events are documented in JSDoc with `@event` tags

## Step 6 — JSDoc

- [ ] Top-level JSDoc block present before the class definition
- [ ] `@attr` tag for every public attribute with type and description
- [ ] `@event` tag for every dispatched event with detail structure
- [ ] `@slot` tag for default and named slots
- [ ] `@cssProperty` tag for any component-level CSS custom properties
- [ ] `@example` tag with a minimal, realistic usage snippet

## Step 7 — Catalog Integration

- [ ] Import added to `devify.js` barrel file
- [ ] `COMPONENT_REGISTRY` entry added in `catalog/data.js` with correct tier, domain, deps
- [ ] Component tag added to the correct `COMPONENT_CATEGORIES` array
- [ ] `DEFAULT_CONTENT` entry added in `components/dvfy-component-playground.js`
  - Shows a single representative instance (not multiple variants)

## Step 8 — Manifest

- [ ] `npm run analyze` ran successfully
- [ ] Component appears in `custom-elements.json` with correct attrs/events/slots
- [ ] Playground renders the component correctly in the catalog

## Step 9 — Edge Cases

- [ ] Empty/missing slot content renders gracefully (no broken layout)
- [ ] Long text truncates or wraps without overflow
- [ ] Multiple instances on the same page do not share state or conflict
- [ ] Component works when attributes are set before and after DOM insertion
- [ ] Component works when inserted dynamically via `innerHTML`

## Step 10 — Final Review

- [ ] Tested in light theme
- [ ] Tested in dark theme
- [ ] Tested with keyboard navigation only
- [ ] Tested with a screen reader (or reviewed ARIA structure manually)
- [ ] `docs/component-review-checklist.md` passes all items
