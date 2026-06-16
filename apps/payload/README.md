# @plotline/payload

Plotline's Payload CMS backend: admin panel, REST API, TMDB media cache, and Clerk profile sync.

## Local development

From the repo root:

```bash
pnpm db:up
pnpm install
pnpm dev --filter=@plotline/payload
```

The app runs at [http://localhost:3001](http://localhost:3001). The admin panel is at [http://localhost:3001/admin](http://localhost:3001/admin).

Create your first admin user through the admin UI on first launch.

## Collections

| Collection              | Purpose                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `users`                 | Payload admin accounts (not Plotline app users)                                           |
| `profiles`              | App users synced from Clerk                                                               |
| `media`                 | Shared TMDB catalog cache                                                                 |
| `library-items`         | One row per `(profile, media)` — status and progress                                      |
| `watchlists`            | Named lists for organizing library items; optional challenge mode with typed `statsCache` |
| `watchlist-memberships` | Join table linking library items to watchlists; list-scoped status and goal weight        |
| `watch-events`          | Append-only activity log                                                                  |
| `reviews`               | One rating/review per `(profile, media)`                                                  |

## Custom endpoints

| Endpoint                                | Method | Auth                        | Purpose                                   |
| --------------------------------------- | ------ | --------------------------- | ----------------------------------------- |
| `/api/tmdb/upsert`                      | POST   | Service (`PAYLOAD_API_KEY`) | Upsert TMDB media records                 |
| `/api/library/add-to-list`              | POST   | Service + `x-clerk-user-id` | Upsert library item and add to watchlist  |
| `/api/library/log-watch`                | POST   | Service + `x-clerk-user-id` | Log watch event and update library item   |
| `/api/watchlists/:id/recalculate-stats` | POST   | Service + `x-clerk-user-id` | Recompute watchlist challenge stats cache |
| `/api/webhooks/clerk`                   | POST   | Clerk webhook signature     | Sync profiles from Clerk                  |

BFF calls from `apps/plotline` should send:

```
Authorization: Bearer ${PAYLOAD_API_KEY}
x-clerk-user-id: ${clerkUserId}
```

## Type generation

Generated types are written to `@plotline/payload-types`:

```bash
pnpm generate:types
```

Do not edit `packages/payload-types/src/index.ts` manually.

## Environment variables

| Variable               | Required   | Description                               |
| ---------------------- | ---------- | ----------------------------------------- |
| `POSTGRES_URL`         | Yes        | PostgreSQL connection string              |
| `PAYLOAD_SECRET`       | Yes        | Payload encryption secret                 |
| `PAYLOAD_API_KEY`      | Yes        | Server-to-server API key for Plotline BFF |
| `PLOTLINE_URL`         | Yes (prod) | Plotline app origin for CORS              |
| `CLERK_WEBHOOK_SECRET` | Yes (prod) | Clerk webhook signing secret              |
| `SENTRY_DSN`           | No         | Sentry error reporting                    |
| `SENTRY_AUTH_TOKEN`    | No         | CI/build source map upload                |

See [`../../.env.example`](../../.env.example) for the full monorepo variable list.

## Sentry

Sentry is configured via `@sentry/nextjs`:

- `src/instrumentation.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.ts` wrapped with `withSentryConfig`

## Vercel deployment

1. Create a Vercel project with **Root Directory** `apps/payload`.
2. Enable **Include source files outside Root Directory** for monorepo builds.
3. Build command: `cd ../.. && pnpm exec turbo run build --filter=@plotline/payload`
4. Set env vars: `POSTGRES_URL`, `PAYLOAD_SECRET`, `PAYLOAD_API_KEY`, `CLERK_WEBHOOK_SECRET`, `PLOTLINE_URL`, Sentry vars.
5. Point Clerk webhooks to `https://<payload-domain>/api/webhooks/clerk`.
