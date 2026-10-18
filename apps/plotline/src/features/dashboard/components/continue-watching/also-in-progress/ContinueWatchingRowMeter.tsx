import { Progress } from '@/components/ui/progress'
import { ShowIf } from '@/components/utils/ShowIf'
import {
  ContinueWatchingItem,
  formatContinueWatchingRelativeTime,
} from '@/features/dashboard/services/continue-watching'

type ContinueWatchingRowMeterProps = {
  item: ContinueWatchingItem
}

export function ContinueWatchingRowMeter({ item }: ContinueWatchingRowMeterProps) {
  const relativeTime = formatContinueWatchingRelativeTime(item.lastWatchedAt, new Date())
  const { lastWatchedAt, percent, progressLabel } = item

  return (
    <div className="order-4 flex w-full min-w-0 basis-full flex-wrap items-center gap-x-3 gap-y-1.5 @min-[48rem]/cw:contents">
      <div className="w-full min-w-0 max-w-full">
        <ShowIf condition={percent != null}>
          <Progress
            aria-label={progressLabel}
            className="w-full"
            trackClassName="h-1.5"
            value={percent}
          />
        </ShowIf>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs text-muted-foreground">{progressLabel}</span>
        <ContinueWatchingRowTime lastWatchedAt={lastWatchedAt} relativeTime={relativeTime} />
      </div>
    </div>
  )
}

function ContinueWatchingRowTime({
  lastWatchedAt,
  relativeTime,
}: {
  lastWatchedAt: null | string
  relativeTime: null | string
}) {
  if (relativeTime == null || lastWatchedAt == null) return null

  return (
    <time
      className="shrink-0 text-xs whitespace-nowrap text-muted-foreground"
      dateTime={lastWatchedAt}
    >
      {relativeTime}
    </time>
  )
}
