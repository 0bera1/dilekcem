import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.pdf.test.ts'],
    testTimeout: 60000,
  },
})
