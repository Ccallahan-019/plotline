# Plotline architecture

## Challenge-mode watchlists

Challenge lists extend the standard `watchlists` and `watchlist-memberships` collections without duplicating global progress on `library-items`.

### Data model

- **`watchlists.challenge`** — optional challenge config: due date, goal type (`count` or `runtime_minutes`), TV counting rules, and prior-completion rules.
- **`watchlists.statsCache`** — denormalized list/challenge stats (typed via colocated JSON Schema). Recalculated by hooks and `POST /api/watchlists/:id/recalculate-stats`.
- **`watchlist-memberships` list-scoped fields** — `listStatus`, `completedForListAt`, `countsTowardGoal`, `goalWeight`, `episodesAtJoin`, and `episodesCountedForList` track what counts *for this list*.

Global truth for watch progress remains on `library-items.status` and `library-items.progress`.

### TV counting rules

| Rule | Behavior |
| --- | --- |
| `movies_only` | TV titles excluded from goal denominator and progress |
| `tv_as_series` | One TV series counts as 1 unit when list-scoped status is `completed` |
| `tv_by_episode` | Progress weighted by episodes watched since join |
| `tv_by_season` | One completed season counts as 1 unit |

### Sync flow

1. Adding to a list creates a membership; `beforeValidate` initializes challenge fields from watchlist config + media type.
2. When a `library-items` status or progress changes, `syncMembershipsFromLibraryItem` updates related memberships (respecting `priorCompletionRule`) and recalculates affected watchlist stats.
3. Membership create/update/delete triggers `recalculateWatchlistStatsById`.

### Shared stats helpers

Pure computation lives in `@plotline/shared/watchlist-stats` (`computeWatchlistStats`, `computeChallengePacing`, `applyTvCountRule`). Used by Payload hooks, the recalculate endpoint, and (future) Plotline BFF `GET /api/watchlists/:slug/stats`.

### BFF integration (Plotline app)

When the plotline UI implements challenge lists:

- `GET /api/watchlists/:slug/stats` — return cached or freshly computed stats
- Challenge UI: progress bar, days left, required/day, on-track badge, overdue state
