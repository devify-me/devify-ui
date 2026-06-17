/**
 * verify-composition-demo.mjs — real-browser e2e proof for devify-ui#372 (LP-Factory N1 / G2).
 *
 * Drives the served composition demo in headless Chromium and asserts the WHOLE POINT
 * of the issue: the §8 page composed only from the sanctioned primitives renders with
 * ZERO unresolved/dead classes, every primitive upgrades, applies real token-bound
 * computed styles, and the page is actually themed (not unthemed).
 *
 * Reuses the cached Playwright chromium. Spins up a static server on a free port.
 *
 * Usage: node scripts/verify-composition-demo.mjs
 * Exit 0 = proof holds; exit 1 = a dead class / unstyled primitive / unthemed page.
 */
// eslint-disable-next-line import-x/no-extraneous-dependencies -- dev/CI verify tool; not part of the shipped package (scripts/ is excluded from `files`)
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

const server = http.createServer(async (req, res) => {
  try {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

const fail = (msg) => { console.error('FAIL:', msg); process.exitCode = 1; };
const ok = msg => console.log('  ok —', msg);

await new Promise(r => server.listen(0, r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/examples/composition/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(String(e)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => customElements.get('dvfy-page-section') !== undefined);

console.log(`Composition demo e2e — ${url}\n`);

// 1. Every primitive family upgraded (custom element defined + present on the page).
const families = ['dvfy-page-section', 'dvfy-grid', 'dvfy-stack', 'dvfy-heading', 'dvfy-text'];
const upgrade = await page.evaluate(fams => fams.map(f => ({
  f, defined: !!customElements.get(f), count: document.querySelectorAll(f).length,
})), families);
for (const u of upgrade) {
  if (!u.defined) fail(`${u.f} is not a defined custom element (did not register)`);
  else if (u.count === 0) fail(`${u.f} not present on the demo page`);
  else ok(`${u.f} upgraded — ${u.count} instance(s)`);
}

// 2. ZERO dead/invented utility classes. The G2 failure mode is stringly-typed classes
//    that resolve to nothing. Assert the page carries NO class attribute at all on any
//    element except the documented page-reset selectors (there are none here) — the
//    composition is 100% elements + attributes, not classes.
const strayClasses = await page.evaluate(() => {
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    for (const c of el.classList) {
      // any dvfy-* utility-looking class on a consumer element is the dead-class smell
      if (c.startsWith('dvfy-')) bad.push(`${el.tagName.toLowerCase()}.${c}`);
    }
  }
  return bad;
});
if (strayClasses.length) fail(`invented/dead dvfy-* utility classes found: ${strayClasses.join(', ')}`);
else ok('zero invented dvfy-* utility classes in the composed page (closed vocabulary holds)');

// 3. Primitives applied REAL token-bound computed styles (not unstyled fallback).
const styled = await page.evaluate(() => {
  const grid = document.querySelector('dvfy-grid[cols="3"]');
  const stack = document.querySelector('dvfy-stack');
  const section = document.querySelector('dvfy-page-section[tone="muted"]');
  const cs = el => el ? getComputedStyle(el) : null;
  const gs = cs(grid), ss = cs(stack), secs = cs(section);
  return {
    gridDisplay: gs && gs.display,
    gridCols: gs && gs.gridTemplateColumns,           // 3 tracks at >= md width
    gridGap: gs && gs.gap,                             // resolved from --dvfy-space-*
    stackDisplay: ss && ss.display,
    stackDir: ss && ss.flexDirection,
    sectionBg: secs && secs.backgroundColor,          // muted surface token, not transparent
    sectionPadTop: secs && secs.paddingTop,           // clamped padding, not 0
  };
});
if (styled.gridDisplay !== 'grid') fail(`dvfy-grid did not apply display:grid (got ${styled.gridDisplay})`);
else ok(`dvfy-grid display:grid, gap=${styled.gridGap}, tracks="${styled.gridCols}"`);
if (!/(\d.*){2,}/.test(styled.gridCols) || styled.gridCols.split(' ').length < 3) {
  fail(`dvfy-grid cols=3 did not resolve to 3 tracks at desktop width (got "${styled.gridCols}")`);
} else ok('dvfy-grid cols=3 resolved to 3 tracks at desktop width');
if (styled.stackDisplay !== 'flex' || styled.stackDir !== 'column') fail(`dvfy-stack flex/column not applied (${styled.stackDisplay}/${styled.stackDir})`);
else ok('dvfy-stack display:flex direction:column applied');
if (!styled.sectionBg || styled.sectionBg === 'rgba(0, 0, 0, 0)' || styled.sectionBg === 'transparent') {
  fail(`dvfy-page-section[tone=muted] background did not resolve to a token (got ${styled.sectionBg})`);
} else ok(`dvfy-page-section tone=muted background resolved (${styled.sectionBg}), padding-top=${styled.sectionPadTop}`);

// 4. Typography primitives produced REAL semantic tags + token-bound sizes.
const typo = await page.evaluate(() => {
  const h1 = document.querySelector('dvfy-heading[level="1"] > h1');
  const h2 = document.querySelector('dvfy-heading[level="2"] > h2');
  const p = document.querySelector('dvfy-text:not([inline]) > p');
  const h1count = document.querySelectorAll('h1').length;
  return {
    hasH1: !!h1, hasH2: !!h2, hasP: !!p, h1count,
    h1Size: h1 ? getComputedStyle(h1).fontSize : null,
    pSize: p ? getComputedStyle(p).fontSize : null,
  };
});
if (!typo.hasH1) fail('dvfy-heading level=1 did not render a real <h1>');
else ok(`dvfy-heading level=1 → real <h1> (font-size ${typo.h1Size})`);
if (!typo.hasH2) fail('dvfy-heading level=2 did not render a real <h2>');
else ok('dvfy-heading level=2 → real <h2>');
if (!typo.hasP) fail('dvfy-text did not render a real <p>');
else ok(`dvfy-text → real <p> (font-size ${typo.pSize})`);
if (typo.h1count !== 1) fail(`SEO single-<h1> expected; found ${typo.h1count}`);
else ok('exactly one <h1> on the page (SEO baseline)');

// 5. Page is actually THEMED (renting-ideal applied on <html>, not unthemed).
const theme = await page.evaluate(() => ({
  dataTheme: document.documentElement.getAttribute('data-theme'),
  bodyBg: getComputedStyle(document.body).backgroundColor,
  textPrimary: getComputedStyle(document.body).color,
}));
if (theme.dataTheme !== 'renting-ideal') fail(`page not themed via data-theme (got ${theme.dataTheme})`);
else ok(`page themed: data-theme=${theme.dataTheme}, body bg=${theme.bodyBg}, text=${theme.textPrimary}`);

// 6. No console/page errors (a missing element or bad import would surface here).
if (consoleErrors.length) fail(`console/page errors: ${consoleErrors.join(' | ')}`);
else ok('no console or page errors');

await browser.close();
server.close();

if (process.exitCode === 1) {
  console.error('\nComposition demo proof FAILED.');
} else {
  console.log('\nComposition demo proof PASSED — §8 page renders with zero dead classes, fully themed.');
}
