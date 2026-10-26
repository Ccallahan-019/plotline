'use client'

import type { Watchlist } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { dashboardQueryKeys } from '@/features/dashboard/services/query-keys'

import { watchlistQueryKeys } from '../../services/query-keys'
import { postReopenChallenge } from '../services/fetch-reopen-challenge'

/**
 * Reopens a list-size challenge that finished, so titles added since count toward it.
 *
 * Runs when the caller invokes `mutate` with the watchlist slug, after the user confirms
 * the alert. On success it writes the returned watchlist into the detail cache, so the
 * hero swaps its "Completed" label for live progress at once, then invalidates watchlist
 * and dashboard queries. On failure it shows a toast and leaves the cache as it was.
 *
 * @returns A React Query mutation for the watchlist slug
 */
export function useReopenChallenge() {
  const queryClient = useQueryClient()

  return useMutation<Watchlist, Error, string>({
    mutationFn: (slug) => postReopenChallenge(slug),
    onError: () => {
      toast.error('Could not reopen the challenge', {
        description: 'Try again in a moment.',
      })
    },
    onSuccess: (watchlist, slug) => {
      queryClient.setQueryData(watchlistQueryKeys.watchlist(slug), watchlist)
      void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
    },
  })
}
