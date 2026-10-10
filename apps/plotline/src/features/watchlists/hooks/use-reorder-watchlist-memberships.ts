'use client'

import type { WatchlistMembership } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { patchWatchlistMembershipOrder } from '../services/fetch-watchlists'
import {
  orderWatchlistMemberships,
  restoreMembershipOrderAfterReorder,
  submittedMembershipIdsStillPresent,
} from '../services/order-watchlist-memberships'
import { watchlistQueryKeys } from '../services/query-keys'

type ReorderContext = {
  previous: undefined | WatchlistMembership[]
  queryKey: readonly ['watchlists', string, 'memberships']
}

type ReorderWatchlistMembershipsVariables = {
  membershipIds: number[]
  slug: string
}

/**
 * Persists a new membership order for one watchlist.
 *
 * Optimistically rewrites the detail query to the submitted id order. A failed
 * save restores that order only for rows still in the cache, so a delete that
 * landed during the request is not undone and does not toast. A successful
 * save writes that order back onto the cache after cancelling in-flight
 * refetches, which can still hold the previous order. Refetches the list and
 * the watchlist cards when the mutation settles so poster stacks follow the
 * saved order. A successful save does not toast, because reordering is a
 * frequent gesture.
 *
 * @returns A React Query mutation for `{ membershipIds, slug }`
 */
export function useReorderWatchlistMemberships() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ReorderWatchlistMembershipsVariables, ReorderContext>({
    mutationFn: async (variables) => {
      try {
        await patchWatchlistMembershipOrder(variables.slug, variables.membershipIds)
      } catch (error) {
        const current = queryClient.getQueryData<WatchlistMembership[]>(
          watchlistQueryKeys.watchlistDetailMemberships(variables.slug),
        )

        if (submittedMembershipIdsStillPresent(current, variables.membershipIds)) {
          toast.error('Could not save list order', {
            description: 'The previous order was restored.',
          })
        }

        throw error
      }
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return
      }

      const current = queryClient.getQueryData<WatchlistMembership[]>(context.queryKey)

      if (!current || !context.previous) {
        queryClient.setQueryData(context.queryKey, context.previous)
        return
      }

      queryClient.setQueryData(
        context.queryKey,
        restoreMembershipOrderAfterReorder(current, context.previous),
      )
    },
    onMutate: async (variables) => {
      const queryKey = watchlistQueryKeys.watchlistDetailMemberships(variables.slug)
      const previous = queryClient.getQueryData<WatchlistMembership[]>(queryKey)

      await queryClient.cancelQueries({ queryKey })

      if (previous) {
        const ordered = orderWatchlistMemberships(previous, variables.membershipIds)

        if (ordered) {
          queryClient.setQueryData(queryKey, ordered)
        }
      }

      return { previous, queryKey }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: watchlistQueryKeys.watchlistDetailMemberships(variables.slug),
      })
      void queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.cards() })
    },
    onSuccess: async (_data, variables) => {
      const queryKey = watchlistQueryKeys.watchlistDetailMemberships(variables.slug)

      await queryClient.cancelQueries({ queryKey })

      const current = queryClient.getQueryData<WatchlistMembership[]>(queryKey)

      if (!current) {
        return
      }

      const ordered = orderWatchlistMemberships(current, variables.membershipIds)

      if (ordered) {
        queryClient.setQueryData(queryKey, ordered)
      }
    },
  })
}
