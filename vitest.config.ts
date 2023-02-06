/// <reference types="vitest" />

import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      exclude: [
        '**/build',
        'packages/remix-themes/src/**/*.test.ts',
        'packages/remix-themes/src/**/*.test.tsx',
      ],
      excludeNodeModules: true,
    },
    include: [
      'packages/remix-themes/src/**/*.test.ts',
      'packages/remix-themes/src/**/*.test.tsx',
    ],
    setupFiles: ['./setup-test-env.ts'],
  },
})
