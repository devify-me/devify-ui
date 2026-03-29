# Issue #211: Add payment component suite for Stripe, Paddle, and PayPal

**Type:** feat
**Branch:** feat/211-payment-component-suite
**Labels:** enhancement

## Context

The Devify framework billing module ships three gateways (Stripe, Paddle, PayPal) with a complete REST API but zero frontend. This suite provides 6 Web Components that work with all three gateways, adapting their UX per gateway type.

## Architecture

All components follow the standard @devify/ui pattern: Light DOM, attributes-as-API, semantic tokens, ARIA support. Data-fetching components accept either an `api-base` + `tenant-id` for live API calls, or static data via attributes/children for standalone use (playground, testing). Gateway-specific SDK loading is lazy.

## File Structure

| File | Purpose |
|------|---------|
| `components/dvfy-usage-meter.js` | Feature usage progress bars |
| `components/dvfy-invoice-list.js` | Billing history with status badges |
| `components/dvfy-subscription-card.js` | Current subscription status card |
| `components/dvfy-plan-picker.js` | Plan comparison grid |
| `components/dvfy-payment-methods.js` | Saved payment method list + management |
| `components/dvfy-payment-setup.js` | Gateway-specific add payment method flow |

## Tasks

- [ ] Implement dvfy-usage-meter (Tier 2, deps: dvfy-progress)
- [ ] Implement dvfy-invoice-list (Tier 2, deps: dvfy-badge)
- [ ] Implement dvfy-subscription-card (Tier 2, deps: dvfy-badge, dvfy-button)
- [ ] Implement dvfy-plan-picker (Tier 2, deps: dvfy-button, dvfy-badge)
- [ ] Implement dvfy-payment-methods (Tier 2, deps: dvfy-button)
- [ ] Implement dvfy-payment-setup (Tier 2, deps: dvfy-button, dvfy-loader)
- [ ] Register all components in devify.js, data.js, playground DEFAULT_CONTENT
- [ ] Run npm run analyze
- [ ] Run npm run lint — fix issues
- [ ] Run npm test — verify no regressions
- [ ] Diff review against main
- [ ] Create PR

## Future
<!-- Unrelated issues discovered during implementation -->
