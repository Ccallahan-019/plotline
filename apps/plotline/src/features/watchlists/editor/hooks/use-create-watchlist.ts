'use client'

import type { Watchlist } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { WatchlistWriteInput } from '../services/watchlist-write'

import { invalidateAfterCreateWatchlist } from '../../services/invalidate-watchlist-queries'
import { watchlistQueryKeys } from '../../services/query-keys'
import { postWatchlist } from '../services/fetch-watchlist'

/**
 * Creates an owned watchlist and refreshes the lists that show it.
 *
 * Stores the returned document under its new slug, then invalidates watchlist
 * card and detail queries so the indexes and the next page see the list.
 *
 * @returns A React Query mutation for `WatchlistWriteInput`
 */
export function useCreateWatchlist() {
  const queryClient = useQueryClient()

  return useMutation<Watchlist, Error, WatchlistWriteInput>({
    mutationFn: postWatchlist,
    onSuccess: (watchlist) => {
      queryClient.setQueryData(watchlistQueryKeys.watchlist(watchlist.slug), watchlist)
      void queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.cards() })
      void queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.watchlist(watchlist.slug) })
      invalidateAfterCreateWatchlist(queryClient)
    },
  })
}
