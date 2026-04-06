import { expect } from '@open-wc/testing';

/**
 * Check an element for accessibility violations using axe-core.
 *
 * This utility wraps the chai-a11y-axe plugin to provide a simple async function
 * for a11y testing across component tests. The assertion will fail if any violations
 * are found; axe-core provides detailed violation messages.
 *
 * @param {HTMLElement} element - The element to check for accessibility violations
 * @param {Object} [context] - Optional configuration for axe-core
 * @param {string[]} [context.ignoredRules] - List of axe rule IDs to ignore (e.g., 'aria-valid-attr-value')
 * @param {string[]} [context.ignoredTags] - List of HTML tags to exclude from scanning (e.g., 'img')
 * @returns {Promise<void>} Resolves if no violations, rejects with detailed error if violations found
 *
 * @example
 * import { fixture, html } from '@open-wc/testing';
 * import { checkA11y } from '../utils/axe-test.js';
 * import '../components/dvfy-button.js';
 *
 * it('renders an accessible button', async () => {
 *   const el = await fixture(html`<dvfy-button>Click me</dvfy-button>`);
 *   await checkA11y(el);
 * });
 *
 * @example
 * // Ignoring specific rules if intentional
 * it('renders with ignored rule', async () => {
 *   const el = await fixture(html`<div aria-labelledby="missing-id"></div>`);
 *   await checkA11y(el, { ignoredRules: ['aria-valid-attr-value'] });
 * });
 */
export async function checkA11y(element, context = {}) {
  await expect(element).to.be.accessible(context);
}
