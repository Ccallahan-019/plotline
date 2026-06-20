'use client'

import { type PropsWithChildren, useMemo } from 'react'

import { LIBRARY_FILTER_DEFINITIONS } from '@/features/media-grid/filters/definitions/default-registry'
import { FilterRegistryProvider } from '@/features/media-grid/filters/providers/FilterRegistryProvider'
import { useWatchlists } from '@/features/watchlists/hooks/use-watchlists'

export function LibraryFilterRegistryProvider({ children }: PropsWithChildren) {
  const { data: watchlists = [] } = useWatchlists()

  const context = useMemo(
    () => ({
      watchlistNameById: new Map(watchlists.map((watchlist) => [watchlist.id, watchlist.name])),
      watchlists: watchlists.map((watchlist) => ({
        id: watchlist.id,
        name: watchlist.name,
      })),
    }),
    [watchlists],
  )

  return (
    <FilterRegistryProvider context={context} definitions={LIBRARY_FILTER_DEFINITIONS}>
      {children}
    </FilterRegistryProvider>
  )
}
