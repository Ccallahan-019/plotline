import type { CollectionBeforeValidateHook } from 'payload'

import { toNonNegativeInteger } from '@plotline/shared/utils/toNonNegativeInteger'

type GenreRow = {
  id?: number | string
  name?: unknown
  tmdbId?: number
}

export function normalizeMediaGenreRows(genres: unknown): unknown {
  if (!Array.isArray(genres)) {
    return genres
  }

  return genres.map((genre) => {
    if (genre == null || typeof genre !== 'object') {
      return genre
    }

    const row = genre as GenreRow
    const tmdbId = toNonNegativeInteger(row.tmdbId) ?? toNonNegativeInteger(row.id)

    const nextRow: Record<string, unknown> = { ...row }

    if (toNonNegativeInteger(row.id) != null) {
      delete nextRow.id
    }

    if (tmdbId != null) {
      nextRow.tmdbId = tmdbId
    }

    return nextRow
  })
}

export const normalizeMediaGenres: CollectionBeforeValidateHook = ({ data }) => {
  if (!data || !('genres' in data)) {
    return data
  }

  return {
    ...data,
    genres: normalizeMediaGenreRows(data.genres),
  }
}
