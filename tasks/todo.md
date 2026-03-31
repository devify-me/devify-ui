# Issue #291: Fix dvfy-button type="submit" does not submit parent form

**Type:** fix
**Branch:** fix/291-button-form-submit
**Labels:** bug, ctx:components, priority:high

## Plan

- [ ] Add click handler that calls `form.requestSubmit()` for type="submit" and `form.reset()` for type="reset"
- [ ] Update JSDoc to document type attribute behavior
- [ ] Run `npm run analyze` to regenerate manifest
- [ ] Verify: build passes (`npm run build`)
- [ ] Verify: lint clean (`npm run lint`)

## Future
<!-- Unrelated issues discovered during implementation — do NOT fix inline -->
