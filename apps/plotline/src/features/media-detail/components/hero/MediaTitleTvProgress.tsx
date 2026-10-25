import { LibraryItem, Media } from '@plotline/payload-types'

import { ProgressLabel } from '@/components/ui/progress'
import { Progress } from '@/components/ui/progress'

import { getTvWatchProgress } from '../../services/format-media-title'

type MediaTitleTvProgressProps = {
  libraryItem: LibraryItem | null
  media: Media
}

export function MediaTitleTvProgress({ libraryItem, media }: MediaTitleTvProgressProps) {
  const progress =
    media.mediaType === 'tv'
      ? getTvWatchProgress({
          episodeCount: media.tvMeta?.episodeCount,
          episodesWatched: libraryItem?.progress.episodesWatched,
          lastEpisode: libraryItem?.progress.lastEpisode,
          lastSeason: libraryItem?.progress.lastSeason,
          media: media,
          seasonsCompleted: libraryItem?.progress.seasonsCompleted,
          status: libraryItem?.status,
        })
      : null

  if (progress == null || progress.episodeCount == null) return null

  const watchedLabel = `${progress.episodesWatched} of ${progress.episodeCount} episodes`
  const barValue = Math.min(progress.episodesWatched, progress.episodeCount)

  return (
    <Progress
      aria-label={watchedLabel}
      className="flex-col-reverse max-w-3xl"
      max={progress.episodeCount}
      value={barValue}
    >
      <div className="flex gap-3 justify-between">
        <ProgressLabel>{watchedLabel}</ProgressLabel>
        <ProgressLabel className="text-muted-foreground">
          Up Next S{progress.upNextSeason} E{progress.upNextEpisode}
        </ProgressLabel>
      </div>
    </Progress>
  )
}
