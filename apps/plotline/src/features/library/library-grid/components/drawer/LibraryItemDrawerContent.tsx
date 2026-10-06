'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { useLibraryItemDrawerData } from '@/features/library/library-grid/hooks/use-library-item-drawer-data'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'

import { LibraryItemDrawerDetailsColumn } from './LibraryItemDrawerDetailsColumn'
import { LibraryItemDrawerPrimaryColumn } from './LibraryItemDrawerPrimaryColumn'
import { LibraryItemDrawerProgressColumn } from './LibraryItemDrawerProgressColumn'

type LibraryItemDrawerContentProps = {
  item: LibraryItem
}

export function LibraryItemDrawerContent({ item }: LibraryItemDrawerContentProps) {
  const { isLoadingWatchlists, viewModel } = useLibraryItemDrawerData(item)
  const media = getMediaFromLibraryItem(item)

  if (!viewModel || !media) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 md:gap-8 p-4">
      <LibraryItemDrawerPrimaryColumn libraryItem={item} viewModel={viewModel} />
      <LibraryItemDrawerProgressColumn viewModel={viewModel} />
      <LibraryItemDrawerDetailsColumn
        isLoadingWatchlists={isLoadingWatchlists}
        viewModel={viewModel}
      />
    </div>
  )
}
