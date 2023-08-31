import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup/idb.ts'],
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
})
