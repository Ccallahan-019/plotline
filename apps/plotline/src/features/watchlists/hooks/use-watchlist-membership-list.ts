import { move } from '@dnd-kit/helpers'
import { DragEndEvent } from '@dnd-kit/react'
import { WatchlistMembership } from '@plotline/payload-types'
import { useEffect, useRef, useState } from 'react'

import { getMembershipMedia } from '../services/membership-media'
import {
  reconcilePendingMembershipRows,
  sameMembershipIdOrder,
  withMembershipSortOrder,
} from '../services/order-watchlist-memberships'
import { useRemoveFromWatchlist } from './use-remove-from-watchlist'
import { useReorderWatchlistMemberships } from './use-reorder-watchlist-memberships'

type UseWatchlistMembershipListProps = {
  memberships: WatchlistMembership[]
  slug: string
}

/**
 * Local drag order and row actions for one watchlist's membership list.
 *
 * `rows` follows `memberships` except while a reorder is saving. Refetches in
 * that window still have the previous server order, so the list keeps the
 * dragged order and only applies row updates and removals. A remove drops the
 * row immediately. If that delete fails, the row is put back at the cache
 * position even while the reorder is still saving. Another drag is ignored
 * until the in-flight reorder settles.
 *
 * @param props.memberships - Server memberships for this watchlist, already ordered
 * @param props.slug - Watchlist slug used by the reorder and remove mutations
 * @returns Drag handlers, the rows to render, and the log-watch target
 */
export function useWatchlistMembershipList({ memberships, slug }: UseWatchlistMembershipListProps) {
  const reorder = useReorderWatchlistMemberships()
  const remove = useRemoveFromWatchlist()
  const [rows, setRows] = useState(memberships)
  const [logTarget, setLogTarget] = useState<null | WatchlistMembership>(null)
  const [restoreIds, setRestoreIds] = useState<ReadonlySet<number>>(() => new Set())
  const rowsRef = useRef(rows)
  const reorderPendingRef = useRef(false)

  rowsRef.current = rows
  reorderPendingRef.current = reorder.isPending

  // A refetch while the save is in flight still has the previous server order.
  // `restoreIds` is how a failed delete gets back onto that list.
  useEffect(() => {
    if (reorder.isPending) {
      setRows((current) => reconcilePendingMembershipRows(current, memberships, restoreIds))
      return
    }

    setRows(memberships)
  }, [memberships, reorder.isPending, restoreIds])

  const handleDragEnd = (event: DragEndEvent) => {
    if (reorderPendingRef.current) {
      return
    }

    const current = rowsRef.current
    const next = move(current, event)

    if (sameMembershipIdOrder(current, next)) {
      return
    }

    const ordered = withMembershipSortOrder(next)

    setRows(ordered)
    reorder.mutate({
      membershipIds: ordered.map((membership) => membership.id),
      slug,
    })
  }

  const handleRemove = (membership: WatchlistMembership) => {
    setRestoreIds((current) => {
      if (!current.has(membership.id)) {
        return current
      }

      const next = new Set(current)
      next.delete(membership.id)

      return next
    })
    setRows((current) => current.filter((row) => row.id !== membership.id))
    remove.mutate(
      {
        membershipId: membership.id,
        slug,
        title: getMembershipMedia(membership)?.title,
      },
      {
        onError: () => {
          if (!reorderPendingRef.current) {
            return
          }

          setRestoreIds((current) => {
            if (current.has(membership.id)) {
              return current
            }

            const next = new Set(current)
            next.add(membership.id)

            return next
          })
        },
      },
    )
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
