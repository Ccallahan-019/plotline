import { ProgressLabel } from '@/components/ui/progress'
import { Progress } from '@/components/ui/progress'

import { type TvWatchProgress } from '../../services/format-media-title'

type MediaTitleTvProgressProps = {
  progress: null | TvWatchProgress
}

export function MediaTitleTvProgress({ progress }: MediaTitleTvProgressProps) {
  if (progress == null || progress.episodeCount == null) {
    return null
  }

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
