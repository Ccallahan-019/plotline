import { CardDescription } from '@/components/ui/card'
import { Progress, ProgressLabel } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

import {
  formatSeasonWatchedLabel,
  type SeasonWatchedProgress,
} from '../../services/format-media-season'

type MediaSeasonProgressProps = {
  episodeCount: number
  progress: SeasonWatchedProgress
}

export function MediaSeasonProgress({ episodeCount, progress }: MediaSeasonProgressProps) {
  if (progress.status === 'unknown') {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  if (progress.status === 'error') {
    return <CardDescription className="text-xs">Could not load progress</CardDescription>
  }

  const { watchedCount } = progress
  const label = formatSeasonWatchedLabel(watchedCount, episodeCount)

  return (
    <Progress
      aria-hidden
      className="w-full gap-1 flex-col-reverse"
      max={episodeCount}
      value={watchedCount}
    >
      <ProgressLabel className="text-xs text-muted-foreground">{label}</ProgressLabel>
    </Progress>
  )
}
