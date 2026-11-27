import { MediaSeasonEpisodesEmpty } from './MediaSeasonEpisodesEmpty'
import { MediaSeasonEpisodeStrip } from './MediaSeasonEpisodeStrip'
import { type MediaSeasonEpisodesProps } from './seasonEpisodes'

export function MediaSeasonEpisodes({
  backdropPath,
  episodes,
  logWatchDisabled,
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
      logWatchDisabled={logWatchDisabled}
      onLogEpisode={onLogEpisode}
      seasonNumber={seasonNumber}
      title={title}
    />
  )
}
