import type { LibraryItem } from '@plotline/payload-types'

import type { TvProgressUpdate } from './buildTvProgressUpdate'

import {
  resolveSeasonsCompleted,
  type ResolveSeasonsCompletedInput,
} from './resolveSeasonsCompleted'

export type BatchLoggedEpisode = {
  episode: number
  isRewatch?: boolean
  season: number
}

/**
 * Rebuilds TV progress after a batch of episode logs.
 *
 * Last season/episode come from the latest pair in season/episode order.
 * `episodesWatched` grows by the number of distinct first-watch pairs. When watched keys
 * and stored season lengths are both provided, appends seasons whose episodes
 * `1..length` are covered; otherwise `seasonsCompleted` is copied through.
 *
 * @param loggedEpisodes - Episodes in this batch, flagged when derive classified a rewatch
 * @param currentProgress - Library-item progress before this batch
 * @param options.seasonEpisodeCounts - Lengths from `media.tvMeta`; omit to leave seasons unchanged
 * @param options.watchedEpisodeKeys - First-watch keys after derive, including this batch
 * @returns The TV progress patch to store on the library item
 */
export function buildBatchTvProgressUpdate(
  loggedEpisodes: BatchLoggedEpisode[],
  currentProgress: LibraryItem['progress'] | null | undefined,
  options?: ResolveSeasonsCompletedInput,
): TvProgressUpdate {
  const sortedEpisodes = [...loggedEpisodes].sort((a, b) => {
    if (a.season !== b.season) {
      return a.season - b.season
    }

    return a.episode - b.episode
  })

  const latestEpisode = sortedEpisodes.at(-1)
  const currentEpisodesWatched = currentProgress?.episodesWatched ?? 0
  const uniqueNewEpisodes = new Set<string>()

  for (const episode of loggedEpisodes) {
    if (!episode.isRewatch) {
      uniqueNewEpisodes.add(`${episode.season}:${episode.episode}`)
    }
  }

  const newEpisodeCount = uniqueNewEpisodes.size
  const seasonsCompleted = resolveSeasonsCompleted(currentProgress?.seasonsCompleted, options)

  return {
    type: 'tv',
    ...(seasonsCompleted != null ? { seasonsCompleted } : {}),
    ...(latestEpisode
      ? { lastEpisode: latestEpisode.episode, lastSeason: latestEpisode.season }
      : {}),
    ...(newEpisodeCount > 0
      ? { episodesWatched: currentEpisodesWatched + newEpisodeCount }
      : currentProgress?.episodesWatched != null
        ? { episodesWatched: currentProgress.episodesWatched }
        : {}),
  }
}
