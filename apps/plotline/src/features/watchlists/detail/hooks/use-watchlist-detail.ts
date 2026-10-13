import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { useMemo, useState } from 'react'

import { getErrorMessage } from '@/utils/get-error-message'

import type { WatchlistDetailSurface } from '../components/WatchlistDetail'

import { useWatchlist } from '../../hooks/use-watchlist'
import { formatWatchlistTitleCount } from '../../services/format-watchlist-title-count'
import { buildWatchlistOnListKeys } from '../services/build-watchlist-on-list-keys'
import { omitPendingWatchlistRemoves } from '../services/pending-watchlist-remove'
import { DEFAULT_WATCHLIST_MEMBERSHIP_SORT, WatchlistMembershipSort } from '../types'
import { useMembershipLayout } from './use-membership-layout'
import { usePendingWatchlistRemoveKeys } from './use-pending-watchlist-remove-keys'
import { useWatchlistMemberships } from './use-watchlist-memberships'

type UseWatchlistDetailProps = {
  initialMemberships: null | WatchlistMembership[]
  initialMembershipsError: null | string
  initialWatchlist: Watchlist
  slug: string
  surface: WatchlistDetailSurface
}

/**
 * State and derived values for the watchlist and challenge detail page.
 *
 * Runs on the client once the server has prefetched the watchlist and its memberships.
 * Both queries start from that data, then stay live. The hook also owns the local sort,
 * the title-search dialog state and the row/grid layout. In-flight removes stay out of
 * the title count and stay in the on-list keys, so search cannot re-add a title whose
 * DELETE has not settled.
 *
 * @param props.initialMemberships - Memberships from the server prefetch, or `null` if it failed
 * @param props.initialMembershipsError - Prefetch error message shown until memberships load
 * @param props.initialWatchlist - Watchlist from the server prefetch
 * @param props.slug - Watchlist slug used by the queries and mutations
 * @param props.surface - `challenge` shows goal progress and Counts controls
 * @returns The watchlist, memberships, load state, layout, sort and search state, and the parent href
 */
export function useWatchlistDetail({
  initialMemberships,
  initialMembershipsError,
  initialWatchlist,
  slug,
  surface,
}: UseWatchlistDetailProps) {
  const watchlistQuery = useWatchlist(slug, { initialData: initialWatchlist })
  const membershipsQuery = useWatchlistMemberships(slug, {
    initialData: initialMemberships ?? undefined,
  })
  const membershipLayout = useMembershipLayout()
  const [sort, setSort] = useState<WatchlistMembershipSort>(DEFAULT_WATCHLIST_MEMBERSHIP_SORT)
  const [titleSearchOpen, setTitleSearchOpen] = useState(false)
  const isChallenge = surface === 'challenge'
  const watchlist = watchlistQuery.data ?? initialWatchlist
  const memberships = membershipsQuery.data
  const pendingRemoveKeys = usePendingWatchlistRemoveKeys(slug)
  // The cache drops a row before its DELETE finishes. Those keys stay on-list
  // so search cannot re-add the title while the membership still exists.
  const onListKeys = useMemo(
    () => buildWatchlistOnListKeys(memberships ?? [], pendingRemoveKeys),
    [memberships, pendingRemoveKeys],
  )
  // The same in-flight deletes stay out of the count. A refetch can still
  // include them until the DELETE settles.
  const listedMemberships = useMemo(
    () =>
      memberships == null ? null : omitPendingWatchlistRemoves(memberships, pendingRemoveKeys),
    [memberships, pendingRemoveKeys],
  )
  const errorMessage =
    getErrorMessage(membershipsQuery.error) ?? (memberships ? null : initialMembershipsError)
  const description = watchlist.description?.trim()
  const titleCountLabel =
    listedMemberships == null ? null : formatWatchlistTitleCount(listedMemberships.length)

  const parentHref = isChallenge ? `/dashboard/challenges/${slug}` : `/dashboard/watchlists/${slug}`

  return {
    description,
    errorMessage,
    isChallenge,
    isPending: membershipsQuery.isPending,
    membershipLayout,
    memberships,
    onListKeys,
    parentHref,
    setSort,
    setTitleSearchOpen,
    sort,
    titleCountLabel,
    titleSearchOpen,
    watchlist,
  }
}
