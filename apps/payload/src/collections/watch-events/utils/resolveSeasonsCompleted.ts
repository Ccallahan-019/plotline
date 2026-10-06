import { toWatchedEpisodeKey } from '@plotline/shared/log-watch'

export type ResolveSeasonsCompletedInput = {
  seasonEpisodeCounts?: null | readonly SeasonEpisodeCount[]
  watchedEpisodeKeys?: ReadonlySet<string>
}

/**
 * One stored season length from `media.tvMeta.seasonEpisodeCounts`.
 *
 * Season 0 is specials. A missing or non-positive `episodeCount` is not a length.
 */
export type SeasonEpisodeCount = {
  episodeCount?: null | number
  season?: null | number
}

/**
 * Next `seasonsCompleted` for a locked TV progress patch.
 *
 * A season is appended when first-watch keys cover episodes `1..episodeCount`. Completion
 * does not use `lastEpisode` — skips and rewatch cursor moves must not finish a season.
 * Seasons already stored stay in place. Omit either input to copy the previous array
 * through, including when a season's length was never stored.
 *
 * @param current - Seasons already stored on the library item
 * @param input.seasonEpisodeCounts - Lengths from media; `null` or omitted skips recomputation
 * @param input.watchedEpisodeKeys - `season:episode` keys after derive, including this request
 * @returns The union to persist, or the previous value when completion cannot be decided
 */
export function resolveSeasonsCompleted(
  current: null | readonly number[] | undefined,
  input?: ResolveSeasonsCompletedInput,
): null | number[] | undefined {
  if (input?.seasonEpisodeCounts == null || input.watchedEpisodeKeys == null) {
    return current == null ? current : [...current]
  }

  const completed = current == null ? [] : [...current]
  const considered = new Set<number>()

  for (const entry of input.seasonEpisodeCounts) {
    if (entry == null) {
      continue
    }

    const { episodeCount, season } = entry

    if (!isSeasonNumber(season) || !isPositiveEpisodeCount(episodeCount) || considered.has(season)) {
      continue
    }

    considered.add(season)

    if (completed.includes(season)) {
      continue
    }

    if (isSeasonFullyWatched(season, episodeCount, input.watchedEpisodeKeys)) {
      completed.push(season)
    }
  }

  if (current == null && completed.length === 0) {
    return current
  }

  return completed
}

// A zero or missing count is not a length, so that season must not be marked complete.
function isPositiveEpisodeCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

// True when every episode from 1 through the stored length is a first-watch key.
function isSeasonFullyWatched(
  season: number,
  episodeCount: number,
  watchedEpisodeKeys: ReadonlySet<string>,
): boolean {
  for (let episode = 1; episode <= episodeCount; episode += 1) {
    if (!watchedEpisodeKeys.has(toWatchedEpisodeKey(season, episode))) {
      return false
    }
  }

  return true
}

// Season 0 (specials) counts; fractional or negative numbers are not a season id.
function isSeasonNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}
