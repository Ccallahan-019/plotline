'use client'

import type { MediaType } from '@plotline/shared/constants'

import { useMemo } from 'react'

import { useLibraryItemsLookup } from '@/features/library/library-grid/hooks/use-library-items-lookup'
import { MediaGrid } from '@/features/media-grid/grid/components/MediaGrid'
import { buildLibraryItemLookupByTmdb } from '@/features/search/services/build-library-item-lookup'
import { OpenStateProvider } from '@/providers/OpenStateProvider'

import { useTmdbSimilar } from '../../hooks/use-tmdb-similar'
import { MediaSimilarGridItem } from './MediaSimilarGridItem'
import { MediaSimilarTitlesEmpty } from './MediaSimilarTitlesEmpty'
import { MediaSimilarTitlesError } from './MediaSimilarTitlesError'

type MediaSimilarTabProps = {
  enabled: boolean
  mediaType: MediaType
  tmdbId: number
}

export function MediaSimilarTab({ enabled, mediaType, tmdbId }: MediaSimilarTabProps) {
  const query = useTmdbSimilar(mediaType, tmdbId, { enabled })
  const libraryQuery = useLibraryItemsLookup({ enabled })
  const lookup = useMemo(
    () => buildLibraryItemLookupByTmdb(libraryQuery.data ?? []),
    [libraryQuery.data],
  )
  const results = query.data?.results ?? []
  const state = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : results.length === 0
        ? 'empty'
        : 'success'

  return (
    <MediaGrid
      items={results}
      renderItem={(result) => (
        <OpenStateProvider key={`${result.id}-${result.media_type}`}>
          <MediaSimilarGridItem item={result} lookup={lookup} />
        </OpenStateProvider>
      )}
      state={state}
      states={{
        emptyState: <MediaSimilarTitlesEmpty mediaType={mediaType} />,
        errorState: (
          <MediaSimilarTitlesError
            isFetching={query.isFetching}
            mediaType={mediaType}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ),
      }}
    />
  )
}
