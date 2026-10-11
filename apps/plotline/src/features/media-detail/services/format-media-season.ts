import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { formatReleaseYear } from '@/features/media-grid/grid/services/media-display-helpers'

import type { MediaTitleSeason } from '../types'

import { formatReleaseDateLabel } from './format-media-title'

/**
 * Distinct episodes logged for one season.
 *
 * Pairs with `episode` below 1 are ignored. When `episodeCount` is known, the
 * result is capped at that length so the progress label cannot exceed the season.
 *
 * @param episodes - Unique watched pairs for the series
 * @param seasonNumber - Season to count
 * @param episodeCount - Season length; `null` leaves the count uncapped
 * @returns Episodes watched in that season
 */
export function countSeasonEpisodesWatched(
  episodes: readonly WatchedEpisodePair[],
  seasonNumber: number,
  episodeCount: null | number,
): number {
  const watched = new Set<number>()

  for (const episode of episodes) {
    if (episode.season === seasonNumber && episode.episode >= 1) {
      watched.add(episode.episode)
    }
  }

  if (episodeCount != null && episodeCount >= 0) {
    return Math.min(watched.size, episodeCount)
  }

  return watched.size
}

/**
 * Episode title for a season row.
 *
 * @param name - TMDB episode name
 * @param episodeNumber - Episode number used when the name is blank
 * @returns The trimmed name, or `Episode {n}`
 */
export function formatEpisodeDisplayName(
  name: null | string | undefined,
  episodeNumber: number,
): string {
  const trimmed = name?.trim()

  return trimmed || `Episode ${episodeNumber}`
}

/**
 * Release date and runtime shown on the right of an episode row.
 *
 * @param airDate - TMDB air date, or empty when the episode has not aired
 * @param runtimeMinutes - Runtime in minutes
 * @returns A middle-dot separated line, or `null` when both parts are unknown
 */
export function formatEpisodeMeta(
  airDate: null | string | undefined,
  runtimeMinutes: null | number | undefined,
): null | string {
  const parts = [formatReleaseDateLabel(airDate), formatEpisodeRuntime(runtimeMinutes)].filter(
    (part): part is string => part != null,
  )

  return parts.length > 0 ? parts.join(' · ') : null
}

/**
 * Short runtime for an episode row.
 *
 * Under an hour this is minutes only (`48m`). Longer runtimes include hours (`1h 2m`).
 *
 * @param runtimeMinutes - TMDB runtime in minutes
 * @returns A display length, or `null` when runtime is missing or zero
 */
export function formatEpisodeRuntime(runtimeMinutes: null | number | undefined): null | string {
  if (runtimeMinutes == null || runtimeMinutes <= 0) {
    return null
  }

  const hours = Math.floor(runtimeMinutes / 60)
  const minutes = runtimeMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

/**
 * Episode-count line on a season card.
 *
 * @param episodeCount - Episodes in the season; `null` when TMDB omitted it
 * @returns `9 episodes`, `1 episode`, or `null` when the count is unknown
 */
export function formatSeasonEpisodeCount(episodeCount: null | number): null | string {
  if (episodeCount == null) {
    return null
  }

  return episodeCount === 1 ? '1 episode' : `${episodeCount} episodes`
}

/**
 * Release year for a season card.
 *
 * @param airDate - Season air date from TMDB
 * @returns A four-digit year, or `null` when the date is missing
 */
export function formatSeasonReleaseYear(airDate: null | string | undefined): null | string {
  return formatReleaseYear(airDate)
}

/**
 * Label under a season progress bar.
 *
 * @param watchedCount - Episodes logged in the season
 * @param episodeCount - Season length
 * @returns `3 / 9 Watched`
 */
export function formatSeasonWatchedLabel(watchedCount: number, episodeCount: number): string {
  return `${watchedCount} / ${episodeCount} Watched`
}

/**
 * Season whose episodes are listed under the cards.
 *
 * A user selection wins when that season is still in the list. Otherwise the
 * library item's last watched season is used when it is present. The remaining
 * fallback is the lowest regular season (season number greater than 0), so
 * specials do not open by default. A specials-only series still opens on its
 * first season.
 *
 * @param seasons - Seasons on the title
 * @param selectedSeasonNumber - Season the user picked; `null` before any click
 * @param lastSeason - Latest season on the library item, when the title is tracked
 * @returns The season to expand, or `undefined` when the series has no seasons
 */
export function resolveSelectedSeason(
  seasons: readonly MediaTitleSeason[],
  selectedSeasonNumber: null | number,
  lastSeason: null | number | undefined,
): MediaTitleSeason | undefined {
  const chosen =
    selectedSeasonNumber == null
      ? undefined
      : seasons.find((season) => season.seasonNumber === selectedSeasonNumber)

  if (chosen) {
    return chosen
  }

  const inProgress =
    lastSeason == null ? undefined : seasons.find((season) => season.seasonNumber === lastSeason)

  return inProgress ?? defaultSeason(seasons)
}

// Lowest numbered regular season, or the first season when the series has only specials.
function defaultSeason(seasons: readonly MediaTitleSeason[]): MediaTitleSeason | undefined {
  let regular: MediaTitleSeason | undefined

  for (const season of seasons) {
    if (season.seasonNumber <= 0) {
      continue
    }

    if (!regular || season.seasonNumber < regular.seasonNumber) {
      regular = season
    }
  }

  return regular ?? seasons[0]
}
