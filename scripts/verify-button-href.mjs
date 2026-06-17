/**
 * verify-button-href.mjs — real-browser e2e proof for devify-ui#363.
 *
 * Drives the actual shipped <dvfy-button.js> in headless Chromium and asserts the WHOLE
 * POINT of the issue: a primary CTA with `href` is a REAL link — clicking it actually
 * changes window.location (no stub), Enter navigates too, role=link is set, and a plain
 * (no-href) button still does NOT navigate. Unit tests stub navigation; this proves the
 * browser really moves. Catches the exact rueda "dead hero CTA" regression.
 *
 * Reuses the cached Playwright chromium. Spins up a static server on a free port that
 * serves the repo (so the real component module loads) plus two synthetic routes.
 *
 * Usage: node scripts/verify-button-href.mjs
 * Exit 0 = navigation proven; exit 1 = dead CTA / wrong semantics.
 */
// eslint-disable-next-line import-x/no-extraneous-dependencies -- dev/CI verify tool; not shipped (scripts/ excluded from `files`)
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const HOME = `<!doctype html><html><head><meta charset="utf-8">
<script type="module" src="/components/dvfy-button.js"></script></head>
<body>
  <dvfy-button id="cta" href="/cuestionario" variant="primary">Empezar</dvfy-button>
  <dvfy-button id="plain" variant="outline">No nav</dvfy-button>
</body></html>`;
const DEST = `<!doctype html><html><head><meta charset="utf-8"></head>
<body><h1 id="dest">Cuestionario</h1></body></html>`;

const server = http.createServer(async (req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '/index.html') { res.writeHead(200, { 'Content-Type': 'text/html' }).end(HOME); return; }
  if (rel === '/cuestionario') { res.writeHead(200, { 'Content-Type': 'text/html' }).end(DEST); return; }
  try {
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
});

const fail = (msg) => { console.error('FAIL:', msg); process.exitCode = 1; };
const ok = msg => console.log('  ok —', msg);

await new Promise(r => server.listen(0, r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(String(e)));

try {
  console.log(`button href e2e — ${base}\n`);

  // 1. role=link semantics applied by the real component.
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => customElements.get('dvfy-button') !== undefined);
  const ctaRole = await page.getAttribute('#cta', 'role');
  const plainRole = await page.getAttribute('#plain', 'role');
  ctaRole === 'link' ? ok('href button has role=link') : fail(`cta role=${ctaRole}, expected link`);
  plainRole === 'button' ? ok('no-href button keeps role=button') : fail(`plain role=${plainRole}, expected button`);

  // 2. Click on the href CTA REALLY navigates (no stub).
  await Promise.all([
    page.waitForURL('**/cuestionario'),
    page.click('#cta'),
  ]).catch(() => {});
  if (page.url().endsWith('/cuestionario') && await page.$('#dest')) ok('click on href CTA navigated to /cuestionario');
  else fail(`click did not navigate — url is ${page.url()} (DEAD CTA)`);

  // 3. Enter key on the href CTA REALLY navigates.
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => customElements.get('dvfy-button') !== undefined);
  await page.focus('#cta');
  await Promise.all([
    page.waitForURL('**/cuestionario'),
    page.keyboard.press('Enter'),
  ]).catch(() => {});
  page.url().endsWith('/cuestionario') ? ok('Enter on href CTA navigated') : fail(`Enter did not navigate — url ${page.url()}`);

  // 4. A plain button must NOT navigate (regression guard).
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => customElements.get('dvfy-button') !== undefined);
  await page.click('#plain');
  await page.waitForTimeout(150);
  page.url().endsWith('/') ? ok('no-href button did NOT navigate') : fail(`plain button navigated to ${page.url()}`);

  if (consoleErrors.length) fail(`console errors: ${consoleErrors.join(' | ')}`);
  else ok('no console / page errors');
} finally {
  await browser.close();
  server.close();
}

console.log(process.exitCode ? '\n✗ button href e2e FAILED' : '\n✓ button href e2e passed — CTA navigation is real');
