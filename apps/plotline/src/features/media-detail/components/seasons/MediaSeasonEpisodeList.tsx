import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { useTvSeasonEpisodes } from '@/features/library/log-watch/hooks/use-tv-season-episodes'

import type { MediaTitleSeason } from '../../types'

import { MediaSeasonEpisodeCardSkeleton } from './MediaSeasonEpisodeCardSkeleton'
import { MediaSeasonEpisodes, seasonEpisodeStripClassName } from './MediaSeasonEpisodes'

/** Enough stills to fill the strip before it scrolls. */
const EPISODE_SKELETON_COUNT = 6

type MediaSeasonEpisodeListProps = {
  backdropPath: null | string
  enabled: boolean
  logWatchSubmitting: boolean
  onLogEpisode: (seasonNumber: number, episodeNumber: number) => void
  query: ReturnType<typeof useTvSeasonEpisodes>
  selectedSeason?: MediaTitleSeason
  title: string
}

export function MediaSeasonEpisodeList({
  backdropPath,
  enabled,
  logWatchSubmitting,
  onLogEpisode,
  query,
  selectedSeason,
  title,
}: MediaSeasonEpisodeListProps) {
  if (!enabled || selectedSeason == null) {
    return null
  }

  const { data, isError, isPending } = query

  if (isPending) {
    return (
      <ScrollArea>
        <div
          aria-busy="true"
          aria-label="Loading episodes"
          className={seasonEpisodeStripClassName}
          role="status"
        >
          {Array.from({ length: EPISODE_SKELETON_COUNT }, (_, index) => (
            <MediaSeasonEpisodeCardSkeleton key={index} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
  }

  if (isError) {
    return (
      <ErrorEmpty
        description="Episodes for this season could not be loaded."
        title="Error Loading Episodes"
      />
    )
  }

  return (
    <MediaSeasonEpisodes
      backdropPath={backdropPath}
      episodes={data.episodes}
      logWatchSubmitting={logWatchSubmitting}
      onLogEpisode={onLogEpisode}
      seasonNumber={selectedSeason.seasonNumber}
      title={title}
    />
  )
}
