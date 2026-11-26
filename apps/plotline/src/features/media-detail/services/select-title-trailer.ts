import type { TmdbTitleVideo } from '@plotline/shared/tmdb'

import type { MediaTitleTrailer } from '../types'

type PlayableTitleVideo = {
  iso3166: null | string
  key: string
  name: string
  publishedAt: number
  type: 'Teaser' | 'Trailer'
}

/**
 * Chooses one official YouTube video for the title page.
 *
 * Official trailers come before official teasers. Within a type, a video whose
 * country matches `region` comes first, then the newest `published_at`.
 * Vimeo and every other video type are left out.
 *
 * @param videos - TMDB `videos.results` from movie or series title details
 * @param region - Profile watch region, such as `US`
 * @returns The chosen video key and name, or `null` when none qualify
 */
export function selectTitleTrailer(
  videos: readonly TmdbTitleVideo[] | undefined,
  region: string,
): MediaTitleTrailer | null {
  const regionCode = region.trim().toUpperCase()
  const candidates = (videos ?? []).flatMap((video) => {
    const playable = toPlayableTitleVideo(video)

    return playable ? [playable] : []
  })

  candidates.sort((left, right) => compareTitleTrailers(left, right, regionCode))

  const selected = candidates[0]

  if (!selected) {
    return null
  }

  const { key, name } = selected

  return { key, name }
}

// Official trailers, then the viewer's region, then the newest upload.
function compareTitleTrailers(
  left: PlayableTitleVideo,
  right: PlayableTitleVideo,
  region: string,
): number {
  const { iso3166: leftIso3166, publishedAt: leftPublishedAt, type: leftType } = left
  const { iso3166: rightIso3166, publishedAt: rightPublishedAt, type: rightType } = right
  const typeRank = trailerTypeRank(leftType) - trailerTypeRank(rightType)

  if (typeRank !== 0) {
    return typeRank
  }

  const regionRank = titleRegionRank(leftIso3166, region) - titleRegionRank(rightIso3166, region)

  if (regionRank !== 0) {
    return regionRank
  }

  // Two missing dates share the oldest sentinel, and subtracting those values is not zero.
  if (leftPublishedAt === rightPublishedAt) {
    return 0
  }

  return rightPublishedAt - leftPublishedAt
}

// Epoch milliseconds for an upload time. A missing or invalid date sorts as the oldest.
function publishedAtTime(publishedAt: null | string | undefined): number {
  if (!publishedAt) {
    return Number.NEGATIVE_INFINITY
  }

  const time = Date.parse(publishedAt)

  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time
}

// Sort rank for a video country. A match with the profile region comes first.
function titleRegionRank(iso3166: null | string, region: string): number {
  return iso3166 === region ? 0 : 1
}

// An official YouTube trailer or teaser with a playable key, or `null` otherwise.
function toPlayableTitleVideo(video: TmdbTitleVideo): null | PlayableTitleVideo {
  const { iso_3166_1, key, name, official, published_at, site, type } = video
  const trimmedKey = key?.trim()

  if (official !== true || site !== 'YouTube' || !trimmedKey) {
    return null
  }

  if (type !== 'Trailer' && type !== 'Teaser') {
    return null
  }

  return {
    iso3166: iso_3166_1?.trim().toUpperCase() || null,
    key: trimmedKey,
    name: name?.trim() ?? '',
    publishedAt: publishedAtTime(published_at),
    type,
  }
}

// Sort rank for an official trailer or teaser. Trailers come first.
function trailerTypeRank(type: 'Teaser' | 'Trailer'): number {
  return type === 'Trailer' ? 0 : 1
}
