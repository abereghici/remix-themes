/// <reference types="vitest" />

import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      exclude: ['**/build', '**/src/**/*.test.ts', '**/src/**/*.test.tsx'],
      excludeNodeModules: true,
    },
    setupFiles: ['./setup-test-env.ts'],
  },
})
