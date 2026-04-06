# Issue #311: WCAG 2.1 AA Audit

**Type:** feat  
**Branch:** feat/311-wcag-2.1-aa-audit  
**Issue:** [#311](https://github.com/devify-me/devify-ui/issues/311)

## Context
Production-ready component library requires WCAG 2.1 AA compliance. Implement hybrid a11y testing strategy: axe-core integration for automated checks on critical components + dedicated a11y test suite for complex keyboard/focus patterns + manual audit of presentational components.

## Architecture
Three-layer testing: (1) Axe utility helper, (2) Axe checks in functional tests for ~20 Tier A components, (3) Dedicated a11y tests for 5-6 Tier B complex patterns. Manual audit of Tier C presentational components.

## Tasks

### Phase 1: Tooling & Infrastructure

- [ ] **Create utils/axe-test.js**
  - Import `chai-a11y-axe` and expose `checkA11y()` helper
  - Simple wrapper around axe + expect().toHaveNoViolations()
  - Add JSDoc example showing usage pattern

- [ ] **Verify web-test-runner configuration**
  - Confirm web-test-runner discovers `*.test.js` files (it should)
  - Test that axe works in browser environment
  - Run existing tests locally to establish baseline

### Phase 2: Augment Critical Component Tests (Tier A)

- [ ] **Add axe checks to button, input, checkbox tests**
  - Add `await checkA11y(el)` after each test fixture rendering
  - Run: `npm test -- dvfy-button.test.js`
  - Commit: "test(button,input,checkbox): add axe a11y checks"

- [x] **Add axe checks to radio, switch, textarea, select tests**
  - Apply same pattern
  - Commit: "test(form-controls): add axe a11y checks"

- [ ] **Add axe checks to modal, dropdown, tabs tests**
  - Apply pattern
  - Commit: "test(interactive): add axe a11y checks"

- [ ] **Add axe checks to table, nav, breadcrumb, pagination tests**
  - Apply pattern
  - Commit: "test(navigation): add axe a11y checks"

- [ ] **Add axe checks to drawer, accordion, alert, toast tests**
  - Apply pattern
  - Commit: "test(feedback,overlay): add axe a11y checks"

- [ ] **Add axe checks to theme-switcher, sidebar tests**
  - Apply pattern
  - Commit: "test(app-chrome): add axe a11y checks"

### Phase 3: Deep A11y Test Suite (Tier B)

- [ ] **Create dvfy-modal.a11y.test.js**
  - Test: focus trap, Escape key, aria-modal role, aria-labelledby
  - Commit: "test(modal): add accessibility-specific tests"

- [ ] **Create dvfy-dropdown.a11y.test.js**
  - Test: arrow key nav, Enter/Space, aria-expanded, aria-selected
  - Commit: "test(dropdown): add accessibility-specific tests"

- [ ] **Create dvfy-table.a11y.test.js**
  - Test: caption/aria-label, scope attrs, keyboard nav, row select announce
  - Commit: "test(table): add accessibility-specific tests"

- [ ] **Create dvfy-nav.a11y.test.js**
  - Test: semantic nav, aria-current, skip links, descriptive text
  - Commit: "test(nav): add accessibility-specific tests"

- [ ] **Create dvfy-drawer.a11y.test.js**
  - Test: focus trap, Escape key, aria-modal, backdrop click
  - Commit: "test(drawer): add accessibility-specific tests"

### Phase 4: Manual Audit + Fixes (Tier C)

- [ ] **Audit presentational components**
  - Check: token usage, text alternatives, color contrast
  - Commit: "fix(components): update tokens for WCAG AA compliance"

- [ ] **Audit remaining components**
  - Same process
  - Commit: "fix(components): WCAG AA token compliance"

### Phase 5: Documentation

- [ ] **Create docs/a11y-testing-guide.md**
  - Testing patterns, examples, how to run, debugging
  - Commit: "docs: add a11y testing guide"

- [ ] **Update docs/component-review-checklist.md**
  - Add a11y testing reference
  - Commit: "docs: update component review checklist"

- [ ] **Create docs/wcag-compliance.md**
  - Audit results, fixes applied, CI reference
  - Commit: "docs: add WCAG compliance audit results"

### Phase 6: Verification & CI

- [ ] **Run full test suite**
  - Command: `npm test`
  - Expected: all tests pass, zero axe violations

- [ ] **Run full gate**
  - Command: `npm run lint && npm run contrast:ci && npm run build && npm test`
  - Expected: all green

- [ ] **Verify CI configuration**
  - Check `.github/workflows/ci.yml`
  - Axe violations fail test job automatically

- [ ] **Create PR**
  - Title: "feat: accessibility audit — WCAG 2.1 AA pass on all existing components"
  - Verify: all CI checks pass

## Success Criteria
- [ ] All axe checks pass (zero violations on Tier A components)
- [ ] All a11y-specific tests pass (focus trap, keyboard nav, aria state)
- [ ] Manual audit complete, all Tier C components WCAG AA compliant
- [ ] CI green: lint, contrast, build, test all pass
- [ ] Documentation written
- [ ] PR created with all changes
