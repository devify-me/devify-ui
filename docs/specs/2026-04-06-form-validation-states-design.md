# Form Validation States & Field Groups Design

**Issue:** [#313](https://github.com/devify-me/devify-ui/issues/313)  
**Date:** 2026-04-06  
**Status:** Design approved

---

## Goal

Enable CRUD forms (subscription form in devify-cc#408, future project/decision forms) to display validation states (error, warning, success) with inline messages without custom markup or JavaScript.

## Problem

Current form components (dvfy-input, dvfy-select) support error display but lack warning/success states. Forms building on @devify/ui each implement their own error display patterns, producing inconsistent UX and duplicated markup. No standard wrapper for grouping multi-field validation (e.g., address blocks, date ranges).

## Success Criteria

- dvfy-input and dvfy-select expose `state` attribute (error | warning | success) with message slots
- New dvfy-field-group component wraps label + inputs + error display
- All states meet WCAG 2.1 AA color contrast requirements
- devify-cc#408 subscription form uses field-group with validation states
- Form submitting empty required field shows inline error without JavaScript
- Form passes axe-core with zero a11y violations

---

## Architecture

### Three-Part Solution

**1. Validation States on Form Controls**
- Add `state` attribute to dvfy-input and dvfy-select
- Three message slots: `error-message`, `warning-message`, `success-message`
- Visual styling per state (border color, focus ring, text color)

**2. dvfy-field-group Wrapper Component**
- Groups label + one or more inputs + help/error text
- Reads `state` from child inputs; displays their messages
- Optional group-level `state` and messages for cross-field validation
- Renders as `<fieldset>` + `<legend>` for accessibility

**3. Token Reuse**
- Use existing semantic tokens (--dvfy-danger-*, --dvfy-warning-*, --dvfy-success-*)
- Already WCAG AA compliant from accessibility audit (#311)
- No new tokens needed

---

## Component Specifications

### dvfy-input & dvfy-select Updates

#### New Attributes

| Attribute | Type | Values | Default | Purpose |
|-----------|------|--------|---------|---------|
| `state` | string | `"error"` \| `"warning"` \| `"success"` | none | Validation state |

#### New Slots

| Slot Name | Purpose |
|-----------|---------|
| `error-message` | Error message text (displayed when `state="error"`) |
| `warning-message` | Warning message text (displayed when `state="warning"`) |
| `success-message` | Success message text (displayed when `state="success"`) |

#### Visual Changes

**Border Color:**
- Error: `--dvfy-input-error` (red)
- Warning: derived from `--dvfy-warning-bg` (yellow, new token)
- Success: derived from `--dvfy-success-bg` (green, new token)
- Focus ring: matches state color (or uses base ring color if no state)

**Text Color:**
- Error message: `--dvfy-danger-text`
- Warning message: `--dvfy-warning-text`
- Success message: `--dvfy-success-text`

**Optional Visual Indicator:**
- Icon next to field (✗, ⚠, ✓) via CSS `::before` pseudo-element or icon slot
- Icon color matches message text color
- Configurable via CSS custom property (--dvfy-show-state-icon)

#### Example Usage

```html
<!-- Error state with message -->
<dvfy-input 
  label="Email" 
  name="email" 
  type="email"
  required
  state="error"
>
  <span slot="error-message">Invalid email format</span>
</dvfy-input>

<!-- Success state (no message) -->
<dvfy-input 
  label="Username" 
  name="username"
  state="success"
></dvfy-input>

<!-- Warning state with message -->
<dvfy-select 
  label="Plan" 
  name="plan"
  state="warning"
>
  <option value="free">Free</option>
  <option value="pro" selected>Pro (will renew)</option>
  <span slot="warning-message">Billing renews in 3 days</span>
</dvfy-select>
```

#### Backward Compatibility

Keep existing `error` attribute working:
- `error="text"` maps to `state="error"` + message slot population
- Deprecated but functional — existing forms continue to work
- Migration path: gradually move to `state` + slots

---

### dvfy-field-group (New Component)

#### Purpose

Wrapper component that groups related form fields (label, help text, inputs, error display) for consistent styling and accessibility.

#### Attributes

| Attribute | Type | Values | Default | Purpose |
|-----------|------|--------|---------|---------|
| `label` | string | any | required | Group label (e.g., "Address", "Date Range") |
| `help` | string | any | optional | Helper text shown below label, above inputs |
| `state` | string | `"error"` \| `"warning"` \| `"success"` | none | Group-level validation state (cross-field errors) |

#### Slots

| Slot Name | Purpose |
|-----------|---------|
| default | Input elements (dvfy-input, dvfy-select, etc.) |
| `error-message` | Group-level error message (shown when `state="error"`) |
| `warning-message` | Group-level warning message (shown when `state="warning"`) |
| `success-message` | Group-level success message (shown when `state="success"`) |

#### HTML Structure

```html
<fieldset>
  <legend><!-- label --></legend>
  <!-- help text (if provided) -->
  <!-- slot: default inputs -->
  <!-- group-level error message (if state is set) -->
</fieldset>
```

#### Styling

- Renders as `<fieldset>` + `<legend>` for accessibility (semantic grouping)
- Gap between inputs: `--dvfy-space-2`
- Label (legend) font: `--dvfy-text-sm`, `--dvfy-weight-medium`, `--dvfy-text-primary`
- Help text: `--dvfy-text-xs`, `--dvfy-text-muted`
- Message text color: matches state (danger, warning, success)
- Group-level error displayed below all inputs

#### Example Usage

```html
<!-- Single input group -->
<dvfy-field-group label="Email Address" help="We'll never share your email">
  <dvfy-input 
    label="Email" 
    name="email" 
    type="email" 
    required
  ></dvfy-input>
</dvfy-field-group>

<!-- Multi-input group (address) -->
<dvfy-field-group label="Billing Address">
  <dvfy-input label="Street" name="street" required></dvfy-input>
  <dvfy-input label="City" name="city" required></dvfy-input>
  <dvfy-input label="ZIP" name="zip" required></dvfy-input>
</dvfy-field-group>

<!-- Group with cross-field error -->
<dvfy-field-group 
  label="Date Range"
  state="error"
>
  <dvfy-input label="Start Date" name="start" type="date" required></dvfy-input>
  <dvfy-input label="End Date" name="end" type="date" required></dvfy-input>
  <span slot="error-message">End date must be after start date</span>
</dvfy-field-group>

<!-- Group with individual input errors (read from children) -->
<dvfy-field-group label="Billing Address">
  <dvfy-input label="Street" name="street" required></dvfy-input>
  <dvfy-input 
    label="City" 
    name="city" 
    required
    state="error"
  >
    <span slot="error-message">City is required</span>
  </dvfy-input>
  <dvfy-input label="ZIP" name="zip" required></dvfy-input>
</dvfy-field-group>
```

#### Accessibility

- Semantic `<fieldset>` + `<legend>` for screen reader grouping
- Children inputs maintain their own `aria-describedby` for message linking
- Group-level messages linked via `aria-describedby` on fieldset
- `aria-invalid="true"` inherited from child states
- Keyboard navigation: Tab moves through all input children

---

## Tokens Required

### New Color Tokens

For warning/success state styling in inputs, derive from existing palette:

| Token | Value | Purpose |
|-------|-------|---------|
| `--dvfy-input-warning` | yellow-600 equivalent | Border color for warning state |
| `--dvfy-input-success` | green-600 equivalent | Border color for success state |

**Rationale:** Error already has `--dvfy-input-error`. Warning and success need border tokens for consistency.

These are derived from existing `--dvfy-warning-bg` and `--dvfy-success-bg` (already WCAG AA compliant).

---

## Implementation Plan

### Phase 1: dvfy-input Updates
- Add `state` attribute + slots to component
- Update CSS for state colors and focus rings
- Update JSDoc with new attributes and slots
- Add tests for all three states + message display
- Verify backward compatibility with `error` attribute

### Phase 2: dvfy-select Updates
- Same as input (add `state`, slots, CSS, tests)
- Handle state styling on custom trigger button

### Phase 3: dvfy-field-group (New Component)
- Create component with `<fieldset>` + `<legend>` structure
- Implement label, help, default slot
- Implement group-level error/warning/success slots
- Style with semantic tokens + gap between inputs
- Add to barrel export (devify.js) + catalog

### Phase 4: Integration & Testing
- Add deep a11y test suite (dvfy-field-group.a11y.test.js)
- Test: fieldset accessibility, message announcements, keyboard nav
- Add functional tests for state + message display
- Update component review checklist

### Phase 5: Documentation
- Update `docs/a11y-testing-guide.md` with form validation patterns
- Update `docs/wcag-compliance.md` with new tokens
- Add example form to catalog playground

---

## Testing Strategy

### Automated Tests

**dvfy-input & dvfy-select:**
- Axe checks for all three states (color contrast, ARIA)
- Functional tests: state attribute changes, slots render correctly
- Backward compatibility test: `error` attribute still works

**dvfy-field-group:**
- Axe checks: fieldset + legend accessibility
- Slot rendering tests (label, help, error/warning/success messages)
- Child error display (reads `state` from inputs)
- Group-level error display (reads `state` from field-group)

### Manual Testing

- Keyboard-only navigation (Tab through inputs, read error messages)
- Screen reader test (NVDA/VoiceOver announces state + message changes)
- Visual check: color contrast in all states, message text readable

---

## Integration with devify-cc#408

Subscription form using field-group + validation states:

```html
<form id="subscription-form">
  <dvfy-field-group label="Subscription Plan">
    <dvfy-select 
      label="Plan Type" 
      name="plan" 
      required
    >
      <option value="">Select a plan</option>
      <option value="pro">Pro ($29/mo)</option>
      <option value="enterprise">Enterprise (custom)</option>
    </dvfy-select>
  </dvfy-field-group>

  <dvfy-field-group label="Billing Information" help="For invoice delivery">
    <dvfy-input 
      label="Email" 
      name="email" 
      type="email" 
      required
    ></dvfy-input>
    <dvfy-input 
      label="Company Name" 
      name="company"
    ></dvfy-input>
  </dvfy-field-group>

  <dvfy-field-group label="Billing Address">
    <dvfy-input 
      label="Street Address" 
      name="street" 
      required
    ></dvfy-input>
    <dvfy-input 
      label="City" 
      name="city" 
      required
    ></dvfy-input>
    <dvfy-input 
      label="ZIP Code" 
      name="zip" 
      required
    ></dvfy-input>
  </dvfy-field-group>

  <button type="submit">Subscribe</button>
</form>

<script>
  document.getElementById('subscription-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Validate form
    if (!form.email.value) {
      const emailField = form.querySelector('[name="email"]');
      emailField.setAttribute('state', 'error');
      emailField.querySelector('[slot="error-message"]').textContent = 'Email is required';
    }
    // ... more validation
  });
</script>
```

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Color contrast in warning/success states | New tokens derived from audit-compliant palette (#311) |
| Backward compatibility break | Keep `error` attribute working; deprecation notice in JSDoc |
| Fieldset a11y issues | Semantic `<fieldset>` + `<legend>` (standard pattern) |
| Screen reader announcement overload | Use `aria-describedby` linking, not live regions (less intrusive) |

---

## Success Metrics

- ✅ All dvfy-input/select tests pass (old + new state tests)
- ✅ dvfy-field-group tests pass (structure, message display, a11y)
- ✅ Axe checks pass on all combinations (color contrast, ARIA)
- ✅ Keyboard-only navigation works through field-group + inputs
- ✅ devify-cc#408 subscription form uses field-group without custom error handling
- ✅ Screen reader announces state changes correctly
