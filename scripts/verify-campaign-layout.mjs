/**
 * verify-campaign-layout.mjs — real-browser e2e proof for devify-ui#377 (Marketing WS-3b).
 *
 * Drives the served dvfy-campaign-layout demo in headless Chromium and asserts the WHOLE
 * POINT of the issue: the landing page renders with a 1:1 ATTENTION RATIO — zero competing
 * nav links. The only clickable conversion paths are the consumer CTAs toward the single
 * goal, plus the single same-page brand self-link; there is NO nav menu / nav escape route.
 *
 * Attention ratio (Gardner) = clickable links ÷ conversion goals; optimal 1:1. This proof:
 *   - asserts ZERO dvfy-nav-bar / dvfy-nav-menu / dvfy-nav on the page (the layout omits them),
 *   - counts every clickable link (real <a> + every element with role="link", e.g. dvfy-button[href]),
 *   - asserts every off-page clickable link is a CTA pointing at the ONE goal destination,
 *   - asserts the only same-page link is the a11y skip link + the brand self-link (#top) — not escapes,
 *   - asserts the page is actually themed (data-theme on <html>) and free of console errors.
 *
 * Reuses the cached Playwright chromium. Spins up a static server on a free port.
 *
 * Usage: node scripts/verify-campaign-layout.mjs
 * Exit 0 = 1:1 holds; exit 1 = a competing nav link / unthemed page / wrong link count.
 */
// eslint-disable-next-line import-x/no-extraneous-dependencies -- dev/CI verify tool; not part of the shipped package (scripts/ is excluded from `files`)
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

// The single conversion goal on this page. Every off-page CTA must point here.
const GOAL_DESTINATION = '/empezar';

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
const url = `http://127.0.0.1:${port}/examples/campaign-layout/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(String(e)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => customElements.get('dvfy-campaign-layout') !== undefined);

console.log(`Campaign-layout e2e (1:1 attention ratio) — ${url}\n`);

// 1. The layout upgraded and produced the page-scaffold landmarks.
const scaffold = await page.evaluate(() => ({
  defined: !!customElements.get('dvfy-campaign-layout'),
  layouts: document.querySelectorAll('dvfy-campaign-layout').length,
  mains: document.querySelectorAll('dvfy-campaign-layout main#main-content').length,
  headers: document.querySelectorAll('dvfy-campaign-layout header').length,
  footers: document.querySelectorAll('dvfy-campaign-layout footer').length,
}));
if (!scaffold.defined) fail('dvfy-campaign-layout did not register as a custom element');
else ok('dvfy-campaign-layout upgraded');
if (scaffold.layouts !== 1) fail(`expected exactly 1 dvfy-campaign-layout, found ${scaffold.layouts}`);
else ok('exactly 1 dvfy-campaign-layout wraps the page');
if (scaffold.mains !== 1) fail(`expected exactly 1 <main id="main-content">, found ${scaffold.mains}`);
else ok('single <main id="main-content"> conversion landmark present');
if (scaffold.headers !== 1) fail(`expected the brand header, found ${scaffold.headers}`);
else ok('brand-mark <header> present');
if (scaffold.footers !== 1) fail(`expected the footer, found ${scaffold.footers}`);
else ok('footer (fine print) landmark present');

// 2. ZERO navigation menus — the layout deliberately omits every site-nav escape route.
const navEscape = await page.evaluate(() => ({
  navBars: document.querySelectorAll('dvfy-nav-bar').length,
  navMenus: document.querySelectorAll('dvfy-nav-menu').length,
  navs: document.querySelectorAll('dvfy-nav').length,
}));
if (navEscape.navBars || navEscape.navMenus || navEscape.navs) {
  fail(`competing navigation present: dvfy-nav-bar=${navEscape.navBars}, dvfy-nav-menu=${navEscape.navMenus}, dvfy-nav=${navEscape.navs}`);
} else ok('zero dvfy-nav-bar / dvfy-nav-menu / dvfy-nav (no site-nav escape routes)');

// 3. THE ATTENTION-RATIO PROOF. Enumerate every clickable link on the page:
//    real <a> anchors + every element with role="link" (dvfy-button[href] becomes role=link).
//    Classify each as: off-page CTA (→ the goal), same-page anchor (skip/brand self-link), or LEAK.
const links = await page.evaluate(() => {
  const out = [];
  // Real anchors
  for (const a of document.querySelectorAll('a[href]')) {
    out.push({ kind: 'a', href: a.getAttribute('href'), text: (a.textContent || '').trim().slice(0, 40) });
  }
  // role="link" hosts (dvfy-button[href] etc.) that are NOT also <a>
  for (const el of document.querySelectorAll('[role="link"]')) {
    if (el.tagName === 'A') continue;
    out.push({ kind: el.tagName.toLowerCase(), href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) });
  }
  return out;
});

const samePage = links.filter(l => l.href && l.href.startsWith('#'));
const offPage = links.filter(l => !l.href || !l.href.startsWith('#'));

console.log(`\n  link inventory — ${links.length} clickable link(s):`);
for (const l of links) console.log(`    [${l.href && l.href.startsWith('#') ? 'same-page' : 'off-page '}] <${l.kind}> href="${l.href}" — "${l.text}"`);
console.log('');

// 3a. Every same-page link must be a non-escape anchor: the skip link (#main-content) or the
//     brand self-link (#top). Anything else on-page that isn't one of those is suspect.
const allowedSamePage = new Set(['#main-content', '#top']);
const samePageLeaks = samePage.filter(l => !allowedSamePage.has(l.href));
if (samePageLeaks.length) fail(`unexpected same-page links: ${samePageLeaks.map(l => l.href).join(', ')}`);
else ok(`same-page links are non-escape only (${samePage.map(l => l.href).join(', ')})`);

// 3b. THE CORE ASSERTION: every off-page clickable link is a CTA pointing at the ONE goal.
//     Zero off-page link may point anywhere other than the single conversion destination.
const goalCtas = offPage.filter(l => l.href === GOAL_DESTINATION);
const leaks = offPage.filter(l => l.href !== GOAL_DESTINATION);
if (leaks.length) {
  fail(`attention-ratio LEAK — off-page link(s) not pointing at the goal (${GOAL_DESTINATION}): ${leaks.map(l => `${l.href} "${l.text}"`).join('; ')}`);
} else {
  ok(`every off-page link is a CTA → the single goal "${GOAL_DESTINATION}" (${goalCtas.length} CTA(s))`);
}

// 3c. Compute the attention ratio explicitly. competing links (= off-page, not the goal) ÷ goal must be 0.
//     i.e. clickable conversion links ÷ conversion goals == CTA count ÷ 1 (the page has exactly one goal).
const competingLinks = leaks.length;
if (competingLinks !== 0) fail(`attention ratio is NOT 1:1 — ${competingLinks} competing link(s) leak attention`);
else ok(`attention ratio 1:1 holds — 0 competing links; ${goalCtas.length} CTA(s) all → 1 goal`);

// 3d. Sanity: there IS at least one CTA (a page with no conversion path is also wrong).
if (goalCtas.length < 1) fail('no conversion CTA found — the single conversion path is missing');
else ok(`${goalCtas.length} conversion CTA(s) present (the single path exists)`);

// 4. Page is actually THEMED (renting-ideal on <html>), not unthemed.
const theme = await page.evaluate(() => ({
  dataTheme: document.documentElement.getAttribute('data-theme'),
  headerBg: (() => {
    const h = document.querySelector('dvfy-campaign-layout header');
    return h ? getComputedStyle(h).backgroundColor : null;
  })(),
  bodyBg: getComputedStyle(document.body).backgroundColor,
}));
if (theme.dataTheme !== 'renting-ideal') fail(`page not themed via data-theme (got ${theme.dataTheme})`);
else ok(`page themed: data-theme=${theme.dataTheme}, header bg=${theme.headerBg}, body bg=${theme.bodyBg}`);
if (!theme.headerBg || theme.headerBg === 'rgba(0, 0, 0, 0)' || theme.headerBg === 'transparent') {
  fail(`brand header background did not resolve to a token (got ${theme.headerBg})`);
} else ok('brand header background resolves to a semantic surface token (themed, not transparent)');

// 5. Zero invented dvfy-* utility classes inside the composed page (closed vocabulary holds).
const strayClasses = await page.evaluate(() => {
  const bad = [];
  const allowed = new Set([
    'dvfy-campaign-layout__skip', 'dvfy-campaign-layout__header', 'dvfy-campaign-layout__brand',
    'dvfy-campaign-layout__brand-text', 'dvfy-campaign-layout__logo', 'dvfy-campaign-layout__main',
    'dvfy-campaign-layout__footer',
  ]);
  for (const el of document.querySelectorAll('body *')) {
    for (const c of el.classList) {
      if (c.startsWith('dvfy-') && !allowed.has(c)) bad.push(`${el.tagName.toLowerCase()}.${c}`);
    }
  }
  return bad;
});
if (strayClasses.length) fail(`invented/dead dvfy-* utility classes found: ${strayClasses.join(', ')}`);
else ok('zero invented dvfy-* utility classes (only the layout BEM internals)');

// 6. No console / page errors.
if (consoleErrors.length) fail(`console/page errors: ${consoleErrors.join(' | ')}`);
else ok('no console or page errors');

await browser.close();
server.close();

if (process.exitCode === 1) {
  console.error('\nCampaign-layout 1:1 proof FAILED.');
} else {
  console.log('\nCampaign-layout 1:1 proof PASSED — landing renders with a 1:1 attention ratio, zero competing nav links, fully themed.');
}
