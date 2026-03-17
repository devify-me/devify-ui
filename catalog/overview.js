/**
 * catalog/overview.js — Landing page renderer
 */
import { COMPONENT_CATEGORIES, HTMX_PATTERNS, TOKEN_GROUPS } from './data.js';

export function renderOverview(mainEl) {
  const componentCount = Object.values(COMPONENT_CATEGORIES).flat().length;
  const patternCount = Object.keys(HTMX_PATTERNS).length;
  const tokenGroupCount = Object.keys(TOKEN_GROUPS).length;

  // Title
  const title = document.createElement('h1');
  title.textContent = '@devify/ui';
  title.style.cssText = 'font-size: var(--dvfy-text-4xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-2); font-family: var(--dvfy-font-brand);';
  mainEl.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Design System Explorer';
  subtitle.style.cssText = 'font-size: var(--dvfy-text-lg); color: var(--dvfy-text-secondary); margin-bottom: var(--dvfy-space-8);';
  mainEl.appendChild(subtitle);

  // Stats row
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--dvfy-space-4); margin-bottom: var(--dvfy-space-8);';

  const stats = [
    { label: 'Components', value: componentCount, hash: '#components/dvfy-button' },
    { label: 'HTMX Patterns', value: patternCount, hash: '#patterns/dvfy-htmx-form' },
    { label: 'Token Groups', value: tokenGroupCount, hash: '#tokens/colors' },
  ];

  for (const stat of stats) {
    const card = document.createElement('dvfy-card');
    card.style.cssText = 'cursor: pointer; text-align: center; padding: var(--dvfy-space-6);';
    card.addEventListener('click', () => { location.hash = stat.hash; });

    const val = document.createElement('div');
    val.textContent = stat.value;
    val.style.cssText = 'font-size: var(--dvfy-text-4xl); font-weight: var(--dvfy-weight-bold); color: var(--dvfy-primary-bg);';
    card.appendChild(val);

    const lbl = document.createElement('div');
    lbl.textContent = stat.label;
    lbl.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary); margin-top: var(--dvfy-space-1);';
    card.appendChild(lbl);

    statsRow.appendChild(card);
  }
  mainEl.appendChild(statsRow);

  // Quick links
  const linksTitle = document.createElement('h2');
  linksTitle.textContent = 'Explore';
  linksTitle.style.cssText = 'font-size: var(--dvfy-text-xl); font-weight: var(--dvfy-weight-semibold); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(linksTitle);

  const linksGrid = document.createElement('div');
  linksGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: var(--dvfy-space-4);';

  const quickLinks = [
    { title: 'Colors', desc: '11 color families with full shade scale', hash: '#tokens/colors' },
    { title: 'Typography', desc: 'Font families, sizes, weights, and spacing', hash: '#tokens/typography' },
    { title: 'Spacing', desc: 'Base-4 spacing scale with visual bars', hash: '#tokens/spacing' },
    { title: 'Elevation', desc: '7-level shadow system with live preview', hash: '#tokens/elevation' },
    { title: 'Components', desc: `${componentCount} components with live playground`, hash: '#components/dvfy-button' },
    { title: 'Brand Settings', desc: 'Live-edit semantic tokens and export themes', hash: '#brand' },
  ];

  for (const link of quickLinks) {
    const card = document.createElement('dvfy-card');
    card.style.cssText = 'cursor: pointer; padding: var(--dvfy-space-4);';
    card.addEventListener('click', () => { location.hash = link.hash; });

    const h = document.createElement('h3');
    h.textContent = link.title;
    h.style.cssText = 'font-size: var(--dvfy-text-base); font-weight: var(--dvfy-weight-semibold); margin-bottom: var(--dvfy-space-1);';
    card.appendChild(h);

    const p = document.createElement('p');
    p.textContent = link.desc;
    p.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary); margin: 0;';
    card.appendChild(p);

    linksGrid.appendChild(card);
  }
  mainEl.appendChild(linksGrid);
}
