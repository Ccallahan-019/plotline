'use client'

import type { PropsWithChildren } from 'react'

import { TMDB_FILTER_DEFINITIONS } from '@/features/media-grid/filters/definitions/default-registry'
import { FilterErrorsProvider } from '@/features/media-grid/filters/providers/FilterErrorsProvider'
import { FiltersProvider } from '@/features/media-grid/filters/providers/FiltersProvider'
import { OpenStateProvider } from '@/providers/OpenStateProvider'

export function SearchFiltersRootProvider({ children }: PropsWithChildren) {
  return (
    <OpenStateProvider>
      <FiltersProvider definitions={TMDB_FILTER_DEFINITIONS}>
        <FilterErrorsProvider>{children}</FilterErrorsProvider>
      </FiltersProvider>
    </OpenStateProvider>
  )
}
