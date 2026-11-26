import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import { MediaSeasonEpisodesEmpty } from './MediaSeasonEpisodesEmpty'
import { MediaSeasonEpisodeStrip } from './MediaSeasonEpisodeStrip'

export const seasonEpisodeStripClassName = 'flex w-max items-start gap-3 px-1 pt-1 pb-4'

export type MediaSeasonEpisodesProps = {
  backdropPath: null | string
  episodes: TmdbTvSeasonEpisode[]
  logWatchSubmitting: boolean
  onLogEpisode: (seasonNumber: number, episodeNumber: number) => void
  seasonNumber: number
  title: string
}

export function MediaSeasonEpisodes({
  backdropPath,
  episodes,
  logWatchSubmitting,
  onLogEpisode,
  seasonNumber,
  title,
}: MediaSeasonEpisodesProps) {
  if (episodes.length === 0) {
    return <MediaSeasonEpisodesEmpty />
  }

  // Remounting on seasonNumber clears the previous season's selection, so the
  // new season opens on its first episode.
  return (
    <MediaSeasonEpisodeStrip
      backdropPath={backdropPath}
      episodes={episodes}
      key={seasonNumber}
      logWatchSubmitting={logWatchSubmitting}
      onLogEpisode={onLogEpisode}
      seasonNumber={seasonNumber}
      title={title}
    />
  )
}
