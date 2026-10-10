import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import { Skeleton } from '@/components/ui/skeleton'

import type { LogWatchEpisodeInput } from '../../../services/log-watch-form-schema'

import {
  formatEpisodeOption,
  isEpisodeSelected,
  isLoggedEpisodeWatched,
} from '../../../services/episode-field'
import { LogWatchEpisodeRow } from './LogWatchEpisodeRow'

type TmdbEpisodeListContentProps = {
  disabled: boolean
  isPending: boolean
  onSelectedChange: (season: number, episode: number, selected: boolean) => void
  season: number
  selectedEpisodes: readonly LogWatchEpisodeInput[]
  showCompleted: boolean
  tmdbEpisodes: readonly TmdbTvSeasonEpisode[]
  watchedEpisodeKeys: ReadonlySet<string>
}

export function TmdbEpisodeListContent({
  disabled,
  isPending,
  onSelectedChange,
  season,
  selectedEpisodes,
  showCompleted,
  tmdbEpisodes,
  watchedEpisodeKeys,
}: TmdbEpisodeListContentProps) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton className="h-5.5 w-full" key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3" data-slot="checkbox-group">
      {tmdbEpisodes.map((entry) => {
        const episodeNumber = entry.episode_number
        const selectedId = `log-watch-episode-${season}-${episodeNumber}`

        return (
          <LogWatchEpisodeRow
            disabled={disabled}
            isSelected={isEpisodeSelected(selectedEpisodes, season, episodeNumber)}
            isWatched={isLoggedEpisodeWatched(season, episodeNumber, {
              showCompleted,
              watchedEpisodeKeys,
            })}
            key={episodeNumber}
            label={formatEpisodeOption(season, episodeNumber, entry.name)}
            onSelectedChange={(checked) => {
              onSelectedChange(season, episodeNumber, checked)
            }}
            selectedId={selectedId}
          />
        )
      })}
    </div>
  )
}
