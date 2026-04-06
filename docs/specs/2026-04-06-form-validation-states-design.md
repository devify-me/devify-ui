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
- devify-cc#408 subscription form uses field-group with validation states (app sets `state` via JavaScript on validation)
- Form passes axe-core with zero a11y violations
- Keyboard-only and screen reader navigation works with all state combinations

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

**3. Token Reuse + New Input-Specific Tokens**
- Use existing semantic tokens (--dvfy-danger-*, --dvfy-warning-*, --dvfy-success-*)
- Add two new input-specific border tokens (see "Tokens Required" section)
- Already WCAG AA compliant from accessibility audit (#311)

---

## Component Specifications

### dvfy-input & dvfy-select Updates

#### New Attributes

| Attribute | Type | Values | Default | Purpose |
|-----------|------|--------|---------|---------|
| `state` | string | `"error"` \| `"warning"` \| `"success"` | none | Validation state |

#### Message Display Mechanism (Light DOM)

**Light DOM Attribute Approach** (vs. Shadow DOM slots):

Components use Light DOM without Shadow DOM. Message display uses named child elements:

```html
<dvfy-input label="Email" name="email" state="error">
  <span slot="error-message">Invalid email format</span>
</dvfy-input>
```

**Implementation:**
- Component's `#build()` preserves child elements with `slot` attribute (does NOT call `textContent = ''`)
- Component queries for `[slot="error-message"]`, `[slot="warning-message"]`, `[slot="success-message"]` children
- Moves matched child to message display area during render (or shows/hides based on `state`)
- If no matching child element exists, no message is displayed

**Alternative: Attribute-Based Messages** (simpler, considered):
```html
<dvfy-input label="Email" name="email" state="error" error-message="Invalid email format"></dvfy-input>
```
- Pros: simpler implementation, easier to update programmatically
- Cons: breaks pattern consistency with other slot-based components
- **Decision:** Use Light DOM child elements (slots) to match existing component patterns (labels, icons already use slots)

#### New Slots (Light DOM Child Elements)

| Slot Name | Purpose |
|-----------|---------|
| `error-message` | Child element with this slot attribute contains error text (displayed when `state="error"`) |
| `warning-message` | Child element with this slot attribute contains warning text (displayed when `state="warning"`) |
| `success-message` | Child element with this slot attribute contains success text (displayed when `state="success"`) |

#### Visual Changes

**Border Color (Consistent Across All Form Controls):**
- Error: `--dvfy-input-error` (red) — existing token used by dvfy-input
- Warning: `--dvfy-warning-border` (amber) — existing token used by other components
- Success: `--dvfy-success-border` (green) — existing token used by other components
- Focus ring: matches state color (or uses base ring color if no state)

**Note:** dvfy-select currently uses `--dvfy-danger-border` for errors. This will be updated to `--dvfy-input-error` for consistency with dvfy-input and other form controls as part of this work.

**Text Color:**
- Error message: `--dvfy-danger-text`
- Warning message: `--dvfy-warning-text`
- Success message: `--dvfy-success-text`

**Visual Indicator (Optional, Deferred):**
- Icons (✗, ⚠, ✓) are visual enhancement, not required for MVP
- Can be added in future via CSS-only `::before` pseudo-element approach
- Deferred to allow focus on core functionality (state attribute + message display)
- If implemented later: icon color matches state text color, icon placed right side of field

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

**Message Display Strategy:**
- **Child Input Errors:** Children handle their own message display (via their `[slot="error-message"]` etc. elements)
- **Group-Level Errors:** Field-group can display its own messages for cross-field validation (e.g., "dates don't overlap")
- No message duplication — child displays its message, group displays group-level message in separate area below inputs

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

### Token Strategy: Reuse Existing Border Tokens

**Use existing border tokens** (already defined in token system):
- Error: `--dvfy-input-error` (existing, red-500/400)
- Warning: `--dvfy-warning-border` (existing, amber-200 light / amber-700 dark)
- Success: `--dvfy-success-border` (existing, green-200 light / green-700 dark)

**Rationale:** Other components (dvfy-tag, dvfy-alert, dvfy-badge, dvfy-toast) already use `--dvfy-*-border` tokens for border colors. Reusing this pattern maintains consistency across the library. No new tokens required.

**Token Resolution (Light/Dark Themes):**
All tokens resolve via `tokens/light.css`, `tokens/dark.css`, and brand theme files. No theme generator changes needed — tokens already exist.

---

## Implementation Plan

### Phase 1: Form Control Updates (dvfy-input, dvfy-select, dvfy-textarea, dvfy-date-picker)
**For dvfy-input, dvfy-select, dvfy-textarea, dvfy-date-picker:**
- Add `state` to `observedAttributes` array
- Add `state` case in `attributeChangedCallback` (triggers re-render)
- Update Light DOM build: preserve child elements with `slot="*-message"` attributes
- Update CSS for state colors and focus rings (use `--dvfy-warning-border`, `--dvfy-success-border`)
- Update JSDoc with new `state` attribute and slot names
- Add tests for all three states + message display
- Verify backward compatibility with existing `error` attributes

**Rationale:** All four components support the `error` attribute and use `--dvfy-input-error` token. Validation states should be consistent across all form controls. dvfy-textarea is semantically equivalent to dvfy-input; dvfy-date-picker is semantically a select. Both participate in form validation.

### Phase 2: dvfy-field-group (New Component)
- Create component with `<fieldset>` + `<legend>` structure
- Implement label, help, default slot
- Implement group-level error/warning/success slots
- Style with semantic tokens + gap between inputs
- Add to barrel export (devify.js) + catalog

### Phase 3: Integration & Testing
- Add deep a11y test suite (dvfy-field-group.a11y.test.js)
- Test: fieldset accessibility, message announcements, keyboard nav
- Add functional tests for state + message display
- Update component review checklist

### Phase 4: Documentation
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
  const form = document.getElementById('subscription-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate email field
    const emailField = form.querySelector('[name="email"]');
    if (!emailField.value.trim()) {
      emailField.setAttribute('state', 'error');
      let errorMsg = emailField.querySelector('[slot="error-message"]');
      if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.slot = 'error-message';
        emailField.appendChild(errorMsg);
      }
      errorMsg.textContent = 'Email is required';
      return;
    } else {
      emailField.removeAttribute('state');
    }
    
    // ... validate other fields
    // If all valid, submit form
    console.log('Form is valid, submitting...');
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
