'use client'

import { useState } from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ShowIf } from '@/components/utils/ShowIf'
import { useTvSeasonEpisodes } from '@/features/library/log-watch/hooks/use-tv-season-episodes'
import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

import type { MediaTitleSeason } from '../../types'

import {
  countSeasonEpisodesWatched,
  resolveSelectedSeason,
} from '../../services/format-media-season'
import { MediaSeasonCard } from './MediaSeasonCard'
import { MediaSeasonEpisodeList } from './MediaSeasonEpisodeList'
import { MediaSeasonsEmpty } from './MediaSeasonsEmpty'

type MediaSeasonsTabProps = {
  backdropPath: null | string
  enabled: boolean
  fallbackPosterPath: null | string
  lastSeason: null | number
  libraryItemId: null | number
  logWatchSubmitting: boolean
  onLogEpisode: (seasonNumber: number, episodeNumber: number) => void
  seasons: MediaTitleSeason[]
  title: string
  tmdbId: number
}

export function MediaSeasonsTab({
  backdropPath,
  enabled,
  fallbackPosterPath,
  lastSeason,
  libraryItemId,
  logWatchSubmitting,
  onLogEpisode,
  seasons,
  title,
  tmdbId,
}: MediaSeasonsTabProps) {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<null | number>(null)
  const selected = resolveSelectedSeason(seasons, selectedSeasonNumber, lastSeason)
  const { overview = null, seasonNumber: activeSeasonNumber } = selected ?? {}
  const watchedQuery = useWatchedEpisodes(libraryItemId, { enabled })
  const episodesQuery = useTvSeasonEpisodes(tmdbId, activeSeasonNumber, {
    enabled: enabled && selected != null,
  })

  if (seasons.length === 0) {
    return <MediaSeasonsEmpty />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <ScrollArea>
          <div className="flex w-max gap-3 px-1 pt-1 pb-4">
            {seasons.map((season) => (
              <MediaSeasonCard
                fallbackPosterPath={fallbackPosterPath}
                key={season.seasonNumber}
                onSelect={setSelectedSeasonNumber}
                season={season}
                selected={season.seasonNumber === activeSeasonNumber}
                watchedCount={watchedCountForSeason(season, libraryItemId, watchedQuery)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <ShowIf condition={overview != null}>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm lg:text-base font-medium">Season Synopsis</h3>
            <p className="text-xs leading-relaxed text-pretty lg:text-sm">{overview}</p>
          </div>
        </ShowIf>
      </div>

      <MediaSeasonEpisodeList
        backdropPath={backdropPath}
        enabled={enabled}
        logWatchSubmitting={logWatchSubmitting}
        onLogEpisode={onLogEpisode}
        query={episodesQuery}
        selectedSeason={selected}
        title={title}
      />
    </div>
  )
}

function watchedCountForSeason(
  season: MediaTitleSeason,
  libraryItemId: null | number,
  watchedQuery: ReturnType<typeof useWatchedEpisodes>,
): null | number {
  if (libraryItemId == null) {
    return 0
  }

  const { episodeCount, seasonNumber } = season
  const { data, isError, isSuccess } = watchedQuery

  if (isSuccess) {
    return countSeasonEpisodesWatched(data, seasonNumber, episodeCount)
  }

  if (isError) {
    return 0
  }

  return null
}
