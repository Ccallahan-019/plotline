import type { LibraryItem } from '@plotline/payload-types'

import type { AddToListsFormInput } from '@/features/library/types/mutations'
import type { MediaDisplay } from '@/features/media-grid/types'

import type { AddToLibraryFormValues } from './add-to-library-form-schema'

import { getMediaFromLibraryItem } from '../../services/get-media-from-library-item'
import { toAddToListTmdbMediaInput } from './to-add-to-list-media-input'

export type { AddToLibraryFormValues } from './add-to-library-form-schema'

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
