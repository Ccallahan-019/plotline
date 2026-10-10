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

/**
 * Debounced TMDB title search in search mode.
 *
 * Queries shorter than the minimum length never hit the network, and a cleared
 * field drops the previous query immediately. Longer text waits `debounceMs`.
 *
 * @param query - Raw title text from the input
 * @param options.debounceMs - Delay before a long-enough query is sent
 * @param options.enabled - When `false`, no request is made
 * @param options.mediaType - Movie or TV catalog to search
 * @param options.page - Result page, starting at 1
 * @returns The React Query result plus `debouncedQuery`, the text last applied
 */
export function useTmdbSearch(query: string, options?: UseTmdbSearchOptions) {
  const page = options?.page ?? 1
  const debounceMs = options?.debounceMs ?? DEBOUNCE_MS
  const mediaType = options?.mediaType ?? DEFAULT_SEARCH_MEDIA_TYPE
  const trimmedQuery = query.trim()
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery)

  // Drop below the minimum immediately so a cleared field does not keep the last search.
  if (!isBrowseRequestEnabled('search', trimmedQuery) && debouncedQuery !== trimmedQuery) {
    setDebouncedQuery(trimmedQuery)
  }

  useEffect(() => {
    if (!isBrowseRequestEnabled('search', trimmedQuery)) {
      return
    }

    const timer = window.setTimeout(() => setDebouncedQuery(trimmedQuery), debounceMs)

    return () => window.clearTimeout(timer)
  }, [debounceMs, trimmedQuery])

  const enabled = (options?.enabled ?? true) && isBrowseRequestEnabled('search', debouncedQuery)
  const searchQuery = useQuery<TmdbSearchResponse>({
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

  return {
    ...searchQuery,
    debouncedQuery,
  }
}
