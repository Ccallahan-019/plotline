'use client'

import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

import type { FilterDefinition, MediaFilters } from '../types'

import { DEFAULT_MEDIA_FILTERS } from '../constants'
import { normalizeMediaFilters } from '../services/normalize-filters'
import { removeFilterByKey } from '../services/remove-filter'

type FiltersContextValue = {
  appliedFilters: MediaFilters
  applyDraft: () => void
  clearAll: () => void
  draftFilters: MediaFilters
  removeFilter: (key: string) => void
  setAppliedFilters: (filters: MediaFilters) => void
  setDraftFilters: (filters: MediaFilters) => void
}

const FiltersContext = createContext<FiltersContextValue | null>(null)

type FiltersProviderProps = PropsWithChildren<{
  definitions: FilterDefinition[]
  initialFilters?: MediaFilters
}>

export function FiltersProvider({
  children,
  definitions,
  initialFilters = DEFAULT_MEDIA_FILTERS,
}: FiltersProviderProps) {
  const [appliedFilters, setAppliedFilters] = useState<MediaFilters>(
    normalizeMediaFilters(initialFilters),
  )
  const [draftFilters, setDraftFilters] = useState<MediaFilters>(
    normalizeMediaFilters(initialFilters),
  )

  const applyDraft = useCallback(() => {
    setAppliedFilters(normalizeMediaFilters(draftFilters))
  }, [draftFilters])

  const clearAll = useCallback(() => {
    setDraftFilters(DEFAULT_MEDIA_FILTERS)
    setAppliedFilters(DEFAULT_MEDIA_FILTERS)
  }, [])

  const removeFilter = useCallback(
    (key: string) => {
      setAppliedFilters((current) => removeFilterByKey(current, key, definitions))
      setDraftFilters((current) => removeFilterByKey(current, key, definitions))
    },
    [definitions],
  )

  const value = useMemo(
    () => ({
      appliedFilters,
      applyDraft,
      clearAll,
      draftFilters,
      removeFilter,
      setAppliedFilters: (filters: MediaFilters) => {
        setAppliedFilters(normalizeMediaFilters(filters))
      },
      setDraftFilters: (filters: MediaFilters) => {
        setDraftFilters(filters)
      },
    }),
    [appliedFilters, applyDraft, clearAll, draftFilters, removeFilter],
  )

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFilters() {
  const context = useContext(FiltersContext)

  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider')
  }

  return context
}
