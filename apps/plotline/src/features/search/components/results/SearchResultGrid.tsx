'use client'

import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { MediaGrid } from '@/features/media-grid/grid/components/MediaGrid'
import { cn } from '@/lib/utils'
import { OpenStateProvider } from '@/providers/OpenStateProvider'

import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'
import { SearchResultEmpty } from './SearchResultEmpty'
import { SearchResultMediaGridItem } from './SearchResultMediaGridItem'

const ERROR_EMPTY_PROPS = {
  description: 'Check your connection and TMDB configuration, then try again.',
  title: 'Could not load results',
}

export function SearchResultGrid() {
  const { errorMessage, isFetching, isInitialLoading, searchResults, showPrompt } = useTmdbBrowse()

  const state = errorMessage
    ? 'error'
    : isInitialLoading
      ? 'loading'
      : showPrompt || searchResults?.results.length === 0
        ? 'empty'
        : 'success'

  return (
    <MediaGrid
      className={cn(isFetching && 'pointer-events-none opacity-50')}
      items={searchResults?.results ?? []}
      renderItem={(result) => (
        <OpenStateProvider key={`${result.id}-${result.media_type}`}>
          <SearchResultMediaGridItem item={result} />
        </OpenStateProvider>
      )}
      state={state}
      states={{
        emptyState: <SearchResultEmpty />,
        errorState: <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />,
      }}
    />
  )
}
