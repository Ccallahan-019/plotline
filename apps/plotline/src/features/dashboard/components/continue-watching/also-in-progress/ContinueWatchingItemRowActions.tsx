import { LibraryItem } from '@plotline/payload-types'

import { ItemActions } from '@/components/ui/item'
import { LogWatchPopover } from '@/features/library/log-watch/components/popover/LogWatchPopover'

import { ContinueWatchingTitleMenu } from './ContinueWatchingTitleMenu'

type ContinueWatchingItemRowActionsProps = {
  href: string
  libraryItem: LibraryItem | undefined
  logLabel: string
  title: string
}

export function ContinueWatchingItemRowActions({
  href,
  libraryItem,
  logLabel,
  title,
}: ContinueWatchingItemRowActionsProps) {
  return (
    <ItemActions className="relative z-10 order-3 shrink-0 @min-[48rem]/cw:order-0">
      <ContinueWatchingLogWatchPopover libraryItem={libraryItem} triggerLabel={logLabel} />
      <ContinueWatchingTitleMenu href={href} title={title} />
    </ItemActions>
  )
}

function ContinueWatchingLogWatchPopover({
  libraryItem,
  triggerLabel,
}: {
  libraryItem: LibraryItem | undefined
  triggerLabel: string
}) {
  if (libraryItem == null) return null

  return <LogWatchPopover libraryItem={libraryItem} triggerLabel={triggerLabel} />
}
