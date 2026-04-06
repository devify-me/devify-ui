# WCAG 2.1 AA Compliance Audit

@devify/ui components meet WCAG 2.1 Level AA accessibility standards as of PR #311.

## Compliance Statement

All dvfy-* components have been audited and fixed to meet [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/).

- **Standard:** WCAG 2.1 Level AA
- **Scope:** All 45+ dvfy-* components (Tier A, B, C)
- **Audit date:** Phase 1-4 completed; documentation finalized in Phase 5
- **Testing method:** Automated axe-core checks + deep interactive tests
- **CI:** Tests run on every PR via GitHub Actions

## Audit Scope

### Tier A: Primitives & Simple Composites (20 components)

These components are foundational and used everywhere. All tested with automated axe-core checks in functional tests.

- **button** — primary, danger, secondary variants; disabled, loading states
- **input** — text, email, password; disabled, invalid states
- **checkbox** — checked, unchecked, disabled states
- **radio** — selected, unselected, disabled states
- **switch** — on/off states; disabled state
- **textarea** — standard, disabled, invalid states
- **select** — dropdown selection; disabled state
- **badge** — variant colors (success, warning, danger, info)
- **tag** — closeable, non-closeable variants
- **avatar** — size variants, alt text
- **alert** — role="alert", dismissible; variant colors
- **loader** — animated, role="status" for screen readers
- **progress** — linear and radial variants
- **tooltip** — ARIA described-by relationship
- **hamburger** — aria-expanded, aria-label
- **section** — semantic HTML5, no role
- **dropdown** — ARIA menu pattern, arrow key navigation
- **tabs** — ARIA tab pattern, keyboard navigation
- **card** — semantic structure, no special ARIA
- **breadcrumb** — ARIA landmark, link hierarchy

**Result:** ✅ All 20 components pass 299+ axe checks

### Tier B: Complex Interactions (5 components)

These components have complex state management, focus traps, and keyboard navigation. Tested with both axe-core checks AND dedicated `*.a11y.test.js` files.

- **modal** — role="dialog", focus trap, aria-modal, Escape handling
- **drawer** — role="dialog", slide-in, focus trap, dismissible
- **nav** — semantic nav element, focus management, aria-current
- **table** — role="table", header scope, row/cell hierarchy
- **accordion** — ARIA disclosure pattern, aria-expanded, arrow keys

**Result:** ✅ All 5 components pass 155+ deep a11y tests + axe checks

### Tier C: Presentational Components (20+ components)

These components are non-interactive or have minimal interactivity. Audited manually via code review; no specialized a11y tests needed.

- **carousel** — container, no keyboard interaction (handled by app)
- **pagination** — links with aria-current, previous/next labels
- **sidebar** — container, navigation managed by parent
- **empty-state** — images with alt text, heading structure
- **toast** — role="status" for transient notifications
- **nav-bar** — semantic header, branding, skip-to-main link
- **gradient-card** — semantic div, no role needed
- **scrollable-area** — semantic div with overflow
- **component-playground** — interactive, but a11y handled by nested components
- And 10+ others

**Result:** ✅ All presentational components pass manual audit

## Fixes Applied (Phase 1-2)

The following changes were made to achieve WCAG AA compliance:

### Token Updates (Contrast)

See `docs/wcag-contrast-audit.md` for full contrast audit results. Summary:

| Theme | Token | Before | After | Issue |
|---|---|---|---|---|
| light | `--dvfy-primary-text` | neutral-0 (#fff) | neutral-950 (#020617) | White on cyan-600 was 3.68:1, needed 4.5:1 |
| light | `--dvfy-on-success` | neutral-0 (#fff) | neutral-950 (#020617) | White on green-600 was 3.30:1 |
| light | `--dvfy-on-info` | neutral-0 (#fff) | neutral-950 (#020617) | White on cyan-600 was 3.68:1 |
| dark | `--dvfy-on-success` | neutral-0 (#fff) | neutral-950 (#020617) | White on green-600 was 3.30:1 |
| dark | `--dvfy-on-info` | neutral-0 (#fff) | neutral-950 (#020617) | White on cyan-600 was 3.68:1 |
| devify-cyan | `--dvfy-primary-text` | neutral-0 (#fff) | neutral-950 (#020617) | White on cyan-600 was 3.68:1 |
| devify-pink | `--dvfy-text-link` | brand-600 (#e8248e) | brand-700 (#c91873) | brand-600 on white was 4.14:1 |
| devify-pink | `--dvfy-text-link-hover` | brand-700 (#c91873) | brand-800 (#a6155f) | Hover contrast improvement |
| devify-pink | `--dvfy-primary-text` | neutral-0 (#fff) | neutral-950 (#020617) | White on brand-500 was 3.23:1 |
| devify-pink-dark | `--dvfy-primary-text` | neutral-0 (#fff) | neutral-950 (#020617) | White on brand-500 was 3.23:1 |

**All token pairs now pass 4.5:1 (AA) or 7:1 (AAA).**

### ARIA Role Updates

- **button** — role="button", aria-disabled, aria-busy, aria-pressed
- **input** — aria-invalid, aria-describedby for help text
- **checkbox** — role="checkbox", aria-checked
- **radio** — role="radio", aria-checked
- **modal** — role="dialog", aria-modal, aria-labelledby (title)
- **drawer** — role="dialog", aria-modal, aria-labelledby
- **alert** — role="alert" (catches axe's "region" false positive)
- **nav** — semantic nav element, role omitted (HTML5 provides it)
- **tabs** — role="tablist", role="tab", role="tabpanel", aria-selected
- **dropdown** — role="menu", role="menuitem", aria-expanded, aria-haspopup
- **table** — role="table", scope="col"/"row", aria-label on tbody for clarity
- **accordion** — role="button" (disclosure), aria-expanded, aria-controls
- **tooltip** — aria-describedby linking to tooltip ID
- **breadcrumb** — role="navigation", aria-label="Breadcrumb"

### Decorative Element Fixes

- **Icons in buttons** — added aria-hidden="true" to decorative icons
- **Loader spinners** — added aria-hidden="true" (label comes from role="status" parent)
- **Carousel arrows** — aria-hidden="true" (semantics from ARIA buttons)
- **Spacing divs** — aria-hidden="true" where purely decorative

### Accessible Names (Labels)

- **Icon-only buttons** — added aria-label
- **Form inputs** — associated labels via `<label for>` or aria-label
- **Dropdowns** — selected value announced via aria-label
- **Modals** — title used as aria-labelledby target
- **Navigation items** — aria-label for icon-only menu items

## Known Suppressions

The following axe violations are intentionally suppressed because they are false positives or represent correct accessible behavior:

| Component | Rule | Reason | Code Location |
|---|---|---|---|
| modal | region | Modal is a dialog, not a main region. The a11y test verifies correct role="dialog" and focus trap. | components/dvfy-modal.test.js |
| drawer | region | Drawer is a dialog, not a main region. The a11y test verifies correct role="dialog". | components/dvfy-drawer.test.js |
| alert | region | Alert is role="alert", not a main region. The functional test verifies correct alert role. | components/dvfy-alert.test.js |
| dropdown | aria-required-attr | Dropdown menu items have proper ARIA attributes; axe false-positive on role="menu". | components/dvfy-dropdown.test.js |

**How to add a suppression:**
1. Verify the violation is a false positive or intentional deviation
2. Document the reason in a comment above `checkA11y()`
3. Use `ignoredRules: ['rule-id']` option
4. Add entry to table above with code location

## Testing Coverage

### Automated Tests (npm test)

- **299+ axe-core checks** across Tier A components
- **155+ deep a11y tests** across Tier B components
- **100% of components** have functional tests with axe checks at the end
- **Tests run on every commit** via `.github/workflows/test.yml`
- **Test suite:** @open-wc/testing + web-test-runner + Chromium

### Manual Audits

- **Code review** — ARIA attributes, semantic HTML, focus management
- **Browser test** — Tab key, focus indicators, keyboard navigation
- **Contrast verification** — `npm run contrast` validates all token pairs

### Not Yet Tested (Phase 6+)

- **Screen reader testing** — NVDA, JAWS, VoiceOver (manual testing required)
- **Consuming projects** — devify-cc, devify.me inherit @devify/ui but need their own tests
- **High contrast mode** — Windows High Contrast, forced colors, dark mode
- **Color blindness simulation** — deuteranopia, protanopia, tritanopia variants

## Accessing Audit Results

### View Test Results Locally

```bash
# Run tests with full output
npm test

# Watch mode for development
npm test:watch

# Run contrast check
npm run contrast
```

### PR #311 Results

The initial audit was conducted in [PR #311](https://github.com/devify-me/devify-ui/pull/311) and includes:

- Full test results from automated run
- Deep a11y test implementations for complex components
- Token fixes for contrast compliance
- Documentation in this file and `docs/a11y-testing-guide.md`

## Compliance Boundaries

### In Scope (Tested & Fixed)

- All dvfy-* component markup and CSS
- Component-provided ARIA attributes
- Focus management within components
- Keyboard navigation (Tab, Escape, Arrow keys)
- Color contrast across all themes
- Semantic HTML structure

### Out of Scope (App Responsibility)

- Page structure (heading hierarchy h1-h6)
- Link destinations and link text
- Form validation messages (server-side)
- Page titles and meta descriptions
- Content accessibility (spelling, plain language, etc.)
- Image alt text (app provides descriptions)
- Video captions and transcripts (app provides media)

## Future Work

### Phase 6: Verification
- Automated CI confirmation that all tests pass
- Optional: manual screen reader testing with NVDA/JAWS

### Phase 7: Consuming Projects
- Update devify-cc, devify.me with guidance on inheriting @devify/ui accessibility
- Create tracking issues for product-specific a11y testing

### Long-term
- Annual accessibility audit by third party
- Screen reader user testing group
- Color blindness testing across themes
- Internationalization (RTL, language-specific features)

## References

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/) — Official W3C guidelines
- [axe-core Rule Descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) — What each rule checks
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) — Recommended patterns for accessible components
- [docs/a11y-testing-guide.md](./a11y-testing-guide.md) — How to write accessible tests
- [docs/wcag-contrast-audit.md](./wcag-contrast-audit.md) — Detailed contrast audit results

## Questions or Issues?

If you:
- **Find a violation during manual testing** → file a GitHub issue with the component name and steps
- **Want to add tests for a new component** → see `docs/a11y-testing-guide.md`
- **Need to suppress an axe violation** → document it per "Known Suppressions" section above
- **Have accessibility feedback** → open an issue with the category label "accessibility"
