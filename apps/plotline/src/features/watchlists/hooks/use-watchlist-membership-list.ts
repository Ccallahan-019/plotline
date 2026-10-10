import { move } from '@dnd-kit/helpers'
import { DragEndEvent } from '@dnd-kit/react'
import { WatchlistMembership } from '@plotline/payload-types'
import { useMemo, useState } from 'react'

import { getWatchlistMembershipOnListKey } from '../services/build-watchlist-on-list-keys'
import { getMembershipMedia } from '../services/membership-media'
import {
  arrangeMembershipsByIds,
  sameMembershipIdOrder,
} from '../services/order-watchlist-memberships'
import { omitPendingWatchlistRemoves } from '../services/pending-watchlist-remove'
import { usePendingWatchlistRemoveKeys } from './use-pending-watchlist-remove-keys'
import { useRemoveFromWatchlist } from './use-remove-from-watchlist'
import { useReorderWatchlistMemberships } from './use-reorder-watchlist-memberships'

type UseWatchlistMembershipListProps = {
  memberships: WatchlistMembership[]
  slug: string
}

/**
 * Drag order and row actions for one watchlist's membership list.
 *
 * `rows` is derived from `memberships` on every render; there is no copy of the
 * list in local state. Titles whose remove has not settled are left out, because
 * a refetch started by another write can still include them. While a reorder is
 * saving, rows follow the submitted id order, because a refetch in that window
 * still has the previous server order. Row updates and removals from the cache
 * still apply on top of that order. A drag is ignored until the in-flight
 * reorder settles. Remove and reorder patch the query cache optimistically and
 * roll it back on failure, so a failed delete shows the row again without any
 * extra bookkeeping here.
 *
 * @param props.memberships - Server memberships for this watchlist, already ordered
 * @param props.slug - Watchlist slug used by the reorder and remove mutations
 * @returns Drag handlers, the rows to render, and the log-watch target
 */
export function useWatchlistMembershipList({ memberships, slug }: UseWatchlistMembershipListProps) {
  const reorder = useReorderWatchlistMemberships()
  const remove = useRemoveFromWatchlist()
  const pendingRemoveKeys = usePendingWatchlistRemoveKeys(slug)
  const [savingOrder, setSavingOrder] = useState<null | readonly number[]>(null)
  const [logTarget, setLogTarget] = useState<null | WatchlistMembership>(null)

  const rows = useMemo(() => {
    const visible = omitPendingWatchlistRemoves(memberships, pendingRemoveKeys)

    return savingOrder ? arrangeMembershipsByIds(visible, savingOrder) : visible
  }, [memberships, pendingRemoveKeys, savingOrder])

  const handleDragEnd = (event: DragEndEvent) => {
    if (savingOrder) {
      return
    }

    const next = move(rows, event)

    if (sameMembershipIdOrder(rows, next)) {
      return
    }

    const membershipIds = next.map((membership) => membership.id)

    // Set before the mutation's own cache write lands, so the dropped row does not snap back.
    setSavingOrder(membershipIds)
    reorder.mutate({ membershipIds, slug }, { onSettled: () => setSavingOrder(null) })
  }

  const handleRemove = (membership: WatchlistMembership) => {
    remove.mutate({
      membershipId: membership.id,
      onListKey: getWatchlistMembershipOnListKey(membership),
      slug,
      title: getMembershipMedia(membership)?.title,
    })
  }

  return {
    handleDragEnd,
    handleRemove,
    logTarget,
    reorder,
    rows,
    setLogTarget,
  }
}
