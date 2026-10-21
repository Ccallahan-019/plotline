const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

/**
 * Builds a TMDB image URL for a stored path.
 *
 * @param path - TMDB file path (`/abc.jpg`), or empty when the title has no image
 * @param size - TMDB size segment such as `w342` or `w1280`
 * @returns An absolute image URL, or `null` when `path` is missing
 */
export function mediaImageUrl(path: null | string | undefined, size: string): null | string {
  if (!path) {
    return null
  }

  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

/**
 * Backdrop URL used by the title detail hero.
 *
 * @param path - TMDB backdrop path, or empty when the title has no still
 * @returns A `w1280` image URL, or `null` when `path` is missing
 */
export function titleBackdropUrl(path: null | string | undefined): null | string {
  return mediaImageUrl(path, 'w1280')
}
