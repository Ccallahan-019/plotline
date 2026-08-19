import type { LibraryItem } from '@plotline/payload-types'

import { toFiniteNumber } from '@plotline/shared/utils'

export type TvProgressUpdate = {
  episodesWatched?: number
  lastEpisode?: number
  lastSeason?: number
  seasonsCompleted?: null | number[]
  type: 'tv'
}

export function buildTvProgressUpdate(
  tvContext: {
    episode?: null | number
    season?: null | number
  },
  currentProgress: LibraryItem['progress'] | null | undefined,
  options?: { isRewatch?: boolean },
): TvProgressUpdate {
  const episode = toFiniteNumber(tvContext.episode)
  const season = toFiniteNumber(tvContext.season)
  const currentEpisodesWatched = currentProgress?.episodesWatched ?? 0

  const progress: TvProgressUpdate = {
    type: 'tv',
    ...(currentProgress?.seasonsCompleted != null
      ? { seasonsCompleted: currentProgress.seasonsCompleted }
      : {}),
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
