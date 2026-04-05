import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../components/dvfy-modal.js';
import './dvfy-htmx-form.js';

describe('dvfy-htmx-form', () => {
  afterEach(() => {
    // Clean up modals appended to document.body
    document.querySelectorAll('dvfy-modal').forEach(m => m.remove());
  });

  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-htmx-form')).to.exist;
    });

    it('creates an inner form element', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit" method="post">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form).to.exist;
    });

    it('moves children into the form', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      const input = form.querySelector('[name="title"]');
      expect(input).to.exist;
    });

    it('creates loading overlay', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const overlay = el.querySelector('.dvfy-htmx-form__overlay');
      expect(overlay).to.exist;
    });
  });

  describe('attributes', () => {
    it('sets hx-post from action and method attrs', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/tasks" method="post">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-post')).to.equal('/tasks');
    });

    it('sets hx-put for put method', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/tasks/1" method="put">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-put')).to.equal('/tasks/1');
    });

    it('sets hx-delete for delete method', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/tasks/1" method="delete">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-delete')).to.equal('/tasks/1');
    });

    it('sets hx-target from target attr', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit" target="#results">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-target')).to.equal('#results');
    });

    it('defaults hx-target to this', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-target')).to.equal('this');
    });

    it('sets hx-swap from swap attr', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit" swap="outerHTML">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-swap')).to.equal('outerHTML');
    });

    it('defaults hx-swap to innerHTML', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-swap')).to.equal('innerHTML');
    });

    it('defaults method to post', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      expect(form.getAttribute('hx-post')).to.equal('/submit');
    });
  });

  describe('submit button enhancement', () => {
    it('wraps submit button with spinner', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const wrap = el.querySelector('.dvfy-htmx-form__submit-wrap');
      expect(wrap).to.exist;
      const spinner = wrap.querySelector('.dvfy-htmx-form__spinner');
      expect(spinner).to.exist;
      const btn = wrap.querySelector('[type="submit"]');
      expect(btn).to.exist;
    });

    it('spinner is hidden by default', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const spinner = el.querySelector('.dvfy-htmx-form__spinner');
      // Spinner display is controlled by CSS class on parent
      expect(el.classList.contains('dvfy-htmx-form--loading')).to.be.false;
    });
  });

  describe('loading state', () => {
    it('adds loading class on htmx:beforeRequest', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      form.dispatchEvent(new CustomEvent('htmx:beforeRequest', { bubbles: true }));
      expect(el.classList.contains('dvfy-htmx-form--loading')).to.be.true;
    });

    it('disables submit button during loading', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      const btn = el.querySelector('[type="submit"]');
      form.dispatchEvent(new CustomEvent('htmx:beforeRequest', { bubbles: true }));
      expect(btn.disabled).to.be.true;
    });

    it('removes loading class on htmx:afterRequest', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      form.dispatchEvent(new CustomEvent('htmx:beforeRequest', { bubbles: true }));
      form.dispatchEvent(
        new CustomEvent('htmx:afterRequest', {
          bubbles: true,
          detail: { xhr: { status: 200 } },
        })
      );
      expect(el.classList.contains('dvfy-htmx-form--loading')).to.be.false;
    });

    it('re-enables submit button after request', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      const btn = el.querySelector('[type="submit"]');
      form.dispatchEvent(new CustomEvent('htmx:beforeRequest', { bubbles: true }));
      form.dispatchEvent(
        new CustomEvent('htmx:afterRequest', {
          bubbles: true,
          detail: { xhr: { status: 200 } },
        })
      );
      expect(btn.disabled).to.be.false;
    });
  });

  describe('events', () => {
    it('fires form-success on successful response', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      setTimeout(() =>
        form.dispatchEvent(
          new CustomEvent('htmx:afterRequest', {
            bubbles: true,
            detail: { xhr: { status: 200 } },
          })
        )
      );
      const event = await oneEvent(el, 'form-success');
      expect(event).to.exist;
    });

    it('fires form-error on error response', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <button type="submit">Submit</button>
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      setTimeout(() =>
        form.dispatchEvent(
          new CustomEvent('htmx:responseError', {
            bubbles: true,
            detail: { xhr: null },
          })
        )
      );
      const event = await oneEvent(el, 'form-error');
      expect(event).to.exist;
      expect(event.detail).to.have.property('errors');
    });
  });

  describe('CSRF token', () => {
    it('includes CSRF hidden field when meta tag exists', async () => {
      const meta = document.createElement('meta');
      meta.name = 'csrf-token';
      meta.content = 'test-token-123';
      document.head.appendChild(meta);

      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      const form = el.querySelector('.dvfy-htmx-form__form');
      const hidden = form.querySelector('input[name="_csrf"]');
      expect(hidden).to.exist;
      expect(hidden.value).to.equal('test-token-123');

      document.head.removeChild(meta);
    });
  });

  describe('ARIA', () => {
    it('sets role=form', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      expect(el.getAttribute('role')).to.equal('form');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Form');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`
        <dvfy-htmx-form action="/submit" aria-label="Task form">
          <input type="text" name="title" />
        </dvfy-htmx-form>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Task form');
    });
  });
});
