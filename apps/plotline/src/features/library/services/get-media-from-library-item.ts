import { LibraryItem, Media } from '@plotline/payload-types'

export function getMediaFromLibraryItem(item: LibraryItem): Media | null {
  return typeof item.media === 'object' ? item.media : null
}
