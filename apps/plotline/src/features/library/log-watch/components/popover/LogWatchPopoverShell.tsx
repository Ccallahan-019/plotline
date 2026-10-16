import { LibraryItem, Media } from '@plotline/payload-types'

import { useLogWatchPopoverShell } from '../../hooks/use-log-watch-popover-shell'
import { LogWatchDialog } from '../LogWatchDialog'
import { LogWatchQuickForm } from '../LogWatchQuickForm'
import { LogWatchPopoverChrome } from './LogWatchPopoverChrome'

type LogWatchPopoverShellProps = {
  libraryItem: LibraryItem
  media: Media
}

export function LogWatchPopoverShell({ libraryItem, media }: LogWatchPopoverShellProps) {
  const {
    form,
    handleDialogOpenChange,
    handleMoreOptions,
    isDialogOpen,
    isSubmitting,
    watchedCoverage,
  } = useLogWatchPopoverShell({ libraryItem, media })

  return (
    <>
      <LogWatchPopoverChrome disabled={isSubmitting} media={media}>
        <LogWatchQuickForm
          form={form}
          isSubmitting={isSubmitting}
          media={media}
          onMoreOptions={handleMoreOptions}
        />
      </LogWatchPopoverChrome>

      <LogWatchDialog
        form={form}
        isSubmitting={isSubmitting}
        media={media}
        onOpenChange={handleDialogOpenChange}
        open={isDialogOpen}
        watchedCoverage={watchedCoverage}
      />
    </>
  )
}
