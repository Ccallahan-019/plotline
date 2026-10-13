import { LibraryItem } from '@plotline/payload-types'

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { StatusBadge } from '@/components/utils/StatusBadge'
import { LogWatchPopover } from '@/features/library/log-watch/components/popover/LogWatchPopover'
import { MediaGridPoster } from '@/features/media-grid/grid/components/MediaGridPoster'

import { LibraryItemDrawerViewModel } from '../../types'
import { LibraryItemPersonalNotes } from './LibraryItemPersonalNotes'
import { UpdateLibraryItemStatusPopover } from './UpdateLibraryItemStatusPopover'

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

  const itemDescription = buildItemDescription(
    viewModel.releaseYear,
    viewModel.mediaTypeLabel,
    durationLabel,
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Item className="p-0 items-start">
          <ItemMedia>
            <MediaGridPoster className="w-32 h-auto" media={viewModel.media} ratio={2 / 3} />
          </ItemMedia>

          <ItemContent>
            <ItemTitle>{viewModel.title}</ItemTitle>
            <ItemDescription>{itemDescription}</ItemDescription>

            <StatusBadge className="h-6 -ml-0.5 mt-1.5" status={viewModel.status} />
          </ItemContent>
        </Item>
      </div>

      <div className="flex gap-2">
        <LogWatchPopover libraryItem={libraryItem} />
        <UpdateLibraryItemStatusPopover
          libraryItem={libraryItem}
          status={viewModel.status}
          title={viewModel.title}
        />
      </div>

      <LibraryItemPersonalNotes libraryItem={libraryItem} personalNotes={viewModel.personalNotes} />
    </div>
  )
}

function buildItemDescription(
  releaseYear: null | string,
  mediaTypeLabel: null | string,
  durationLabel: null | string,
) {
  return [releaseYear, mediaTypeLabel, durationLabel].filter(Boolean).join(' · ')
}
