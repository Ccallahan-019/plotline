import { LibraryItem } from '@plotline/payload-types'

import {
  getMediaFromLibraryItem,
  toMediaDisplayFromMedia,
} from '@/features/media-grid/grid/services/media-display-helpers'
import { MediaDisplay } from '@/features/media-grid/types'

export function toMediaDisplayFromLibraryItem(item: LibraryItem): MediaDisplay | null {
  const media = getMediaFromLibraryItem(item)

  if (!media) {
    return null
  }

  return toMediaDisplayFromMedia(media)
}
