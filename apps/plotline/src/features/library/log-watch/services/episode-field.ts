import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import type { LogWatchFormApi } from '../hooks/use-log-watch-form'

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

/**
 * Copies the current TV episode onto `episodes` so single and batch mappers stay in sync.
 *
 * Form-level `isRewatch` wins and is written onto the episode object. When no episode is
 * selected, `episodes` is cleared.
 *
 * @param form - Log-watch form API used to read and write episode fields
 */
export function syncQuickLogEpisode(form: LogWatchFormApi) {
  const episode = form.getFieldValue('episode')
  const isRewatch = form.getFieldValue('isRewatch')

  if (episode == null) {
    form.setFieldValue('episodes', [])
    return
  }

  const next = { ...episode, isRewatch }
  form.setFieldValue('episode', next)
  form.setFieldValue('episodes', [next])
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

// `S1E3 — Episode Title` when TMDB provided a name; otherwise `S1E3`.
function formatEpisodeOption(season: number, episodeNumber: number, name: null | string) {
  const code = `S${season}E${episodeNumber}`
  return name ? `${code} — ${name}` : code
}
