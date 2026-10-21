import type { Media } from '@plotline/payload-types'

import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

import { seasonPipProgress } from '../services/continue-watching'

type UseContinueWatchingSeasonPipsOptions = {
  episode: number
  libraryItemId: number
  season: number
  seasonEpisodeCounts: NonNullable<Media['tvMeta']>['seasonEpisodeCounts']
}

/**
 * Season pips for the up-next episode on the continue-watching hero.
 *
 * The watched-episodes query stays off when the season length is unknown.
 * Progress stays null until that query has data, so a load is not shown as
 * zero episodes watched.
 *
 * @param options.episode - Up-next episode number
 * @param options.libraryItemId - Library item whose watched pairs to load
 * @param options.season - Up-next season number
 * @param options.seasonEpisodeCounts - Per-season lengths from catalog metadata
 * @returns Pip progress when the season length and watched pairs are known, plus the watched-episodes query
 */
export function useContinueWatchingSeasonPips(options: UseContinueWatchingSeasonPipsOptions) {
  const { episode, libraryItemId, season, seasonEpisodeCounts } = options
  const canShowPips =
    seasonPipProgress({
      episode,
      season,
      seasonEpisodeCounts,
      watched: [],
    }) != null
  const watched = useWatchedEpisodes(libraryItemId, { enabled: canShowPips })
  const watchedEpisodes = watched.data
  const progress =
    canShowPips && watchedEpisodes != null
      ? seasonPipProgress({
          episode,
          season,
          seasonEpisodeCounts,
          watched: watchedEpisodes,
        })
      : null

  return {
    progress,
    watched,
  }
}
