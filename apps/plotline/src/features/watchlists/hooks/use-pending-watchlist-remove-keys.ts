'use client'

import { useMutationState } from '@tanstack/react-query'
import { useMemo } from 'react'

import { onListKeysForPendingRemoves } from '../services/pending-watchlist-remove'
import { watchlistQueryKeys } from '../services/query-keys'

/**
 * Lookup keys for titles whose remove from this watchlist has not settled.
 *
 * Subscribes to pending removes and filters by `slug` while rendering. An
 * offline delete stays `pending` until it can run, so it stays in this set
 * too. The mutation cache only notifies this subscription when a mutation
 * changes, so a slug filter inside the subscription would stay stale after
 * navigating to another list.
 *
 * @param slug - Watchlist whose pending removes should still count as on the list
 * @returns `movie:550` style keys to merge into the title-search on-list set
 */
export function usePendingWatchlistRemoveKeys(slug: string): ReadonlySet<string> {
  const pendingVariables = useMutationState({
    filters: {
      exact: true,
      mutationKey: watchlistQueryKeys.removeMembership(),
      status: 'pending',
    },
    select: (mutation) => mutation.state.variables,
  })

  return useMemo(
    () => onListKeysForPendingRemoves(pendingVariables, slug),
    [pendingVariables, slug],
  )
}
