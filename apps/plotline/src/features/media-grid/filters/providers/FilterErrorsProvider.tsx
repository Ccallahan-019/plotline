'use client'

import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

import type { FilterValidationErrors } from '../types'

type FilterErrorsContextValue = {
  clearErrors: () => void
  errors: FilterValidationErrors
  setError: (key: string, error: null | string) => void
  setErrors: (errors: FilterValidationErrors) => void
}

const FilterErrorsContext = createContext<FilterErrorsContextValue | null>(null)

export function FilterErrorsProvider({ children }: PropsWithChildren) {
  const [errors, setErrorsState] = useState<FilterValidationErrors>({})

  const setError = useCallback((key: string, error: null | string) => {
    setErrorsState((current) => ({
      ...current,
      [key]: error,
    }))
  }, [])

  const setErrors = useCallback((nextErrors: FilterValidationErrors) => {
    setErrorsState(nextErrors)
  }, [])

  const clearErrors = useCallback(() => {
    setErrorsState({})
  }, [])

  const value = useMemo(
    () => ({
      clearErrors,
      errors,
      setError,
      setErrors,
    }),
    [clearErrors, errors, setError, setErrors],
  )

  return <FilterErrorsContext.Provider value={value}>{children}</FilterErrorsContext.Provider>
}

export function useFilterErrors() {
  const context = useContext(FilterErrorsContext)

  if (!context) {
    throw new Error('useFilterErrors must be used within a FilterErrorsProvider')
  }

  return context
}
