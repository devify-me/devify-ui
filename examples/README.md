# @devify/ui — Framework Integration Examples

@devify/ui is built on standard Web Components (Light DOM, no Shadow DOM). Every component works in any framework or no framework at all.

## Quick Reference

| Framework | Works? | Config needed | Event handling | Boolean attrs |
|-----------|--------|---------------|----------------|---------------|
| Vanilla HTML | ✅ | None | `addEventListener` | `setAttribute('')` |
| HTMX | ✅ | None | `hx-trigger="eventname"` | HTML attributes |
| React 18 | ✅ | None | `useRef` + `addEventListener` | `attr={val ? "" : undefined}` |
| Vue 3 | ✅ | `isCustomElement` | `@eventname` | `attr={val ? '' : undefined}` |
| Svelte 5 | ✅ | None | `on:eventname` | `attr={val ? '' : undefined}` |

## Examples

| Directory | Framework | Description |
|-----------|-----------|-------------|
| [`vanilla/`](vanilla/index.html) | Vanilla HTML | Reference implementation — all components, no framework |
| [`htmx/`](htmx/index.html) | HTMX | All 5 HTMX patterns with `hx-*` attributes |
| [`react/`](react/index.html) | React 18 | CDN demo + `App.jsx` production patterns |
| [`vue/`](vue/index.html) | Vue 3 | CDN demo + `App.vue` SFC with Vite setup |
| [`svelte/`](svelte/index.html) | Svelte 5 | CDN demo + `App.svelte` SvelteKit setup |

## Installation

```bash
npm install @devify/ui
```

Then in your app entry point:

```js
import '@devify/ui';           // register all custom elements
import '@devify/ui/devify.css'; // design tokens (CSS custom properties)
```

Or pick individual components:

```js
import '@devify/ui/components/dvfy-button.js';
import '@devify/ui/components/dvfy-input.js';
```

## Framework-Specific Setup

### HTMX

No setup required. HTMX observes the Light DOM directly, so `hx-*` attributes on or around `dvfy-*` elements work as expected.

```html
<!-- Load HTMX and @devify/ui -->
<script src="https://unpkg.com/htmx.org@2.0.4/dist/htmx.min.js" defer></script>
<script type="module" src="/node_modules/@devify/ui/devify.js"></script>
```

### React 18

No configuration required. React 18 forwards unknown attributes to the DOM.

**Two key gotchas:**

1. **Custom events** — React's synthetic event system doesn't capture `CustomEvent`s. Use `useRef` + `addEventListener`:

```jsx
function DvfySwitch({ checked, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.addEventListener('change', (e) => onChange(e.detail?.checked));
    return () => el.removeEventListener('change', ...);
  }, []);
  return <dvfy-switch ref={ref} checked={checked ? "" : undefined} />;
}
```

2. **Boolean attributes** — React passes `true` as the string `"true"`, which doesn't match attribute-presence checks. Use `""` for present, `undefined` for absent:

```jsx
// Wrong:  <dvfy-button disabled={true}>
// Correct: <dvfy-button disabled={isDisabled ? "" : undefined}>
```

**TypeScript** — add to a `.d.ts` file:

```ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dvfy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: string; size?: string; disabled?: string; loading?: string;
      };
      // add more as needed
    }
  }
}
```

**Next.js (SSR)** — custom elements are browser-only. Use dynamic imports:

```js
const DvfyButton = dynamic(() => import('./DvfyButton'), { ssr: false });
```

### Vue 3

**Required config** — tell Vue that `dvfy-*` tags are native custom elements, not missing Vue components:

```js
// main.ts
const app = createApp(App);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('dvfy-');
```

In Vite (`vite.config.ts`):

```ts
import vue from '@vitejs/plugin-vue';
export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('dvfy-'),
        },
      },
    }),
  ],
};
```

**Boolean attributes:**

```html
<!-- Pass "" to set attribute, undefined to remove it -->
<dvfy-button :disabled="saving ? '' : undefined">Save</dvfy-button>
```

**Events** — Vue 3 forwards `@eventname` to `addEventListener` natively:

```html
<dvfy-switch @change="notifications = $event.detail?.checked" />
```

**`v-model`** — not supported on custom elements. Use `:value` + `@input`:

```html
<dvfy-input :value="name" @input="name = $event.target?.value" />
```

**Nuxt** — wrap in `<ClientOnly>` for SSR:

```html
<ClientOnly>
  <dvfy-button>Click me</dvfy-button>
</ClientOnly>
```

### Svelte

Svelte has the best native support — **no configuration required**.

**Boolean attributes:**

```svelte
<!-- Pass "" to set attribute, undefined to remove it -->
<dvfy-button disabled={saving ? '' : undefined}>Save</dvfy-button>
```

**Events** — `on:eventname` works natively, including hyphenated names:

```svelte
<dvfy-switch on:change={(e) => notifications = e.detail?.checked} />
<dvfy-tabs on:tab-change={(e) => activeTab = e.detail?.label} />
```

**`bind:value`** — does not work on custom elements. Use `on:input`:

```svelte
<dvfy-input value={name} on:input={(e) => name = e.target?.value} />
```

**SvelteKit SSR** — guard imports for browser-only execution:

```js
// In +layout.svelte or a specific page:
import { browser } from '$app/environment';
import { onMount } from 'svelte';

onMount(async () => {
  if (browser) await import('@devify/ui');
});
```

## Common Gotchas Across All Frameworks

### Boolean Attributes

Web components use **attribute presence** for boolean state. Setting an attribute to the string `"true"` or `"false"` doesn't work — the attribute must either be present (any value) or absent.

| Framework | Correct pattern |
|-----------|----------------|
| React | `disabled={isDisabled ? "" : undefined}` |
| Vue | `:disabled="isDisabled ? '' : undefined"` |
| Svelte | `disabled={isDisabled ? '' : undefined}` |
| Vanilla | `el.setAttribute('disabled', '')` / `el.removeAttribute('disabled')` |

### Custom Events

`dvfy-*` components dispatch standard `CustomEvent`s that bubble up the DOM. The event detail varies per component — check the JSDoc in each component file.

```js
// All components use this pattern:
element.dispatchEvent(new CustomEvent('change', {
  bubbles: true,
  composed: false,  // stays within Light DOM — won't cross Shadow DOM boundaries
  detail: { checked: true }  // component-specific detail
}));
```

### CSS Custom Properties

Tokens are exposed as CSS custom properties on `:root`. They work identically across all frameworks since they're resolved by the browser's CSS engine.

```css
/* Override a token globally */
:root {
  --dvfy-primary-bg: #your-brand-color;
}

/* Or scope to a component */
dvfy-button.special {
  --dvfy-primary-bg: hotpink;
}
```

### HTMX `hx-trigger` with CustomEvents

HTMX's `hx-trigger` can listen for any DOM event, including custom events from `dvfy-*` components:

```html
<!-- Triggers POST /toggle when dvfy-switch fires a "change" event -->
<dvfy-switch
  hx-post="/toggle"
  hx-trigger="change"
  hx-swap="none"
></dvfy-switch>
```

## HTMX Patterns Reference

| Pattern | Element | Purpose |
|---------|---------|---------|
| Form submission | `dvfy-htmx-form` | POST/PUT/PATCH with loading, feedback, CSRF |
| Confirmation | `dvfy-confirm` | Modal guard before destructive actions |
| Live search | `dvfy-live-search` | Debounced search → server-rendered results |
| Data table | `dvfy-htmx-table` | Sort/filter/paginate via server requests |
| Infinite scroll | `dvfy-infinite-scroll` | Append pages on scroll |

See [`htmx/index.html`](htmx/index.html) for working examples of all five patterns.
