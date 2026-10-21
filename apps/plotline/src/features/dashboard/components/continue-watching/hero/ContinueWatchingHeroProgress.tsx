import { Progress, ProgressLabel } from '@/components/ui/progress'

type ContinueWatchingHeroProgressProps = {
  percent: null | number
  progressLabel: string
}

export function ContinueWatchingHeroProgress({
  percent,
  progressLabel,
}: ContinueWatchingHeroProgressProps) {
  if (percent == null) {
    return <p className="text-xs text-muted-foreground">{progressLabel}</p>
  }

  return (
    <Progress className="max-w-xl flex-col-reverse gap-1" trackClassName="h-2" value={percent}>
      <ProgressLabel className="text-xs font-normal text-muted-foreground">
        {progressLabel}
      </ProgressLabel>
    </Progress>
  )
}
