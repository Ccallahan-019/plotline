# @plotline/plotline

User-facing Next.js app for Plotline — Clerk authentication, shadcn/ui, and a Payload BFF layer.

## Local development

From the monorepo root:

```bash
pnpm install
pnpm db:up
cp .env.example .env   # fill in Clerk, Payload, TMDB, and Sentry keys
pnpm dev               # runs payload (3001) and plotline (3000) via Turborepo
```

Plotline only:

```bash
pnpm dev --filter=@plotline/plotline
```

The payload app must be running at `PAYLOAD_URL` (default `http://localhost:3001`) for watchlist and library routes to work.

## shadcn/ui

Plotline uses shadcn/ui preset **`b4XvrpuTqd`** with **pointer buttons** (`--pointer`).

Initialize or re-apply the preset from the repo root:

```bash
pnpm dlx shadcn@latest init --preset b4XvrpuTqd --pointer -d -f -c apps/plotline
pnpm dlx shadcn@latest apply --preset b4XvrpuTqd --pointer -c apps/plotline
```

Add components:

```bash
pnpm dlx shadcn@latest add <component> -c apps/plotline
```

Compose UI from `@/components/ui/*` only — do not add parallel component libraries.

## Architecture

Plotline cannot call Payload's Local API directly (separate Next.js apps). All user data flows through:

1. Clerk session in plotline (`proxy.ts`, `auth()`)
2. BFF route handlers under `src/app/api/`
3. Server-only Payload client (`src/lib/payload/`) with `PAYLOAD_API_KEY` + `x-clerk-user-id`

```text
Browser → Clerk → Plotline BFF → Payload REST (apps/payload) → PostgreSQL
```

### TanStack Query (client data layer)

Interactive client islands fetch same-origin BFF routes via TanStack Query. Server Components prefetch with server-only query functions and pass `initialData` to hydrate the cache.

| Layer          | Path                       | Role                                                                                 |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| Server queries | `src/lib/payload/queries/` | Payload REST access (`import 'server-only'`) — used by RSC prefetch and BFF handlers |
| BFF            | `src/app/api/`             | Clerk auth + delegates to server queries                                             |
| Client fetch   | `src/lib/query/api.ts`     | `fetchJson` wrapper — never imports `@/lib/payload`                                  |
| Query keys     | `src/lib/query/keys.ts`    | Centralized key factory                                                              |
| Hooks          | `src/lib/query/hooks/`     | `useQuery` / `useMutation` for features                                              |

**Pattern:** thin RSC page shell (auth + prefetch) → client island with hook + `initialData`. Mutations call POST BFF routes and invalidate related query keys.

Reference implementation: `/watchlists` — `WatchlistsGrid` + `useWatchlists`. Reusable media presentation (`MediaGridItem`, `MediaListItem`, `MediaPoster`) lives in `src/features/media/`; library-specific UI (`LibraryList`, `LibraryListItem`, `StatusBadge`, `TitleSearchCombobox`, `LogWatchButton`) lives in `src/features/library/` and composes those media primitives. Mutations use `useAddToList` and `useLogWatch` from `src/lib/query/hooks/`.

Query client defaults: `staleTime` 30s, `gcTime` 5m, retry once on 5xx.

## MVP routes

| Route                  | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `/`                    | Landing / marketing stub                 |
| `/sign-in`, `/sign-up` | Clerk auth                               |
| `/dashboard`           | Protected shell with placeholder widgets |
| `/watchlists`          | List user watchlists from Payload        |
| `/watchlists/[slug]`   | Single watchlist detail stub             |

## BFF API routes

| Route                           | Method | Purpose                                            |
| ------------------------------- | ------ | -------------------------------------------------- |
| `GET /api/library-items`        | GET    | List library items (`status`, `mediaType` filters) |
| `GET /api/watchlists`           | GET    | List watchlists (`filter` query)                   |
| `GET /api/watchlists/[slug]`    | GET    | Single watchlist by slug                           |
| `GET /api/watch-events`         | GET    | Watch history (`limit`, `sort`)                    |
| `GET /api/reviews`                | GET    | User reviews (`hasBody` filter)                    |
| `POST /api/library/add-to-list` | POST   | Add media to library + watchlist                   |
| `POST /api/library/log-watch`   | POST   | Log a watch event                                  |
| `GET /api/tmdb/search?q=`       | GET    | TMDB search                                        |

## Feature roadmap

Mapped to Payload collections and custom endpoints (not built in this scaffold):

- **Year in Review** — aggregate `watch-events` + `statsCache`
- **Recommendations** — future `recommendation-cache` collection
- **Social feed** — future `friendships`, `activity-items`
- **Streaming availability** — future `streaming-availability` + JustWatch/Reelgood
- **Release alerts** — future `profile-media-follows`

## Clerk

1. Create a Clerk application and add keys to `.env` / `apps/plotline/.env.local`
2. `proxy.ts` uses a protected-first strategy: `/`, `/sign-in`, `/sign-up` are public; everything else requires auth
3. Payload syncs profiles via Clerk webhooks on the payload app (`CLERK_WEBHOOK_SECRET`)

Required variables:

| Variable                            | Purpose           |
| ----------------------------------- | ----------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client-side Clerk |
| `CLERK_SECRET_KEY`                  | Server-side Clerk |

## Sentry

Uses `@sentry/nextjs` with a separate Sentry project (`javascript-nextjs-plotline`).

| Variable            | Purpose                 |
| ------------------- | ----------------------- |
| `SENTRY_DSN`        | Server/edge DSN         |
| `SENTRY_AUTH_TOKEN` | Source map upload in CI |

Tracing and Session Replay sample at 100% in development, ~10% in production.

## Environment variables

| Variable                            | Required   | Description                               |
| ----------------------------------- | ---------- | ----------------------------------------- |
| `PAYLOAD_URL`                       | Yes        | Payload REST base URL (no trailing slash) |
| `PAYLOAD_API_KEY`                   | Yes        | Service key for BFF → Payload calls       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes        | Clerk publishable key                     |
| `CLERK_SECRET_KEY`                  | Yes        | Clerk secret key                          |
| `TMDB_API_KEY`                      | For search | TMDB v3 API key                           |
| `TMDB_READ_ACCESS_TOKEN`            | Optional   | TMDB v4 read token                        |
| `SENTRY_DSN`                        | Optional   | Sentry server DSN                         |
| `SENTRY_AUTH_TOKEN`                 | Optional   | Source map upload in CI                   |

See root [`.env.example`](../../.env.example) for the full monorepo list.

## Vercel deployment

1. Create a Vercel project with **Root Directory** `apps/plotline`
2. Enable **Include source files outside Root Directory** (monorepo)
3. Build command: `cd ../.. && pnpm exec turbo run build --filter=@plotline/plotline`
4. Set env vars above plus point `PAYLOAD_URL` at the deployed payload app
5. Set `PLOTLINE_URL` on the payload project for CORS

See [`docs/deployment.md`](../../docs/deployment.md) for Neon, preview DBs, and dual-project setup.
