'use client'

import type { ReactNode } from 'react'

import { OpenStateProvider } from '@/providers/OpenStateProvider'

import type { FilterDefinition, FilterRenderContext, MediaFilters } from '../types'

import { DEFAULT_FILTER_DEFINITIONS } from '../definitions/default-registry'
import { FilterErrorsProvider } from './FilterErrorsProvider'
import { FilterRegistryProvider } from './FilterRegistryProvider'
import { FiltersProvider } from './FiltersProvider'

type MediaFiltersProviderProps = {
  children: ReactNode
  context?: FilterRenderContext
  definitions?: FilterDefinition[]
  initialFilters?: MediaFilters
  visibleKeys?: string[]
}

/**
 * Composes the filter providers needed by FilterBar and FilterSheet.
 */
export function MediaFiltersProvider({
  children,
  context,
  definitions = DEFAULT_FILTER_DEFINITIONS,
  initialFilters,
  visibleKeys,
}: MediaFiltersProviderProps) {
  return (
    <OpenStateProvider>
      <FiltersProvider definitions={definitions} initialFilters={initialFilters}>
        <FilterErrorsProvider>
          <FilterRegistryProvider
            context={context}
            definitions={definitions}
            visibleKeys={visibleKeys}
          >
            {children}
          </FilterRegistryProvider>
        </FilterErrorsProvider>
      </FiltersProvider>
    </OpenStateProvider>
  )
}
