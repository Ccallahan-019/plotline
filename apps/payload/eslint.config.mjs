import { payloadConfig } from '@plotline/eslint-config/payload'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...payloadConfig,
  {
    ignores: ['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts'],
  },
]
