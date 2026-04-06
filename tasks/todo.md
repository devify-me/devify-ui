# Issue #313: Form Validation States & Field Groups

**Type:** feat  
**Branch:** feat/313-form-validation-states  
**Issue:** [#313](https://github.com/devify-me/devify-ui/issues/313)  
**Design Spec:** [docs/specs/2026-04-06-form-validation-states-design.md](docs/specs/2026-04-06-form-validation-states-design.md)

## Context

Add validation states (error, warning, success) to form controls + new dvfy-field-group wrapper component. Enables devify-cc#408 (subscription form) and future CRUD forms to display consistent validation feedback without custom markup.

## Architecture

**Three-part solution:**
1. Update form controls (dvfy-input, dvfy-select, dvfy-textarea, dvfy-date-picker) with `state` attribute + message slots
2. Create new dvfy-field-group wrapper for label + inputs + group-level error display
3. Reuse existing semantic tokens (--dvfy-warning-border, --dvfy-success-border) — no new tokens needed

## File Structure

**Modified:**
- `components/dvfy-input.js` — add state + slots + CSS
- `components/dvfy-select.js` — add state + slots + CSS (also fix token from --dvfy-danger-border to --dvfy-input-error)
- `components/dvfy-textarea.js` — add state + slots + CSS
- `components/dvfy-date-picker.js` — add state + slots + CSS
- `devify.js` — export new dvfy-field-group

**Created:**
- `components/dvfy-field-group.js` — new wrapper component
- `components/dvfy-field-group.test.js` — functional tests
- `components/dvfy-field-group.a11y.test.js` — a11y tests

## Tasks

### Phase 1: Form Control Updates (dvfy-input, dvfy-select, dvfy-textarea, dvfy-date-picker)

**Pattern documented in FORM_VALIDATION_PATTERN.md — identical 6-step pattern for all 4 components**

- [x] dvfy-input: Add state attribute + Light DOM slots + tests (COMPLETE, reviewed, tested)
- [ ] dvfy-select: Apply pattern (fix token from --dvfy-danger-border to --dvfy-input-error)
- [ ] dvfy-textarea: Apply pattern (identical to dvfy-input)
- [ ] dvfy-date-picker: Apply pattern (state styling on trigger button)
- [ ] Verify Phase 1: All form controls passing tests, lint, contrast

**Reference:** See FORM_VALIDATION_PATTERN.md for 6-step checklist (observedAttributes → attributeChangedCallback → #build() preservation → #appendMessages() branches → CSS → JSDoc → tests)

### Phase 2: dvfy-field-group (New Component)

- [ ] Create dvfy-field-group.js (<fieldset> + <legend> structure)
- [ ] Add dvfy-field-group to barrel export (devify.js)
- [ ] Create dvfy-field-group.test.js (functional tests)
- [ ] Create dvfy-field-group.a11y.test.js (a11y tests)
- [ ] Add dvfy-field-group to catalog
- [ ] Verify Phase 2: Field-group tests pass, lint, analyze

### Phase 3: Integration & Testing

- [ ] Full test suite (npm test — all pass)
- [ ] Contrast audit (npm run contrast:ci — 90/90 WCAG AA)
- [ ] Lint & build (npm run lint, npm run build)
- [ ] Manual verification (keyboard nav, screen reader)

### Phase 4: Documentation

- [ ] Update docs/a11y-testing-guide.md
- [ ] Update docs/wcag-compliance.md
- [ ] Update docs/component-review-checklist.md

## Success Criteria

- ✅ All form controls expose `state` attribute (error | warning | success)
- ✅ All states meet WCAG 2.1 AA color contrast
- ✅ dvfy-field-group wraps label + inputs + error display
- ✅ devify-cc#408 can use without custom error handling
- ✅ All 1288+ tests pass
- ✅ Keyboard + screen reader a11y works
- ✅ Documentation updated
