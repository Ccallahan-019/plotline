# @plotline/payload-types

Generated TypeScript types for the Plotline Payload CMS schema.

## Usage

```typescript
import type { Config } from '@plotline/payload-types'

type Media = Config['collections']['media']
```

Both `apps/payload` and `apps/plotline` depend on this package for typed REST responses and collection shapes.

## Regenerating types

From the repo root, after changing Payload collections:

```bash
pnpm generate:types
```

This runs `payload generate:types` in the payload app and writes output to `src/index.ts`.

**Do not edit `src/index.ts` manually** after the payload app is set up — changes will be overwritten on the next generation run.
