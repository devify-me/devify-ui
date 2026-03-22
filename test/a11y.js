/**
 * Accessibility audit using axe-playwright.
 * Checks the catalog against WCAG 2.1 AA standards.
 * Run after starting the catalog server: npm run serve
 */
import { chromium } from 'playwright';
import { checkA11y, injectAxe } from 'axe-playwright';

const BASE_URL = 'http://localhost:8090/catalog/';

// Routes to audit
const ROUTES = [
  '',                              // overview
  '#overview',
  '#tokens/colors',
  '#tokens/typography',
  '#components/dvfy-button',
  '#components/dvfy-input',
  '#components/dvfy-modal',
];

let browser;
let page;
let violations = 0;

try {
  browser = await chromium.launch();
  page = await browser.newPage();

  for (const route of ROUTES) {
    const url = BASE_URL + route;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await injectAxe(page);

    try {
      await checkA11y(page, null, {
        axeOptions: {
          runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        },
        includedImpacts: ['critical', 'serious'],
        detailedReport: true,
        detailedReportOptions: { html: false },
      });
      console.log(`✓  ${url}`);
    } catch (err) {
      console.error(`✗  ${url}`);
      console.error(err.message);
      violations++;
    }
  }
} finally {
  await browser?.close();
}

if (violations > 0) {
  console.error(`\nAccessibility audit failed: ${violations} page(s) have violations`);
  process.exit(1);
}

console.log('\nAccessibility audit passed');
