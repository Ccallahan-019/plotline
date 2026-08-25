import { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import { Skeleton } from '@/components/ui/skeleton'

import {
  formatEpisodeOption,
  getSelectedEpisode,
  isEpisodeSelected,
} from '../../../services/episode-field'
import { LogWatchEpisodeInput } from '../../../services/log-watch-form-schema'
import { LogWatchEpisodeRow } from './LogWatchEpisodeRow'

type TmdbEpisodeListContentProps = {
  disabled: boolean
  isPending: boolean
  onRewatchChange: (season: number, episode: number, isRewatch: boolean) => void
  onSelectedChange: (season: number, episode: number, selected: boolean) => void
  season: number
  selectedEpisodes: readonly LogWatchEpisodeInput[]
  tmdbEpisodes: readonly TmdbTvSeasonEpisode[]
}

export function TmdbEpisodeListContent({
  disabled,
  isPending,
  onRewatchChange,
  onSelectedChange,
  season,
  selectedEpisodes,
  tmdbEpisodes,
}: TmdbEpisodeListContentProps) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton className="h-8 w-full" key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3" data-slot="checkbox-group">
      {tmdbEpisodes.map((entry) => {
        const episodeNumber = entry.episode_number
        const selectedId = `log-watch-episode-${season}-${episodeNumber}`
        const rewatchId = `log-watch-rewatch-${season}-${episodeNumber}`

        return (
          <LogWatchEpisodeRow
            disabled={disabled}
            isRewatch={
              getSelectedEpisode(selectedEpisodes, season, episodeNumber)?.isRewatch === true
            }
            isSelected={isEpisodeSelected(selectedEpisodes, season, episodeNumber)}
            key={episodeNumber}
            label={formatEpisodeOption(season, episodeNumber, entry.name)}
            onRewatchChange={(checked) => {
              onRewatchChange(season, episodeNumber, checked)
            }}
            onSelectedChange={(checked) => {
              onSelectedChange(season, episodeNumber, checked)
            }}
            rewatchId={rewatchId}
            selectedId={selectedId}
          />
        )
      })}
    </div>
  )
}
