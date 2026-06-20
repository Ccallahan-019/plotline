'use client'

import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { useFilters } from '@/features/media-grid/filters/providers/FiltersProvider'
import { MediaGrid } from '@/features/media-grid/grid/components/MediaGrid'
import { cn } from '@/lib/utils'
import { OpenStateProvider } from '@/providers/OpenStateProvider'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'
import { LibraryGridEmpty } from './LibraryGridEmpty'
import { LibraryGridItem } from './LibraryGridItem'

const ERROR_EMPTY_PROPS = {
  description: 'Ensure the payload app is running and service credentials are configured.',
  title: 'Could not load library',
}

export function LibraryGrid() {
  const { appliedFilters } = useFilters()
  const { errorMessage, isFetching, isInitialLoading, libraryItems } = useLibraryBrowse()

  const items = libraryItems?.docs ?? []

  const state = errorMessage
    ? 'error'
    : isInitialLoading
      ? 'loading'
      : items.length === 0
        ? 'empty'
        : 'success'

  return (
    <MediaGrid
      className={cn(isFetching && 'pointer-events-none opacity-50')}
      items={items}
      renderItem={(item) => (
        <OpenStateProvider key={item.id}>
          <LibraryGridItem item={item} />
        </OpenStateProvider>
      )}
      state={state}
      states={{
        emptyState: <LibraryGridEmpty filters={appliedFilters} />,
        errorState: <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />,
      }}
    />
  )
}
