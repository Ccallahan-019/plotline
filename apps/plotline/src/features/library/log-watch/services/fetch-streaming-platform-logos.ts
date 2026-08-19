import type { TmdbWatchProvidersResponse } from '@/features/search/types'

import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

const PLATFORM_LOGO_MEDIA_TYPE = 'movie'

export const STREAMING_PLATFORM_LOGO_REGION = 'US'

export function fetchStreamingPlatformLogos(): Promise<TmdbWatchProvidersResponse> {
  return fetchJson<TmdbWatchProvidersResponse>(
    `/api/tmdb/watch-providers${buildSearchParams({
      mediaType: PLATFORM_LOGO_MEDIA_TYPE,
      region: STREAMING_PLATFORM_LOGO_REGION,
    })}`,
  )
}
