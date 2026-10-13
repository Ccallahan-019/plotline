import type { StreamingPlatform } from '@plotline/shared/constants'

import { getStreamingPlatformMeta } from '@plotline/shared/constants'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import {
  fetchStreamingPlatformLogos,
  STREAMING_PLATFORM_LOGO_REGION,
} from '../services/fetch-streaming-platform-logos'

const STALE_TIME_MS = 1000 * 60 * 60 * 24

type UseStreamingPlatformLogosOptions = {
  enabled?: boolean
}

export function useStreamingPlatformLogos(options?: UseStreamingPlatformLogosOptions) {
  const query = useQuery({
    enabled: options?.enabled ?? true,
    queryFn: fetchStreamingPlatformLogos,
    queryKey: ['tmdb-watch-providers', 'movie', STREAMING_PLATFORM_LOGO_REGION],
    staleTime: STALE_TIME_MS,
  })

  const logoPathByProviderId = useMemo(() => {
    const map = new Map<number, string>()

    for (const provider of query.data?.providers ?? []) {
      if (provider.logoPath) {
        map.set(provider.id, provider.logoPath)
      }
    }

    return map
  }, [query.data])

  const getPlatformLogoPath = useCallback(
    (platform: StreamingPlatform): null | string => {
      const providerId = getStreamingPlatformMeta(platform).tmdbProviderId

      if (providerId == null) {
        return null
      }

      return logoPathByProviderId.get(providerId) ?? null
    },
    [logoPathByProviderId],
  )

  return {
    ...query,
    getPlatformLogoPath,
    logoPathByProviderId,
  }
}
