'use client'

import { useState } from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useTvSeasonEpisodes } from '@/features/library/log-watch/hooks/use-tv-season-episodes'
import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

import type { MediaTitleSeason } from '../../types'

import {
  countSeasonEpisodesWatched,
  resolveSelectedSeason,
} from '../../services/format-media-season'
import { MediaSeasonCard } from './MediaSeasonCard'
import { MediaSeasonEpisodeList } from './MediaSeasonEpisodeList'

type MediaSeasonsTabProps = {
  enabled: boolean
  fallbackPosterPath: null | string
  lastSeason: null | number
  libraryItemId: null | number
  seasons: MediaTitleSeason[]
  tmdbId: number
}

export function MediaSeasonsTab({
  enabled,
  fallbackPosterPath,
  lastSeason,
  libraryItemId,
  seasons,
  tmdbId,
}: MediaSeasonsTabProps) {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<null | number>(null)
  const selected = resolveSelectedSeason(seasons, selectedSeasonNumber, lastSeason)
  const watchedQuery = useWatchedEpisodes(libraryItemId, { enabled })
  const episodesQuery = useTvSeasonEpisodes(tmdbId, selected?.seasonNumber, {
    enabled: enabled && selected != null,
  })

  if (seasons.length === 0) {
    return <p className="text-sm text-muted-foreground">No seasons are listed for this series.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <ScrollArea>
        <div className="flex w-max gap-3 px-1 pt-1 pb-4">
          {seasons.map((season) => (
            <MediaSeasonCard
              fallbackPosterPath={fallbackPosterPath}
              key={season.seasonNumber}
              onSelect={setSelectedSeasonNumber}
              season={season}
              selected={season.seasonNumber === selected?.seasonNumber}
              watchedCount={watchedCountForSeason(season, libraryItemId, watchedQuery)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <MediaSeasonEpisodeList enabled={enabled} query={episodesQuery} selectedSeason={selected} />
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

  if (watchedQuery.isSuccess) {
    return countSeasonEpisodesWatched(watchedQuery.data, season.seasonNumber, season.episodeCount)
  }

  if (watchedQuery.isError) {
    return 0
  }

  return null
}
