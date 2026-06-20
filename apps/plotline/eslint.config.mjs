import { nextConfig } from '@plotline/eslint-config/next'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextConfig,
  {
    ignores: ['.next/'],
  },
]
