import { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import { FieldDescription } from '@/components/ui/field'

import { LogWatchEpisodeInput } from '../../../services/log-watch-form-schema'
import { LogWatchEpisodesFallbackList } from './LogWatchEpisodesFallbackList'
import { TmdbEpisodeListContent } from './TmdbEpisodeListContent'

type TmdbEpisodeListProps = {
  disabled: boolean
  isPending: boolean
  onRewatchChange: (season: number, episode: number, isRewatch: boolean) => void
  onSelectedChange: (season: number, episode: number, selected: boolean) => void
  season: number
  selectedEpisodes: readonly LogWatchEpisodeInput[]
  showTmdbEpisodeList: boolean
  tmdbEpisodes: readonly TmdbTvSeasonEpisode[]
}

export function TmdbEpisodeList({
  disabled,
  isPending,
  onRewatchChange,
  onSelectedChange,
  season,
  selectedEpisodes,
  showTmdbEpisodeList,
  tmdbEpisodes,
}: TmdbEpisodeListProps) {
  // Empty TMDB seasons still need the numeric add UI; otherwise submit stays blocked.
  const isEmptyTmdbSeason = showTmdbEpisodeList && !isPending && tmdbEpisodes.length === 0

  if (!showTmdbEpisodeList || isEmptyTmdbSeason) {
    const fallbackList = (
      <LogWatchEpisodesFallbackList
        disabled={disabled}
        onRewatchChange={onRewatchChange}
        onSelectedChange={onSelectedChange}
        season={season}
        selectedEpisodes={selectedEpisodes}
      />
    )

    if (!isEmptyTmdbSeason) {
      return fallbackList
    }

    return (
      <div className="flex flex-col gap-3">
        <FieldDescription>No episodes found for this season.</FieldDescription>
        {fallbackList}
      </div>
    )
  }

  return (
    <TmdbEpisodeListContent
      disabled={disabled}
      isPending={isPending}
      onRewatchChange={onRewatchChange}
      onSelectedChange={onSelectedChange}
      season={season}
      selectedEpisodes={selectedEpisodes}
      tmdbEpisodes={tmdbEpisodes}
    />
  )
}
