'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

import { getErrorMessage } from '@/utils/get-error-message'

import { useTmdbWatchProviders as useTmdbWatchProvidersHook } from '../hooks/use-tmdb-watch-providers'
import { useMediaType } from './MediaTypeProvider'

type TmdbWatchProvidersContextValue = {
  errorMessage: null | string
  isLoading: boolean
  providerNameById: Map<number, string>
  providers: { id: number; logoPath?: null | string; name: string }[]
  region: string | undefined
}

const TmdbWatchProvidersContext = createContext<null | TmdbWatchProvidersContextValue>(null)

export function TmdbWatchProvidersProvider({ children }: PropsWithChildren) {
  const { mediaType } = useMediaType()
  const { error, isLoading, providerNameById, providers, region } =
    useTmdbWatchProvidersHook(mediaType)

  const value: TmdbWatchProvidersContextValue = {
    errorMessage: getErrorMessage(error),
    isLoading,
    providerNameById,
    providers,
    region,
  }

  return (
    <TmdbWatchProvidersContext.Provider value={value}>
      {children}
    </TmdbWatchProvidersContext.Provider>
  )
}

export function useTmdbWatchProviders() {
  const context = useContext(TmdbWatchProvidersContext)

  if (!context) {
    throw new Error('useTmdbWatchProviders must be used within a TmdbWatchProvidersProvider')
  }

  return context
}
