'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

import { getErrorMessage } from '@/utils/get-error-message'

import { useTmdbGenres as useTmdbGenresHook } from '../hooks/use-tmdb-genres'
import { useMediaType } from './MediaTypeProvider'

type TmdbGenresContextValue = {
  discoverGenres: { id: number; name: string }[]
  errorMessage: null | string
  genreNameById: Map<number, string>
  isLoading: boolean
}

const TmdbGenresContext = createContext<null | TmdbGenresContextValue>(null)

export function TmdbGenresProvider({ children }: PropsWithChildren) {
  const { mediaType } = useMediaType()
  const { data, error, genreNameById, isLoading } = useTmdbGenresHook()

  const discoverGenres = mediaType === 'tv' ? (data?.tv ?? []) : (data?.movie ?? [])

  const errorMessage = getErrorMessage(error)

  const value: TmdbGenresContextValue = {
    discoverGenres,
    errorMessage,
    genreNameById,
    isLoading,
  }

  return <TmdbGenresContext.Provider value={value}>{children}</TmdbGenresContext.Provider>
}

export function useTmdbGenres() {
  const context = useContext(TmdbGenresContext)
  if (!context) {
    throw new Error('useTmdbGenre must be used within a TmdbGenreProvider')
  }
  return context
}
