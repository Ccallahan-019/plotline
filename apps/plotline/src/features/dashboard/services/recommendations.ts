import type { MediaType } from '@plotline/shared/constants'
import type { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import type { DashboardRecommendationItem, DashboardRecommendationSeed } from '../types'

/** How many posters the overview recommendation card shows. */
export const RECOMMENDATION_POSTER_LIMIT = 4

const SEED_LIMIT = 2
const HIGH_RATING = 7

/** A completed library title that can seed recommendations when nothing is rated 7 or higher. */
export type CompletedSeedCandidate = {
  completedAt?: null | string
  lastWatchedAt?: null | string
  media: number | RecommendationMedia
  updatedAt: string
}

/** A review that can seed recommendations when its rating is 7 or higher. */
export type RatedSeedCandidate = {
  media: number | RecommendationMedia
  rating: number
  updatedAt: string
}

export type RecommendationSeedSelection = {
  reason: 'completed' | 'rated' | null
  seeds: DashboardRecommendationSeed[]
}

type RecommendationMedia = {
  mediaType: MediaType
  posterPath?: null | string
  title: string
  tmdbId: number
}

/**
 * Collects `mediaType:tmdbId` keys for titles already in the library.
 *
 * @param items - Library items, with media populated when the key can be known
 * @returns Keys used to drop recommendations the profile already has
 */
export function libraryMediaKeys(
  items: readonly { media: number | RecommendationMedia }[],
): Set<string> {
  const keys = new Set<string>()

  for (const item of items) {
    const media = resolveMedia(item.media)

    if (media) {
      keys.add(mediaKey(media.mediaType, media.tmdbId))
    }
  }

  return keys
}

/**
 * Chooses recommendation posters from TMDB pages.
 *
 * Pages are read in seed order. Titles already in the library, the seeds
 * themselves, and duplicate recommendations are dropped. The result stops at
 * `limit` posters (four by default).
 *
 * @param input.libraryKeys - Keys from `libraryMediaKeys`
 * @param input.limit - Maximum posters. Defaults to four
 * @param input.pages - Recommendation pages aligned with the seed order
 * @param input.seeds - Seed titles, which are not recommended back
 * @returns Posters for the overview card
 */
export function selectRecommendationPosters(input: {
  libraryKeys: ReadonlySet<string>
  limit?: number
  pages: readonly {
    mediaType: MediaType
    results: readonly TmdbSearchResultItem[]
  }[]
  seeds: readonly { mediaType: MediaType; tmdbId: number }[]
}): DashboardRecommendationItem[] {
  const limit = input.limit ?? RECOMMENDATION_POSTER_LIMIT
  const blocked = new Set(input.libraryKeys)

  for (const seed of input.seeds) {
    blocked.add(mediaKey(seed.mediaType, seed.tmdbId))
  }

  const posters: DashboardRecommendationItem[] = []

  for (const page of input.pages) {
    for (const result of page.results) {
      const poster = toPoster(result, page.mediaType)

      if (!poster) {
        continue
      }

      const key = mediaKey(poster.mediaType, poster.tmdbId)

      if (blocked.has(key)) {
        continue
      }

      blocked.add(key)
      posters.push(poster)

      if (posters.length >= limit) {
        return posters
      }
    }
  }

  return posters
}

/**
 * Picks up to two recommendation seeds.
 *
 * High ratings come first: reviews of 7 or higher, newest `updatedAt` first.
 * When none exist, the two most recently completed library titles are used.
 * One high rating does not get filled out with a completed title.
 *
 * @param input.completed - Completed library titles
 * @param input.rated - Profile reviews, including ratings below 7
 * @returns The seed titles and whether they came from ratings or completions
 */
export function selectRecommendationSeeds(input: {
  completed: readonly CompletedSeedCandidate[]
  rated: readonly RatedSeedCandidate[]
}): RecommendationSeedSelection {
  const rated = uniqueTitles(
    input.rated
      .filter((review) => review.rating >= HIGH_RATING)
      .sort((left, right) => compareTimeDesc(left.updatedAt, right.updatedAt))
      .map((review) => toSeed(review.media, review.rating)),
  ).slice(0, SEED_LIMIT)

  if (rated.length > 0) {
    return { reason: 'rated', seeds: rated }
  }

  const completed = uniqueTitles(
    [...input.completed]
      .sort((left, right) => compareTimeDesc(completedTime(left), completedTime(right)))
      .map((item) => toSeed(item.media, null)),
  ).slice(0, SEED_LIMIT)

  if (completed.length === 0) {
    return { reason: null, seeds: [] }
  }

  return { reason: 'completed', seeds: completed }
}

// Newest finite timestamp first. Missing and invalid timestamps sort last.
function compareTimeDesc(left: null | string, right: null | string): number {
  const leftTime = timeValue(left)
  const rightTime = timeValue(right)

  if (leftTime == null && rightTime == null) {
    return 0
  }

  if (leftTime == null) {
    return 1
  }

  if (rightTime == null) {
    return -1
  }

  return rightTime - leftTime
}

// Completion time, then last watch, then the library row's update time.
function completedTime(item: CompletedSeedCandidate): null | string {
  return item.completedAt ?? item.lastWatchedAt ?? item.updatedAt
}

// Stable key for a TMDB title across library rows and recommendation results.
function mediaKey(mediaType: MediaType, tmdbId: number): string {
  return `${mediaType}:${tmdbId}`
}

// Populated media with a title and TMDB id. Id-only relations are skipped.
function resolveMedia(
  media: null | number | RecommendationMedia | undefined,
): null | RecommendationMedia {
  if (!media || typeof media === 'number' || !media.title.trim() || media.tmdbId <= 0) {
    return null
  }

  return media
}

// Epoch milliseconds, or null when the timestamp is missing or invalid.
function timeValue(value: null | string | undefined): null | number {
  if (!value) {
    return null
  }

  const time = Date.parse(value)

  return Number.isNaN(time) ? null : time
}

// Poster from a TMDB result. The seed's media type is stamped on because recommendations omit it.
function toPoster(
  result: TmdbSearchResultItem,
  mediaType: MediaType,
): DashboardRecommendationItem | null {
  const title = (result.title ?? result.name ?? '').trim()

  if (!title || !Number.isFinite(result.id) || result.id <= 0) {
    return null
  }

  return {
    mediaType,
    posterPath: result.poster_path ?? null,
    title,
    tmdbId: result.id,
  }
}

// Seed title, or null when the media relation was not populated.
function toSeed(
  media: number | RecommendationMedia,
  rating: null | number,
): DashboardRecommendationSeed | null {
  const resolved = resolveMedia(media)

  if (!resolved) {
    return null
  }

  return {
    mediaType: resolved.mediaType,
    rating,
    title: resolved.title,
    tmdbId: resolved.tmdbId,
  }
}

// Drops empty seeds and keeps the first title for each media key.
function uniqueTitles(
  seeds: readonly (DashboardRecommendationSeed | null)[],
): DashboardRecommendationSeed[] {
  const seen = new Set<string>()
  const unique: DashboardRecommendationSeed[] = []

  for (const seed of seeds) {
    if (!seed) {
      continue
    }

    const key = mediaKey(seed.mediaType, seed.tmdbId)

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    unique.push(seed)
  }

  return unique
}
