import type { TmdbSearchResponse } from '@plotline/shared/tmdb'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import type { MediaFilters } from '@/features/media-grid/filters/types'
import type { BrowseMode, SearchMediaType, SearchSort } from '@/features/search/types'

import { fetchTmdbBrowse } from '@/features/search/services/fetch-tmdb'
import { searchQueryKeys } from '@/features/search/services/query-keys'
import { isBrowseRequestEnabled } from '@/features/search/services/search-filters'

const DEBOUNCE_MS = 300

type UseTmdbBrowseOptions = {
  debounceMs?: number
  enabled?: boolean
  filters: MediaFilters
  mediaType: SearchMediaType
  mode: BrowseMode
  page?: number
  sort: SearchSort
}

export function useTmdbBrowse(
  query: string,
  {
    debounceMs = DEBOUNCE_MS,
    enabled = true,
    filters,
    mediaType,
    mode,
    page = 1,
    sort,
  }: UseTmdbBrowseOptions,
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim())

  useEffect(() => {
    const trimmed = query.trim()
    const timer = window.setTimeout(() => setDebouncedQuery(trimmed), debounceMs)

    return () => window.clearTimeout(timer)
  }, [debounceMs, query])

  const shouldFetch = enabled && isBrowseRequestEnabled(mode, debouncedQuery)

  return useQuery<TmdbSearchResponse>({
    enabled: shouldFetch,
    placeholderData: (previousData) => previousData,
    queryFn: () => fetchTmdbBrowse(mode, debouncedQuery, mediaType, filters, sort, page),
    queryKey: searchQueryKeys.tmdbSearch(mode, debouncedQuery, mediaType, filters, sort, page),
  })
}
