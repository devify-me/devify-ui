import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: ['components/**/*.test.js', 'patterns/**/*.test.js'],
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
};
