import { Progress, ProgressLabel } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

import { formatSeasonWatchedLabel } from '../../services/format-media-season'

type MediaSeasonProgressProps = {
  episodeCount: number
  watchedCount: null | number
}

export function MediaSeasonProgress({ episodeCount, watchedCount }: MediaSeasonProgressProps) {
  if (watchedCount == null) {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

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
