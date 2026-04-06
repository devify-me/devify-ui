# Form Validation States Pattern (Issue #313)

## Summary

This document describes the pattern for adding validation state support (`state` attribute + message slots) to form control components. Pattern proven on dvfy-input; applies identically to dvfy-select, dvfy-textarea, dvfy-date-picker.

## Pattern: 5 Changes Per Component

### 1. observedAttributes Array

Add `"state"` to the component's `observedAttributes` static getter.

**Example (dvfy-input):**
```javascript
static get observedAttributes() {
  return ['label', 'name', 'type', 'value', 'error', 'help', 'required', 'disabled', 'size', 'state'];
}
```

### 2. attributeChangedCallback

Add state case that triggers message re-render:

```javascript
attributeChangedCallback(name, oldValue, newValue) {
  if (name === 'state') {
    this.#patchMessages(this.querySelector('input')); // or 'select', 'textarea', etc.
  }
  // ... existing cases
}
```

For dvfy-select/date-picker: use the appropriate form element selector.

### 3. #build() Method

Preserve Light DOM child elements with `slot` attributes before clearing:

```javascript
#build() {
  // BEFORE: Save slotted children
  const slottedChildren = Array.from(this.children).filter(el => el.hasAttribute('slot'));
  
  // Clear and rebuild (existing code)
  this.textContent = '';
  // ... build label, wrapper, input, etc.
  
  // AFTER: Re-attach slotted children before appending messages
  slottedChildren.forEach(el => this.appendChild(el));
  this.#appendMessages();
}
```

**Why:** Slotted children contain the message source text (e.g., `<span slot="error-message">Invalid email</span>`). Component queries their text in `#appendMessages()` to populate rendered message elements.

### 4. #appendMessages() Method

Add three state branches (error, warning, success) that query slot children and render corresponding message elements:

```javascript
#appendMessages() {
  const input = this.querySelector('input'); // or 'select', etc.
  const errorText = this.querySelector('[slot="error-message"]')?.textContent?.trim();
  const warningText = this.querySelector('[slot="warning-message"]')?.textContent?.trim();
  const successText = this.querySelector('[slot="success-message"]')?.textContent?.trim();

  const state = this.getAttribute('state');
  
  // Legacy error attribute takes precedence
  if (this.hasAttribute('error') && this.getAttribute('error')) {
    const errorMsg = document.createElement('span');
    errorMsg.className = 'dvfy-<component>__error-msg';
    errorMsg.role = 'alert';
    errorMsg.textContent = this.getAttribute('error');
    this.appendChild(errorMsg);
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorMsg.id = `${this.id}-error`);
  }
  // State: error
  else if (state === 'error' && errorText) {
    const errorMsg = document.createElement('span');
    errorMsg.className = 'dvfy-<component>__error-msg';
    errorMsg.role = 'alert';
    errorMsg.textContent = errorText;
    this.appendChild(errorMsg);
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorMsg.id = `${this.id}-error`);
  }
  // State: warning
  else if (state === 'warning' && warningText) {
    const warningMsg = document.createElement('span');
    warningMsg.className = 'dvfy-<component>__warning-msg';
    warningMsg.role = 'status';
    warningMsg.textContent = warningText;
    this.appendChild(warningMsg);
    input.setAttribute('aria-invalid', 'false');
  }
  // State: success
  else if (state === 'success' && successText) {
    const successMsg = document.createElement('span');
    successMsg.className = 'dvfy-<component>__success-msg';
    successMsg.role = 'status';
    successMsg.textContent = successText;
    this.appendChild(successMsg);
    input.setAttribute('aria-invalid', 'false');
  }
  // Default: no state
  else {
    input.setAttribute('aria-invalid', 'false');
  }

  // Help text (if applicable to component)
  if (this.hasAttribute('help')) {
    const helpMsg = document.createElement('span');
    helpMsg.className = 'dvfy-<component>__help';
    helpMsg.textContent = this.getAttribute('help');
    this.appendChild(helpMsg);
  }
}
```

### 5. CSS & HTML Structure

**Add to STYLES constant:**

```javascript
/* State: error */
dvfy-<component>[state="error"] .dvfy-<component>__field { 
  border-color: var(--dvfy-input-error); 
}
dvfy-<component>[state="error"] .dvfy-<component>__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-input-error) 25%, transparent);
}

/* State: warning */
dvfy-<component>[state="warning"] .dvfy-<component>__field { 
  border-color: var(--dvfy-warning-border); 
}
dvfy-<component>[state="warning"] .dvfy-<component>__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-warning-border) 25%, transparent);
}

/* State: success */
dvfy-<component>[state="success"] .dvfy-<component>__field { 
  border-color: var(--dvfy-success-border); 
}
dvfy-<component>[state="success"] .dvfy-<component>__field:focus {
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-success-border) 25%, transparent);
}

/* Message text colors */
dvfy-<component> .dvfy-<component>__error-msg { 
  font-size: var(--dvfy-text-xs); 
  color: var(--dvfy-danger-text); 
}
dvfy-<component> .dvfy-<component>__warning-msg { 
  font-size: var(--dvfy-text-xs); 
  color: var(--dvfy-warning-text); 
}
dvfy-<component> .dvfy-<component>__success-msg { 
  font-size: var(--dvfy-text-xs); 
  color: var(--dvfy-success-text); 
}

/* Hide slot source elements from visual display */
dvfy-<component> [slot] { 
  display: none; 
}
```

**Update labelPositionCSS messages array** (if applicable):

For dvfy-input, dvfy-textarea (which use labelPositionCSS):

```javascript
${labelPositionCSS('dvfy-<component>', { 
  layout: 'field', 
  label: '.dvfy-<component>__label', 
  content: ['.dvfy-<component>__wrapper'], 
  messages: ['.dvfy-<component>__help', '.dvfy-<component>__error-msg', '.dvfy-<component>__warning-msg', '.dvfy-<component>__success-msg']
})}
```

### 6. JSDoc Updates

Add documentation for new state attribute and message slots:

```javascript
/**
 * <dvfy-input> — Text input with label, error, and help text
 *
 * Attributes:
 *   label, type, name, value, placeholder, error (deprecated), state, help, required, disabled, size
 *
 * @attr {string} state - Validation state: "error" | "warning" | "success" (optional)
 *
 * @slot error-message - Error message text (displayed when state="error")
 * @slot warning-message - Warning message text (displayed when state="warning")
 * @slot success-message - Success message text (displayed when state="success")
 *
 * @example
 * <dvfy-input label="Email" name="email" type="email" state="error">
 *   <span slot="error-message">Invalid email format</span>
 * </dvfy-input>
 *
 * @example
 * <dvfy-input label="Username" name="username" state="success"></dvfy-input>
 */
```

## Testing Pattern

Add these test cases to each component's `.test.js` file:

```javascript
describe('state attribute', () => {
  it('renders error message when state="error"', async () => {
    const el = await fixture(html`
      <dvfy-input label="Email" name="email" state="error">
        <span slot="error-message">Invalid email</span>
      </dvfy-input>
    `);
    const errorMsg = el.querySelector('.dvfy-input__error-msg');
    expect(errorMsg).to.exist;
    expect(errorMsg.textContent).to.equal('Invalid email');
  });

  it('renders warning message when state="warning"', async () => {
    const el = await fixture(html`
      <dvfy-input label="Email" name="email" state="warning">
        <span slot="warning-message">Email will renew soon</span>
      </dvfy-input>
    `);
    const warningMsg = el.querySelector('.dvfy-input__warning-msg');
    expect(warningMsg).to.exist;
    expect(warningMsg.textContent).to.equal('Email will renew soon');
  });

  it('renders success message when state="success"', async () => {
    const el = await fixture(html`
      <dvfy-input label="Email" name="email" state="success">
        <span slot="success-message">Email verified</span>
      </dvfy-input>
    `);
    const successMsg = el.querySelector('.dvfy-input__success-msg');
    expect(successMsg).to.exist;
    expect(successMsg.textContent).to.equal('Email verified');
  });

  it('renders no message when state is not set', async () => {
    const el = await fixture(html`<dvfy-input label="Email" name="email"></dvfy-input>`);
    expect(el.querySelector('.dvfy-input__error-msg')).to.not.exist;
    expect(el.querySelector('.dvfy-input__warning-msg')).to.not.exist;
    expect(el.querySelector('.dvfy-input__success-msg')).to.not.exist;
  });

  it('updates message when state changes', async () => {
    const el = await fixture(html`
      <dvfy-input label="Email" name="email" state="error">
        <span slot="error-message">Error 1</span>
      </dvfy-input>
    `);
    expect(el.querySelector('.dvfy-input__error-msg')?.textContent).to.equal('Error 1');
    
    el.setAttribute('state', 'warning');
    el.querySelector('[slot="warning-message"]')?.remove();
    const warningMsg = document.createElement('span');
    warningMsg.slot = 'warning-message';
    warningMsg.textContent = 'Warning 1';
    el.appendChild(warningMsg);
    
    expect(el.querySelector('.dvfy-input__warning-msg')?.textContent).to.equal('Warning 1');
  });

  it('backward compatible with error attribute', async () => {
    const el = await fixture(html`<dvfy-input label="Email" name="email" error="Legacy error"></dvfy-input>`);
    const errorMsg = el.querySelector('.dvfy-input__error-msg');
    expect(errorMsg?.textContent).to.equal('Legacy error');
  });

  it('passes axe checks for all states', async () => {
    const el = await fixture(html`
      <dvfy-input label="Email" name="email" state="error">
        <span slot="error-message">Invalid</span>
      </dvfy-input>
    `);
    await checkA11y(el);
  });
});
```

## Component-Specific Notes

### dvfy-select
- Update error border token from `--dvfy-danger-border` to `--dvfy-input-error` (consistency with dvfy-input)
- Apply state styling to `.dvfy-select__trigger` button, not inner input
- Same slot pattern

### dvfy-textarea
- Identical to dvfy-input pattern
- Same CSS, same slots, same attributeChangedCallback

### dvfy-date-picker
- Apply state styling to date picker trigger button
- Same slot pattern as other inputs
- Same attributeChangedCallback

## Completion Checklist Per Component

- [ ] Add "state" to observedAttributes
- [ ] Add state case in attributeChangedCallback
- [ ] Update #build() to preserve slotted children
- [ ] Update #appendMessages() with three state branches
- [ ] Add CSS selectors for all three states (border colors, focus rings)
- [ ] Update CSS rule for hidden [slot] elements
- [ ] Update labelPositionCSS messages array (if applicable)
- [ ] Add JSDoc for state attribute + three message slots
- [ ] Add 7 state tests to component.test.js
- [ ] Run: npm test — all tests pass
- [ ] Run: npm run lint — clean
- [ ] Run: npm run contrast:ci — 90/90 WCAG AA
