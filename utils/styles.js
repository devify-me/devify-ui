const injected = new Set();

export function injectStyles(id, css) {
  if (injected.has(id)) return;
  injected.add(id);
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}
