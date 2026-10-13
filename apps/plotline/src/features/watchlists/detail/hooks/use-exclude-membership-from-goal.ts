'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { FetchJsonError } from '@/lib/api/fetch-json'

import { watchlistQueryKeys } from '../../services/query-keys'
import { patchWatchlistMembership } from '../services/fetch-watchlist-memberships'
import {
  applyMembershipGoalCounts,
  membershipGoalCountsFrom,
  optimisticMembershipGoalCounts,
  restoreMembershipGoalCounts,
} from '../services/membership-goal-counts'

type ExcludeContext = {
  previous: undefined | WatchlistMembership[]
  queryKey: readonly ['watchlists', string, 'memberships']
}

type ExcludeMembershipFromGoalVariables = {
  challenge: null | Watchlist['challenge']
  excludeFromGoal: boolean
  membershipId: number
  slug: string
}

/**
 * Sets whether one membership counts toward the challenge goal.
 *
 * Optimistically patches that row on the detail memberships query. On error,
 * rolls the same row back and leaves every other row as it is now. A successful
 * response is merged onto the cached row so populated media stays; a response
 * for an older toggle is ignored once the checkbox has moved on. Watchlist
 * stats, this membership list, and the card indexes refresh when no other
 * counts update is still in flight.
 *
 * @returns A React Query mutation for `{ challenge, excludeFromGoal, membershipId, slug }`
 */
export function useExcludeMembershipFromGoal() {
  const queryClient = useQueryClient()

  return useMutation<WatchlistMembership, Error, ExcludeMembershipFromGoalVariables, ExcludeContext>(
    {
      mutationFn: (variables) =>
        patchWatchlistMembership(variables.slug, variables.membershipId, {
          excludeFromGoal: variables.excludeFromGoal,
        }),
      mutationKey: watchlistQueryKeys.excludeFromGoal(),
      onError: (error, variables, context) => {
        if (!context?.previous) {
          return
        }

        const current = queryClient.getQueryData<WatchlistMembership[]>(context.queryKey)

        queryClient.setQueryData(
          context.queryKey,
          current
            ? restoreMembershipGoalCounts(current, context.previous, variables.membershipId)
            : context.previous,
        )
        toast.error('Could not update counts', {
          description: countsErrorDescription(error),
        })
      },
      onMutate: async (variables) => {
        const queryKey = watchlistQueryKeys.watchlistDetailMemberships(variables.slug)

        await queryClient.cancelQueries({ queryKey })

        const previous = queryClient.getQueryData<WatchlistMembership[]>(queryKey)

        const membership = previous?.find((row) => row.id === variables.membershipId)

        if (previous && membership) {
          queryClient.setQueryData(
            queryKey,
            applyMembershipGoalCounts(
              previous,
              variables.membershipId,
              optimisticMembershipGoalCounts(
                membership,
                variables.challenge,
                variables.excludeFromGoal,
              ),
            ),
          )
        }

        return { previous, queryKey }
      },
      onSettled: (_data, _error, variables) => {
        // This mutation is still pending until onSettled returns, so 1 means it is the only one.
        if (queryClient.isMutating({ mutationKey: watchlistQueryKeys.excludeFromGoal() }) > 1) {
          return
        }

        void queryClient.invalidateQueries({
          exact: true,
          queryKey: watchlistQueryKeys.watchlist(variables.slug),
        })
        void queryClient.invalidateQueries({
          queryKey: watchlistQueryKeys.watchlistDetailMemberships(variables.slug),
        })
        void queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.cards() })
      },
      onSuccess: (updated, variables) => {
        const queryKey = watchlistQueryKeys.watchlistDetailMemberships(variables.slug)
        const current = queryClient.getQueryData<WatchlistMembership[]>(queryKey)
        const row = current?.find((membership) => membership.id === variables.membershipId)

        if (!current || !row || row.excludeFromGoal !== variables.excludeFromGoal) {
          return
        }

        queryClient.setQueryData(
          queryKey,
          applyMembershipGoalCounts(current, variables.membershipId, membershipGoalCountsFrom(updated)),
        )
      },
    },
  )
}

// Prefer the server's exclusion note when it rejects the toggle.
function countsErrorDescription(error: unknown): string {
  if (
    error instanceof FetchJsonError &&
    isErrorBody(error.body) &&
    typeof error.body.error === 'string'
  ) {
    return error.body.error
  }

  return 'The previous setting was restored.'
}

function isErrorBody(value: unknown): value is { error?: unknown } {
  return typeof value === 'object' && value !== null
}
