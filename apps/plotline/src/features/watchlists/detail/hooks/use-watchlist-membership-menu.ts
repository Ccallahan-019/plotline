import { WatchlistMembership } from '@plotline/payload-types'
import { MediaStatus } from '@plotline/shared/constants'
import { useQueryClient } from '@tanstack/react-query'

import { useUpdateLibraryItem } from '@/features/library/library-item/hooks/use-update-library-item'

import { watchlistQueryKeys } from '../../services/query-keys'
import { getMembershipLibraryItem, getMembershipMedia } from '../services/membership-media'
import { patchMembershipLibraryStatus } from '../services/order-watchlist-memberships'

type UseWatchlistMembershipMenuProps = {
  membership: WatchlistMembership
  slug: string
}

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
    const previous = queryClient.getQueryData<WatchlistMembership[]>(queryKey)

    if (previous) {
      queryClient.setQueryData(
        queryKey,
        patchMembershipLibraryStatus(previous, membership.id, status),
      )
    }

    void updateLibraryItem
      .mutateAsync({
        libraryItem,
        libraryItemId: libraryItem.id,
        status,
      })
      .catch(() => {
        queryClient.setQueryData(queryKey, previous)
      })
  }

  return {
    canEditLibraryItem,
    handleStatusChange,
    isUpdatePending: updateLibraryItem.isPending,
    libraryItemStatus: libraryItem?.status,
  }
}
