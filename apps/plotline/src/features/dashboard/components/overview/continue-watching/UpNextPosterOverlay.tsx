import { LibraryItem } from '@plotline/payload-types'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ContinueWatchingItem } from '@/features/dashboard/services/continue-watching'

import { UpNextLogWatch } from './UpNextLogWatch'
import { UpNextProgressBadge } from './UpNextProgressBadge'

type UpNextPosterOverlayProps = {
  isHovered: boolean
  item: ContinueWatchingItem
  libraryItem: LibraryItem | undefined
}

export function UpNextPosterOverlay({ isHovered, item, libraryItem }: UpNextPosterOverlayProps) {
  return (
    <AspectRatio className="pointer-events-none absolute inset-x-0 top-0 z-10" ratio={2 / 3}>
      <div className="absolute inset-1 flex flex-col justify-between gap-2">
        <UpNextProgressBadge isHovered={isHovered} item={item} />
        <UpNextLogWatch libraryItem={libraryItem} />
      </div>
    </AspectRatio>
  )
}
