import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

/** Layout of the horizontal episode strip and its loading skeleton. */
export const seasonEpisodeStripClassName = 'flex w-max items-start gap-3 px-1 pt-1 pb-4'

export type MediaSeasonEpisodesProps = {
  backdropPath: null | string
  episodes: TmdbTvSeasonEpisode[]
  logWatchDisabled: boolean
  onLogEpisode: (seasonNumber: number, episodeNumber: number) => void
  seasonNumber: number
  title: string
}
