import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      // App imports use `@/`. The regex leaves scoped packages such as `@plotline/*` alone.
      {
        find: /^@\//,
        replacement: `${path.resolve(rootDir, 'src')}/`,
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
})
