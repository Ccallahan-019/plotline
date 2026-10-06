import type { LibraryItem } from '@plotline/payload-types'

import { toFiniteNumber } from '@plotline/shared/utils'

import {
  resolveSeasonsCompleted,
  type ResolveSeasonsCompletedInput,
} from './resolveSeasonsCompleted'

export type BuildTvProgressUpdateOptions = {
  isRewatch?: boolean
} & ResolveSeasonsCompletedInput

export type TvProgressUpdate = {
  episodesWatched?: number
  lastEpisode?: number
  lastSeason?: number
  seasonsCompleted?: null | number[]
  type: 'tv'
}

/**
 * Rebuilds TV progress after a watch event.
 *
 * Copies last season/episode from `tvContext`. Increments `episodesWatched` only for
 * first-watch logs. When watched keys and stored season lengths are both provided,
 * appends seasons whose episodes `1..length` are covered; otherwise `seasonsCompleted`
 * is copied through.
 *
 * @param tvContext - Season and episode from the watch event
 * @param currentProgress - Library-item progress before this event
 * @param options.isRewatch - When true, keep the current `episodesWatched` count
 * @param options.seasonEpisodeCounts - Lengths from `media.tvMeta`; omit to leave seasons unchanged
 * @param options.watchedEpisodeKeys - First-watch keys after derive, including this event
 * @returns The TV progress patch to store on the library item
 */
export function buildTvProgressUpdate(
  tvContext: {
    episode?: null | number
    season?: null | number
  },
  currentProgress: LibraryItem['progress'] | null | undefined,
  options?: BuildTvProgressUpdateOptions,
): TvProgressUpdate {
  const episode = toFiniteNumber(tvContext.episode)
  const season = toFiniteNumber(tvContext.season)
  const currentEpisodesWatched = currentProgress?.episodesWatched ?? 0
  const seasonsCompleted = resolveSeasonsCompleted(currentProgress?.seasonsCompleted, options)

  const progress: TvProgressUpdate = {
    type: 'tv',
    ...(seasonsCompleted != null ? { seasonsCompleted } : {}),
    ...(season !== undefined ? { lastSeason: season } : {}),
    ...(episode !== undefined ? { lastEpisode: episode } : {}),
  }

  if (episode !== undefined && !options?.isRewatch) {
    progress.episodesWatched = currentEpisodesWatched + 1
  } else if (options?.isRewatch && currentProgress?.episodesWatched != null) {
    progress.episodesWatched = currentProgress.episodesWatched
  }

  return progress
}
