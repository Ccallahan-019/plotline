import { LibraryItem } from '@plotline/payload-types'
import { SquareArrowOutUpRight } from 'lucide-react'

import { ButtonLink } from '@/components/buttons/ButtonLink'
import { LogWatchPopover } from '@/features/library/log-watch/components/popover/LogWatchPopover'

type ContinueWatchingHeroActionsProps = {
  href: string
  libraryItem: LibraryItem | undefined
  logLabel: string
}

export function ContinueWatchingHeroActions({
  href,
  libraryItem,
  logLabel,
}: ContinueWatchingHeroActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ContinueWatchingHeroPopover libraryItem={libraryItem} logLabel={logLabel} />
      <ButtonLink href={href} variant="outline">
        <SquareArrowOutUpRight data-icon="inline-start" />
        View Title Details
      </ButtonLink>
    </div>
  )
}

function ContinueWatchingHeroPopover({
  libraryItem,
  logLabel,
}: {
  libraryItem: LibraryItem | undefined
  logLabel: string
}) {
  if (libraryItem == null) {
    return null
  }

  return <LogWatchPopover libraryItem={libraryItem} triggerLabel={logLabel} />
}
