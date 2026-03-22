import openWcConfig from '@open-wc/eslint-config';
import noUnsanitized from 'eslint-plugin-no-unsanitized';

export default [
  ...openWcConfig,

  // Security: flag unsafe innerHTML/outerHTML assignments
  noUnsanitized.configs.recommended,

  {
    // Project-wide overrides for vanilla JS web components (no Lit)
    rules: {
      // Not a Lit project — disable Lit template rules
      'lit/no-template-bind': 'off',
      'lit/no-duplicate-template-bindings': 'off',
      'lit/no-useless-template-literals': 'off',
      'lit/attribute-value-entities': 'off',
      'lit/binding-positions': 'off',
      'lit/no-invalid-html': 'off',
      'lit/no-value-attribute': 'off',
      'lit/no-invalid-escape-sequences': 'off',
      'lit/no-legacy-template-syntax': 'off',
      'lit/no-private-properties': 'off',
      'lit/no-native-attributes': 'off',
      'lit/no-classfield-shadowing': 'off',
      'lit/lifecycle-super': 'off',

      // lit-a11y rules not applicable to vanilla web components
      'lit-a11y/click-events-have-key-events': 'off',

      // Import rules — browser-native ES modules don't need Node resolution
      'import-x/no-unresolved': 'off',
      'import-x/no-extraneous-dependencies': 'off',

      // class-methods-use-this flags pure private helper methods that
      // don't access `this`. These are valid in vanilla web components;
      // converting them to static requires invasive call-site changes.
      // The lifecycle-method exceptions from open-wc config are preserved.
      'class-methods-use-this': 'off',

      // Prefer const and modern JS
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  {
    // Ignore generated files and node_modules
    ignores: [
      'node_modules/**',
      'custom-elements.json',
      'package-lock.json',
    ],
  },
];
