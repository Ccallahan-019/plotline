'use client'

import type { MediaType } from '@plotline/shared/constants'

import { useQuery } from '@tanstack/react-query'

import type { MediaTitlePageData } from '../types'

import { fetchMediaTitle } from '../services/fetch-media-title'
import { mediaTitleQueryKeys } from '../services/query-keys'

/**
 * Loads the title page and keeps the server payload as the first paint.
 *
 * Refetches after library mutations invalidate the `media-title` key. The query
 * stays fresh for about 30 seconds so opening the page does not immediately
 * repeat the TMDB upsert.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @param initialData - Payload prefetched by the server page
 * @returns A React Query result for `MediaTitlePageData`
 */
export function useMediaTitlePage(
  mediaType: MediaType,
  tmdbId: number,
  initialData: MediaTitlePageData,
) {
  return useQuery({
    initialData,
    queryFn: () => fetchMediaTitle({ mediaType, tmdbId }),
    queryKey: mediaTitleQueryKeys.detail(mediaType, tmdbId),
    staleTime: 30_000,
  })
}
