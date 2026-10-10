'use client'

import type { Watchlist } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateWatchlistInput } from '../types'

import { patchWatchlist } from '../services/fetch-watchlists'
import { watchlistQueryKeys } from '../services/query-keys'

type UpdateWatchlistVariables = {
  slug: string
} & UpdateWatchlistInput

/**
 * Saves a watchlist's name, description, and visibility.
 *
 * Writes the returned watchlist into the detail cache immediately, then
 * invalidates watchlist queries so cards and pickers pick up the new details.
 * The slug does not change, so the detail route stays put.
 *
 * @returns A React Query mutation for `{ slug, name, description, visibility }`
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
