const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

/**
 * Builds a TMDB image URL for a stored path.
 *
 * @param path - TMDB file path (`/abc.jpg`), or empty when the title has no image
 * @param size - TMDB size segment such as `w342` or `w1280`
 * @returns An absolute image URL, or `null` when `path` is missing
 */
export function tmdbMediaUrl(path: null | string | undefined, size: string): null | string {
  if (!path) {
    return null
  }

  return `${TMDB_IMAGE_BASE}/${size}${path}`
}
