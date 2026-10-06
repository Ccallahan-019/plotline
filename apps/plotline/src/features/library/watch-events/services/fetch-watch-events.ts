import type { WatchEvent } from '@plotline/payload-types'

import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type { WatchEventFilters } from './query-keys'

export function fetchWatchEvents(filters?: WatchEventFilters): Promise<WatchEvent[]> {
  return fetchJson<WatchEvent[]>(
    `/api/watch-events${buildSearchParams({
      limit: filters?.limit,
      sort: filters?.sort,
    })}`,
  )
}
