# @plotline/shared

Shared utilities, constants, and TMDB client stubs used by both Plotline apps.

## Modules

| Import | Purpose |
| --- | --- |
| `@plotline/shared/tmdb` | TMDB v3 client + Zod schemas |
| `@plotline/shared/constants/media` | `MediaStatus`, `MediaType`, `WatchEventType`, `Visibility`, `StreamingPlatform` |
| `@plotline/shared/utils/dates` | Release calendar helpers |
| `@plotline/shared/env` | Shared `@t3-oss/env-core` validation for server env vars |

## TMDB caching

TMDB responses are **not** stored in this package. The Plotline BFF fetches search/detail data via `@plotline/shared/tmdb`, then the payload app upserts normalized records into the `media` collection (via `/api/tmdb/upsert`). This package only provides the typed client and schemas for that fetch layer.

## Usage

```typescript
import { createTmdbClient } from "@plotline/shared/tmdb";
import { MEDIA_STATUSES } from "@plotline/shared/constants/media";
import { daysUntilRelease } from "@plotline/shared/utils/dates";

const tmdb = createTmdbClient(process.env.TMDB_API_KEY!);
const results = await tmdb.searchMulti("dune");
const days = daysUntilRelease(results.results[0]?.release_date);
```

Server-only: never import TMDB client code into client components.
