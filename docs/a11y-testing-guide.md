# Accessibility Testing Guide

This guide documents how @devify/ui components are tested for WCAG 2.1 AA compliance and how to write accessible tests.

## Overview

All dvfy-* components undergo two types of accessibility testing:

1. **Automated axe-core checks** — integrated into every test via `checkA11y()`
2. **Deep interaction tests** — dedicated `*.a11y.test.js` files for complex interactive patterns

The tests are run automatically as part of `npm test` (via @web/test-runner with Chromium).

## What axe-core Does

[axe-core](https://github.com/dequelabs/axe-core) is an automated accessibility testing engine that:
- Scans the DOM for ARIA misuse, contrast violations, missing labels, and semantic errors
- Runs in seconds without human interaction
- Cannot detect visual layout issues, keyboard behavior, or screen reader quirks
- Is a **starting point**, not a complete audit — automated tools catch ~60% of issues

### Why We Use It

- **Fast feedback** — runs on every test, every PR, zero setup
- **Consistent baseline** — catches regressions early
- **Low false-positive rate** — when axe flags something, it's usually wrong

### What It Cannot Detect

- **Keyboard navigation** (Tab order, focus traps, arrow key support)
- **Screen reader announcements** (requires manual testing or specialized tools)
- **Visual focus indicators** (CSS animations, color contrast in high-contrast mode)
- **HTMX form revalidation** (server-side logic)
- **Layout cascades** (responsive breakpoints, container query interactions)

For these, we use dedicated `*.a11y.test.js` files (see "Deep A11y Tests" below).

## Running A11y Tests

```bash
# Run all tests (functional + a11y checks)
npm test

# Watch mode
npm test:watch
```

Tests fail if:
- Any axe violation is found (unless intentionally suppressed)
- Any interactive test fails (focus trap, keyboard nav, etc.)
- Any assertion fails

## Integration Pattern: axe-core in Functional Tests

Every functional test includes an axe check at the end:

```javascript
import { fixture, html, expect } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-button.js';

describe('dvfy-button', () => {
  it('renders with default attributes', async () => {
    const el = await fixture(html`<dvfy-button>Click me</dvfy-button>`);
    expect(el.textContent.trim()).to.equal('Click me');
    expect(el.getAttribute('role')).to.equal('button');
    
    // Always call checkA11y at the end
    await checkA11y(el);
  });

  it('accepts variant attribute', async () => {
    const el = await fixture(html`<dvfy-button variant="danger">Delete</dvfy-button>`);
    expect(el.getAttribute('variant')).to.equal('danger');
    
    await checkA11y(el);
  });
});
```

### API: `checkA11y(element, options?)`

```javascript
import { checkA11y } from '../utils/axe-test.js';

// Basic usage (no options)
await checkA11y(el);

// Ignore specific axe rules with documented reason
await checkA11y(el, {
  ignoredRules: ['aria-valid-attr-value']
});

// Ignore multiple rules
await checkA11y(el, {
  ignoredRules: ['rule-1', 'rule-2', 'rule-3']
});
```

**When to ignore a rule:**
- If the violation is a known false positive (e.g., ARIA attribute applied correctly but axe disagrees)
- If the component intentionally deviates for UX reasons (document the reason in code)
- **Never** ignore without a documented justification

## Deep A11y Tests: Interactive Patterns

Complex interactive components (modals, dropdowns, navs) have dedicated `*.a11y.test.js` files that test:
- **Focus management** — initial focus, trap, restore
- **Keyboard navigation** — Tab, Shift+Tab, Escape, Arrow keys
- **ARIA attributes** — correct roles, expanded states, selected states
- **Screen reader semantics** — aria-label, aria-labelledby, aria-hidden

### Example: Modal Focus Trap

File: `components/dvfy-modal.a11y.test.js`

```javascript
import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-modal.js';

describe('dvfy-modal — accessibility', () => {
  describe('focus trap', () => {
    it('moves focus inside the modal when opened', async () => {
      const el = await fixture(html`
        <dvfy-modal title="Focus Test">
          <button id="first">First</button>
          <button id="second">Second</button>
        </dvfy-modal>
      `);

      el.setAttribute('open', '');
      await new Promise(r => requestAnimationFrame(r));

      const dialog = el.querySelector('.dvfy-modal__dialog');
      expect(dialog.contains(document.activeElement)).to.be.true;
    });

    it('wraps Tab from last focusable to first', async () => {
      const el = await fixture(html`
        <dvfy-modal open>
          <button id="first">First</button>
          <button id="last">Last</button>
        </dvfy-modal>
      `);

      const focusables = [
        el.querySelector('.dvfy-modal__close'),
        el.querySelector('#first'),
        el.querySelector('#last'),
      ];

      // Move to last focusable
      focusables[2].focus();
      expect(document.activeElement).to.equal(focusables[2]);

      // Simulate Tab key
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

      // Should wrap to first
      expect(document.activeElement).to.equal(focusables[0]);
    });

    it('restores focus to trigger when closed', async () => {
      const trigger = document.createElement('button');
      trigger.textContent = 'Open Modal';
      document.body.appendChild(trigger);

      const el = await fixture(html`<dvfy-modal title="Test" open></dvfy-modal>`);
      el._focusTrap.previous = trigger;

      el.removeAttribute('open');
      await new Promise(r => requestAnimationFrame(r));

      expect(document.activeElement).to.equal(trigger);
      document.body.removeChild(trigger);
    });
  });

  describe('keyboard navigation', () => {
    it('closes on Escape key', async () => {
      const el = await fixture(html`<dvfy-modal open title="Test">Content</dvfy-modal>`);
      expect(el.hasAttribute('open')).to.be.true;

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('ARIA attributes', () => {
    it('sets role="dialog"', async () => {
      const el = await fixture(html`<dvfy-modal title="Test">Content</dvfy-modal>`);
      expect(el.getAttribute('role')).to.equal('dialog');
    });

    it('uses aria-labelledby for title', async () => {
      const el = await fixture(html`<dvfy-modal title="Modal Title">Content</dvfy-modal>`);
      const titleId = el.querySelector('.dvfy-modal__title').id;
      expect(el.getAttribute('aria-labelledby')).to.equal(titleId);
    });

    it('sets aria-modal="true"', async () => {
      const el = await fixture(html`<dvfy-modal open>Content</dvfy-modal>`);
      expect(el.getAttribute('aria-modal')).to.equal('true');
    });
  });
});
```

### Creating a `*.a11y.test.js` File

1. Name it `ComponentName.a11y.test.js` (after the component's `*.test.js`)
2. Import fixtures and test helpers from `@open-wc/testing`
3. Test:
   - **Initial focus** — Where does focus land when component is created/opened?
   - **Focus trap** — Can focus escape (modals, dropdowns)?
   - **Tab/Shift+Tab** — Does tabbing move through all focusables in correct order?
   - **Arrow keys** — Do arrow keys navigate within the component (tabs, menu, radio group)?
   - **Escape** — Does Escape close/dismiss overlays?
   - **ARIA attributes** — Correct roles, expanded/selected/checked states?
4. Do NOT call `checkA11y()` in a11y files (they're too detailed for automated checks)

## Debugging A11y Failures

### 1. Read the axe Violation Message

When `npm test` fails with an axe violation:

```
AssertionError: 1 accessibility violation found.

Violations:
- Rule: color-contrast
  Impact: serious
  Target: button#submit
  Message: Element has insufficient color contrast (2.1:1). Expected 4.5:1.
  Help: https://dequeuniversity.com/rules/axe/4.4/color-contrast
```

**What to do:**
- Click the Help link and read the rule's documentation
- Check the target element's CSS and computed styles
- Verify the component is using semantic tokens (not hardcoded colors)

### 2. Check ARIA Labels

Violation: `aria-label-mismatch` or `aria-required-attr`

```javascript
// ❌ Missing aria-label
const el = await fixture(html`<button><span>→</span></button>`);
await checkA11y(el); // Fails: button has no accessible name

// ✅ With aria-label
const el = await fixture(html`<button aria-label="Next">→</button>`);
await checkA11y(el);
```

**Pattern for icon-only buttons:**
```javascript
<dvfy-button aria-label="Close">
  <span slot="icon">✕</span>
</dvfy-button>
```

### 3. Verify Keyboard Behavior

If a `*.a11y.test.js` test fails:

```javascript
// Test that Tab moves focus predictably
it('Tab moves through all focusables', async () => {
  const el = await fixture(html`
    <div>
      <button id="first">First</button>
      <button id="second">Second</button>
    </div>
  `);

  const first = el.querySelector('#first');
  const second = el.querySelector('#second');

  first.focus();
  first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

  // Manually move focus (browser doesn't do it in test)
  second.focus();
  expect(document.activeElement).to.equal(second);
});
```

### 4. Check ARIA Attributes Match Component State

Violation: `aria-disabled-attr` or `aria-hidden`

```javascript
// ❌ aria-disabled but tabindex not -1
<button aria-disabled="true" tabindex="0">Broken</button>

// ✅ Consistent state
<button aria-disabled="true" tabindex="-1" disabled>Correct</button>
```

## Suppressing Violations

Use `checkA11y()` options to suppress intentional violations:

```javascript
it('renders disabled button', async () => {
  const el = await fixture(html`<dvfy-button disabled>Disabled</dvfy-button>`);
  
  // Disabled buttons fail axe's `button-name` rule because the native disabled
  // attribute prevents the button from being actionable. This is correct per WCAG.
  // Suppress the check; the a11y test verifies correct aria-disabled handling.
  await checkA11y(el, {
    ignoredRules: ['button-name']
  });
});
```

**Document the suppression with a comment explaining:**
1. Which rule is suppressed
2. Why it's a false positive or intentional
3. What part of the codebase validates this

Example: `components/dvfy-modal.test.js`
```javascript
// Modal content fails axe's `region` rule because the modal is a dialog,
// not a main region. The a11y test (dvfy-modal.a11y.test.js) verifies
// correct role="dialog" and focus trap behavior.
await checkA11y(el, {
  ignoredRules: ['region']
});
```

## References

### axe-core Rules
- [axe Rule Descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Deque University](https://dequeuniversity.com/rules/axe/) — detailed explanations for each rule

### WCAG 2.1 Guidelines
- [WCAG 2.1 Level AA Criteria](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) (1.4.3)
- [Understanding Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html) (2.4.7)
- [Understanding Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html) (2.4.3)

### @open-wc/testing
- [@open-wc/testing docs](https://open-wc.org/docs/testing/testing-package/)
- [axe-core integration](https://open-wc.org/docs/testing/chai-a11y-axe/) (chai-a11y-axe plugin)

### Web Component Accessibility
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: ARIA: role attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [Web Components accessibility best practices](https://www.w3.org/TR/wai-aria-practices-1.1/#web_components)

## Adding Tests to a New Component

When creating a new component:

1. **Create `ComponentName.test.js`** with functional tests + `checkA11y()` at the end of each test
2. **If interactive** (modal, dropdown, nav, tabs), create `ComponentName.a11y.test.js` for:
   - Focus management
   - Keyboard navigation
   - ARIA attribute correctness
3. **Run `npm test`** — all tests must pass
4. **If axe fails**, investigate the violation (read error message, check the rule docs)
5. **Suppress only if justified** — document the reason inline

## CI

The accessibility tests run automatically on every push and PR via GitHub Actions (`.github/workflows/test.yml`). The job fails if:
- Any axe violation is found
- Any keyboard interaction test fails
- Any assertion fails

There is no separate "a11y check" job — a11y is part of the standard test suite.

## Future Work

- **NVDA/JAWS testing** — manual screen reader validation (Phase 6+)
- **Consuming project a11y** — devify-cc, devify.me will inherit @devify/ui's accessibility but need their own tests
- **Color blind simulation** — axe can filter by color-blind vision modes (simulate deuteranopia, protanopia, tritanopia)
