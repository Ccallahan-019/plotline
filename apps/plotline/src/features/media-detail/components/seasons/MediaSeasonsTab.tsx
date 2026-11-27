'use client'

import { useState } from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ShowIf } from '@/components/utils/ShowIf'
import { useTvSeasonEpisodes } from '@/features/library/log-watch/hooks/use-tv-season-episodes'
import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

import type { MediaTitleSeason } from '../../types'

import { resolveSelectedSeason, seasonWatchedProgress } from '../../services/format-media-season'
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
  const {
    data: watchedEpisodes,
    isError: watchedEpisodesFailed,
    isSuccess: watchedEpisodesLoaded,
  } = watchedQuery
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
            {seasons.map((season) => {
              const { episodeCount, seasonNumber } = season

              return (
                <MediaSeasonCard
                  fallbackPosterPath={fallbackPosterPath}
                  key={seasonNumber}
                  onSelect={setSelectedSeasonNumber}
                  progress={seasonWatchedProgress({
                    episodeCount,
                    episodes: watchedEpisodes,
                    isError: watchedEpisodesFailed,
                    isSuccess: watchedEpisodesLoaded,
                    libraryItemId,
                    seasonNumber,
                  })}
                  season={season}
                  selected={seasonNumber === activeSeasonNumber}
                />
              )
            })}
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
