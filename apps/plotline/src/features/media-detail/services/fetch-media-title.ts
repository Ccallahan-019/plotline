import { fetchJson } from '@/lib/api/fetch-json'

import type { MediaTitlePageData } from '../types'
import type { ParsedMediaTitleParams } from './parse-media-title-params'

/**
 * Loads one title page through the media BFF.
 *
 * @param params - Media type and TMDB id
 * @returns Catalog media, library state, and overview fields
 * @throws {FetchJsonError} When the title is missing or the BFF request fails
 */
export function fetchMediaTitle(params: ParsedMediaTitleParams): Promise<MediaTitlePageData> {
  return fetchJson<MediaTitlePageData>(`/api/media/${params.mediaType}/${params.tmdbId}`)
}
