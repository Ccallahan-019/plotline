import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import {
  isTvEpisodeRewatch,
  toWatchedEpisodeKeySet,
  type WatchedEpisodePair,
} from '@plotline/shared/log-watch'

import type { LogWatchFormApi } from '../hooks/use-log-watch-form'
import type { LogWatchEpisodeInput } from './log-watch-form-schema'

/** Prior TV coverage used to label rows the server will store as rewatches. */
export type LogWatchWatchedCoverage = {
  showCompleted: boolean
  watchedEpisodes: readonly WatchedEpisodePair[]
}

// `S1E3 — Episode Title` when TMDB provided a name; otherwise `S1E3`.
export function formatEpisodeOption(
  season: number,
  episodeNumber: number,
  name?: null | string,
) {
  const code = `S${season}E${episodeNumber}`
  return name ? `${code} — ${name}` : code
}

/**
 * Season `<Select>` values from series metadata, always including the current season.
 *
 * Uses `seasonCount` when it is a positive number; otherwise the current season (at least 1).
 * Season 0 (specials) is prepended when it is selected.
 *
 * @param seasonCount - Known season count from TMDB or library metadata
 * @param currentSeason - Season currently selected in the form
 * @returns Season numbers in ascending order
 */
export function getSeasonSelectOptions(
  seasonCount: null | number | undefined,
  currentSeason: number,
): number[] {
  const count = seasonCount != null && seasonCount > 0 ? seasonCount : Math.max(currentSeason, 1)
  const seasons = Array.from({ length: count }, (_, index) => index + 1)

  if (currentSeason === 0) {
    return [0, ...seasons]
  }

  if (!seasons.includes(currentSeason)) {
    return [...seasons, currentSeason].sort((left, right) => left - right)
  }

  return seasons
}

// True when the season/episode pair is already in the batch selection.
export function isEpisodeSelected(
  episodes: readonly LogWatchEpisodeInput[],
  season: number,
  episode: number,
): boolean {
  return episodes.some((entry) => entry.season === season && entry.episode === episode)
}

/**
 * True when a TV episode row should show the non-interactive Watched label.
 *
 * A completed show covers every episode. Otherwise the season/episode pair must already
 * be in the watched-key set. The row stays selectable either way; the server marks the
 * log as a rewatch.
 *
 * @param season - Season number shown on the row
 * @param episode - Episode number shown on the row
 * @param options.showCompleted - Library item status is `completed`
 * @param options.watchedEpisodeKeys - `season:episode` keys from prior watch events
 * @returns Whether to render the Watched label
 */
export function isLoggedEpisodeWatched(
  season: number,
  episode: number,
  options: {
    showCompleted: boolean
    watchedEpisodeKeys: ReadonlySet<string>
  },
): boolean {
  return isTvEpisodeRewatch({
    episode,
    libraryItemStatus: options.showCompleted ? 'completed' : null,
    season,
    watchedEpisodeKeys: options.watchedEpisodeKeys,
  })
}

// Chronological order: season ascending, then episode ascending.
export function sortLogWatchEpisodes(
  episodes: readonly LogWatchEpisodeInput[],
): LogWatchEpisodeInput[] {
  return [...episodes].sort((left, right) => {
    if (left.season !== right.season) {
      return left.season - right.season
    }

    return left.episode - right.episode
  })
}

/**
 * Copies the current TV episode onto `episodes` so single and batch mappers stay in sync.
 *
 * When no episode is selected, `episodes` is cleared.
 *
 * @param form - Log-watch form API used to read and write episode fields
 */
export function syncQuickLogEpisode(form: LogWatchFormApi) {
  const episode = form.getFieldValue('episode')

  if (episode == null) {
    form.setFieldValue('episodes', [])
    return
  }

  form.setFieldValue('episodes', [{ episode: episode.episode, season: episode.season }])
}

/**
 * Resets the episode number to 1 after a season change, then syncs `episodes`.
 *
 * Callers use this for both the TMDB season select and the no-TMDB number field so a
 * leftover episode from the previous season cannot be submitted under the new season.
 *
 * @param form - Log-watch form API used to read and write episode fields
 */
export function syncQuickLogEpisodeAfterSeasonChange(form: LogWatchFormApi) {
  form.setFieldValue('episode.episode', 1)
  syncQuickLogEpisode(form)
}

/**
 * Copies a single selected dialog episode back onto the quick-log episode field.
 *
 * Multiple selected rows leave `episode` alone so the batch selection stays the source of
 * truth. Clearing the last row also clears `episode`.
 *
 * @param form - Log-watch form API used to read and write episode fields
 */
export function syncQuickLogEpisodeFromSelection(form: LogWatchFormApi) {
  const episodes = form.getFieldValue('episodes')
  const selected = episodes[0]

  if (episodes.length === 1 && selected != null) {
    form.setFieldValue('episode', { episode: selected.episode, season: selected.season })
    return
  }

  if (episodes.length === 0) {
    form.setFieldValue('episode', undefined)
  }
}

/**
 * Maps TMDB episodes to select items labeled `S{n}E{m} — {name}` when a title exists.
 *
 * @param season - Season number used in the label prefix
 * @param episodes - TMDB episode list for that season
 * @returns Select items whose values are TMDB episode numbers
 */
export function toEpisodeSelectItems(season: number, episodes: TmdbTvSeasonEpisode[]) {
  return episodes.map((entry) => ({
    label: formatEpisodeOption(season, entry.episode_number, entry.name),
    value: entry.episode_number,
  }))
}

/**
 * `season:episode` keys for the Watched labels on the TV episode list.
 *
 * @param watchedEpisodes - Pairs already logged for this library item
 * @returns Keys understood by {@link isLoggedEpisodeWatched}
 */
export function toLogWatchWatchedEpisodeKeys(
  watchedEpisodes: readonly WatchedEpisodePair[],
): Set<string> {
  return toWatchedEpisodeKeySet(watchedEpisodes)
}

/**
 * Adds or removes an episode from the dialog multi-select, keeping chronological order.
 *
 * @param episodes - Currently selected episode rows
 * @param next - Season/episode to toggle
 * @param selected - Whether the episode should remain in the batch
 * @returns A new selected-episode list
 */
export function upsertSelectedEpisode(
  episodes: readonly LogWatchEpisodeInput[],
  next: LogWatchEpisodeInput,
  selected: boolean,
): LogWatchEpisodeInput[] {
  const without = episodes.filter(
    (entry) => entry.season !== next.season || entry.episode !== next.episode,
  )

  if (!selected) {
    return without
  }

  return sortLogWatchEpisodes([...without, next])
}
