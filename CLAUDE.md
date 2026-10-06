# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

pnpm + Turborepo monorepo (Node >= 20, pnpm 10) for Plotline, a movie/TV tracking app.

| Workspace                     | Role                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| `apps/payload`                | Payload CMS 3 backend on Next.js (port 3001): admin, REST, Postgres   |
| `apps/plotline`               | User-facing Next.js app (port 3000): Clerk auth, shadcn/ui, BFF       |
| `packages/shared`             | Pure TS shared by both apps (subpath exports, see below)              |
| `packages/payload-types`      | Generated Payload types (`@plotline/payload-types`), do not hand-edit |
| `packages/eslint-config`, `packages/typescript-config` | Shared tooling config                        |

`apps/plotline/CLAUDE.md` pulls in `apps/plotline/AGENTS.md`: the app runs a Next.js version with breaking changes. Read the relevant guide in `apps/plotline/node_modules/next/dist/docs/` before writing Next.js code there.

## Commands

From the repo root:

```bash
pnpm dev                                  # both apps via turbo
pnpm dev --filter=@plotline/payload       # one app
pnpm build | pnpm lint | pnpm typecheck   # turbo across workspaces (lint runs with --fix)
pnpm format                               # prettier --write .
pnpm generate:types                       # regenerate packages/payload-types after collection changes
```

Tests (Vitest; run inside the package directory):

```bash
# apps/payload: unit specs in src/**/tests/*.spec.ts plus tests/int/*.int.spec.ts (int needs POSTGRES_URL)
pnpm test:int
npx vitest run --config ./vitest.config.mts src                           # unit specs only, no DB
npx vitest run --config ./vitest.config.mts src/endpoints/log-watch/tests/log-watch.spec.ts
npx vitest run --config ./vitest.config.mts -t "test name substring"
pnpm test:e2e                                                             # Playwright

# apps/plotline and packages/shared: src/**/*.spec.ts
pnpm test
```

Env vars live in a root `.env` (template: `.env.example`); apps may also use `apps/plotline/.env.local` and `apps/payload/.env`. The `db:up`/`db:down` scripts call `docker compose`, but no compose file is checked in; Payload connects through `POSTGRES_URL`.

## Architecture

### Request flow

```
Browser → Clerk (apps/plotline) → BFF route handler → Payload REST (apps/payload) → Postgres
```

- The two apps are separate Next.js deployments, so plotline cannot use Payload's Local API. All data goes through `src/lib/payload/payload-fetch.ts` (`server-only`), which sends `Authorization: Bearer $PAYLOAD_API_KEY` and `x-clerk-user-id`.
- BFF routes live in `apps/plotline/src/app/api/**/route.ts`. They call `requireClerkUserId()`, delegate to a server service, and map errors with `handlePayloadError`.
- On the Payload side, custom endpoints (`apps/payload/src/endpoints/`, registered in `payload.config.ts`) start with `requireServiceAuth` (API-key check, `access/isServiceRole.ts`) and `requireProfileContext` (Clerk user id → `profiles` row, cached on `req.context.profileId`). After that they use `overrideAccess: true` and scope queries to the resolved profile themselves.
- Profiles are synced from Clerk through a webhook on the payload app (`CLERK_WEBHOOK_SECRET`).

### Plotline app structure

Code is organized by feature under `src/features/<feature>/` with `components/`, `hooks/`, `services/` and `types/`. The `src/lib/query/` table in `apps/plotline/README.md` is out of date; the hooks now live in the feature folders.

- `services/` contains both client fetchers (call same-origin `/api/...`) and server-only Payload calls (`get-*`, `*-event.ts` using `payloadFetch`).
- TanStack Query: Server Components prefetch and pass `initialData`; client hooks own `useQuery`/`useMutation`. Library mutations do optimistic patches on the `['library-items', 'grid' | 'lookup']` caches, roll back on error, and call `invalidateAfterLibraryMutation`. Any key under the `['library-items']` prefix (including `['library-items', id, 'watched-episodes']`) is invalidated together.
- Forms use TanStack Form through `features/forms` (`useAppForm`, field components) with Zod schemas.
- UI: compose from `@/components/ui/*` (shadcn preset `b4XvrpuTqd`, pointer buttons). Do not add parallel component libraries. Add components with `pnpm dlx shadcn@latest add <component> -c apps/plotline` from the root.
- `src/proxy.ts` is the Clerk middleware: `/`, `/sign-in` and `/sign-up` are public; everything else needs auth.

### Payload data model

- `media` is the shared TMDB catalog cache (`tmdbId` + `mediaType` unique; `tvMeta.seasonEpisodeCounts` stores per-season lengths). Upserts go through `utilities/upsertMediaFromTmdb.ts`.
- `library-items` has one row per `(profile, media)` (unique index) and holds global `status` and `progress` (movie: `watched`; TV: `lastSeason`, `lastEpisode`, `episodesWatched`, `seasonsCompleted`).
- `watch-events` is an append-only log. Episode identity is the `season:episode` key from `tvContext`.
- `watchlists` / `watchlist-memberships` hold list-scoped state and challenge mode. `docs/architecture.md` covers TV counting rules, `statsCache` and the sync flow; the pure math is in `@plotline/shared/watchlist-stats`.
- Hooks chain across collections. A library-item change syncs memberships and recalculates watchlist stats. A library-item update to `completed` auto-creates a `completed` watch event. A watch-event create syncs the library item and clears `profiles.statsCache`. The context flags in `collections/library-items/context.ts` suppress these steps; Payload merges a call's `context` into `req.context`, so the flags persist for the rest of the request unless removed.

### Log-watch (the most involved flow)

`endpoints/log-watch/` (single and `/batch`) and the `watch-events` afterChange hook share one model:

1. Run inside `runInPayloadTransaction`. Find or create the library item under a `(profile, media)` advisory lock, then take `withLibraryItemRowLock` (`SELECT ... FOR UPDATE` on the transaction's drizzle session).
2. `loadLogWatchRewatchContext` reloads the item and the watched episode keys. `deriveRewatch` (`@plotline/shared/log-watch`) decides `completed` / `progress` / `rewatched`; the client never sends an event type or rewatch flag.
3. The request's `libraryItemStatus` is applied after classification, so a first watch is never classified against the new status.
4. Endpoints create events with `SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT` and then write progress, `lastWatchedAt` and the stats-cache clear once. Without the flag (admin/REST creates), the hook does the same derivation itself.
5. `resolveSeasonsCompleted` marks a season complete only when first-watch keys cover episodes `1..episodeCount` from stored metadata. Missing lengths copy the existing value through rather than guess.

The frontend mirrors this optimistically (`features/library/log-watch/services/optimistic-library-item.ts`) using the same shared helpers.

### Shared package

Import by subpath only: `@plotline/shared/{constants,tmdb,log-watch,watchlist-stats,utils,env}`. Keep it free of Payload and React dependencies so both apps and tests can use it.

## Conventions

From `.cursor/rules/project-documentation.mdc` (always applied):

- Every function in a `services/` module, exported or private, needs a comment directly above it. Prefer full JSDoc (`@param`, `@returns`, `@throws` when relevant); a one-line `//` comment is acceptable only for simple helpers.
- Every custom hook (`use*` in a `hooks/` module) needs a full JSDoc block covering what the caller gets, when it runs, `@param` for arguments and options, and `@returns`. A one-line comment is not enough.
- Comments explain why or what the caller gets, not a restatement of the signature. Update them when behavior changes.

Other conventions visible in the code:

- ESLint uses `perfectionist`, so object keys, imports and module members are sorted. Run `pnpm lint` (which fixes) rather than ordering by hand. Prettier config is at the root.
- Payload unit specs live in a `tests/` folder next to the code and mock `req.payload` methods. When a module mock (e.g. `withLibraryItemRowLock`) is used, every export the code under test calls must be included in the mock.
