import { fixture, html, expect } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-field-group.js';
import './dvfy-input.js';

describe('dvfy-field-group — accessibility', () => {

  // ─── Fieldset + Legend Structure ──────────────────────────────────────────────

  describe('fieldset + legend structure', () => {
    it('renders a fieldset element', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Personal Info"></dvfy-field-group>
      `);
      const fieldset = el.querySelector('fieldset');
      expect(fieldset).to.exist;
    });

    it('renders a legend inside the fieldset', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Contact"></dvfy-field-group>
      `);
      const legend = el.querySelector('fieldset legend');
      expect(legend).to.exist;
    });

    it('legend contains the label text', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Billing Address"></dvfy-field-group>
      `);
      const legend = el.querySelector('legend');
      expect(legend.textContent).to.equal('Billing Address');
    });

    it('legend is the first child of fieldset', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Group Label" help="Helper text">
          <dvfy-input label="Field 1"></dvfy-input>
        </dvfy-field-group>
      `);
      const fieldset = el.querySelector('fieldset');
      const legend = fieldset.querySelector('legend');
      expect(fieldset.firstElementChild).to.equal(legend);
    });

    it('fieldset is valid semantic structure (no aria violations)', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Group">
          <dvfy-input label="Field 1"></dvfy-input>
        </dvfy-field-group>
      `);
      await checkA11y(el);
    });
  });

  // ─── Tab Navigation Through Inputs ───────────────────────────────────────────

  describe('keyboard navigation (Tab)', () => {
    it('all child inputs are keyboard accessible via Tab', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Multiple Inputs">
          <dvfy-input id="input1" label="First"></dvfy-input>
          <dvfy-input id="input2" label="Second"></dvfy-input>
          <dvfy-input id="input3" label="Third"></dvfy-input>
        </dvfy-field-group>
      `);

      const input1 = el.querySelector('#input1');
      const input2 = el.querySelector('#input2');
      const input3 = el.querySelector('#input3');

      // Get the actual focusable elements (the inner <input> elements inside dvfy-input)
      const focusable1 = input1.querySelector('input');
      const focusable2 = input2.querySelector('input');
      const focusable3 = input3.querySelector('input');

      // Verify all are focusable
      expect(focusable1).to.exist;
      expect(focusable2).to.exist;
      expect(focusable3).to.exist;

      // All should be in the tab order
      expect(focusable1.getAttribute('tabindex')).to.not.equal('-1');
      expect(focusable2.getAttribute('tabindex')).to.not.equal('-1');
      expect(focusable3.getAttribute('tabindex')).to.not.equal('-1');
    });

    it('focus can be set on first child input', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Focus Test">
          <dvfy-input id="first" label="First Field"></dvfy-input>
          <dvfy-input id="second" label="Second Field"></dvfy-input>
        </dvfy-field-group>
      `);

      const firstInput = el.querySelector('#first input');
      firstInput.focus();
      expect(document.activeElement).to.equal(firstInput);
    });

    it('focus can be set on middle child input', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Middle Focus">
          <dvfy-input id="a" label="A"></dvfy-input>
          <dvfy-input id="b" label="B"></dvfy-input>
          <dvfy-input id="c" label="C"></dvfy-input>
        </dvfy-field-group>
      `);

      const middleInput = el.querySelector('#b input');
      middleInput.focus();
      expect(document.activeElement).to.equal(middleInput);
    });

    it('focus can be set on last child input', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Last Focus">
          <dvfy-input id="first" label="First"></dvfy-input>
          <dvfy-input id="last" label="Last"></dvfy-input>
        </dvfy-field-group>
      `);

      const lastInput = el.querySelector('#last input');
      lastInput.focus();
      expect(document.activeElement).to.equal(lastInput);
    });
  });

  // ─── Legend & Help Text Reading Order ────────────────────────────────────────

  describe('legend and help text reading order', () => {
    it('legend is associated with fieldset for screen readers', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Contact Info">
          <dvfy-input label="Email"></dvfy-input>
        </dvfy-field-group>
      `);
      const legend = el.querySelector('legend');
      expect(legend).to.exist;
      // Legend inside fieldset provides implicit association
      await checkA11y(el);
    });

    it('help text appears after legend in DOM order (read after label)', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Email Address" help="We never share your email">
          <dvfy-input label="Email"></dvfy-input>
        </dvfy-field-group>
      `);

      const fieldset = el.querySelector('fieldset');
      const legend = fieldset.querySelector('legend');
      const help = fieldset.querySelector('.dvfy-field-group__help');

      expect(legend).to.exist;
      expect(help).to.exist;

      // Help comes after legend in DOM order
      const legendIndex = Array.from(fieldset.children).indexOf(legend);
      const helpIndex = Array.from(fieldset.children).indexOf(help);
      expect(helpIndex).to.be.greaterThan(legendIndex);
    });

    it('help text is visible and accessible', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Phone Number" help="Include country code">
          <dvfy-input label="Phone"></dvfy-input>
        </dvfy-field-group>
      `);

      const help = el.querySelector('.dvfy-field-group__help');
      expect(help).to.exist;
      expect(help.textContent).to.equal('Include country code');
      await checkA11y(el);
    });

    it('no help text when not provided', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Name">
          <dvfy-input label="Full Name"></dvfy-input>
        </dvfy-field-group>
      `);

      const help = el.querySelector('.dvfy-field-group__help');
      expect(help).to.be.null;
      await checkA11y(el);
    });
  });

  // ─── ARIA Attributes in Error State ──────────────────────────────────────────

  describe('ARIA attributes in error state', () => {
    it('fieldset has aria-describedby pointing to error message when state="error"', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Date Range" state="error">
          <dvfy-input id="start" label="Start Date"></dvfy-input>
          <dvfy-input id="end" label="End Date"></dvfy-input>
          <span slot="error-message">End date must be after start date</span>
        </dvfy-field-group>
      `);

      const fieldset = el.querySelector('fieldset');
      const ariaDescribedBy = fieldset.getAttribute('aria-describedby');

      expect(ariaDescribedBy).to.exist;
      expect(ariaDescribedBy).to.be.a('string');
    });

    it('error message element has unique ID', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Password" state="error">
          <dvfy-input id="pwd" label="Password"></dvfy-input>
          <span slot="error-message">Password too weak</span>
        </dvfy-field-group>
      `);

      const errorMsg = el.querySelector('.dvfy-field-group__message--error');
      expect(errorMsg).to.exist;
      expect(errorMsg.id).to.exist;
      expect(errorMsg.id).to.not.be.empty;
    });

    it('error message has role="alert"', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Username" state="error">
          <dvfy-input id="user" label="Username"></dvfy-input>
          <span slot="error-message">Username already taken</span>
        </dvfy-field-group>
      `);

      const errorMsg = el.querySelector('.dvfy-field-group__message--error');
      expect(errorMsg.getAttribute('role')).to.equal('alert');
    });

    it('aria-describedby ID matches error message ID', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Email" state="error">
          <dvfy-input id="email" label="Email"></dvfy-input>
          <span slot="error-message">Invalid email format</span>
        </dvfy-field-group>
      `);

      const fieldset = el.querySelector('fieldset');
      const errorMsg = el.querySelector('.dvfy-field-group__message--error');
      const describedById = fieldset.getAttribute('aria-describedby');

      expect(describedById).to.equal(errorMsg.id);
    });

    it('error message displays the slot content text', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Age" state="error">
          <dvfy-input id="age" label="Age"></dvfy-input>
          <span slot="error-message">Must be 18 or older</span>
        </dvfy-field-group>
      `);

      const errorMsg = el.querySelector('.dvfy-field-group__message--error');
      expect(errorMsg.textContent).to.equal('Must be 18 or older');
    });

    it('error state passes axe-core check', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Confirm Password" state="error">
          <dvfy-input id="confirm" label="Confirm"></dvfy-input>
          <span slot="error-message">Passwords do not match</span>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });
  });

  // ─── ARIA Attributes in Warning & Success States ───────────────────────────

  describe('ARIA attributes in warning/success states', () => {
    it('warning state has aria-describedby pointing to warning message', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Expiry Date" state="warning">
          <dvfy-input id="exp" label="Expiry"></dvfy-input>
          <span slot="warning-message">Card expires in 30 days</span>
        </dvfy-field-group>
      `);

      const fieldset = el.querySelector('fieldset');
      const ariaDescribedBy = fieldset.getAttribute('aria-describedby');

      expect(ariaDescribedBy).to.exist;
    });

    it('warning message has role="status"', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Storage" state="warning">
          <dvfy-input id="storage" label="Used"></dvfy-input>
          <span slot="warning-message">You are using 80% of your quota</span>
        </dvfy-field-group>
      `);

      const warningMsg = el.querySelector('.dvfy-field-group__message--warning');
      expect(warningMsg.getAttribute('role')).to.equal('status');
    });

    it('success state has aria-describedby pointing to success message', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Username Availability" state="success">
          <dvfy-input id="available" label="Check"></dvfy-input>
          <span slot="success-message">Username is available</span>
        </dvfy-field-group>
      `);

      const fieldset = el.querySelector('fieldset');
      const ariaDescribedBy = fieldset.getAttribute('aria-describedby');

      expect(ariaDescribedBy).to.exist;
    });

    it('success message has role="status"', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Account Setup" state="success">
          <dvfy-input id="setup" label="Status"></dvfy-input>
          <span slot="success-message">Account created successfully</span>
        </dvfy-field-group>
      `);

      const successMsg = el.querySelector('.dvfy-field-group__message--success');
      expect(successMsg.getAttribute('role')).to.equal('status');
    });

    it('no aria-describedby when state is cleared (removed)', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Test" state="error">
          <dvfy-input id="test" label="Test"></dvfy-input>
          <span slot="error-message">Error</span>
        </dvfy-field-group>
      `);

      const fieldset = el.querySelector('fieldset');
      expect(fieldset.hasAttribute('aria-describedby')).to.be.true;

      // Remove state and wait for attributeChangedCallback to rebuild
      el.removeAttribute('state');
      await Promise.resolve();

      // After state is removed, fieldset is rebuilt and aria-describedby removed
      expect(el.querySelector('fieldset').hasAttribute('aria-describedby')).to.be.false;
    });

    it('warning state passes axe-core check', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Credit Card" state="warning">
          <dvfy-input id="card" label="Card Number"></dvfy-input>
          <span slot="warning-message">Your card may expire soon</span>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });

    it('success state passes axe-core check', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Verification" state="success">
          <dvfy-input id="verified" label="Status"></dvfy-input>
          <span slot="success-message">Email verified</span>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });
  });

  // ─── Full Accessibility (axe-core) ─────────────────────────────────────────

  describe('full accessibility compliance', () => {
    it('basic field group passes axe checks', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Basic Group">
          <dvfy-input label="Field"></dvfy-input>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });

    it('field group with help text passes axe checks', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Contact" help="Include country code">
          <dvfy-input label="Phone"></dvfy-input>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });

    it('multi-field group passes axe checks', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Date Range" help="Select start and end dates">
          <dvfy-input id="start" label="Start"></dvfy-input>
          <dvfy-input id="end" label="End"></dvfy-input>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });

    it('error state group passes axe checks', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Password" state="error">
          <dvfy-input id="pwd" label="Password"></dvfy-input>
          <span slot="error-message">Password must be at least 8 characters</span>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });

    it('complex field group with all features passes axe checks', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Billing Address" help="Used for invoices" state="warning">
          <dvfy-input id="street" label="Street"></dvfy-input>
          <dvfy-input id="city" label="City"></dvfy-input>
          <dvfy-input id="zip" label="ZIP Code"></dvfy-input>
          <span slot="warning-message">This address differs from shipping address</span>
        </dvfy-field-group>
      `);

      await checkA11y(el);
    });
  });

});
