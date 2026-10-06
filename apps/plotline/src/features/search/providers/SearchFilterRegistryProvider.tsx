'use client'

import { type PropsWithChildren, useMemo } from 'react'

import { TMDB_FILTER_DEFINITIONS } from '@/features/media-grid/filters/definitions/default-registry'
import { FilterRegistryProvider } from '@/features/media-grid/filters/providers/FilterRegistryProvider'

import { useTmdbGenres } from './TmdbGenresProvider'
import { useTmdbWatchProviders } from './TmdbWatchProvidersProvider'

export function SearchFilterRegistryProvider({ children }: PropsWithChildren) {
  const { discoverGenres, genreNameById } = useTmdbGenres()
  const { providerNameById, providers, region } = useTmdbWatchProviders()

  const context = useMemo(
    () => ({
      genreNameById,
      genres: discoverGenres,
      providerNameById,
      providerRegion: region,
      providers: providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
      })),
    }),
    [discoverGenres, genreNameById, providerNameById, providers, region],
  )

  return (
    <FilterRegistryProvider context={context} definitions={TMDB_FILTER_DEFINITIONS}>
      {children}
    </FilterRegistryProvider>
  )
}
