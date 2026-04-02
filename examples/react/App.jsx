/**
 * @devify/ui + React — production-ready usage pattern
 *
 * Setup (Vite or CRA):
 *   npm install @devify/ui
 *
 * In main.jsx / index.jsx:
 *   import '@devify/ui';           // register all components
 *   import '@devify/ui/devify.css'; // design tokens
 *
 * TypeScript users: add to vite.config.ts or tsconfig:
 *   "@types/react": { "compilerOptions": { "customElements": "allowAll" } }
 *   or declare module types via a .d.ts file (see gotchas below).
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Reusable wrapper hooks ────────────────────────────────────────────────────

/**
 * Hook: attach a DOM event listener to a ref and clean it up.
 *
 * GOTCHA: React's synthetic event system does NOT propagate CustomEvents.
 * You MUST use addEventListener on the actual DOM node.
 */
function useCustomEvent(ref, eventName, handler) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !handler) return;
    el.addEventListener(eventName, handler);
    return () => el.removeEventListener(eventName, handler);
  }, [ref, eventName, handler]);
}

/**
 * Hook: sync a boolean attribute on a custom element.
 *
 * GOTCHA: React passes boolean `true` as the string "true", which doesn't
 * match attribute-presence checks in web components. Use this hook instead.
 */
function useBoolAttr(ref, attrName, value) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    value ? el.setAttribute(attrName, '') : el.removeAttribute(attrName);
  }, [ref, attrName, value]);
}

// ─── Wrapper components ────────────────────────────────────────────────────────

/**
 * Two-way bound <dvfy-switch> wrapper.
 *
 * @param {{ label: string, checked: boolean, onChange: (value: boolean) => void }} props
 */
export function DvfySwitch({ label, checked, onChange }) {
  const ref = useRef(null);
  useBoolAttr(ref, 'checked', checked);
  useCustomEvent(ref, 'change', useCallback((e) => {
    onChange?.(e.detail?.checked ?? ref.current?.hasAttribute('checked'));
  }, [onChange]));
  return <dvfy-switch ref={ref} label={label} />;
}

/**
 * Controlled <dvfy-input> wrapper.
 *
 * @param {{ label: string, value: string, onInput: (value: string) => void }} props
 */
export function DvfyInput({ label, value, onInput, ...rest }) {
  const ref = useRef(null);

  useCustomEvent(ref, 'input', useCallback((e) => {
    onInput?.(e.target?.value ?? e.detail?.value ?? '');
  }, [onInput]));

  // Keep the underlying <input> value in sync with React state
  useEffect(() => {
    const el = ref.current;
    if (!el || value === undefined) return;
    const inner = el.querySelector('input');
    if (inner && inner.value !== value) inner.value = value;
  }, [value]);

  return <dvfy-input ref={ref} label={label} {...rest} />;
}

/**
 * <dvfy-button> wrapper with boolean attribute handling.
 *
 * @param {{ children, onClick, variant, size, disabled, loading }} props
 */
export function DvfyButton({ children, onClick, variant, size, disabled, loading }) {
  const ref = useRef(null);
  useBoolAttr(ref, 'disabled', disabled);
  useBoolAttr(ref, 'loading', loading);
  useCustomEvent(ref, 'click', onClick);
  return <dvfy-button ref={ref} variant={variant} size={size}>{children}</dvfy-button>;
}

/**
 * <dvfy-tabs> with onTabChange callback.
 *
 * @param {{ children, onTabChange: (label: string) => void }} props
 */
export function DvfyTabs({ children, onTabChange }) {
  const ref = useRef(null);
  useCustomEvent(ref, 'tab-change', useCallback((e) => {
    onTabChange?.(e.detail?.label);
  }, [onTabChange]));
  return <dvfy-tabs ref={ref}>{children}</dvfy-tabs>;
}

// ─── Example usage ─────────────────────────────────────────────────────────────

export default function App() {
  const [notifications, setNotifications] = useState(true);
  const [query, setQuery]                 = useState('');
  const [saving, setSaving]               = useState(false);
  const [activeTab, setActiveTab]         = useState('Overview');

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--dvfy-space-8)' }}>
      <h1>@devify/ui + React</h1>

      {/* Static attributes work without a wrapper */}
      <dvfy-alert variant="info" title="Framework note" style={{ marginBottom: 'var(--dvfy-space-6)' }}>
        Pure display components need no wrapper. Only interactive components
        that emit CustomEvents or use boolean attributes need thin wrappers.
      </dvfy-alert>

      {/* Two-way switch */}
      <DvfySwitch
        label="Enable notifications"
        checked={notifications}
        onChange={setNotifications}
      />
      <p style={{ fontSize: 'var(--dvfy-text-sm)', color: 'var(--dvfy-text-secondary)', marginTop: 'var(--dvfy-space-1)' }}>
        Notifications: {notifications ? 'ON' : 'OFF'}
      </p>

      {/* Controlled input */}
      <DvfyInput
        label="Search"
        value={query}
        onInput={setQuery}
        placeholder="Type to search…"
        style={{ marginTop: 'var(--dvfy-space-4)' }}
      />

      {/* Button with loading state */}
      <DvfyButton
        variant="primary"
        loading={saving}
        disabled={saving}
        onClick={handleSave}
        style={{ marginTop: 'var(--dvfy-space-4)' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </DvfyButton>

      {/* Tabs with onTabChange */}
      <DvfyTabs onTabChange={setActiveTab} style={{ marginTop: 'var(--dvfy-space-8)' }}>
        <dvfy-tab label="Overview" active="">
          <p>Overview content. Active tab state: <strong>{activeTab}</strong></p>
        </dvfy-tab>
        <dvfy-tab label="Settings">
          <p>Settings content</p>
        </dvfy-tab>
      </DvfyTabs>

      {/* Display-only components — no wrapper needed */}
      <div style={{ marginTop: 'var(--dvfy-space-6)', display: 'flex', gap: 'var(--dvfy-space-2)' }}>
        <dvfy-badge>Default</dvfy-badge>
        <dvfy-badge variant="success">Success</dvfy-badge>
        <dvfy-badge variant="warning">Warning</dvfy-badge>
      </div>
    </div>
  );
}

// ─── Gotchas summary ───────────────────────────────────────────────────────────
//
// 1. CustomEvents → use addEventListener via useRef, not onClick/onChange.
//    React's synthetic events don't capture bubbling CustomEvents.
//
// 2. Boolean attributes → pass "" (empty string) or use setAttribute/removeAttribute.
//    React converts `disabled={true}` to the string "true", not attribute presence.
//    Pattern: <dvfy-button disabled={isDisabled ? "" : undefined}>
//    Or use the useBoolAttr hook above.
//
// 3. TypeScript → add global JSX type declarations in a dvfy.d.ts file:
//    declare global {
//      namespace JSX {
//        interface IntrinsicElements {
//          'dvfy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
//            variant?: string; size?: string; disabled?: string; loading?: string;
//          };
//          // ... add others as needed
//        }
//      }
//    }
//
// 4. Server-side rendering (Next.js) → custom elements are browser-only.
//    Wrap component usage in a dynamic import with { ssr: false }:
//    const DvfyButton = dynamic(() => import('./DvfyButton'), { ssr: false });
//
// 5. ref on custom elements → React 18 forwards refs to the DOM node directly.
//    No need for forwardRef on these wrappers.
