'use client'

import type { WatchlistMembership } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { RemoveFromWatchlistVariables } from '../services/pending-watchlist-remove'

import { deleteWatchlistMembership } from '../services/fetch-watchlists'
import { restoreMembershipAfterFailedRemove } from '../services/order-watchlist-memberships'
import { watchlistQueryKeys } from '../services/query-keys'

type RemoveContext = {
  previous: undefined | WatchlistMembership[]
  queryKey: readonly ['watchlists', string, 'memberships']
}

/**
 * Deletes one membership from a watchlist.
 *
 * Drops the row from the detail cache immediately. `onListKey` stays available
 * on the in-flight mutation so search can keep treating that title as on the
 * list until this delete settles. A successful delete cancels in-flight detail
 * refetches and drops the row again, because a refetch started by another write
 * can still include it. If the delete fails, that row is inserted back among
 * the rows still in the cache so a reorder that landed in the meantime keeps
 * its order. Invalidates watchlist and per-title membership queries when the
 * mutation settles so title counts and add-to-list state refresh. The library
 * item is not removed.
 *
 * @returns A React Query mutation for `{ membershipId, onListKey, slug, title }`
 */
export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, RemoveFromWatchlistVariables, RemoveContext>({
    mutationFn: (variables) => {
      const title = variables.title ?? 'This title'
      const remove = deleteWatchlistMembership(variables.slug, variables.membershipId).then(
        () => undefined,
      )

      return toast
        .promise(remove, {
          error: {
            description: 'There was an error removing this title. Please try again.',
            message: 'Could not remove title',
          },
          loading: 'Removing from list...',
          success: {
            description: `${title} was removed from this watchlist.`,
            message: 'Removed from list',
          },
        })
        .unwrap()
    },
    mutationKey: watchlistQueryKeys.removeMembership(),
    onError: (_error, variables, context) => {
      if (!context?.previous) {
        return
      }

      const current = queryClient.getQueryData<WatchlistMembership[]>(context.queryKey)

      queryClient.setQueryData(
        context.queryKey,
        current
          ? restoreMembershipAfterFailedRemove(current, context.previous, variables.membershipId)
          : context.previous,
      )
    },
    onMutate: async (variables) => {
      const queryKey = watchlistQueryKeys.watchlistDetailMemberships(variables.slug)
      const previous = queryClient.getQueryData<WatchlistMembership[]>(queryKey)

      await queryClient.cancelQueries({ queryKey })

      if (previous) {
        queryClient.setQueryData(
          queryKey,
          previous.filter((membership) => membership.id !== variables.membershipId),
        )
      }

      return { previous, queryKey }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      void queryClient.invalidateQueries({ queryKey: ['watchlist-memberships'] })
    },
    onSuccess: async (_data, variables) => {
      const queryKey = watchlistQueryKeys.watchlistDetailMemberships(variables.slug)

      await queryClient.cancelQueries({ queryKey })

      const current = queryClient.getQueryData<WatchlistMembership[]>(queryKey)

      if (!current?.some((membership) => membership.id === variables.membershipId)) {
        return
      }

      queryClient.setQueryData(
        queryKey,
        current.filter((membership) => membership.id !== variables.membershipId),
      )
    },
  })
}
