'use client'

import type { Watchlist } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { WatchlistWriteInput } from '../services/watchlist-write'

import { watchlistQueryKeys } from '../../services/query-keys'
import { patchWatchlist } from '../services/fetch-watchlist'

type UpdateWatchlistVariables = {
  slug: string
} & WatchlistWriteInput

/**
 * Saves a watchlist's name, description, visibility, cover, and challenge settings.
 *
 * Writes the returned watchlist into the detail cache immediately, then
 * invalidates watchlist card and detail queries so both indexes pick up the
 * new details. The slug does not change, so the detail route stays put.
 *
 * @returns A React Query mutation for the watchlist slug plus `WatchlistWriteInput`
 */
export function useUpdateWatchlist() {
  const queryClient = useQueryClient()

  return useMutation<Watchlist, Error, UpdateWatchlistVariables>({
    mutationFn: ({ slug, ...input }) => patchWatchlist(slug, input),
    onSuccess: (watchlist, variables) => {
      queryClient.setQueryData(watchlistQueryKeys.watchlist(variables.slug), watchlist)
      void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })
}
