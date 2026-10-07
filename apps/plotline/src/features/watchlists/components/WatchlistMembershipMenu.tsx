import { WatchlistMembership } from '@plotline/payload-types'
import { MediaStatus } from '@plotline/shared/constants'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from 'cn'
import { Check, Ellipsis } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MEDIA_STATUS_OPTIONS } from '@/features/library/constants/media-status-options'
import { useUpdateLibraryItem } from '@/features/library/library-item/hooks/use-update-library-item'

import { getMembershipLibraryItem, getMembershipMedia } from '../services/membership-media'
import { patchMembershipLibraryStatus } from '../services/order-watchlist-memberships'
import { watchlistQueryKeys } from '../services/query-keys'

export function WatchlistMembershipMenu({
  membership,
  onLogWatch,
  onRemove,
  slug,
  title,
  triggerSize = 'icon-sm',
  triggerVariant = 'ghost',
}: {
  membership: WatchlistMembership
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  slug: string
  title: string
  triggerSize?: 'icon-sm' | 'icon'
  triggerVariant?: 'ghost' | 'secondary'
}) {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`More actions for ${title}`}
            size={triggerSize}
            type="button"
            variant={triggerVariant}
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem disabled={!canEditLibraryItem} onClick={() => onLogWatch(membership)}>
          Log a watch
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!canEditLibraryItem}>
            Change status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent sideOffset={8}>
            {MEDIA_STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                className="flex items-center justify-between gap-3"
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
              >
                {option.label}
                <Check
                  aria-hidden
                  className={cn(option.value === libraryItem?.status ? 'opacity-100' : 'opacity-0')}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => onRemove(membership)} variant="destructive">
          Remove from watchlist
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
