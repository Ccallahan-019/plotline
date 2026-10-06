import type { TmdbSearchResponse } from '@plotline/shared/tmdb'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { fetchTmdbSearch } from '@/features/search/services/fetch-tmdb'
import { searchQueryKeys } from '@/features/search/services/query-keys'
import { isBrowseRequestEnabled } from '@/features/search/services/search-filters'
import {
  DEFAULT_SEARCH_FILTERS,
  DEFAULT_SEARCH_MEDIA_TYPE,
  DEFAULT_SEARCH_SORT,
  type SearchMediaType,
} from '@/features/search/types'

const DEBOUNCE_MS = 300

type UseTmdbSearchOptions = {
  debounceMs?: number
  enabled?: boolean
  mediaType?: SearchMediaType
  page?: number
}

export function useTmdbSearch(query: string, options?: UseTmdbSearchOptions) {
  const page = options?.page ?? 1
  const debounceMs = options?.debounceMs ?? DEBOUNCE_MS
  const mediaType = options?.mediaType ?? DEFAULT_SEARCH_MEDIA_TYPE
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim())

  useEffect(() => {
    const trimmed = query.trim()
    const timer = window.setTimeout(() => setDebouncedQuery(trimmed), debounceMs)

    return () => window.clearTimeout(timer)
  }, [debounceMs, query])

  const enabled = (options?.enabled ?? true) && isBrowseRequestEnabled('search', debouncedQuery)

  return useQuery<TmdbSearchResponse>({
    enabled,
    queryFn: () => fetchTmdbSearch(debouncedQuery, page, mediaType),
    queryKey: searchQueryKeys.tmdbSearch(
      'search',
      debouncedQuery,
      mediaType,
      DEFAULT_SEARCH_FILTERS,
      DEFAULT_SEARCH_SORT,
      page,
    ),
  })
}
