import { expect } from '@open-wc/testing';

// Smoke test: verify all components define valid custom elements
const COMPONENTS = [
  'dvfy-accordion', 'dvfy-alert', 'dvfy-avatar', 'dvfy-badge',
  'dvfy-breadcrumb', 'dvfy-button', 'dvfy-card', 'dvfy-carousel',
  'dvfy-checkbox', 'dvfy-drawer', 'dvfy-dropdown', 'dvfy-empty',
  'dvfy-gradient-card', 'dvfy-hamburger', 'dvfy-hovercard', 'dvfy-input',
  'dvfy-loader', 'dvfy-modal', 'dvfy-pagination', 'dvfy-progress',
  'dvfy-radio', 'dvfy-scramble-hover', 'dvfy-scroll-progress', 'dvfy-section',
  'dvfy-select', 'dvfy-sidebar', 'dvfy-slider', 'dvfy-spotlight-card',
  'dvfy-switch', 'dvfy-table', 'dvfy-tabs', 'dvfy-tag', 'dvfy-textarea',
  'dvfy-text-vortex', 'dvfy-theme-switcher', 'dvfy-toast', 'dvfy-tooltip',
  'dvfy-tree-view',
];

describe('Component registration', () => {
  before(async () => {
    await import('../devify.js');
  });

  for (const tag of COMPONENTS) {
    it(`${tag} is registered`, () => {
      expect(customElements.get(tag)).to.not.be.undefined;
    });
  }
});
