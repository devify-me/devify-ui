#!/usr/bin/env node
/**
 * Taxonomy composition-law check for @devify/ui.
 *
 * Validates the stratified taxonomy (Components / Widgets / Layouts) declared in
 * `catalog/COMPONENT_REGISTRY` against the strict-downward composition law and
 * per-stratum classification rules (see docs/taxonomy.md).
 *
 * Rules enforced:
 *   Integrity  — every listed dependency is a registered component.
 *   Presence   — components declare `tier` (1–3); widgets declare `role`;
 *                layouts declare `category` + `pageRole`.
 *   Composition (strict downward, never sideways/up):
 *     • component → depends only on components of a LOWER tier.
 *         Tier 1 has no deps; Tier N (2,3) needs ≥1 Tier N-1 dep and no
 *         same-tier / higher-tier deps.
 *     • widget    → depends only on components (no widget/layout deps).
 *     • layout    → depends only on widgets or components (no layout deps).
 *
 * Usage:
 *   node scripts/check-taxonomy.mjs        # report mode (always exit 0)
 *   node scripts/check-taxonomy.mjs --ci   # exit 1 on any violation
 */

import { COMPONENT_REGISTRY, strataOf } from '../catalog/data.js';

const CI_MODE = process.argv.includes('--ci');
const STRATA_RANK = { component: 0, widget: 1, layout: 2 };
const violations = [];

const fail = (tag, msg) => violations.push(`${tag}: ${msg}`);

for (const [tag, meta] of Object.entries(COMPONENT_REGISTRY)) {
  const strata = strataOf(meta);
  const deps = meta.deps || [];

  // Integrity — every dep is registered.
  for (const dep of deps) {
    if (!COMPONENT_REGISTRY[dep]) {
      fail(tag, `depends on "${dep}" which is not in the registry`);
    }
  }

  // Presence — declared fields per stratum.
  if (strata === 'component') {
    if (![1, 2, 3].includes(meta.tier)) fail(tag, `component must declare tier 1–3 (got ${JSON.stringify(meta.tier)})`);
  } else if (strata === 'widget') {
    if (!meta.role) fail(tag, 'widget must declare a `role`');
    if (meta.tier != null) fail(tag, 'widget must not declare a depth `tier`');
  } else if (strata === 'layout') {
    if (!meta.category) fail(tag, 'layout must declare a `category`');
    if (!meta.pageRole) fail(tag, 'layout must declare a `pageRole`');
    if (meta.tier != null) fail(tag, 'layout must not declare a depth `tier`');
  } else {
    fail(tag, `unknown strata "${strata}"`);
  }

  // Composition law — strict downward, never sideways/up.
  for (const dep of deps) {
    const depMeta = COMPONENT_REGISTRY[dep];
    if (!depMeta) continue; // already reported by integrity check
    const depStrata = strataOf(depMeta);

    if (strata === 'component') {
      if (depStrata !== 'component') {
        fail(tag, `component may only depend on components (dep "${dep}" is a ${depStrata})`);
      } else if (!(depMeta.tier < meta.tier)) {
        fail(tag, `Tier ${meta.tier} component may only depend on lower tiers (dep "${dep}" is Tier ${depMeta.tier})`);
      }
    } else {
      // widget / layout — deps must be a STRICTLY lower stratum (no sideways/up).
      if (!(STRATA_RANK[depStrata] < STRATA_RANK[strata])) {
        fail(tag, `${strata} may only depend on strictly lower strata (dep "${dep}" is a ${depStrata})`);
      }
    }
  }

  // Component tier forcing-function: Tier N (2,3) needs ≥1 Tier N-1 dep.
  if (strata === 'component' && meta.tier > 1) {
    const hasLowerAdjacent = deps.some(d => COMPONENT_REGISTRY[d]?.tier === meta.tier - 1);
    if (!hasLowerAdjacent) fail(tag, `Tier ${meta.tier} component must compose ≥1 Tier ${meta.tier - 1} component`);
  }
}

if (violations.length) {
  console.error(`✗ taxonomy check: ${violations.length} violation(s)`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(CI_MODE ? 1 : 0);
}

console.log('✓ taxonomy check: composition law and stratum rules hold');
