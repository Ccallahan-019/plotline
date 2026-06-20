'use client'

import type { PropsWithChildren } from 'react'

import { LIBRARY_FILTER_DEFINITIONS } from '@/features/media-grid/filters/definitions/default-registry'
import { FilterErrorsProvider } from '@/features/media-grid/filters/providers/FilterErrorsProvider'
import { FiltersProvider } from '@/features/media-grid/filters/providers/FiltersProvider'
import { OpenStateProvider } from '@/providers/OpenStateProvider'

export function LibraryFiltersRootProvider({ children }: PropsWithChildren) {
  return (
    <OpenStateProvider>
      <FiltersProvider definitions={LIBRARY_FILTER_DEFINITIONS}>
        <FilterErrorsProvider>{children}</FilterErrorsProvider>
      </FiltersProvider>
    </OpenStateProvider>
  )
}
