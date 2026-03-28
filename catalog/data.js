/**
 * catalog/data.js — All hardcoded maps for the Design System Explorer
 *
 * Taxonomy (tiers, domains, registry), HTMX patterns, token groups, and semantic tokens.
 */

/** Tier definitions — composition hierarchy (each tier requires ≥1 dep from previous tier) */
export const TIERS = {
  1: {
    name: 'Primitives',
    label: 'Tier 1 — Primitives',
    description: 'Zero dvfy-* dependencies. Leaf nodes of the composition tree.',
    rules: 'Must not import or render other dvfy-* components.',
  },
  2: {
    name: 'Composites',
    label: 'Tier 2 — Composites',
    description: 'One composition layer. Combines Tier 1 primitives into richer controls.',
    rules: 'Must have ≥1 Tier 1 dependency. Only Tier 1 deps allowed.',
  },
  3: {
    name: 'Organisms',
    label: 'Tier 3 — Organisms',
    description: 'Two+ composition layers. Combines Tier 1 and Tier 2 components.',
    rules: 'Must have ≥1 Tier 2 dependency. Tier 1 and Tier 2 deps allowed.',
  },
  4: {
    name: 'Widgets',
    label: 'Tier 4 — Widgets',
    description: 'Self-contained functional unit with own state machine and UX flow.',
    rules: 'Must have ≥1 Tier 3 dependency. Full composition depth.',
  },
  5: {
    name: 'Layouts',
    label: 'Tier 5 — Layouts',
    description: 'Page-level spatial scaffold. Defines regions for content and navigation.',
    rules: 'Must have ≥1 Tier 3+ dependency. Defines page-level spatial arrangement.',
  },
};

/** Domain keys → display labels */
export const DOMAINS = {
  forms:      'Forms',
  display:    'Data Display',
  feedback:   'Feedback',
  navigation: 'Navigation',
  layout:     'Layout',
  utility:    'Utility',
};

/**
 * Preview layout hints — how the playground preview area should present the component.
 *
 *   center       — Centered in preview (buttons, badges, toggles)
 *   stretch      — Full-width, vertically centered (inputs, progress bars)
 *   fill         — Fills entire preview area (cards, tables, accordion)
 *   edge         — Attached to container edges with sibling content (drawer, sidebar)
 *   overlay      — Needs a trigger to demonstrate (modal, toast, tooltip)
 *   top-bar      — Pinned to top with simulated page content below (nav-bar)
 *   inline-group — Horizontal flex at natural size (nav-menu, tag groups)
 */
export const LAYOUTS = ['center', 'stretch', 'fill', 'edge', 'overlay', 'top-bar', 'inline-group'];

/** Component registry — single source of truth for classification */
export const COMPONENT_REGISTRY = {
  // Tier 1 — Primitives (zero dvfy-* deps)
  'dvfy-button':          { tier: 1, domain: 'forms',      deps: [], layout: 'center' },
  'dvfy-input':           { tier: 1, domain: 'forms',      deps: [], layout: 'stretch' },
  'dvfy-textarea':        { tier: 1, domain: 'forms',      deps: [], layout: 'stretch' },
  'dvfy-checkbox':        { tier: 1, domain: 'forms',      deps: [], layout: 'center' },
  'dvfy-radio':           { tier: 1, domain: 'forms',      deps: [], layout: 'center' },
  'dvfy-switch':          { tier: 1, domain: 'forms',      deps: [], layout: 'center' },
  'dvfy-slider':          { tier: 1, domain: 'forms',      deps: [], layout: 'stretch' },
  'dvfy-select':          { tier: 1, domain: 'forms',      deps: [], layout: 'stretch' },
  'dvfy-file-upload':     { tier: 1, domain: 'forms',      deps: [], layout: 'stretch' },
  'dvfy-date-picker':     { tier: 1, domain: 'forms',      deps: [], layout: 'center' },
  'dvfy-badge':           { tier: 1, domain: 'display',    deps: [], layout: 'center' },
  'dvfy-tag':             { tier: 1, domain: 'display',    deps: [], layout: 'center' },
  'dvfy-avatar':          { tier: 1, domain: 'display',    deps: [], layout: 'center' },
  'dvfy-progress':        { tier: 1, domain: 'display',    deps: [], layout: 'stretch' },
  'dvfy-card':            { tier: 1, domain: 'display',    deps: [], layout: 'center' },
  'dvfy-gradient-card':   { tier: 1, domain: 'display',    deps: [], layout: 'center' },
  'dvfy-spotlight-card':  { tier: 1, domain: 'display',    deps: [], layout: 'center' },
  'dvfy-compare':         { tier: 1, domain: 'display',    deps: [], layout: 'fill' },
  'dvfy-empty':           { tier: 1, domain: 'display',    deps: [], layout: 'fill' },
  'dvfy-carousel':        { tier: 1, domain: 'display',    deps: [], layout: 'fill' },
  'dvfy-scroll-progress': { tier: 1, domain: 'display',    deps: [], layout: 'fill' },
  'dvfy-marquee-scroll':  { tier: 1, domain: 'display',    deps: [], layout: 'stretch' },
  'dvfy-alert':           { tier: 1, domain: 'feedback',   deps: [], layout: 'stretch' },
  'dvfy-loader':          { tier: 1, domain: 'feedback',   deps: [], layout: 'center' },
  'dvfy-toast':           { tier: 1, domain: 'feedback',   deps: [], layout: 'overlay' },
  'dvfy-hovercard':       { tier: 1, domain: 'feedback',   deps: [], layout: 'overlay' },
  'dvfy-hamburger':       { tier: 1, domain: 'navigation', deps: [], layout: 'center' },
  'dvfy-breadcrumb':      { tier: 1, domain: 'navigation', deps: [], layout: 'stretch' },
  'dvfy-pagination':      { tier: 1, domain: 'navigation', deps: [], layout: 'stretch' },
  'dvfy-tabs':            { tier: 1, domain: 'navigation', deps: [], layout: 'fill' },
  'dvfy-dropdown':        { tier: 1, domain: 'navigation', deps: [], layout: 'overlay' },
  'dvfy-tree-node':       { tier: 1, domain: 'navigation', deps: [], layout: 'stretch' },
  'dvfy-tree-view':       { tier: 1, domain: 'navigation', deps: [], layout: 'stretch' },
  'dvfy-sidebar':         { tier: 1, domain: 'navigation', deps: [], layout: 'edge' },
  'dvfy-section':         { tier: 1, domain: 'layout',     deps: [], layout: 'fill' },
  'dvfy-tooltip':         { tier: 1, domain: 'utility',    deps: [], layout: 'overlay' },
  'dvfy-scroll-reveal':   { tier: 1, domain: 'utility',    deps: [], layout: 'fill' },
  'dvfy-page-transition': { tier: 1, domain: 'utility',    deps: [], layout: 'fill' },
  'dvfy-transition-root': { tier: 1, domain: 'utility',    deps: [], layout: 'fill' },
  'dvfy-text-vortex':     { tier: 1, domain: 'utility',    deps: [], layout: 'fill' },
  'dvfy-scramble-hover':  { tier: 1, domain: 'utility',    deps: [], layout: 'fill' },
  'dvfy-infinite-scroll': { tier: 1, domain: 'utility',    deps: [], layout: 'fill',    server: true },
  'dvfy-live-search':     { tier: 1, domain: 'forms',      deps: [], layout: 'stretch', server: true },
  'dvfy-htmx-table':      { tier: 1, domain: 'display',    deps: [], layout: 'fill',    server: true },

  // Tier 2 — Composites (≥1 Tier 1 dep, only Tier 1 deps)
  'dvfy-drawer':               { tier: 2, domain: 'layout',     deps: ['dvfy-button'], layout: 'edge' },
  'dvfy-table':                { tier: 2, domain: 'display',    deps: ['dvfy-checkbox'], layout: 'fill' },
  'dvfy-modal':                { tier: 2, domain: 'feedback',   deps: ['dvfy-button'], layout: 'overlay' },
  'dvfy-nav':                  { tier: 1, domain: 'navigation', deps: [], layout: 'center' },
  'dvfy-nav-menu':             { tier: 2, domain: 'navigation', deps: ['dvfy-nav'], layout: 'inline-group' },
  'dvfy-nav-bar':              { tier: 3, domain: 'navigation', deps: ['dvfy-nav-menu', 'dvfy-hamburger', 'dvfy-drawer'], layout: 'top-bar' },
  'dvfy-theme-switcher':       { tier: 2, domain: 'utility',    deps: ['dvfy-dropdown', 'dvfy-button'], layout: 'center' },
  'dvfy-accordion':            { tier: 2, domain: 'layout',     deps: ['dvfy-section'], layout: 'fill' },
  'dvfy-component-playground': { tier: 2, domain: 'utility',    deps: ['dvfy-button', 'dvfy-section', 'dvfy-slider'], layout: 'fill' },

  // Tier 3 — Organisms (≥1 Tier 2 dep)
  'dvfy-auth':      { tier: 3, domain: 'utility',  deps: ['dvfy-modal'], layout: 'fill' },
  'dvfy-htmx-form': { tier: 3, domain: 'forms',    deps: ['dvfy-modal'], layout: 'stretch', server: true },
  'dvfy-confirm':   { tier: 3, domain: 'feedback',  deps: ['dvfy-modal'], layout: 'overlay', server: true },
};

/** Get tags for a given tier number */
export function getComponentsByTier(n) {
  return Object.entries(COMPONENT_REGISTRY)
    .filter(([, meta]) => meta.tier === n)
    .map(([tag]) => tag);
}

/** Get all server-interaction (HTMX) component tags */
export function getServerComponents() {
  return Object.entries(COMPONENT_REGISTRY)
    .filter(([, meta]) => meta.server)
    .map(([tag]) => tag);
}

/** Get tags for a given domain key */
export function getComponentsByDomain(key) {
  return Object.entries(COMPONENT_REGISTRY)
    .filter(([, meta]) => meta.domain === key)
    .map(([tag]) => tag);
}

/** Get tier metadata for a component tag */
export function getTierForComponent(tag) {
  const meta = COMPONENT_REGISTRY[tag];
  return meta ? TIERS[meta.tier] : null;
}

/** Components grouped by domain for sidebar navigation — derived from registry */
export const COMPONENT_CATEGORIES = Object.fromEntries(
  Object.entries(DOMAINS)
    .map(([key, label]) => [label, getComponentsByDomain(key)])
    .filter(([, tags]) => tags.length)
);

/** HTMX integration patterns with descriptions */
export const HTMX_PATTERNS = {
  'dvfy-htmx-form':       'AJAX form submission with validation and loading states',
  'dvfy-infinite-scroll':  'Infinite scroll pagination with hx-trigger="revealed"',
  'dvfy-live-search':      'Live search with debounced hx-trigger',
  'dvfy-htmx-table':       'Sortable, paginated table with HTMX-powered updates',
  'dvfy-confirm':          'Confirmation dialog for destructive HTMX actions',
};

/** Token groups — metadata for each token file driving the token views */
export const TOKEN_GROUPS = {
  typography: {
    label: 'Typography',
    description: 'Font families, sizes, weights, line heights, and letter spacing',
    tokens: {
      'Font Families': [
        { name: '--dvfy-font-sans',  type: 'font',   desc: 'Sans-serif stack (Inter)' },
        { name: '--dvfy-font-serif', type: 'font',   desc: 'Serif stack' },
        { name: '--dvfy-font-mono',  type: 'font',   desc: 'Monospace stack (JetBrains Mono)' },
        { name: '--dvfy-font-brand', type: 'font',   desc: 'Brand display font (Saira Stencil One)' },
      ],
      'Font Sizes': [
        { name: '--dvfy-text-xs',   type: 'size', desc: '0.75rem (12px)' },
        { name: '--dvfy-text-sm',   type: 'size', desc: '0.875rem (14px)' },
        { name: '--dvfy-text-base', type: 'size', desc: '1rem (16px)' },
        { name: '--dvfy-text-lg',   type: 'size', desc: '1.125rem (18px)' },
        { name: '--dvfy-text-xl',   type: 'size', desc: '1.25rem (20px)' },
        { name: '--dvfy-text-2xl',  type: 'size', desc: '1.5rem (24px)' },
        { name: '--dvfy-text-3xl',  type: 'size', desc: '1.875rem (30px)' },
        { name: '--dvfy-text-4xl',  type: 'size', desc: '2.25rem (36px)' },
        { name: '--dvfy-text-5xl',  type: 'size', desc: '3rem (48px)' },
        { name: '--dvfy-text-6xl',  type: 'size', desc: '3.75rem (60px)' },
      ],
      'Font Weights': [
        { name: '--dvfy-weight-light',    type: 'weight', desc: '300' },
        { name: '--dvfy-weight-normal',   type: 'weight', desc: '400' },
        { name: '--dvfy-weight-medium',   type: 'weight', desc: '500' },
        { name: '--dvfy-weight-semibold', type: 'weight', desc: '600' },
        { name: '--dvfy-weight-bold',     type: 'weight', desc: '700' },
        { name: '--dvfy-weight-black',    type: 'weight', desc: '900' },
      ],
      'Line Heights': [
        { name: '--dvfy-leading-none',    type: 'number', desc: '1' },
        { name: '--dvfy-leading-tight',   type: 'number', desc: '1.25' },
        { name: '--dvfy-leading-snug',    type: 'number', desc: '1.375' },
        { name: '--dvfy-leading-normal',  type: 'number', desc: '1.5' },
        { name: '--dvfy-leading-relaxed', type: 'number', desc: '1.625' },
        { name: '--dvfy-leading-loose',   type: 'number', desc: '2' },
      ],
      'Letter Spacing': [
        { name: '--dvfy-tracking-tighter', type: 'length', desc: '-0.05em' },
        { name: '--dvfy-tracking-tight',   type: 'length', desc: '-0.025em' },
        { name: '--dvfy-tracking-normal',  type: 'length', desc: '0em' },
        { name: '--dvfy-tracking-wide',    type: 'length', desc: '0.025em' },
        { name: '--dvfy-tracking-wider',   type: 'length', desc: '0.05em' },
      ],
    },
  },
  spacing: {
    label: 'Spacing',
    description: 'Base-4 scale (4px increments) + semantic names',
    tokens: [
      { name: '--dvfy-space-0',    desc: '0' },
      { name: '--dvfy-space-0-5',  desc: '0.125rem (2px)' },
      { name: '--dvfy-space-1',    desc: '0.25rem (4px)' },
      { name: '--dvfy-space-1-5',  desc: '0.375rem (6px)' },
      { name: '--dvfy-space-2',    desc: '0.5rem (8px)' },
      { name: '--dvfy-space-2-5',  desc: '0.625rem (10px)' },
      { name: '--dvfy-space-3',    desc: '0.75rem (12px)' },
      { name: '--dvfy-space-3-5',  desc: '0.875rem (14px)' },
      { name: '--dvfy-space-4',    desc: '1rem (16px)' },
      { name: '--dvfy-space-5',    desc: '1.25rem (20px)' },
      { name: '--dvfy-space-6',    desc: '1.5rem (24px)' },
      { name: '--dvfy-space-7',    desc: '1.75rem (28px)' },
      { name: '--dvfy-space-8',    desc: '2rem (32px)' },
      { name: '--dvfy-space-9',    desc: '2.25rem (36px)' },
      { name: '--dvfy-space-10',   desc: '2.5rem (40px)' },
      { name: '--dvfy-space-12',   desc: '3rem (48px)' },
      { name: '--dvfy-space-14',   desc: '3.5rem (56px)' },
      { name: '--dvfy-space-16',   desc: '4rem (64px)' },
      { name: '--dvfy-space-20',   desc: '5rem (80px)' },
      { name: '--dvfy-space-24',   desc: '6rem (96px)' },
      { name: '--dvfy-space-32',   desc: '8rem (128px)' },
      { name: '--dvfy-space-40',   desc: '10rem (160px)' },
    ],
  },
  borders: {
    label: 'Borders',
    description: 'Border radius, width, and focus ring tokens',
    tokens: {
      'Border Radius': [
        { name: '--dvfy-radius-none', desc: '0' },
        { name: '--dvfy-radius-xs',   desc: '0.125rem (2px)' },
        { name: '--dvfy-radius-sm',   desc: '0.25rem (4px)' },
        { name: '--dvfy-radius-md',   desc: '0.375rem (6px)' },
        { name: '--dvfy-radius-lg',   desc: '0.5rem (8px)' },
        { name: '--dvfy-radius-xl',   desc: '0.75rem (12px)' },
        { name: '--dvfy-radius-2xl',  desc: '1rem (16px)' },
        { name: '--dvfy-radius-3xl',  desc: '1.5rem (24px)' },
        { name: '--dvfy-radius-full', desc: '9999px (pill)' },
        { name: '--dvfy-radius-round', desc: '50% (circle)' },
      ],
      'Border Width': [
        { name: '--dvfy-border-0', desc: '0' },
        { name: '--dvfy-border-1', desc: '1px' },
        { name: '--dvfy-border-2', desc: '2px' },
        { name: '--dvfy-border-4', desc: '4px' },
        { name: '--dvfy-border-8', desc: '8px' },
      ],
      'Focus Ring': [
        { name: '--dvfy-ring-width',  desc: '3px' },
        { name: '--dvfy-ring-offset', desc: '2px' },
      ],
    },
  },
  elevation: {
    label: 'Elevation',
    description: '7-level shadow scale using --dvfy-shadow-color for dark mode',
    tokens: [
      { name: '--dvfy-shadow-2xs',  desc: 'Subtle — form inputs' },
      { name: '--dvfy-shadow-xs',   desc: 'Cards at rest' },
      { name: '--dvfy-shadow-sm',   desc: 'Raised cards' },
      { name: '--dvfy-shadow-md',   desc: 'Dropdowns, popovers' },
      { name: '--dvfy-shadow-lg',   desc: 'Modals, dialogs' },
      { name: '--dvfy-shadow-xl',   desc: 'Toasts, notifications' },
      { name: '--dvfy-shadow-2xl',  desc: 'Dramatic emphasis' },
    ],
  },
  animation: {
    label: 'Animation',
    description: 'Durations and easing curves — respects prefers-reduced-motion',
    tokens: {
      'Durations': [
        { name: '--dvfy-duration-fastest', desc: '50ms' },
        { name: '--dvfy-duration-fast',    desc: '150ms' },
        { name: '--dvfy-duration-normal',  desc: '250ms' },
        { name: '--dvfy-duration-slow',    desc: '400ms' },
        { name: '--dvfy-duration-slowest', desc: '700ms' },
      ],
      'Easing Curves': [
        { name: '--dvfy-ease-in',     desc: 'cubic-bezier(0.4, 0, 1, 1)' },
        { name: '--dvfy-ease-out',    desc: 'cubic-bezier(0, 0, 0.2, 1)' },
        { name: '--dvfy-ease-in-out', desc: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { name: '--dvfy-ease-bounce', desc: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
        { name: '--dvfy-ease-spring', desc: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
      ],
    },
  },
  layout: {
    label: 'Layout',
    description: 'Breakpoints, container widths, z-index scale, and aspect ratios',
    tokens: {
      'Breakpoints': [
        { name: '--dvfy-screen-xs',  desc: '22.5rem (360px) — mobile' },
        { name: '--dvfy-screen-sm',  desc: '30rem (480px) — large phone' },
        { name: '--dvfy-screen-md',  desc: '48rem (768px) — tablet' },
        { name: '--dvfy-screen-lg',  desc: '64rem (1024px) — desktop' },
        { name: '--dvfy-screen-xl',  desc: '90rem (1440px) — wide' },
        { name: '--dvfy-screen-2xl', desc: '120rem (1920px) — ultrawide' },
      ],
      'Container Widths': [
        { name: '--dvfy-container-xs',  desc: '20rem (320px)' },
        { name: '--dvfy-container-sm',  desc: '24rem (384px)' },
        { name: '--dvfy-container-md',  desc: '28rem (448px)' },
        { name: '--dvfy-container-lg',  desc: '32rem (512px)' },
        { name: '--dvfy-container-xl',  desc: '36rem (576px)' },
        { name: '--dvfy-container-2xl', desc: '42rem (672px)' },
        { name: '--dvfy-container-3xl', desc: '48rem (768px)' },
        { name: '--dvfy-container-4xl', desc: '56rem (896px)' },
        { name: '--dvfy-container-5xl', desc: '64rem (1024px)' },
        { name: '--dvfy-container-6xl', desc: '72rem (1152px)' },
        { name: '--dvfy-container-7xl', desc: '80rem (1280px)' },
      ],
      'Z-Index Scale': [
        { name: '--dvfy-z-hide',     desc: '-1' },
        { name: '--dvfy-z-base',     desc: '0' },
        { name: '--dvfy-z-raised',   desc: '1' },
        { name: '--dvfy-z-dropdown', desc: '10' },
        { name: '--dvfy-z-sticky',   desc: '20' },
        { name: '--dvfy-z-overlay',  desc: '30' },
        { name: '--dvfy-z-modal',    desc: '40' },
        { name: '--dvfy-z-popover',  desc: '50' },
        { name: '--dvfy-z-toast',    desc: '60' },
        { name: '--dvfy-z-tooltip',  desc: '70' },
      ],
    },
  },
};

/** Semantic tokens organized by role — drives Brand Settings view */
export const SEMANTIC_TOKENS = {
  'Surface': [
    { name: '--dvfy-surface-page',    type: 'color', desc: 'Page background' },
    { name: '--dvfy-surface-raised',  type: 'color', desc: 'Raised card/panel background' },
    { name: '--dvfy-surface-overlay', type: 'color', desc: 'Modal/overlay background' },
    { name: '--dvfy-surface-sunken',  type: 'color', desc: 'Recessed area background' },
    { name: '--dvfy-surface-muted',   type: 'color', desc: 'Subtle background fills' },
  ],
  'Text': [
    { name: '--dvfy-text-primary',   type: 'color', desc: 'Main body text' },
    { name: '--dvfy-text-secondary', type: 'color', desc: 'Supporting text' },
    { name: '--dvfy-text-muted',     type: 'color', desc: 'Placeholder, captions' },
    { name: '--dvfy-text-disabled',  type: 'color', desc: 'Disabled text' },
    { name: '--dvfy-text-inverse',   type: 'color', desc: 'Text on dark backgrounds' },
    { name: '--dvfy-text-link',      type: 'color', desc: 'Link color' },
    { name: '--dvfy-text-link-hover', type: 'color', desc: 'Link hover color' },
  ],
  'Border': [
    { name: '--dvfy-border-default', type: 'color', desc: 'Default border' },
    { name: '--dvfy-border-strong',  type: 'color', desc: 'Emphasized border' },
    { name: '--dvfy-border-muted',   type: 'color', desc: 'Subtle border' },
    { name: '--dvfy-border-focus',   type: 'color', desc: 'Focus ring border' },
  ],
  'Primary': [
    { name: '--dvfy-primary-bg',        type: 'color', desc: 'Primary button background' },
    { name: '--dvfy-primary-bg-hover',  type: 'color', desc: 'Primary hover' },
    { name: '--dvfy-primary-bg-active', type: 'color', desc: 'Primary active/pressed' },
    { name: '--dvfy-primary-bg-subtle', type: 'color', desc: 'Primary subtle background' },
    { name: '--dvfy-primary-text',      type: 'color', desc: 'Text on primary background' },
    { name: '--dvfy-primary-border',    type: 'color', desc: 'Primary border' },
  ],
  'Accent': [
    { name: '--dvfy-accent-bg',        type: 'color', desc: 'Accent background' },
    { name: '--dvfy-accent-bg-hover',  type: 'color', desc: 'Accent hover' },
    { name: '--dvfy-accent-bg-subtle', type: 'color', desc: 'Accent subtle background' },
    { name: '--dvfy-accent-text',      type: 'color', desc: 'Accent text' },
    { name: '--dvfy-accent-border',    type: 'color', desc: 'Accent border' },
  ],
  'Success': [
    { name: '--dvfy-success-bg',        type: 'color', desc: 'Success background (solid)' },
    { name: '--dvfy-success-bg-subtle', type: 'color', desc: 'Success subtle background' },
    { name: '--dvfy-success-text',      type: 'color', desc: 'Success text' },
    { name: '--dvfy-success-border',    type: 'color', desc: 'Success border' },
  ],
  'Warning': [
    { name: '--dvfy-warning-bg',        type: 'color', desc: 'Warning background (solid)' },
    { name: '--dvfy-warning-bg-subtle', type: 'color', desc: 'Warning subtle background' },
    { name: '--dvfy-warning-text',      type: 'color', desc: 'Warning text' },
    { name: '--dvfy-warning-border',    type: 'color', desc: 'Warning border' },
  ],
  'Danger': [
    { name: '--dvfy-danger-bg',        type: 'color', desc: 'Danger/error background (solid)' },
    { name: '--dvfy-danger-bg-subtle', type: 'color', desc: 'Danger subtle background' },
    { name: '--dvfy-danger-text',      type: 'color', desc: 'Danger text' },
    { name: '--dvfy-danger-border',    type: 'color', desc: 'Danger border' },
  ],
  'Info': [
    { name: '--dvfy-info-bg',        type: 'color', desc: 'Info background (solid)' },
    { name: '--dvfy-info-bg-subtle', type: 'color', desc: 'Info subtle background' },
    { name: '--dvfy-info-text',      type: 'color', desc: 'Info text' },
    { name: '--dvfy-info-border',    type: 'color', desc: 'Info border' },
  ],
  'Interactive': [
    { name: '--dvfy-hover-bg',     type: 'color', desc: 'Hover background for interactive elements' },
    { name: '--dvfy-active-bg',    type: 'color', desc: 'Active/pressed background' },
    { name: '--dvfy-selected-bg',  type: 'color', desc: 'Selected item background' },
    { name: '--dvfy-disabled-bg',  type: 'color', desc: 'Disabled element background' },
    { name: '--dvfy-disabled-text', type: 'color', desc: 'Disabled element text' },
    { name: '--dvfy-ring-color',   type: 'color', desc: 'Focus ring color' },
  ],
  'Input': [
    { name: '--dvfy-input-bg',           type: 'color', desc: 'Input background' },
    { name: '--dvfy-input-border',       type: 'color', desc: 'Input border' },
    { name: '--dvfy-input-border-hover', type: 'color', desc: 'Input border on hover' },
    { name: '--dvfy-input-border-focus', type: 'color', desc: 'Input border on focus' },
    { name: '--dvfy-input-placeholder',  type: 'color', desc: 'Input placeholder text' },
    { name: '--dvfy-input-error',        type: 'color', desc: 'Input error border' },
  ],
  'Status On': [
    { name: '--dvfy-on-success', type: 'color', desc: 'Text color on solid success background' },
    { name: '--dvfy-on-warning', type: 'color', desc: 'Text color on solid warning background' },
    { name: '--dvfy-on-danger',  type: 'color', desc: 'Text color on solid danger background' },
    { name: '--dvfy-on-info',    type: 'color', desc: 'Text color on solid info background' },
  ],
  'Tooltip': [
    { name: '--dvfy-tooltip-bg',     type: 'color', desc: 'Tooltip background' },
    { name: '--dvfy-tooltip-text',   type: 'color', desc: 'Tooltip text' },
    { name: '--dvfy-tooltip-border', type: 'color', desc: 'Tooltip border' },
  ],
  'Elevation': [
    { name: '--dvfy-shadow-color', type: 'string', desc: 'HSL components for shadow color (e.g. "220 3% 15%")' },
  ],
};

/** Built-in themes (empty — themes are generated from the Palette Generator) */
export const THEMES = [];

/** Curated Google Fonts for brand identity picker */
export const CURATED_FONTS = {
  sans: [
    { name: 'Inter', weights: [300, 400, 500, 600, 700] },
    { name: 'Roboto', weights: [300, 400, 500, 700] },
    { name: 'Open Sans', weights: [300, 400, 600, 700] },
    { name: 'Lato', weights: [300, 400, 700] },
    { name: 'Poppins', weights: [300, 400, 500, 600, 700] },
    { name: 'Nunito', weights: [300, 400, 600, 700] },
    { name: 'Manrope', weights: [300, 400, 500, 600, 700] },
    { name: 'DM Sans', weights: [400, 500, 700] },
    { name: 'Plus Jakarta Sans', weights: [300, 400, 500, 600, 700] },
    { name: 'Work Sans', weights: [300, 400, 500, 600, 700] },
    { name: 'Source Sans 3', weights: [300, 400, 600, 700] },
    { name: 'Outfit', weights: [300, 400, 500, 600, 700] },
    { name: 'Figtree', weights: [300, 400, 500, 600, 700] },
    { name: 'Geist', weights: [300, 400, 500, 600, 700] },
  ],
  serif: [
    { name: 'Merriweather', weights: [300, 400, 700] },
    { name: 'Playfair Display', weights: [400, 500, 600, 700] },
    { name: 'Lora', weights: [400, 500, 600, 700] },
    { name: 'Source Serif 4', weights: [300, 400, 600, 700] },
    { name: 'DM Serif Display', weights: [400] },
    { name: 'Libre Baskerville', weights: [400, 700] },
    { name: 'Crimson Text', weights: [400, 600, 700] },
    { name: 'EB Garamond', weights: [400, 500, 600, 700] },
  ],
  mono: [
    { name: 'JetBrains Mono', weights: [300, 400, 500, 600, 700] },
    { name: 'Fira Code', weights: [300, 400, 500, 600, 700] },
    { name: 'Source Code Pro', weights: [300, 400, 500, 600, 700] },
    { name: 'IBM Plex Mono', weights: [300, 400, 500, 600, 700] },
    { name: 'Roboto Mono', weights: [300, 400, 500, 700] },
    { name: 'Space Mono', weights: [400, 700] },
    { name: 'Inconsolata', weights: [300, 400, 500, 600, 700] },
    { name: 'Geist Mono', weights: [300, 400, 500, 600, 700] },
  ],
  display: [
    { name: 'Saira Stencil One', weights: [400] },
    { name: 'Righteous', weights: [400] },
    { name: 'Fredoka', weights: [300, 400, 500, 600, 700] },
    { name: 'Archivo Black', weights: [400] },
    { name: 'Bebas Neue', weights: [400] },
    { name: 'Oswald', weights: [300, 400, 500, 600, 700] },
    { name: 'Raleway', weights: [300, 400, 500, 600, 700] },
    { name: 'Montserrat', weights: [300, 400, 500, 600, 700] },
    { name: 'Sora', weights: [300, 400, 500, 600, 700] },
    { name: 'Space Grotesk', weights: [300, 400, 500, 600, 700] },
  ],
};
