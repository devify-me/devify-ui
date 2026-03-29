/**
 * <dvfy-live-search> — Debounced search input that loads results via HTMX.
 *
 * Attributes:
 *   src:         URL to search against
 *   param:       query parameter name (default: "q")
 *   target:      CSS selector for results container (default: next sibling)
 *   debounce:    debounce delay in ms (default: "300")
 *   min-chars:   minimum characters before searching (default: "2")
 *   placeholder: input placeholder text (default: "Search...")
 *   swap:        HTMX swap strategy (default: "innerHTML")
 *
 * Events:
 *   search — dispatched on each request, detail: { query }
 *
 * Usage with Go templates:
 *   <!-- Search knowledge base -->
 *   <dvfy-live-search
 *     src="/knowledge/search"
 *     param="q"
 *     target="#kb-results"
 *     min-chars="3"
 *     placeholder="Search knowledge..."
 *   ></dvfy-live-search>
 *   <div id="kb-results">
 *     {{template "knowledge-list" .Entries}}
 *   </div>
 *
 *   <!-- Search audit log with auto-created results container -->
 *   <dvfy-live-search
 *     src="/audit/search"
 *     placeholder="Search audit log..."
 *     debounce="500"
 *   ></dvfy-live-search>
 *
 *   <!-- Filter task list -->
 *   <dvfy-live-search
 *     src="/tasks/filter"
 *     param="search"
 *     target="#task-board"
 *     swap="outerHTML"
 *     min-chars="1"
 *     placeholder="Filter tasks..."
 *   ></dvfy-live-search>
 */

const STYLES = `
dvfy-live-search {
  display: block;
  font-family: var(--dvfy-font-sans);
  position: relative;
}
dvfy-live-search .dvfy-live-search__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
dvfy-live-search .dvfy-live-search__icon {
  position: absolute;
  left: var(--dvfy-space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--dvfy-text-muted);
  pointer-events: none;
  display: flex;
  align-items: center;
}
dvfy-live-search .dvfy-live-search__icon svg {
  width: 1rem;
  height: 1rem;
}
dvfy-live-search .dvfy-live-search__spinner {
  position: absolute;
  right: var(--dvfy-space-3);
  top: 50%;
  transform: translateY(-50%);
  display: none;
}
dvfy-live-search .dvfy-live-search__spinner-circle {
  width: 1rem;
  height: 1rem;
  border-radius: var(--dvfy-radius-round);
  border: 2px solid var(--dvfy-border-default);
  border-top-color: var(--dvfy-primary-bg);
  animation: dvfy-live-search-spin 0.7s linear infinite;
}
dvfy-live-search .dvfy-live-search__input {
  width: 100%;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  padding-left: var(--dvfy-space-9);
  padding-right: var(--dvfy-space-9);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-input-bg);
  border: var(--dvfy-border-1) solid var(--dvfy-input-border);
  border-radius: var(--dvfy-radius-lg);
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
dvfy-live-search .dvfy-live-search__input::placeholder {
  color: var(--dvfy-input-placeholder);
}
dvfy-live-search .dvfy-live-search__input:hover {
  border-color: var(--dvfy-input-border-hover);
}
dvfy-live-search .dvfy-live-search__input:focus {
  border-color: var(--dvfy-input-border-focus);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}
dvfy-live-search .dvfy-live-search__results {
  margin-top: var(--dvfy-space-2);
}
dvfy-live-search--loading .dvfy-live-search__spinner {
  display: flex;
}
@keyframes dvfy-live-search-spin { to { transform: rotate(360deg); } }
`;

/**
 * Debounced search input that loads results via HTMX or fetch fallback.
 *
 * @element dvfy-live-search
 *
 * @attr {string} src - URL to search against
 * @attr {string} param - Query parameter name (default: "q")
 * @attr {string} target - CSS selector for results container (default: auto-created sibling)
 * @attr {number} debounce - Debounce delay in ms (default: 300)
 * @attr {number} min-chars - Minimum characters before searching (default: 2)
 * @attr {string} placeholder - Input placeholder text (default: "Search...")
 * @attr {string} swap - HTMX swap strategy (default: "innerHTML")
 *
 * @fires search - Search request dispatched, detail: { query }
 *
 * @cssprop {color} --dvfy-input-bg - Search input background
 * @cssprop {color} --dvfy-input-border - Search input border color
 * @cssprop {color} --dvfy-primary-bg - Loading spinner accent color
 */
class DvfyLiveSearch extends HTMLElement {
  static #styled = false;
  #input = null;
  #spinner = null;
  #resultsTarget = null;
  #debounceTimer = null;
  #abortController = null;

  connectedCallback() {
    if (!DvfyLiveSearch.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyLiveSearch.#styled = true;
    }
    this.setAttribute('role', 'search');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Live search');
    }
    this.#build();
  }

  disconnectedCallback() {
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);
    if (this.#abortController) this.#abortController.abort();
  }

  #build() {
    const wrapper = document.createElement('div');
    wrapper.className = 'dvfy-live-search__wrapper';

    // Magnifying glass icon (SVG)
    const iconWrap = document.createElement('span');
    iconWrap.className = 'dvfy-live-search__icon';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '11');
    circle.setAttribute('cy', '11');
    circle.setAttribute('r', '8');
    svg.appendChild(circle);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '21');
    line.setAttribute('y1', '21');
    line.setAttribute('x2', '16.65');
    line.setAttribute('y2', '16.65');
    svg.appendChild(line);
    iconWrap.appendChild(svg);
    wrapper.appendChild(iconWrap);

    // Search input
    this.#input = document.createElement('input');
    this.#input.type = 'search';
    this.#input.className = 'dvfy-live-search__input';
    this.#input.placeholder = this.getAttribute('placeholder') || 'Search...';
    this.#input.setAttribute('aria-label', this.getAttribute('placeholder') || 'Search');
    this.#input.setAttribute('autocomplete', 'off');
    wrapper.appendChild(this.#input);

    // Loading spinner
    this.#spinner = document.createElement('span');
    this.#spinner.className = 'dvfy-live-search__spinner';
    const spinCircle = document.createElement('span');
    spinCircle.className = 'dvfy-live-search__spinner-circle';
    this.#spinner.appendChild(spinCircle);
    wrapper.appendChild(this.#spinner);

    this.appendChild(wrapper);

    // Resolve or create results target
    const targetSelector = this.getAttribute('target');
    if (targetSelector) {
      this.#resultsTarget = document.querySelector(targetSelector);
    }
    if (!this.#resultsTarget) {
      this.#resultsTarget = document.createElement('div');
      this.#resultsTarget.className = 'dvfy-live-search__results';
      this.appendChild(this.#resultsTarget);
    }

    // Set up HTMX attributes on the input for HTMX-driven search
    const src = this.getAttribute('src');
    const param = this.getAttribute('param') || 'q';
    const swap = this.getAttribute('swap') || 'innerHTML';
    const debounce = this.getAttribute('debounce') || '300';

    if (src && typeof htmx !== 'undefined') {
      this.#input.setAttribute('hx-get', src);
      this.#input.setAttribute('hx-trigger', 'input changed delay:' + debounce + 'ms, search');
      this.#input.setAttribute('hx-target', targetSelector || '.' + 'dvfy-live-search__results');
      this.#input.setAttribute('hx-swap', swap);
      this.#input.setAttribute('hx-include', 'this');
      this.#input.setAttribute('name', param);

      // Listen for HTMX events for loading state
      this.#input.addEventListener('htmx:beforeRequest', () => {
        this.#spinner.style.display = 'flex';
      });
      this.#input.addEventListener('htmx:afterRequest', () => {
        this.#spinner.style.display = 'none';
      });

      htmx.process(this.#input);
    }

    // Debounced keyup handler (works with and without HTMX)
    this.#input.addEventListener('input', () => this.#onInput());

    // Handle Escape key — clear input and results
    this.#input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.#input.value = '';
        this.#clearResults();
      }
    });
  }

  #onInput() {
    const minChars = parseInt(this.getAttribute('min-chars') || '2', 10);
    const value = this.#input.value.trim();

    if (value.length < minChars) {
      this.#clearResults();
      return;
    }

    // Dispatch search event
    this.dispatchEvent(new CustomEvent('search', {
      bubbles: true,
      detail: { query: value }
    }));

    // If HTMX is not available, use fetch fallback
    if (typeof htmx === 'undefined') {
      this.#fetchSearch(value);
    }
  }

  #fetchSearch(query) {
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);

    const debounce = parseInt(this.getAttribute('debounce') || '300', 10);

    this.#debounceTimer = setTimeout(async () => {
      const src = this.getAttribute('src');
      if (!src) return;

      const param = this.getAttribute('param') || 'q';
      const url = new URL(src, window.location.origin);
      url.searchParams.set(param, query);

      if (this.#abortController) this.#abortController.abort();
      this.#abortController = new AbortController();

      this.#spinner.style.display = 'flex';

      try {
        const response = await fetch(url.toString(), {
          signal: this.#abortController.signal,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const text = await response.text();

        // Parse safely with DOMParser, then move nodes
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const nodes = Array.from(doc.body.childNodes);

        // Clear current results
        while (this.#resultsTarget.firstChild) {
          this.#resultsTarget.removeChild(this.#resultsTarget.firstChild);
        }

        for (const node of nodes) {
          this.#resultsTarget.appendChild(document.adoptNode(node));
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Silently fail — search is non-critical
        }
      } finally {
        this.#spinner.style.display = 'none';
      }
    }, debounce);
  }

  #clearResults() {
    if (this.#debounceTimer) clearTimeout(this.#debounceTimer);
    if (this.#abortController) this.#abortController.abort();

    if (this.#resultsTarget) {
      while (this.#resultsTarget.firstChild) {
        this.#resultsTarget.removeChild(this.#resultsTarget.firstChild);
      }
    }

    this.#spinner.style.display = 'none';
  }

  /** Programmatic access to current search value */
  get value() { return this.#input ? this.#input.value : ''; }
  set value(v) {
    if (this.#input) {
      this.#input.value = v;
      this.#onInput();
    }
  }

  /** Clear the search */
  clear() {
    if (this.#input) this.#input.value = '';
    this.#clearResults();
  }
}

customElements.define('dvfy-live-search', DvfyLiveSearch);
