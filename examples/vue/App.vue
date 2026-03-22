<!--
  @devify/ui + Vue 3 SFC — production-ready usage pattern

  Setup (Vite):
    npm install @devify/ui

  In main.ts:
    import '@devify/ui';
    import '@devify/ui/devify.css';

  In vite.config.ts — declare dvfy-* as custom elements to suppress warnings:
    import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'

    export default defineConfig({
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag) => tag.startsWith('dvfy-'),
            },
          },
        }),
      ],
    })

  Nuxt users: add to nuxt.config.ts:
    vue: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('dvfy-'),
      },
    }
    // and wrap client-only code in <ClientOnly> or a .client.vue component
-->

<template>
  <div style="max-width: 640px; margin: 0 auto; padding: var(--dvfy-space-8)">
    <h1>@devify/ui + Vue 3</h1>

    <dvfy-alert variant="info" title="Key patterns" style="margin-bottom: var(--dvfy-space-6)">
      Use <code>:attr="value ? '' : undefined"</code> for boolean attributes.
      Use <code>@event-name</code> for CustomEvents — Vue 3 handles them natively.
    </dvfy-alert>

    <!-- ── Switch ─────────────────────────────────────────────── -->
    <!--
      Boolean attr pattern: bind to "" (adds attribute) or undefined (removes it).
      @change fires on the "change" CustomEvent dispatched by dvfy-switch.
    -->
    <dvfy-switch
      label="Enable notifications"
      :checked="notifications ? '' : undefined"
      @change="notifications = $event.detail?.checked ?? !notifications"
    />
    <p style="font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary)">
      Notifications: {{ notifications ? 'ON' : 'OFF' }}
    </p>

    <!-- ── Controlled input ──────────────────────────────────── -->
    <!--
      v-model doesn't bind to custom elements by default.
      Vue 3.4+ supports v-model:value for elements that dispatch
      an "update:value" event — dvfy-input dispatches "input" instead,
      so use the explicit :value + @input pattern.
    -->
    <dvfy-input
      label="Your name"
      :value="name"
      @input="name = $event.target?.value ?? $event.detail?.value ?? ''"
      placeholder="Jane Smith"
      required
      style="margin-top: var(--dvfy-space-4)"
    />

    <!-- ── Checkbox ───────────────────────────────────────────── -->
    <dvfy-checkbox
      label="Accept terms"
      :checked="accepted ? '' : undefined"
      @change="accepted = $event.detail?.checked ?? !accepted"
      style="margin-top: var(--dvfy-space-4)"
    />

    <!-- ── Select ─────────────────────────────────────────────── -->
    <dvfy-select
      label="Priority"
      @change="priority = $event.target?.value"
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
      :value="notes"
      @input="notes = $event.target?.value ?? $event.detail?.value ?? ''"
      placeholder="Optional notes…"
      style="margin-top: var(--dvfy-space-4)"
    />

    <!-- ── Button ─────────────────────────────────────────────── -->
    <!--
      loading and disabled are boolean attrs — use the "" / undefined pattern.
      @click fires the native click event.
    -->
    <dvfy-button
      :disabled="saving ? '' : undefined"
      :loading="saving ? '' : undefined"
      @click="handleSave"
      style="margin-top: var(--dvfy-space-4)"
    >
      {{ saving ? 'Saving…' : 'Save' }}
    </dvfy-button>

    <!-- ── Success message ───────────────────────────────────── -->
    <dvfy-alert
      v-if="saved"
      variant="success"
      title="Saved!"
      dismissible
      style="margin-top: var(--dvfy-space-4)"
    >
      Hello, {{ name }}!
    </dvfy-alert>

    <!-- ── Tabs ───────────────────────────────────────────────── -->
    <!--
      @tab-change fires with detail: { label } when the user clicks a tab.
      Control which tab is active by binding the "active" boolean attr.
    -->
    <dvfy-tabs
      @tab-change="activeTab = $event.detail?.label"
      style="margin-top: var(--dvfy-space-8)"
    >
      <dvfy-tab
        label="Overview"
        :active="activeTab === 'Overview' ? '' : undefined"
      >
        <p>Overview content. Current tab: <strong>{{ activeTab }}</strong></p>
      </dvfy-tab>
      <dvfy-tab
        label="Settings"
        :active="activeTab === 'Settings' ? '' : undefined"
      >
        <p>Settings content.</p>
      </dvfy-tab>
    </dvfy-tabs>

    <!-- ── Display-only components — no special handling ─────── -->
    <div style="margin-top: var(--dvfy-space-6); display: flex; gap: var(--dvfy-space-2); flex-wrap: wrap">
      <dvfy-badge>Default</dvfy-badge>
      <dvfy-badge variant="success">Success</dvfy-badge>
      <dvfy-badge variant="warning">Warning</dvfy-badge>
      <dvfy-badge variant="danger">Danger</dvfy-badge>
    </div>

    <dvfy-accordion style="margin-top: var(--dvfy-space-8)">
      <dvfy-accordion-item label="Vue 3 gotchas" open>
        <ul style="padding-left: var(--dvfy-space-4); font-size: var(--dvfy-text-sm)">
          <li>Add <code>isCustomElement</code> to compiler options</li>
          <li>Boolean attrs: use <code>"" / undefined</code> pattern</li>
          <li>Events: use <code>@event-name</code> — Vue 3 handles CustomEvents natively</li>
          <li>v-model: not supported on custom elements without defineCustomElement</li>
          <li>Nuxt: use &lt;ClientOnly&gt; for SSR — web components are browser-only</li>
        </ul>
      </dvfy-accordion-item>
    </dvfy-accordion>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const notifications = ref(true);
const name          = ref('');
const accepted      = ref(false);
const priority      = ref('');
const notes         = ref('');
const saving        = ref(false);
const saved         = ref(false);
const activeTab     = ref('Overview');

function handleSave() {
  if (!name.value.trim()) return;
  saving.value = true;
  setTimeout(() => {
    saving.value = false;
    saved.value  = true;
  }, 1200);
}
</script>

<!--
  GOTCHAS SUMMARY
  ───────────────
  1. isCustomElement config — required to suppress "unknown component" warnings.
     Without it, Vue tries to resolve dvfy-button as a Vue component and warns.

  2. Boolean attributes — Vue's :disabled="true" sets the attribute to the
     string "true", not an empty-string presence. Web components check attribute
     presence (el.hasAttribute), so pass "" for present, undefined for absent.
     Pattern: :disabled="isDisabled ? '' : undefined"

  3. Events — Vue 3 delegates to addEventListener natively for unknown events,
     so @change, @input, @tab-change, etc. all work out of the box.
     Vue 2 requires .native modifier — not needed in Vue 3.

  4. v-model — custom elements don't implement the Vue v-model contract
     (modelValue prop + update:modelValue event). Use :value + @input explicitly.
     Vue 3.4 adds <component v-model:value> for elements emitting "update:value",
     but dvfy-* components emit "input" / "change" for web-standards compatibility.

  5. Nuxt / SSR — custom elements are browser-only APIs. Wrap in <ClientOnly>
     or use .client.vue components to avoid hydration mismatches.

  6. TypeScript — Vue 3 doesn't type-check unknown HTML elements in templates.
     To get type safety, declare them in a .d.ts file:
       import type { DefineComponent } from 'vue'
       declare module '@vue/runtime-dom' {
         interface HTMLAttributes {
           // shared attrs
           label?: string
           variant?: string
           size?: string
           disabled?: string
           loading?: string
         }
       }
-->
