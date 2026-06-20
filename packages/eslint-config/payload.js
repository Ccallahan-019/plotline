import { nextConfig } from './next.js'

/**
 * ESLint configuration for the Payload CMS app.
 *
 * Extends the Next.js config with Payload-specific allowances for config
 * files and collection definitions.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const payloadConfig = [
  ...nextConfig,
  {
    files: ['**/payload.config.ts', '**/payload.config.js', '**/payload.config.mjs'],
    rules: {
      // Payload requires a default export for the config object.
      'import/no-default-export': 'off',
    },
  },
  {
    files: [
      '**/collections/**/*.ts',
      '**/globals/**/*.ts',
      '**/fields/**/*.ts',
      '**/hooks/**/*.ts',
      '**/access/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
