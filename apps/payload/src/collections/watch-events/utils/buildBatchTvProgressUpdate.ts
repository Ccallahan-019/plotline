import type { LibraryItem } from '@plotline/payload-types'

import type { TvProgressUpdate } from './buildTvProgressUpdate'

export type BatchLoggedEpisode = {
  episode: number
  isRewatch?: boolean
  season: number
}

export function buildBatchTvProgressUpdate(
  loggedEpisodes: BatchLoggedEpisode[],
  currentProgress: LibraryItem['progress'] | null | undefined,
): TvProgressUpdate {
  const sortedEpisodes = [...loggedEpisodes].sort((a, b) => {
    if (a.season !== b.season) {
      return a.season - b.season
    }

    return a.episode - b.episode
  })

  const latestEpisode = sortedEpisodes.at(-1)
  const currentEpisodesWatched = currentProgress?.episodesWatched ?? 0
  const newEpisodeCount = loggedEpisodes.filter((episode) => !episode.isRewatch).length

  return {
    type: 'tv',
    ...(currentProgress?.seasonsCompleted != null
      ? { seasonsCompleted: currentProgress.seasonsCompleted }
      : {}),
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
