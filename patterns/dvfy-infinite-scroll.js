/**
 * <dvfy-infinite-scroll> — Loads more content when scrolling near bottom.
 *
 * Attributes:
 *   src:          base URL for loading more items
 *   page-param:   query parameter name for page number (default: "page")
 *   start-page:   starting page number (default: "1")
 *   threshold:    pixels from bottom to trigger load (default: "200")
 *   no-more-text: text to show when no more items (default: "No more items")
 *
 * Events:
 *   page-loaded — dispatched after each page loads, detail: { page }
 *
 * Children: initial content (first page items)
 *
 * Usage with Go templates:
 *   <dvfy-infinite-scroll
 *     src="/api/tasks"
 *     page-param="page"
 *     start-page="1"
 *     threshold="300"
 *     no-more-text="All tasks loaded"
 *   >
 *     {{range .Tasks}}
 *       <div class="task-card">
 *         <h3>{{.Title}}</h3>
 *         <p>{{.Description}}</p>
 *       </div>
 *     {{end}}
 *   </dvfy-infinite-scroll>
 *
 *   <!-- With audit log entries -->
 *   <dvfy-infinite-scroll src="/audit?format=partial" start-page="1">
 *     {{template "audit-rows" .Entries}}
 *   </dvfy-infinite-scroll>
 */

const STYLES = `
dvfy-infinite-scroll {
  display: block;
  font-family: var(--dvfy-font-sans);
  position: relative;
}
dvfy-infinite-scroll .dvfy-infinite-scroll__content {
  display: block;
}
dvfy-infinite-scroll .dvfy-infinite-scroll__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--dvfy-space-6) 0;
}
dvfy-infinite-scroll .dvfy-infinite-scroll__loader-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--dvfy-radius-round);
  border: 2px solid var(--dvfy-border-default);
  border-top-color: var(--dvfy-primary-bg);
  animation: dvfy-infinite-scroll-spin 0.7s linear infinite;
}
dvfy-infinite-scroll .dvfy-infinite-scroll__end {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--dvfy-space-6) 0;
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}
dvfy-infinite-scroll .dvfy-infinite-scroll__sentinel {
  height: 1px;
  width: 100%;
}
dvfy-infinite-scroll .dvfy-infinite-scroll__htmx-target {
  display: none;
}
@keyframes dvfy-infinite-scroll-spin { to { transform: rotate(360deg); } }
`;

/**
 * Infinite scroll loader using IntersectionObserver. Loads pages via HTMX or fetch fallback.
 *
 * @element dvfy-infinite-scroll
 *
 * @attr {string} src - Base URL for loading more items
 * @attr {string} page-param - Query parameter name for page number (default: "page")
 * @attr {number} start-page - Starting page number (default: 1)
 * @attr {number} threshold - Pixels from bottom to trigger load (default: 200)
 * @attr {string} no-more-text - Text shown when all items loaded (default: "No more items")
 *
 * @fires page-loaded - New page loaded, detail: { page }
 *
 * @slot - Initial content (first page items)
 *
 * @cssprop {color} --dvfy-primary-bg - Loading spinner accent color
 * @cssprop {color} --dvfy-text-muted - "No more items" text color
 */
class DvfyInfiniteScroll extends HTMLElement {
  static #styled = false;
  #content = null;
  #loader = null;
  #sentinel = null;
  #htmxTarget = null;
  #observer = null;
  #currentPage = 1;
  #loading = false;
  #exhausted = false;

  connectedCallback() {
    if (!DvfyInfiniteScroll.#styled) {
      const s = document.createElement('style');
      s.textContent = STYLES;
      document.head.appendChild(s);
      DvfyInfiniteScroll.#styled = true;
    }
    this.#build();
  }

  disconnectedCallback() {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }

  #build() {
    if (this.#content) return;
    this.#currentPage = parseInt(this.getAttribute('start-page') || '1', 10);

    // Wrap existing children into content container
    const children = Array.from(this.childNodes);
    this.#content = document.createElement('div');
    this.#content.className = 'dvfy-infinite-scroll__content';
    for (const child of children) {
      this.#content.appendChild(child);
    }
    this.appendChild(this.#content);

    // Create loader (hidden initially)
    this.#loader = document.createElement('div');
    this.#loader.className = 'dvfy-infinite-scroll__loader';
    this.#loader.style.display = 'none';
    const spinner = document.createElement('span');
    spinner.className = 'dvfy-infinite-scroll__loader-spinner';
    this.#loader.appendChild(spinner);
    this.appendChild(this.#loader);

    // Create hidden HTMX target — HTMX swaps server HTML here, then we move nodes safely
    this.#htmxTarget = document.createElement('div');
    this.#htmxTarget.className = 'dvfy-infinite-scroll__htmx-target';
    this.appendChild(this.#htmxTarget);

    // Create sentinel element for IntersectionObserver
    this.#sentinel = document.createElement('div');
    this.#sentinel.className = 'dvfy-infinite-scroll__sentinel';
    this.appendChild(this.#sentinel);

    // Listen for HTMX swap completion on the hidden target
    this.#htmxTarget.addEventListener('htmx:afterSwap', (e) => {
      this.#onHtmxSwap(e);
    });

    // Set up IntersectionObserver
    const threshold = parseInt(this.getAttribute('threshold') || '200', 10);
    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.#loading && !this.#exhausted) {
            this.#loadNext();
          }
        }
      },
      {
        rootMargin: '0px 0px ' + threshold + 'px 0px'
      }
    );
    this.#observer.observe(this.#sentinel);
  }

  #loadNext() {
    const src = this.getAttribute('src');
    if (!src) return;

    this.#loading = true;
    this.#loader.style.display = '';

    const pageParam = this.getAttribute('page-param') || 'page';
    const nextPage = this.#currentPage + 1;

    // Build URL with page parameter
    const url = new URL(src, window.location.origin);
    url.searchParams.set(pageParam, String(nextPage));
    this.#htmxTarget.setAttribute('data-next-page', String(nextPage));

    if (typeof htmx !== 'undefined') {
      // Use HTMX to fetch — it swaps into #htmxTarget, then #onHtmxSwap moves nodes
      this.#htmxTarget.setAttribute('hx-get', url.toString());
      this.#htmxTarget.setAttribute('hx-swap', 'innerHTML');
      this.#htmxTarget.setAttribute('hx-target', 'this');
      htmx.process(this.#htmxTarget);
      htmx.trigger(this.#htmxTarget, 'load');
    } else {
      // Fallback: fetch + DOMParser (no raw innerHTML on user-visible elements)
      this.#fetchFallback(url.toString(), nextPage);
    }
  }

  async #fetchFallback(url, nextPage) {
    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (response.status === 204) {
        this.#showEnd();
        return;
      }
      const text = await response.text();
      if (!text.trim()) {
        this.#showEnd();
        return;
      }

      // Parse with DOMParser (sandboxed, no script execution) then move nodes
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const nodes = Array.from(doc.body.childNodes);
      if (!nodes.length) {
        this.#showEnd();
        return;
      }

      for (const node of nodes) {
        // adoptNode transfers ownership to current document safely
        this.#content.appendChild(document.adoptNode(node));
      }

      this.#loading = false;
      this.#loader.style.display = 'none';
      this.#currentPage = nextPage;

      this.dispatchEvent(new CustomEvent('page-loaded', {
        bubbles: true,
        detail: { page: nextPage }
      }));
    } catch (_) {
      this.#loading = false;
      this.#loader.style.display = 'none';
    }
  }

  #onHtmxSwap(_e) {
    const nextPage = parseInt(this.#htmxTarget.getAttribute('data-next-page') || '0', 10);

    // Move all swapped children from htmxTarget into content
    const nodes = Array.from(this.#htmxTarget.childNodes);
    if (!nodes.length) {
      this.#showEnd();
      return;
    }

    for (const node of nodes) {
      this.#content.appendChild(node);
    }

    this.#loading = false;
    this.#loader.style.display = 'none';
    this.#currentPage = nextPage;

    this.dispatchEvent(new CustomEvent('page-loaded', {
      bubbles: true,
      detail: { page: nextPage }
    }));
  }

  #showEnd() {
    this.#exhausted = true;
    this.#loading = false;
    this.#loader.style.display = 'none';

    if (this.#observer) {
      this.#observer.disconnect();
    }

    // Remove sentinel
    if (this.#sentinel && this.#sentinel.parentNode) {
      this.#sentinel.remove();
    }

    const noMoreText = this.getAttribute('no-more-text') || 'No more items';
    const endEl = document.createElement('div');
    endEl.className = 'dvfy-infinite-scroll__end';
    endEl.textContent = noMoreText;
    this.appendChild(endEl);
  }
}

customElements.define('dvfy-infinite-scroll', DvfyInfiniteScroll);
