import openWc from '@open-wc/eslint-config';

export default [
  ...openWc,
  {
    files: ['**/*.js'],
    rules: {
      // Private methods often manipulate DOM without referencing this
      'class-methods-use-this': 'off',
      // Allow long lines in CSS template literals
      'max-len': 'off',
      // Allow console in scripts
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.js', 'scripts/**/*.js'],
    rules: {
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
  {
    ignores: ['node_modules/**', 'custom-elements.json'],
  },
];
