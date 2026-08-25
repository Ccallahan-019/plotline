import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import type { LogWatchFormApi } from '../hooks/use-log-watch-form'
import type { LogWatchEpisodeInput } from './log-watch-form-schema'

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

// Selected row for a season/episode pair, if the user included it in the batch.
export function getSelectedEpisode(
  episodes: readonly LogWatchEpisodeInput[],
  season: number,
  episode: number,
): LogWatchEpisodeInput | undefined {
  return episodes.find((entry) => entry.season === season && entry.episode === episode)
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
 * Rewatch flag to store on a dialog episode row when the user selects it.
 *
 * Already-selected rows keep their own flag, including an explicit `false`. Newly selected
 * rows inherit the form-level quick-log Rewatch checkbox so opening More Options cannot
 * drop a rewatch the user already marked.
 *
 * @param existing - Current row for that season/episode, if it is already selected
 * @param formIsRewatch - Form-level Rewatch checkbox from the quick-log UI
 * @returns The per-row `isRewatch` value to persist
 */
export function rewatchForSelectedEpisode(
  existing: LogWatchEpisodeInput | undefined,
  formIsRewatch: boolean,
): boolean {
  return existing?.isRewatch ?? formIsRewatch
}

/**
 * Sets `isRewatch` on a selected episode row; unmatched rows are left unchanged.
 *
 * @param episodes - Currently selected episode rows
 * @param season - Season of the row to update
 * @param episode - Episode number of the row to update
 * @param isRewatch - Per-episode rewatch flag for that row
 * @returns A new selected-episode list
 */
export function setSelectedEpisodeRewatch(
  episodes: readonly LogWatchEpisodeInput[],
  season: number,
  episode: number,
  isRewatch: boolean,
): LogWatchEpisodeInput[] {
  return episodes.map((entry) =>
    entry.season === season && entry.episode === episode ? { ...entry, isRewatch } : entry,
  )
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
 * Copies a single selected dialog episode back onto the quick-log fields.
 *
 * Multiple selected rows leave `episode` / `isRewatch` alone so per-episode rewatch stays
 * the source of truth for batch submit. Clearing the last row also clears `episode`.
 *
 * @param form - Log-watch form API used to read and write episode fields
 */
export function syncQuickLogEpisodeFromSelection(form: LogWatchFormApi) {
  const episodes = form.getFieldValue('episodes')
  const selected = episodes[0]

  if (episodes.length === 1 && selected != null) {
    form.setFieldValue('episode', selected)
    form.setFieldValue('isRewatch', selected.isRewatch === true)
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
 * Adds or removes an episode from the dialog multi-select, keeping chronological order.
 *
 * @param episodes - Currently selected episode rows
 * @param next - Season/episode to toggle; `isRewatch` is used only when selecting
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
