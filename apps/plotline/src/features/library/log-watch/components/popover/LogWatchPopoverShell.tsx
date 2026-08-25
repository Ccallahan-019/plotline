import { LibraryItem, Media } from '@plotline/payload-types'

import { ShowIf } from '@/components/utils/ShowIf'

import { useLogWatchForm } from '../../hooks/use-log-watch-form'
import { syncQuickLogEpisode } from '../../services/episode-field'
import { LogWatchDialog } from '../LogWatchDialog'
import { LogWatchQuickForm } from '../LogWatchQuickForm'
import { LogWatchPopoverChrome } from './LogWatchPopoverChrome'

type LogWatchPopoverShellProps = {
  dialogOpen: boolean
  libraryItem: LibraryItem
  media: Media
  onDialogOpenChange: (open: boolean) => void
  onPopoverOpenChange: (open: boolean) => void
  popoverOpen: boolean
}

export function LogWatchPopoverShell({
  dialogOpen,
  libraryItem,
  media,
  onDialogOpenChange,
  onPopoverOpenChange,
  popoverOpen,
}: LogWatchPopoverShellProps) {
  const { form, isSubmitting } = useLogWatchForm({
    libraryItem,
    media,
    onSuccess: () => {
      onPopoverOpenChange(false)
      onDialogOpenChange(false)
    },
  })

  const handlePopoverOpenChange = (nextOpen: boolean) => {
    if (dialogOpen) {
      return
    }

    onPopoverOpenChange(nextOpen)
  }

  // Dialog cancel/dismiss must not leave a hidden multi-select; the popover only edits
  // `episode`, and submit keys off `episodes.length`. Collapse back to the quick-log row.
  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      syncQuickLogEpisode(form)
    }

    onDialogOpenChange(nextOpen)
  }

  const handleMoreOptions = () => {
    if (form.getFieldValue('episodes').length <= 1) {
      syncQuickLogEpisode(form)
    }

    onDialogOpenChange(true)
    onPopoverOpenChange(false)
  }

  return (
    <>
      <LogWatchPopoverChrome
        disabled={isSubmitting}
        media={media}
        onPopoverOpenChange={handlePopoverOpenChange}
        popoverOpen={popoverOpen}
      >
        <ShowIf condition={popoverOpen}>
          <LogWatchQuickForm
            form={form}
            isSubmitting={isSubmitting}
            media={media}
            onMoreOptions={handleMoreOptions}
          />
        </ShowIf>
      </LogWatchPopoverChrome>

      <LogWatchDialog
        form={form}
        isSubmitting={isSubmitting}
        media={media}
        onOpenChange={handleDialogOpenChange}
        open={dialogOpen}
      />
    </>
  )
}
