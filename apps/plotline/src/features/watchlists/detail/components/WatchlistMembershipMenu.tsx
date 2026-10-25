import { WatchlistMembership } from '@plotline/payload-types'
import { Ellipsis } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LibraryStatusMenuItems } from '@/features/library/library-item/components/LibraryStatusMenuItems'

import { useWatchlistMembershipMenu } from '../hooks/use-watchlist-membership-menu'

type WatchlistMembershipMenuProps = {
  membership: WatchlistMembership
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  slug: string
  title: string
  triggerSize?: 'icon-sm' | 'icon'
}

export function WatchlistMembershipMenu({
  membership,
  onLogWatch,
  onRemove,
  slug,
  title,
  triggerSize = 'icon-sm',
}: WatchlistMembershipMenuProps) {
  const { canEditLibraryItem, handleStatusChange, isUpdatePending, libraryItemStatus } =
    useWatchlistMembershipMenu({
      membership,
      slug,
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`More actions for ${title}`}
            size={triggerSize}
            type="button"
            variant="secondary"
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={!canEditLibraryItem} onClick={() => onLogWatch(membership)}>
            Log a watch
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!canEditLibraryItem}>
              Change status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={8}>
              <LibraryStatusMenuItems
                currentStatus={libraryItemStatus}
                disabled={!canEditLibraryItem || isUpdatePending}
                onStatusChange={handleStatusChange}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => onRemove(membership)} variant="destructive">
            Remove from watchlist
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
