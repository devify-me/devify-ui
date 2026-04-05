import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../components/dvfy-modal.js';
import './dvfy-confirm.js';

describe('dvfy-confirm', () => {
  afterEach(() => {
    // Clean up modals appended to document.body
    document.querySelectorAll('dvfy-modal').forEach(m => m.remove());
  });

  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-confirm')).to.exist;
    });

    it('renders trigger element as child', async () => {
      const el = await fixture(html`
        <dvfy-confirm title="Delete?" message="Are you sure?">
          <button>Delete</button>
        </dvfy-confirm>
      `);
      const trigger = el.querySelector('button');
      expect(trigger).to.exist;
      expect(trigger.textContent).to.equal('Delete');
    });

    it('renders as inline-block', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Action</button>
        </dvfy-confirm>
      `);
      expect(el.tagName.toLowerCase()).to.equal('dvfy-confirm');
    });
  });

  describe('modal behavior', () => {
    it('opens modal when trigger is clicked', async () => {
      const el = await fixture(html`
        <dvfy-confirm title="Confirm?" message="Proceed?">
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      const trigger = el.querySelector('button');
      trigger.click();

      const modal = document.querySelector('dvfy-modal');
      expect(modal).to.exist;
      expect(modal.getAttribute('title')).to.equal('Confirm?');
      expect(modal.hasAttribute('open')).to.be.true;
    });

    it('shows message in modal body', async () => {
      const el = await fixture(html`
        <dvfy-confirm title="Delete?" message="This cannot be undone.">
          <button>Delete</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const msg = document.querySelector('.dvfy-confirm__message');
      expect(msg).to.exist;
      expect(msg.textContent).to.equal('This cannot be undone.');
    });

    it('uses default title when none specified', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const modal = document.querySelector('dvfy-modal');
      expect(modal.getAttribute('title')).to.equal('Are you sure?');
    });

    it('renders confirm and cancel buttons with custom text', async () => {
      const el = await fixture(html`
        <dvfy-confirm
          confirm-text="Yes, delete"
          cancel-text="Keep it"
        >
          <button>Delete</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const buttons = document.querySelectorAll('.dvfy-confirm__btn');
      const cancelBtn = document.querySelector('.dvfy-confirm__btn--cancel');
      const confirmBtn = document.querySelector('.dvfy-confirm__btn--confirm');
      expect(cancelBtn.textContent).to.equal('Keep it');
      expect(confirmBtn.textContent).to.equal('Yes, delete');
    });

    it('uses default button text', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const cancelBtn = document.querySelector('.dvfy-confirm__btn--cancel');
      const confirmBtn = document.querySelector('.dvfy-confirm__btn--confirm');
      expect(cancelBtn.textContent).to.equal('Cancel');
      expect(confirmBtn.textContent).to.equal('Confirm');
    });

    it('renders danger variant confirm button', async () => {
      const el = await fixture(html`
        <dvfy-confirm variant="danger">
          <button>Delete</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const confirmBtn = document.querySelector('.dvfy-confirm__btn--danger');
      expect(confirmBtn).to.exist;
    });

    it('sets required attribute on modal', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const modal = document.querySelector('dvfy-modal');
      expect(modal.hasAttribute('required')).to.be.true;
    });
  });

  describe('events', () => {
    it('fires confirmed when confirm button is clicked', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const confirmBtn = document.querySelector('.dvfy-confirm__btn--confirm');
      setTimeout(() => confirmBtn.click());
      const event = await oneEvent(el, 'confirmed');
      expect(event).to.exist;
    });

    it('fires cancelled when cancel button is clicked', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const cancelBtn = document.querySelector('.dvfy-confirm__btn--cancel');
      setTimeout(() => cancelBtn.click());
      const event = await oneEvent(el, 'cancelled');
      expect(event).to.exist;
    });

    it('prevents default click on trigger', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      let defaultPrevented = false;
      el.querySelector('button').addEventListener('click', (e) => {
        defaultPrevented = e.defaultPrevented;
      });
      el.querySelector('button').click();
      expect(defaultPrevented).to.be.true;
    });
  });

  describe('HTMX interception', () => {
    it('removes hx-* attributes from trigger element', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button hx-post="/delete" hx-target="#list">Delete</button>
        </dvfy-confirm>
      `);
      const trigger = el.querySelector('button');
      expect(trigger.hasAttribute('hx-post')).to.be.false;
      expect(trigger.hasAttribute('hx-target')).to.be.false;
    });

    it('applies intercepted hx-* attributes to confirm button', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button hx-post="/delete" hx-target="#list">Delete</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const confirmBtn = document.querySelector('.dvfy-confirm__btn--confirm');
      expect(confirmBtn.getAttribute('hx-post')).to.equal('/delete');
      expect(confirmBtn.getAttribute('hx-target')).to.equal('#list');
    });

    it('sets hx-method from action and method attrs when no intercepted attrs', async () => {
      const el = await fixture(html`
        <dvfy-confirm action="/tasks/1" method="delete">
          <button>Delete</button>
        </dvfy-confirm>
      `);
      el.querySelector('button').click();

      const confirmBtn = document.querySelector('.dvfy-confirm__btn--confirm') ||
                         document.querySelector('.dvfy-confirm__btn--danger');
      expect(confirmBtn.getAttribute('hx-delete')).to.equal('/tasks/1');
    });
  });

  describe('ARIA', () => {
    it('sets default aria-label', async () => {
      const el = await fixture(html`
        <dvfy-confirm>
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Confirmation action');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`
        <dvfy-confirm aria-label="Delete confirmation">
          <button>Trigger</button>
        </dvfy-confirm>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Delete confirmation');
    });
  });
});
