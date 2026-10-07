import type { WatchlistMembership } from '@plotline/payload-types'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { fetchWatchlistMembershipsBySlug } from '../services/fetch-watchlists'
import { watchlistQueryKeys } from '../services/query-keys'

type UseWatchlistMembershipsOptions = {
  initialData?: WatchlistMembership[]
}

/**
 * Loads memberships for a watchlist detail page.
 *
 * The server list is already ordered by `sortOrder`, then `addedAt`, then `id`. Pass that
 * prefetch as `initialData` so the first paint does not wait on the client.
 * The query key sits under `['watchlists', slug]`, so invalidating the
 * watchlist prefix refreshes this list too.
 *
 * @param slug - Watchlist slug; an empty slug skips the fetch
 * @param options.initialData - Memberships from the server prefetch
 * @returns A React Query result for `WatchlistMembership[]`
 */
export function useWatchlistMemberships(slug: string, options?: UseWatchlistMembershipsOptions) {
  return useQuery({
    enabled: slug.length > 0,
    initialData: options?.initialData,
    queryFn: () => fetchWatchlistMembershipsBySlug(slug),
    queryKey: watchlistQueryKeys.watchlistDetailMemberships(slug),
  } satisfies UseQueryOptions<WatchlistMembership[]>)
}
