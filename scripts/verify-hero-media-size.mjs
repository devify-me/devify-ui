/**
 * verify-hero-media-size.mjs — real-browser e2e eyeball for the dvfy-section-hero
 * media-sizing fix (rueda "image is extremely large" / full-bleed bug).
 *
 * Loads the ACTUAL shipped bundle (devify.css + devify.js, complete light theme on
 * <html data-theme>) — not the test harness — renders the hero with
 * media-position="above" aspect-ratio="4 / 3", and proves the rendered media is
 * bounded + centered at desktop width and scales DOWN at mobile width without
 * overflow. Before the fix the media spanned the full ~1280px hero (full-bleed banner).
 *
 * Reuses the cached Playwright chromium. Spins up a static server on a free port.
 *
 * Usage: node scripts/verify-hero-media-size.mjs
 * Exit 0 = bounded + responsive; exit 1 = full-bleed / overflow regression.
 */
// eslint-disable-next-line import-x/no-extraneous-dependencies -- dev/CI verify tool; scripts/ excluded from `files`
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

const PAGE = `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="/devify.css" />
  <script type="module" src="/devify.js"></script>
</head>
<body style="margin:0">
  <main>
    <dvfy-section-hero media-position="above" aspect-ratio="4 / 3" tone="brand" padding="xl">
      <h1>See it before you buy it.</h1>
      <p>A focused hero visual — not a full-page banner.</p>
      <dvfy-button variant="primary" size="lg">Get started</dvfy-button>
      <img slot="media" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23888'/%3E%3C/svg%3E" alt="Hero" />
    </dvfy-section-hero>
  </main>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  try {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/' || rel === '') { res.writeHead(200, { 'Content-Type': 'text/html' }).end(PAGE); return; }
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

const fail = (msg) => { console.error('  FAIL:', msg); process.exitCode = 1; };
const ok = msg => console.log('  ok —', msg);

await new Promise(r => server.listen(0, r));
const port = server.address().port;
const base = `http://localhost:${port}/`;

const browser = await chromium.launch();
try {
  // ── Desktop: media must be bounded + centered, NOT full-bleed ──
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(base);
  await desktop.waitForFunction(() => customElements.get('dvfy-section-hero'));
  const d = await desktop.evaluate(() => {
    const host = document.querySelector('dvfy-section-hero');
    const media = document.querySelector('[slot="media"]');
    const hb = host.getBoundingClientRect();
    const mb = media.getBoundingClientRect();
    return {
      maxWidth: getComputedStyle(media).maxWidth,
      mediaW: mb.width, hostW: hb.width,
      leftGap: mb.left - hb.left, rightGap: hb.right - mb.right,
    };
  });
  if (d.maxWidth === 'none') fail(`media max-width resolved to none (token --dvfy-container-md missing?)`);
  else ok(`media max-width resolves to ${d.maxWidth} (token-bound, not none)`);
  // 448px cap (28rem). Full-bleed regression would be ~1216px (host minus padding).
  if (d.mediaW > 460) fail(`desktop media is ${Math.round(d.mediaW)}px wide on a ${Math.round(d.hostW)}px hero — full-bleed banner regression`);
  else ok(`desktop media is ${Math.round(d.mediaW)}px wide on a ${Math.round(d.hostW)}px hero — bounded, reads as a hero visual`);
  if (Math.abs(d.leftGap - d.rightGap) > 2) fail(`media not centered (left ${Math.round(d.leftGap)} vs right ${Math.round(d.rightGap)})`);
  else ok(`media centered (left/right gaps ≈ ${Math.round(d.leftGap)}px)`);

  // ── Mobile: media scales DOWN, never overflows the host content box ──
  const mobile = await browser.newPage({ viewport: { width: 360, height: 740 } });
  await mobile.goto(base);
  await mobile.waitForFunction(() => customElements.get('dvfy-section-hero'));
  const m = await mobile.evaluate(() => {
    const host = document.querySelector('dvfy-section-hero');
    const media = document.querySelector('[slot="media"]');
    return {
      mediaW: media.getBoundingClientRect().width,
      hostInnerW: host.clientWidth - parseFloat(getComputedStyle(host).paddingLeft) - parseFloat(getComputedStyle(host).paddingRight),
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  if (m.mediaW > m.hostInnerW + 1) fail(`mobile media (${Math.round(m.mediaW)}px) overflows host content box (${Math.round(m.hostInnerW)}px)`);
  else ok(`mobile media is ${Math.round(m.mediaW)}px, fluid within the ${Math.round(m.hostInnerW)}px content box — scales down`);
  if (m.docOverflow > 1) fail(`page has horizontal overflow (${m.docOverflow}px) at 360px`);
  else ok(`no horizontal page overflow at 360px`);
} finally {
  await browser.close();
  server.close();
}

if (process.exitCode) console.error('\nverify-hero-media-size: FAILED');
else console.log('\nverify-hero-media-size: OK — hero media is bounded + responsive');
