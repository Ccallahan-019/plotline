import type { TmdbKeywordSearchResponse } from '@plotline/shared/tmdb'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { fetchTmdbKeywords } from '@/features/search/services/fetch-tmdb'
import { searchQueryKeys } from '@/features/search/services/query-keys'
import { MIN_TMDB_QUERY_LENGTH } from '@/features/search/services/search-filters'

const DEBOUNCE_MS = 300

type UseTmdbKeywordsOptions = {
  debounceMs?: number
  enabled?: boolean
}

/**
 * Debounced TMDB keyword typeahead.
 *
 * Queries shorter than the title-search minimum never hit the network, and a
 * cleared field drops the previous query immediately. Longer text waits `debounceMs`.
 * The request is always the first page of matches.
 *
 * @param query - Raw keyword text from the input
 * @param options.debounceMs - Delay before a long-enough query is sent
 * @param options.enabled - When `false`, no request is made
 * @returns The React Query result plus `debouncedQuery`, the text last applied
 */
export function useTmdbKeywords(query: string, options?: UseTmdbKeywordsOptions) {
  const debounceMs = options?.debounceMs ?? DEBOUNCE_MS
  const trimmedQuery = query.trim()
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery)

  // Drop below the minimum immediately so a cleared field does not keep the last search.
  if (!isKeywordQueryReady(trimmedQuery) && debouncedQuery !== trimmedQuery) {
    setDebouncedQuery(trimmedQuery)
  }

  useEffect(() => {
    if (!isKeywordQueryReady(trimmedQuery)) {
      return
    }

    const timer = window.setTimeout(() => setDebouncedQuery(trimmedQuery), debounceMs)

    return () => window.clearTimeout(timer)
  }, [debounceMs, trimmedQuery])

  const enabled = (options?.enabled ?? true) && isKeywordQueryReady(debouncedQuery)

  const keywordsQuery = useQuery<TmdbKeywordSearchResponse>({
    enabled,
    queryFn: () => fetchTmdbKeywords(debouncedQuery),
    queryKey: searchQueryKeys.tmdbKeywords(debouncedQuery),
  })

  return {
    ...keywordsQuery,
    debouncedQuery,
  }
}

// True when the keyword text is long enough to search, matching title search.
function isKeywordQueryReady(query: string): boolean {
  return query.length >= MIN_TMDB_QUERY_LENGTH
}
