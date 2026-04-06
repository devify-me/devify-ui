import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-field-group.js';
import './dvfy-input.js';

describe('dvfy-field-group', () => {
  describe('structure', () => {
    it('renders a fieldset element', async () => {
      const el = await fixture(html`<dvfy-field-group label="Name"></dvfy-field-group>`);
      const fieldset = el.querySelector('fieldset');
      expect(fieldset).to.not.be.null;
    });

    it('renders a legend element inside the fieldset', async () => {
      const el = await fixture(html`<dvfy-field-group label="Name"></dvfy-field-group>`);
      const legend = el.querySelector('fieldset legend');
      expect(legend).to.not.be.null;
    });

    it('renders the label text in the legend', async () => {
      const el = await fixture(html`<dvfy-field-group label="Billing Address"></dvfy-field-group>`);
      const legend = el.querySelector('legend');
      expect(legend.textContent).to.equal('Billing Address');
    });

    it('renders an empty legend when no label is set', async () => {
      const el = await fixture(html`<dvfy-field-group></dvfy-field-group>`);
      const legend = el.querySelector('legend');
      expect(legend).to.not.be.null;
      expect(legend.textContent).to.equal('');
    });
  });

  describe('help text', () => {
    it('renders help text when help attribute is set', async () => {
      const el = await fixture(html`<dvfy-field-group label="Email" help="We will never share your email"></dvfy-field-group>`);
      const helpEl = el.querySelector('.dvfy-field-group__help');
      expect(helpEl).to.not.be.null;
      expect(helpEl.textContent).to.equal('We will never share your email');
    });

    it('does not render help element when help is not set', async () => {
      const el = await fixture(html`<dvfy-field-group label="Name"></dvfy-field-group>`);
      expect(el.querySelector('.dvfy-field-group__help')).to.be.null;
    });

    it('updates help text when attribute changes', async () => {
      const el = await fixture(html`<dvfy-field-group label="Name" help="Original help"></dvfy-field-group>`);
      el.setAttribute('help', 'Updated help');
      const helpEl = el.querySelector('.dvfy-field-group__help');
      expect(helpEl.textContent).to.equal('Updated help');
    });
  });

  describe('default slot (children)', () => {
    it('renders child input elements inside the fieldset', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Contact">
          <dvfy-input label="Email" name="email"></dvfy-input>
        </dvfy-field-group>
      `);
      const fieldset = el.querySelector('fieldset');
      const input = fieldset.querySelector('dvfy-input');
      expect(input).to.not.be.null;
    });

    it('renders multiple child inputs inside the fieldset', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Billing Address">
          <dvfy-input label="Street" name="street"></dvfy-input>
          <dvfy-input label="City" name="city"></dvfy-input>
          <dvfy-input label="ZIP" name="zip"></dvfy-input>
        </dvfy-field-group>
      `);
      const fieldset = el.querySelector('fieldset');
      const inputs = fieldset.querySelectorAll('dvfy-input');
      expect(inputs.length).to.equal(3);
    });
  });

  describe('state attribute — no message', () => {
    it('renders no message element when state is not set', async () => {
      const el = await fixture(html`<dvfy-field-group label="Name"></dvfy-field-group>`);
      expect(el.querySelector('.dvfy-field-group__message')).to.be.null;
    });

    it('renders no message element when state is cleared', async () => {
      const el = await fixture(html`<dvfy-field-group label="Name" state="error"></dvfy-field-group>`);
      el.removeAttribute('state');
      expect(el.querySelector('.dvfy-field-group__message')).to.be.null;
    });
  });

  describe('state="error"', () => {
    it('renders error message element when state="error" and slot is provided', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Date Range" state="error">
          <span slot="error-message">End date must be after start date</span>
        </dvfy-field-group>
      `);
      const msg = el.querySelector('.dvfy-field-group__message--error');
      expect(msg).to.not.be.null;
      expect(msg.textContent).to.equal('End date must be after start date');
    });

    it('sets role="alert" on error message', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Range" state="error">
          <span slot="error-message">Error</span>
        </dvfy-field-group>
      `);
      const msg = el.querySelector('.dvfy-field-group__message--error');
      expect(msg.getAttribute('role')).to.equal('alert');
    });

    it('renders empty error message element when state="error" but no slot content', async () => {
      const el = await fixture(html`<dvfy-field-group label="Name" state="error"></dvfy-field-group>`);
      const msg = el.querySelector('.dvfy-field-group__message--error');
      expect(msg).to.not.be.null;
    });
  });

  describe('state="warning"', () => {
    it('renders warning message element when state="warning" and slot is provided', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Plan" state="warning">
          <span slot="warning-message">Billing renews soon</span>
        </dvfy-field-group>
      `);
      const msg = el.querySelector('.dvfy-field-group__message--warning');
      expect(msg).to.not.be.null;
      expect(msg.textContent).to.equal('Billing renews soon');
    });

    it('sets role="status" on warning message', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Plan" state="warning">
          <span slot="warning-message">Warning</span>
        </dvfy-field-group>
      `);
      const msg = el.querySelector('.dvfy-field-group__message--warning');
      expect(msg.getAttribute('role')).to.equal('status');
    });
  });

  describe('state="success"', () => {
    it('renders success message element when state="success" and slot is provided', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Username" state="success">
          <span slot="success-message">Username is available</span>
        </dvfy-field-group>
      `);
      const msg = el.querySelector('.dvfy-field-group__message--success');
      expect(msg).to.not.be.null;
      expect(msg.textContent).to.equal('Username is available');
    });

    it('sets role="status" on success message', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Name" state="success">
          <span slot="success-message">OK</span>
        </dvfy-field-group>
      `);
      const msg = el.querySelector('.dvfy-field-group__message--success');
      expect(msg.getAttribute('role')).to.equal('status');
    });
  });

  describe('state transitions', () => {
    it('switches from error to warning message on state change', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Range" state="error">
          <span slot="error-message">Error text</span>
          <span slot="warning-message">Warning text</span>
        </dvfy-field-group>
      `);
      expect(el.querySelector('.dvfy-field-group__message--error')).to.not.be.null;
      expect(el.querySelector('.dvfy-field-group__message--warning')).to.be.null;

      el.setAttribute('state', 'warning');
      expect(el.querySelector('.dvfy-field-group__message--error')).to.be.null;
      expect(el.querySelector('.dvfy-field-group__message--warning')).to.not.be.null;
      expect(el.querySelector('.dvfy-field-group__message--warning').textContent).to.equal('Warning text');
    });

    it('removes message when state is unset', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Name" state="error">
          <span slot="error-message">Error</span>
        </dvfy-field-group>
      `);
      expect(el.querySelector('.dvfy-field-group__message')).to.not.be.null;
      el.removeAttribute('state');
      expect(el.querySelector('.dvfy-field-group__message')).to.be.null;
    });

    it('updates legend text when label attribute changes', async () => {
      const el = await fixture(html`<dvfy-field-group label="Old Label"></dvfy-field-group>`);
      el.setAttribute('label', 'New Label');
      expect(el.querySelector('legend').textContent).to.equal('New Label');
    });
  });

  describe('ARIA', () => {
    it('sets aria-describedby on fieldset when state is set', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Range" state="error">
          <span slot="error-message">Error</span>
        </dvfy-field-group>
      `);
      const fieldset = el.querySelector('fieldset');
      const msgId = el.querySelector('.dvfy-field-group__message--error').id;
      expect(fieldset.getAttribute('aria-describedby')).to.equal(msgId);
    });

    it('removes aria-describedby from fieldset when state is unset', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Name" state="error">
          <span slot="error-message">Error</span>
        </dvfy-field-group>
      `);
      el.removeAttribute('state');
      const fieldset = el.querySelector('fieldset');
      expect(fieldset.hasAttribute('aria-describedby')).to.be.false;
    });

    it('message element has a non-empty id for aria linking', async () => {
      const el = await fixture(html`
        <dvfy-field-group label="Name" state="success">
          <span slot="success-message">OK</span>
        </dvfy-field-group>
      `);
      const msg = el.querySelector('.dvfy-field-group__message--success');
      expect(msg.id).to.not.equal('');
    });
  });
});
