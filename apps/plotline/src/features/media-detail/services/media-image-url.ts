const EPISODE_STILL_WIDTH = 'w500'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

/**
 * Episode still URL, using the series backdrop when the still is missing.
 *
 * A season cached before `still_path` was stored has no field, so those episodes
 * use the backdrop until that cache refreshes.
 *
 * @param stillPath - TMDB episode still, or empty when the episode has none
 * @param backdropPath - Series backdrop used when `stillPath` is missing
 * @returns A `w500` image URL, or `null` when both paths are missing
 */
export function episodeStillUrl(
  stillPath: null | string | undefined,
  backdropPath: null | string | undefined,
): null | string {
  return mediaImageUrl(stillPath ?? backdropPath, EPISODE_STILL_WIDTH)
}

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
