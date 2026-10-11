'use client'

import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'

import type { BreadcrumbOverride } from '../services/apply-breadcrumb-override'

type BreadcrumbOverrideContextValue = {
  override: BreadcrumbOverride | null
  setOverride: (override: BreadcrumbOverride | null) => void
}

const BreadcrumbOverrideContext = createContext<BreadcrumbOverrideContextValue | null>(null)

export function BreadcrumbOverrideProvider({ children }: PropsWithChildren) {
  const [override, setOverride] = useState<BreadcrumbOverride | null>(null)
  const value = useMemo(() => ({ override, setOverride }), [override])

  return (
    <BreadcrumbOverrideContext.Provider value={value}>{children}</BreadcrumbOverrideContext.Provider>
  )
}

export function useBreadcrumbOverride(): BreadcrumbOverrideContextValue {
  const context = useContext(BreadcrumbOverrideContext)

  if (!context) {
    return { override: null, setOverride: () => undefined }
  }

  return context
}
