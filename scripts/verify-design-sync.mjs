#!/usr/bin/env node

/**
 * verify-design-sync.mjs — browser gate for the Claude Design artboard bundle.
 *
 * G&P
 *   Goal:    Load every generated artboard in a real browser and fail on console
 *            errors, failed requests, or components that did not upgrade.
 *   Purpose: A generated bundle can be structurally perfect and still render
 *            nothing. The 2026-08-28 controlled test shipped 244 green tests over
 *            components that were inert on the page; static checks cannot see
 *            that. This is the gate that can.
 *
 * Usage:  npm run design-sync:verify   (build first)
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.design-sync');

if (!existsSync(OUT)) {
  console.error('No .design-sync/ — run `npm run design-sync:build` first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json',
};

const walk = (dir, base = '') => readdirSync(dir).flatMap((e) => {
  const p = join(dir, e);
  const rel = base ? `${base}/${e}` : e;
  return statSync(p).isDirectory() ? walk(p, rel) : [rel];
});

const all = walk(OUT);
const pages = all.filter(f => f.endsWith('.html')).sort();

const server = createServer(async (req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html';
  try {
    const buf = await readFile(join(OUT, rel));
    res.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const results = [];

for (const page of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  const failed = [];
  const external = [];

  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  p.on('requestfailed', (r) => {
    // Google Fonts are an intentional external dependency; a sandbox without
    // network must not be reported as a bundle defect.
    (r.url().includes('fonts.g') ? external : failed).push(`${r.url()} ${r.failure()?.errorText || ''}`);
  });

  await p.goto(`${base}/${page}`, { waitUntil: 'networkidle' }).catch(e => errors.push(`goto: ${e.message}`));
  await p.waitForTimeout(120);

  // Did the components actually upgrade, and did they render anything?
  const probe = await p.evaluate(() => {
    const els = [...document.querySelectorAll('*')].filter(e => e.tagName.toLowerCase().startsWith('dvfy-'));
    const undef = [...new Set(els.filter(e => !customElements.get(e.tagName.toLowerCase()))
      .map(e => e.tagName.toLowerCase()))];
    const inert = [...new Set(els.filter(e => customElements.get(e.tagName.toLowerCase())
      && e.children.length === 0 && !e.textContent.trim() && e.getBoundingClientRect().height === 0)
      .map(e => e.tagName.toLowerCase()))];
    return {
      total: els.length,
      undef,
      inert,
      bodyHeight: document.body.getBoundingClientRect().height,
      imgsBroken: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src')),
    };
  });

  results.push({ page, errors, failed, external, ...probe });
  await ctx.close();
}

await browser.close();
server.close();

/* ── Report ── */
const bad = results.filter(r => r.errors.length || r.failed.length || r.undef.length
  || r.imgsBroken.length || r.bodyHeight < 200);

console.log(`\nartboards checked: ${results.length}`);
console.log(`console errors:    ${results.reduce((n, r) => n + r.errors.length, 0)}`);
console.log(`failed requests:   ${results.reduce((n, r) => n + r.failed.length, 0)} (excl. ${results.reduce((n, r) => n + r.external.length, 0)} external font)`);
console.log(`dvfy elements:     ${results.reduce((n, r) => n + r.total, 0)}`);
console.log(`unupgraded tags:   ${new Set(results.flatMap(r => r.undef)).size}`);
console.log(`broken images:     ${results.reduce((n, r) => n + r.imgsBroken.length, 0)}`);
console.log(`thin pages(<200px):${results.filter(r => r.bodyHeight < 200).length}`);

const inertTags = new Set(results.flatMap(r => r.inert));
if (inertTags.size) console.log(`inert (upgraded, 0-height, no content): ${[...inertTags].join(', ')}`);

if (bad.length) {
  console.log(`\n── ${bad.length} artboard(s) with findings ──`);
  for (const r of bad.slice(0, 25)) {
    console.log(`\n${r.page}  (h=${Math.round(r.bodyHeight)}px, ${r.total} dvfy els)`);
    r.errors.slice(0, 4).forEach(e => console.log(`  ERR  ${e.slice(0, 160)}`));
    r.failed.slice(0, 4).forEach(e => console.log(`  REQ  ${e.slice(0, 160)}`));
    r.undef.forEach(e => console.log(`  UNDEF ${e}`));
    r.imgsBroken.slice(0, 4).forEach(e => console.log(`  IMG  ${e}`));
  }
}

process.exit(bad.length ? 1 : 0);
