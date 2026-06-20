import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants/media'

import type { AddToListsFormInput } from '@/features/library/types/mutations'
import type { MediaDisplay } from '@/features/media-grid/types'

import { getMediaFromLibraryItem } from '../../services/get-media-from-library-item'
import { toAddToListTmdbMediaInput } from './to-add-to-list-media-input'

export type AddToLibraryFormValues = {
  note: string
  status: MediaStatus
  watchlistIds: number[]
}

export function resolveAddToLibraryMedia(
  media: MediaDisplay,
  existingLibraryItem?: LibraryItem,
): AddToListsFormInput['media'] {
  if (existingLibraryItem) {
    const payloadMedia = getMediaFromLibraryItem(existingLibraryItem)

    if (payloadMedia) {
      return { mediaId: payloadMedia.id }
    }
  }

  return toAddToListTmdbMediaInput(media)
}

export const DEFAULT_ADD_TO_LIBRARY_FORM_VALUES: AddToLibraryFormValues = {
  note: '',
  status: 'planned',
  watchlistIds: [],
}

export type AddToLibraryFieldErrors = {
  note?: string
  status?: string
  watchlists?: string
}

export function hasAddToLibraryFieldErrors(errors: AddToLibraryFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function validateAddToLibraryForm(
  values: AddToLibraryFormValues,
  options?: { disabledWatchlistIds?: Set<number> },
): AddToLibraryFieldErrors {
  const errors: AddToLibraryFieldErrors = {}
  const disabledWatchlistIds = options?.disabledWatchlistIds ?? new Set<number>()

  const selectableWatchlistIds = values.watchlistIds.filter(
    (watchlistId) => !disabledWatchlistIds.has(watchlistId),
  )

  if (selectableWatchlistIds.length === 0) {
    errors.watchlists = 'Select at least one watchlist'
  }

  return errors
}
