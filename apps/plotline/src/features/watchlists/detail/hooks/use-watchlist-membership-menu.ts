import type { WatchlistMembership } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { useQueryClient } from '@tanstack/react-query'

import { useUpdateLibraryItem } from '@/features/library/library-item/hooks/use-update-library-item'

import { watchlistQueryKeys } from '../../services/query-keys'
import { getMembershipLibraryItem, getMembershipMedia } from '../services/membership-media'
import { patchMembershipLibraryStatus } from '../services/order-watchlist-memberships'

type UseWatchlistMembershipMenuProps = {
  membership: WatchlistMembership
  slug: string
}

/**
 * State and handlers for one membership's actions menu on a watchlist detail page.
 *
 * Runs on the client for each row. `handleStatusChange` updates the title's library status,
 * and the detail memberships query shows the new status at once. If the update fails, only
 * this row goes back to the status it had, so a status change on another row in the meantime
 * is kept. The library mutation refreshes watchlist stats and cards when it settles.
 *
 * @param props.membership - Row the menu acts on
 * @param props.slug - Watchlist slug that keys the detail memberships query
 * @returns `canEditLibraryItem` (false while the library item or media is not loaded),
 *   `handleStatusChange`, `isUpdatePending`, and the row's current `libraryItemStatus`
 */
export function useWatchlistMembershipMenu({ membership, slug }: UseWatchlistMembershipMenuProps) {
  const queryClient = useQueryClient()
  const updateLibraryItem = useUpdateLibraryItem()
  const libraryItem = getMembershipLibraryItem(membership)
  const media = getMembershipMedia(membership)
  const canEditLibraryItem = libraryItem != null && media != null

  const handleStatusChange = (status: MediaStatus) => {
    if (!libraryItem || libraryItem.status === status || updateLibraryItem.isPending) {
      return
    }

    const queryKey = watchlistQueryKeys.watchlistDetailMemberships(slug)
    const previousStatus = libraryItem.status
    const patchRowStatus = (rowStatus: MediaStatus) =>
      queryClient.setQueryData<WatchlistMembership[]>(queryKey, (rows) =>
        rows ? patchMembershipLibraryStatus(rows, membership.id, rowStatus) : rows,
      )

    patchRowStatus(status)

    void updateLibraryItem
      .mutateAsync({
        libraryItem,
        libraryItemId: libraryItem.id,
        status,
      })
      .catch(() => {
        patchRowStatus(previousStatus)
      })
  }

  return {
    canEditLibraryItem,
    handleStatusChange,
    isUpdatePending: updateLibraryItem.isPending,
    libraryItemStatus: libraryItem?.status,
  }
}
