import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import { FieldDescription } from '@/components/ui/field'

import type { LogWatchEpisodeInput } from '../../../services/log-watch-form-schema'

import { LogWatchEpisodesFallbackList } from './LogWatchEpisodesFallbackList'
import { TmdbEpisodeListContent } from './TmdbEpisodeListContent'

type TmdbEpisodeListProps = {
  disabled: boolean
  isPending: boolean
  onSelectedChange: (season: number, episode: number, selected: boolean) => void
  season: number
  selectedEpisodes: readonly LogWatchEpisodeInput[]
  showCompleted: boolean
  showTmdbEpisodeList: boolean
  tmdbEpisodes: readonly TmdbTvSeasonEpisode[]
  watchedEpisodeKeys: ReadonlySet<string>
}

export function TmdbEpisodeList({
  disabled,
  isPending,
  onSelectedChange,
  season,
  selectedEpisodes,
  showCompleted,
  showTmdbEpisodeList,
  tmdbEpisodes,
  watchedEpisodeKeys,
}: TmdbEpisodeListProps) {
  // Empty TMDB seasons still need the numeric add UI; otherwise submit stays blocked.
  const isEmptyTmdbSeason = showTmdbEpisodeList && !isPending && tmdbEpisodes.length === 0

  if (!showTmdbEpisodeList || isEmptyTmdbSeason) {
    const fallbackList = (
      <LogWatchEpisodesFallbackList
        disabled={disabled}
        onSelectedChange={onSelectedChange}
        season={season}
        selectedEpisodes={selectedEpisodes}
        showCompleted={showCompleted}
        watchedEpisodeKeys={watchedEpisodeKeys}
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
      onSelectedChange={onSelectedChange}
      season={season}
      selectedEpisodes={selectedEpisodes}
      showCompleted={showCompleted}
      tmdbEpisodes={tmdbEpisodes}
      watchedEpisodeKeys={watchedEpisodeKeys}
    />
  )
}
