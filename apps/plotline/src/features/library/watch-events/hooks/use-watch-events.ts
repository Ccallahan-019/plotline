import type { WatchEvent } from '@plotline/payload-types'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { fetchWatchEvents } from '../services/fetch-watch-events'
import { type WatchEventFilters, watchEventQueryKeys } from '../services/query-keys'

type UseWatchEventsOptions = {
  initialData?: WatchEvent[]
}

export function useWatchEvents(filters?: WatchEventFilters, options?: UseWatchEventsOptions) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchWatchEvents(filters),
    queryKey: watchEventQueryKeys.watchEvents(filters),
  } satisfies UseQueryOptions<WatchEvent[]>)
}
