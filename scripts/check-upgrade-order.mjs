#!/usr/bin/env node

/**
 * check-upgrade-order.mjs — static gate for the custom-element upgrade-order trap.
 *
 * G&P
 *   Goal:    Fail CI when a component's `attributeChangedCallback` can dereference
 *            state that only `connectedCallback` creates — with few enough false
 *            positives that the gate stays switched on.
 *   Purpose: A parsed custom element is ALREADY connected when it upgrades, so
 *            `attributeChangedCallback` runs BEFORE `connectedCallback`. The common
 *            `if (!this.isConnected) return;` guard therefore never fires for the
 *            case that matters, and the callback touches null internals. This
 *            shipped in two components behind 1666 green tests (#418), and neither
 *            the catalog playground nor `fixture()` can reach it — both
 *            create-then-connect, while every consumer parses-then-upgrades.
 *            `docs/new-component-checklist.md` Step 9 named the failure in two
 *            items and components violated it anyway, so prose is not enough: this
 *            is the control that replaces it (studio KB `from-lesson-to-control.md`).
 *
 * Detection
 *   built  = private fields assigned in connectedCallback, transitively through the
 *            private methods it calls.
 *   unsafe = private fields dereferenced in attributeChangedCallback (transitively)
 *            at a point where they are NOT known non-null.
 *   Fails when (built ∩ unsafe) is non-empty.
 *
 * A dereference is considered SAFE when dominated by a truthiness test of the same
 * field — `if (this.#x) this.#x.y`, `this.#x && this.#x.y`, `if (!this.#x) return;`
 * earlier in the block, a readiness flag guarding the whole body, a preceding
 * non-nullish assignment (`this.#x = new Foo()`), a non-nullish class-field
 * initialiser — or when written with optional chaining (`this.#x?.y`). A bare read that never member-accesses
 * (passing it, comparing it, assigning to it) cannot throw and is ignored.
 *
 * Usage:  npm run check:upgrade-order [-- --ci]
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as espree from 'espree';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CI = process.argv.includes('--ci');
const PARSE = { ecmaVersion: 'latest', sourceType: 'module', loc: true, range: true };

const isThisPrivate = n => n
  && n.type === 'MemberExpression'
  && n.object?.type === 'ThisExpression'
  && n.property?.type === 'PrivateIdentifier';

/** Generic walk, used only where guard context does not matter. */
function walk(node, visit) {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) child.forEach(c => walk(c, visit));
    else if (child && typeof child.type === 'string') walk(child, visit);
  }
}

/**
 * Private fields with a non-nullish class-field initializer (`#xs = []`, `#n = 0`)
 * can never be null, so dereferencing them during upgrade cannot throw. Only
 * fields initialised to null/undefined — or with no initialiser at all — are at
 * risk. Without this the gate flags its own recommended guard (`!this.#xs.length`).
 */
function neverNullFields(classBody) {
  const safe = new Set();
  for (const el of classBody.body) {
    if (el.type !== 'PropertyDefinition' || el.key?.type !== 'PrivateIdentifier') continue;
    const v = el.value;
    if (!v) continue;                                  // no initialiser -> undefined
    if (v.type === 'Literal' && (v.value === null)) continue;
    if (v.type === 'Identifier' && v.name === 'undefined') continue;
    safe.add(el.key.name);
  }
  return safe;
}

function collectMembers(classBody) {
  const methods = new Map();
  for (const el of classBody.body) {
    if (el.key?.type !== 'PrivateIdentifier') continue;
    if (el.type === 'MethodDefinition') methods.set(el.key.name, el.value.body);
    else if (el.type === 'PropertyDefinition' && /Function/.test(el.value?.type || '')) {
      methods.set(el.key.name, el.value.body);
    }
  }
  return methods;
}

/** Private fields assigned in a body, following private calls. */
function assignedFields(body, methods, seen = new Set()) {
  const out = new Set();
  if (!body) return out;
  walk(body, (n) => {
    if (n.type === 'AssignmentExpression' && isThisPrivate(n.left)) out.add(n.left.property.name);
    if (n.type === 'CallExpression' && isThisPrivate(n.callee)) {
      const name = n.callee.property.name;
      if (!seen.has(name) && methods.has(name)) {
        seen.add(name);
        assignedFields(methods.get(name), methods, seen).forEach(f => out.add(f));
      }
    }
  });
  return out;
}

/**
 * Fields a body assigns a NON-nullish value to, transitively. Calling such a
 * method makes those fields safe for everything after the call — which is how
 * most components legitimately work: `attributeChangedCallback` invokes the same
 * builder `connectedCallback` does, then uses what it built.
 */
function nonNullAssigned(body, methods, seen = new Set()) {
  const out = new Set();
  if (!body) return out;
  walk(body, (n) => {
    if (n.type === 'AssignmentExpression' && isThisPrivate(n.left)) {
      const r = n.right;
      const nullish = (r.type === 'Literal' && r.value === null)
        || (r.type === 'Identifier' && r.name === 'undefined');
      if (!nullish) out.add(n.left.property.name);
    }
    if (n.type === 'CallExpression' && isThisPrivate(n.callee)) {
      const m = n.callee.property.name;
      if (!seen.has(m) && methods.has(m)) {
        seen.add(m);
        nonNullAssigned(methods.get(m), methods, seen).forEach(f => out.add(f));
      }
    }
  });
  return out;
}

/**
 * Names truthy-tested by an expression, and names whose FALSINESS the expression
 * tests (`!this.#x`) — the latter is what an early-return guard establishes for
 * the statements that follow it.
 */
function testedNames(expr, negated = false, acc = { truthy: new Set(), falsy: new Set() }) {
  if (!expr) return acc;
  if (expr.type === 'ChainExpression') return testedNames(expr.expression, negated, acc);
  if (isThisPrivate(expr)) {
    (negated ? acc.falsy : acc.truthy).add(expr.property.name);
    return acc;
  }
  if (expr.type === 'UnaryExpression' && expr.operator === '!') {
    return testedNames(expr.argument, !negated, acc);
  }
  if (expr.type === 'LogicalExpression') {
    // `a && b` under negation, or `a || b` un-negated, both distribute for our purposes
    testedNames(expr.left, negated, acc);
    testedNames(expr.right, negated, acc);
    return acc;
  }
  // `if (this.#x?.y)` / `if (this.#x.y)` — a truthy member access implies #x is non-null.
  if (expr.type === 'MemberExpression' && isThisPrivate(expr.object) && !negated) {
    acc.truthy.add(expr.object.property.name);
    return acc;
  }
  if (expr.type === 'CallExpression' && expr.callee?.type === 'MemberExpression'
    && isThisPrivate(expr.callee.object) && !negated) {
    acc.truthy.add(expr.callee.object.property.name);
    return acc;
  }
  if (expr.type === 'BinaryExpression' && ['!==', '!=', '===', '=='].includes(expr.operator)) {
    const nullish = s => s.type === 'Literal' && s.value === null;
    const other = nullish(expr.right) ? expr.left : (nullish(expr.left) ? expr.right : null);
    if (other && isThisPrivate(other)) {
      const isNonNullTest = expr.operator.startsWith('!');
      ((isNonNullTest !== negated) ? acc.truthy : acc.falsy).add(other.property.name);
    }
    return acc;
  }
  return acc;
}

const returnsOrThrows = (node) => {
  if (!node) return false;
  if (node.type === 'ReturnStatement' || node.type === 'ThrowStatement') return true;
  if (node.type === 'BlockStatement') return node.body.some(returnsOrThrows);
  return false;
};

/**
 * Collect UNSAFE dereferences of private fields, carrying a set of names already
 * known non-null at each point.
 */
function unsafeDerefs(node, methods, guarded = new Set(), out = new Set(), seen = new Set(), sites = new Map()) {
  if (!node || typeof node.type !== 'string') return out;
  if (node.type === 'ChainExpression') return unsafeDerefs(node.expression, methods, guarded, out, seen, sites);

  // Statement sequence: an `if (!this.#x) return;` guards everything after it.
  if (node.type === 'BlockStatement' || node.type === 'Program') {
    let g = new Set(guarded);
    for (const stmt of node.body) {
      unsafeDerefs(stmt, methods, g, out, seen, sites);
      if (stmt.type === 'IfStatement' && returnsOrThrows(stmt.consequent)) {
        const { falsy } = testedNames(stmt.test);
        if (falsy.size) g = new Set([...g, ...falsy]);
      }
      // Lazy init: `if (!this.#x) { this.#x = document.createElement(…); }` —
      // after the branch, #x is non-null on both paths.
      if (stmt.type === 'IfStatement' && !returnsOrThrows(stmt.consequent)) {
        const { falsy } = testedNames(stmt.test);
        if (falsy.size) {
          const built = nonNullAssigned(stmt.consequent, methods);
          [...falsy].filter(f => built.has(f)).forEach((f) => { g = new Set([...g, f]); });
        }
      }
      // `this.#x = new Foo()` makes #x non-null for everything after it.
      if (stmt.type === 'ExpressionStatement'
        && stmt.expression?.type === 'AssignmentExpression'
        && isThisPrivate(stmt.expression.left)) {
        const rhs = stmt.expression.right;
        const nullish = (rhs.type === 'Literal' && rhs.value === null)
          || (rhs.type === 'Identifier' && rhs.name === 'undefined');
        if (!nullish) g = new Set([...g, stmt.expression.left.property.name]);
      }
      // …and so does calling a private method that builds them.
      walk(stmt, (n) => {
        if (n.type === 'CallExpression' && isThisPrivate(n.callee)) {
          const m = n.callee.property.name;
          if (methods.has(m)) g = new Set([...g, ...nonNullAssigned(methods.get(m), methods)]);
        }
      });
    }
    return out;
  }

  if (node.type === 'IfStatement') {
    unsafeDerefs(node.test, methods, guarded, out, seen, sites);
    const { truthy, falsy } = testedNames(node.test);
    unsafeDerefs(node.consequent, methods, new Set([...guarded, ...truthy]), out, seen, sites);
    unsafeDerefs(node.alternate, methods, new Set([...guarded, ...falsy]), out, seen, sites);
    return out;
  }

  if (node.type === 'ConditionalExpression') {
    unsafeDerefs(node.test, methods, guarded, out, seen, sites);
    const { truthy, falsy } = testedNames(node.test);
    unsafeDerefs(node.consequent, methods, new Set([...guarded, ...truthy]), out, seen, sites);
    unsafeDerefs(node.alternate, methods, new Set([...guarded, ...falsy]), out, seen, sites);
    return out;
  }

  if (node.type === 'LogicalExpression') {
    unsafeDerefs(node.left, methods, guarded, out, seen, sites);
    const { truthy, falsy } = testedNames(node.left);
    const rhsGuard = node.operator === '&&' ? truthy : falsy;
    unsafeDerefs(node.right, methods, new Set([...guarded, ...rhsGuard]), out, seen, sites);
    return out;
  }

  // this.#x.y — unsafe unless optional-chained or already guarded
  // `this.#x = new Foo(() => … this.#x …)` — the callback cannot run before the
  // assignment completes, so #x is non-null inside it.
  if (node.type === 'AssignmentExpression' && isThisPrivate(node.left)) {
    const rhs = node.right;
    const nullish = (rhs.type === 'Literal' && rhs.value === null)
      || (rhs.type === 'Identifier' && rhs.name === 'undefined');
    const inner = nullish ? guarded : new Set([...guarded, node.left.property.name]);
    unsafeDerefs(rhs, methods, inner, out, seen, sites);
    unsafeDerefs(node.left.property, methods, guarded, out, seen, sites);
    return out;
  }

  if (node.type === 'MemberExpression' && isThisPrivate(node.object)) {
    const name = node.object.property.name;
    if (!node.optional && !guarded.has(name)) {
      out.add(name);
      if (!sites.has(name) && node.loc) sites.set(name, node.loc.start.line);
    }
    unsafeDerefs(node.property, methods, guarded, out, seen, sites);
    return out;
  }

  if (node.type === 'CallExpression' && isThisPrivate(node.callee)) {
    const name = node.callee.property.name;
    node.arguments.forEach(a => unsafeDerefs(a, methods, guarded, out, seen, sites));
    if (!seen.has(name) && methods.has(name)) {
      seen.add(name);
      unsafeDerefs(methods.get(name), methods, guarded, out, seen, sites);
    }
    return out;
  }

  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) child.forEach(c => unsafeDerefs(c, methods, guarded, out, seen, sites));
    else if (child && typeof child.type === 'string') unsafeDerefs(child, methods, guarded, out, seen, sites);
  }
  return out;
}

/**
 * Second failure subclass: DOUBLE-INITIALISE.
 *
 * The null-dereference check above cannot see this one. On upgrade, a method
 * called from BOTH callbacks runs twice — attributeChangedCallback first, then
 * connectedCallback. If that method allocates a resource (an observer, an
 * AbortController) without first releasing the previous one, the first allocation
 * is orphaned but still live. That is exactly how dvfy-scramble-hover's observer
 * bug worked, and no null-check would have caught it.
 *
 * Flagged only when the shared method allocates such a resource and does not open
 * with a teardown call — i.e. is not idempotent.
 */
const RESOURCE = /Observer$|^AbortController$/;

function sharedNonIdempotent(accBody, ccBody, methods) {
  const called = (body, seen = new Set()) => {
    const out = new Set();
    if (!body) return out;
    walk(body, (n) => {
      if (n.type === 'CallExpression' && isThisPrivate(n.callee)) {
        const m = n.callee.property.name;
        out.add(m);
        if (!seen.has(m) && methods.has(m)) {
          seen.add(m);
          called(methods.get(m), seen).forEach(x => out.add(x));
        }
      }
    });
    return out;
  };

  const fromAcc = called(accBody);
  const fromCc = called(ccBody);
  const findings = [];

  for (const name of fromAcc) {
    if (!fromCc.has(name) || !methods.has(name)) continue;
    const body = methods.get(name);
    let allocates = null;
    walk(body, (n) => {
      if (n.type === 'AssignmentExpression' && isThisPrivate(n.left)
        && n.right?.type === 'NewExpression' && RESOURCE.test(n.right.callee?.name || '')) {
        allocates = { field: n.left.property.name, ctor: n.right.callee.name, at: n.range[0] };
      }
    });
    if (!allocates) continue;

    // Idempotent only if the previous resource is released BEFORE the allocation.
    // Position matters: a `.disconnect()` sitting inside the new observer's own
    // callback is not a teardown of the old one, and counting it as one is how
    // this check first missed the very defect it was written for.
    let releasesFirst = false;
    // An early-return idempotence guard — `if (this.#field) return;` — is a
    // stronger form of teardown than releasing: it never allocates twice at all.
    for (const stmt of body.body || []) {
      if (stmt.type !== 'IfStatement' || !returnsOrThrows(stmt.consequent)) break;
      const { truthy } = testedNames(stmt.test);
      if (truthy.has(allocates.field)) { releasesFirst = true; break; }
    }
    if (releasesFirst) continue;

    walk(body, (n) => {
      if (releasesFirst) return;
      if (n.type !== 'CallExpression' || n.range[1] > allocates.at) return;
      const callee = n.callee;
      if (isThisPrivate(callee)
        && /detach|unbind|teardown|destroy|cleanup|stop|reset|clear/i.test(callee.property.name)) {
        releasesFirst = true; return;
      }
      // this.#field.disconnect() / .abort() on the same field
      if (callee?.type === 'MemberExpression' && isThisPrivate(callee.object)
        && callee.object.property.name === allocates.field
        && /^(disconnect|abort|unobserve)$/.test(callee.property?.name || '')) {
        releasesFirst = true;
      }
    });
    if (!releasesFirst) findings.push({ method: name, field: allocates.field, ctor: allocates.ctor });
  }
  return findings;
}

/**
 * Analyse one component source. Returns [] when clean, otherwise one entry per
 * class with `fields` (null-deref) and/or `dbl` (double-init).
 * Exported so the gate itself can be tested — a control nobody has proven red is
 * not a control (studio KB `prove-a-check-can-fail.md`).
 */
export function analyzeSource(src) {
  const ast = espree.parse(src, PARSE);
  const results = [];
  walk(ast, (n) => {
    if (n.type !== 'ClassBody') return;
    const methods = collectMembers(n);
    const acc = n.body.find(el => el.type === 'MethodDefinition' && el.key?.name === 'attributeChangedCallback');
    const cc = n.body.find(el => el.type === 'MethodDefinition' && el.key?.name === 'connectedCallback');
    if (!acc || !cc) return;
    const neverNull = neverNullFields(n);
    const built = assignedFields(cc.value.body, methods);
    const sites = new Map();
    const unsafe = unsafeDerefs(acc.value.body, methods, new Set(), new Set(), new Set(), sites);
    const fields = [...unsafe].filter(f => built.has(f) && !neverNull.has(f)).sort();
    const dbl = sharedNonIdempotent(acc.value.body, cc.value.body, methods);
    if (fields.length || dbl.length) results.push({ line: acc.loc.start.line, fields, dbl, sites });
  });
  return results;
}

/* ── Scan ── */
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!isMain) { /* imported for tests — skip the CLI scan */ } else {
const files = ['components', 'patterns'].flatMap(dir => readdirSync(join(ROOT, dir))
  .filter(f => f.endsWith('.js') && !f.includes('.test.'))
  .map(f => join(ROOT, dir, f)))
  .sort();

const failures = [];
let checked = 0;

for (const file of files) {
  let ast;
  try { ast = espree.parse(readFileSync(file, 'utf8'), PARSE); } catch (e) {
    failures.push({ file, parse: e.message });
    continue;
  }

  walk(ast, (n) => {
    if (n.type !== 'ClassBody') return;
    const methods = collectMembers(n);
    const acc = n.body.find(el => el.type === 'MethodDefinition' && el.key?.name === 'attributeChangedCallback');
    const cc = n.body.find(el => el.type === 'MethodDefinition' && el.key?.name === 'connectedCallback');
    if (!acc || !cc) return;

    checked += 1;
    const neverNull = neverNullFields(n);
    const built = assignedFields(cc.value.body, methods);
    const sites = new Map();
    const unsafe = unsafeDerefs(acc.value.body, methods, new Set(), new Set(), new Set(), sites);
    const overlap = [...unsafe].filter(f => built.has(f) && !neverNull.has(f)).sort();
    const dbl = sharedNonIdempotent(acc.value.body, cc.value.body, methods);
    if (overlap.length || dbl.length) {
      failures.push({ file, line: acc.loc.start.line, fields: overlap, dbl, sites });
    }
  });
}

/* ── Report ── */
if (failures.length === 0) {
  console.log(`check-upgrade-order: OK — ${checked} components with both callbacks, no unguarded upgrade-order dereference`);
  process.exit(0);
}

console.error(`check-upgrade-order: ${failures.length} of ${checked} component(s) can dereference unbuilt state during upgrade\n`);
for (const f of failures) {
  const rel = f.file.replace(`${ROOT}/`, '');
  if (f.parse) { console.error(`  ${rel}\n    parse error: ${f.parse}`); continue; }
  console.error(`  ${rel}:${f.line}  attributeChangedCallback`);
  if (f.fields?.length) {
    console.error(`    NULL-DEREF   ${f.fields.map(x => `this.#${x}${f.sites?.has(x) ? ` (line ${f.sites.get(x)})` : ''}`).join(', ')} — created by connectedCallback, which on upgrade runs SECOND`);
  }
  for (const d of f.dbl || []) {
    console.error(`    DOUBLE-INIT  this.#${d.method}() runs from BOTH callbacks and allocates this.#${d.field} = new ${d.ctor}() with no teardown first`);
  }
}
console.error(`
Fix: guard on the built artifact, never on isConnected alone —
  if (!this.isConnected || !this.#<field>) return;
connectedCallback re-applies observed attributes, so bailing costs nothing.
Where the field is built inside a deferred callback (rAF/microtask), guard on a
readiness flag set at THAT point, not at the end of connectedCallback.
Reproduce: host.innerHTML = '<tag attr="v">' on an ALREADY-CONNECTED host.`);

process.exit(CI ? 1 : 0);
}
