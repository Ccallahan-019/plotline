import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'tests/int/**/*.int.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
