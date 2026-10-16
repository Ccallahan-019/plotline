import { LibraryItem } from '@plotline/payload-types'

import { LogWatchPopover } from '@/features/library/log-watch/components/popover/LogWatchPopover'

type UpNextLogWatchProps = {
  libraryItem: LibraryItem | undefined
}

export function UpNextLogWatch({ libraryItem }: UpNextLogWatchProps) {
  if (!libraryItem) {
    return null
  }

  return (
    <div className="pointer-events-auto mt-auto flex justify-end">
      <LogWatchPopover libraryItem={libraryItem} triggerLabel={null} triggerSize="icon-sm" />
    </div>
  )
}
