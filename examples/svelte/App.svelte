<!--
  @devify/ui + Svelte 5 — production-ready usage pattern

  Setup (SvelteKit + Vite):
    npm install @devify/ui

  In +layout.svelte or app.html:
    <link rel="stylesheet" href="/node_modules/@devify/ui/devify.css">
    OR in your global CSS:
    @import '@devify/ui/devify.css';

  In +layout.ts (or any .ts/.svelte file that runs in the browser):
    import '@devify/ui';  // registers all custom elements

  No vite.config changes needed — Svelte / Vite handle unknown HTML elements correctly.

  SSR (SvelteKit):
    Custom elements are browser-only. Use onMount or browser guards:
      import { browser } from '$app/environment';
      if (browser) { await import('@devify/ui'); }
    Or place imports inside onMount() to ensure they only run client-side.
-->

<script>
  import { onMount } from 'svelte';

  // State (Svelte 5 runes syntax — use let for Svelte 4 compatibility)
  let notifications = $state(true);
  let name          = $state('');
  let role          = $state('');
  let notes         = $state('');
  let accepted      = $state(false);
  let saving        = $state(false);
  let saved         = $state(false);
  let activeTab     = $state('Overview');

  // Svelte 4 equivalent (without runes):
  // let notifications = true;
  // let name = '';
  // ... etc.

  function handleSave() {
    if (!name.trim()) return;
    saving = true;
    setTimeout(() => {
      saving = false;
      saved  = true;
    }, 1200);
  }

  // SSR guard: import components only in the browser
  onMount(async () => {
    // If you import '@devify/ui' in a shared layout this is not needed.
    // Include it here if this page loads components for the first time.
    // await import('@devify/ui');
  });
</script>

<div style="max-width: 640px; margin: 0 auto; padding: var(--dvfy-space-8)">
  <h1>@devify/ui + Svelte</h1>

  <dvfy-alert variant="info" title="Key patterns" style="margin-bottom: var(--dvfy-space-6)">
    Svelte supports custom elements natively. Use <code>on:eventname</code> for CustomEvents
    and <code>attr={value ? '' : undefined}</code> for boolean attributes.
  </dvfy-alert>

  <!-- ── Switch with two-way binding ───────────────────────── -->
  <!--
    on:change fires on the "change" CustomEvent dispatched by dvfy-switch.
    Svelte forwards all unknown event listeners to addEventListener natively.

    Boolean attr pattern: pass '' (empty string) to set the attribute,
    or undefined / null to remove it.
  -->
  <dvfy-switch
    label="Enable notifications"
    checked={notifications ? '' : undefined}
    on:change={(e) => notifications = e.detail?.checked ?? !notifications}
  ></dvfy-switch>
  <p style="font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary)">
    Notifications: {notifications ? 'ON' : 'OFF'}
  </p>

  <!-- ── Controlled input ──────────────────────────────────── -->
  <!--
    Svelte's bind:value does not work on custom elements because they don't
    implement the value property contract Svelte expects. Use on:input instead.

    Svelte 5 users: same pattern — no special rune needed.
  -->
  <dvfy-input
    label="Your name"
    value={name}
    on:input={(e) => name = e.target?.value ?? e.detail?.value ?? ''}
    placeholder="Jane Smith"
    required
    style="margin-top: var(--dvfy-space-4)"
  ></dvfy-input>

  <!-- ── Checkbox ───────────────────────────────────────────── -->
  <dvfy-checkbox
    label="Accept terms"
    checked={accepted ? '' : undefined}
    on:change={(e) => accepted = e.detail?.checked ?? !accepted}
    style="margin-top: var(--dvfy-space-4)"
  ></dvfy-checkbox>

  <!-- ── Select ─────────────────────────────────────────────── -->
  <dvfy-select
    label="Priority"
    on:change={(e) => role = e.target?.value ?? e.detail?.value}
    style="margin-top: var(--dvfy-space-4)"
  >
    <option value="">Select…</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </dvfy-select>

  <!-- ── Textarea ───────────────────────────────────────────── -->
  <dvfy-textarea
    label="Notes"
    value={notes}
    on:input={(e) => notes = e.target?.value ?? e.detail?.value ?? ''}
    placeholder="Optional notes…"
    style="margin-top: var(--dvfy-space-4)"
  ></dvfy-textarea>

  <!-- ── Button ─────────────────────────────────────────────── -->
  <!--
    Boolean attrs: saving ? '' : undefined — Svelte removes the attribute
    when the value is undefined or null.
  -->
  <dvfy-button
    disabled={saving ? '' : undefined}
    loading={saving ? '' : undefined}
    on:click={handleSave}
    style="margin-top: var(--dvfy-space-4)"
  >
    {saving ? 'Saving…' : 'Save'}
  </dvfy-button>

  <!-- ── Success feedback ───────────────────────────────────── -->
  {#if saved}
    <dvfy-alert
      variant="success"
      title="Saved!"
      dismissible
      style="margin-top: var(--dvfy-space-4)"
    >
      Hello, {name}!
    </dvfy-alert>
  {/if}

  <!-- ── Tabs ───────────────────────────────────────────────── -->
  <!--
    on:tab-change fires with detail: { label } when a tab is activated.
    Svelte handles hyphenated custom event names natively — no escaping needed.
  -->
  <dvfy-tabs
    on:tab-change={(e) => activeTab = e.detail?.label}
    style="margin-top: var(--dvfy-space-8)"
  >
    <dvfy-tab label="Overview" active={activeTab === 'Overview' ? '' : undefined}>
      <p>Overview. Current tab: <strong>{activeTab}</strong></p>
    </dvfy-tab>
    <dvfy-tab label="Settings" active={activeTab === 'Settings' ? '' : undefined}>
      <p>Settings content.</p>
    </dvfy-tab>
  </dvfy-tabs>

  <!-- ── Display-only — no special handling ────────────────── -->
  <div style="margin-top: var(--dvfy-space-6); display: flex; gap: var(--dvfy-space-2); flex-wrap: wrap">
    <dvfy-badge>Default</dvfy-badge>
    <dvfy-badge variant="success">Success</dvfy-badge>
    <dvfy-badge variant="warning">Warning</dvfy-badge>
    <dvfy-badge variant="danger">Danger</dvfy-badge>
  </div>
</div>

<!--
  GOTCHAS SUMMARY
  ───────────────
  1. No config needed — Svelte and Vite treat unknown HTML elements as custom
     elements automatically. No isCustomElement config required.

  2. Boolean attributes — Svelte removes attributes when bound to undefined/null.
     Pattern: checked={value ? '' : undefined}
     Do NOT use checked={value} — Svelte will set it to the string "true"/"false".

  3. Events — on:eventname forwards to addEventListener natively.
     Hyphenated names work: on:tab-change, on:form-success, etc.
     No .native modifier needed (that was a Vue 2 concept).

  4. bind:value — does NOT work on custom elements. Use on:input + value={...}.
     Svelte's bind: directive requires a writable DOM property; dvfy-* components
     use attribute reflection, not a writable value property.

  5. SSR / SvelteKit — custom elements are browser-only. Guard with:
       import { browser } from '$app/environment';
       if (browser) await import('@devify/ui');
     Or import inside onMount() to ensure client-side execution only.

  6. Svelte 5 runes — $state() works the same as let for this use case.
     The on: directive is unchanged in Svelte 5 (still forwards to addEventListener).
     event handlers with on: will eventually migrate to the new syntax:
       <dvfy-switch onchange={handler}> (Svelte 5 unified event syntax)
     but on: remains supported for backwards compatibility.
-->
