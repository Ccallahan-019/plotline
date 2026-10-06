import { LibraryItem } from '@plotline/payload-types'
import { PencilLine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/utils/StatusBadge'
import { LogWatchPopover } from '@/features/library/log-watch/components/popover/LogWatchPopover'
import { MediaGridPoster } from '@/features/media-grid/grid/components/MediaGridPoster'

import { LibraryItemDrawerViewModel } from '../../types'
import { LibraryItemDrawerPlaceholder } from './LibraryItemDrawerPlaceholder'
import { LibraryItemDrawerSection } from './LibraryItemDrawerSection'

type LibraryItemDrawerPrimaryColumnProps = {
  libraryItem: LibraryItem
  viewModel: LibraryItemDrawerViewModel
}

export function LibraryItemDrawerPrimaryColumn({
  libraryItem,
  viewModel,
}: LibraryItemDrawerPrimaryColumnProps) {
  const durationLabel =
    viewModel.mediaType === 'movie' ? viewModel.runtimeLabel : viewModel.tvDurationLabel

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex gap-4">
          <MediaGridPoster className="w-32 h-auto" media={viewModel.media} ratio={2 / 3} />

          <div className="flex flex-col gap-1">
            <p className="font-heading text-md font-medium text-foreground">{viewModel.title}</p>

            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <LibraryItemDrawerPlaceholder
                  className="text-xs text-muted-foreground"
                  value={viewModel.releaseYear}
                />
                <span className="text-xs text-muted-foreground">&middot;</span>
                <LibraryItemDrawerPlaceholder
                  className="text-xs text-muted-foreground"
                  value={viewModel.mediaTypeLabel}
                />
              </div>

              <LibraryItemDrawerPlaceholder
                className="text-xs text-muted-foreground"
                value={durationLabel}
              />

              <StatusBadge className="h-6 -ml-0.5 mt-1.5" status={viewModel.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <LogWatchPopover libraryItem={libraryItem} />
        <Button className="w-fit" disabled type="button" variant="secondary">
          Update Status
        </Button>
      </div>

      <LibraryItemDrawerSection title="Personal Notes">
        <div className="flex flex-col gap-2 items-end">
          <Textarea
            disabled
            placeholder="Your personal notes..."
            value={viewModel.personalNotes ?? ''}
          />
          <Button className="w-fit" disabled type="button" variant="secondary">
            <PencilLine data-icon="inline-start" />
            Save Notes
          </Button>
        </div>
      </LibraryItemDrawerSection>
    </div>
  )
}
