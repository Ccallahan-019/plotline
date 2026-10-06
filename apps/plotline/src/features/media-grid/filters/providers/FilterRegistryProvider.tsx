'use client'

import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

import type { FilterDefinition, FilterRegistry, FilterRenderContext } from '../types'

type FilterRegistryContextValue = {
  context: FilterRenderContext
  visibleDefinitions: FilterDefinition[]
} & FilterRegistry

const FilterRegistryContext = createContext<FilterRegistryContextValue | null>(null)

type FilterRegistryProviderProps = PropsWithChildren<{
  context?: FilterRenderContext
  definitions: FilterDefinition[]
  visibleKeys?: string[]
}>

export function FilterRegistryProvider({
  children,
  context = {},
  definitions,
  visibleKeys,
}: FilterRegistryProviderProps) {
  const visibleDefinitions = useMemo(() => {
    const enabledDefinitions = definitions.filter((definition) => {
      if (definition.isEnabled && !definition.isEnabled(context)) {
        return false
      }

      return true
    })

    if (!visibleKeys) {
      return enabledDefinitions
    }

    const visibleKeySet = new Set(visibleKeys)

    return enabledDefinitions.filter((definition) => visibleKeySet.has(definition.key))
  }, [context, definitions, visibleKeys])

  const value = useMemo(
    () => ({
      context,
      definitions,
      visibleDefinitions,
    }),
    [context, definitions, visibleDefinitions],
  )

  return <FilterRegistryContext.Provider value={value}>{children}</FilterRegistryContext.Provider>
}

export function useFilterRegistry() {
  const registryContext = useContext(FilterRegistryContext)

  if (!registryContext) {
    throw new Error('useFilterRegistry must be used within a FilterRegistryProvider')
  }

  return registryContext
}
