/// <reference types="vitest" />
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from 'vitest/config'

const exclude = ['**/tests/**', '**/index.ts']

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // enable jest-like global test APIs
    globals: true,
    // simulate DOM with happy-dom
    // (requires installing happy-dom as a peer dependency)
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, ...exclude],
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, ...exclude],
    },
  },
})
