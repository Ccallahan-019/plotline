import Link from 'next/link'

import { activityRowHeadline } from '@/features/dashboard/services/activity-display'
import { formatActivityClock } from '@/features/dashboard/services/format-dashboard'
import { cn } from '@/lib/utils'

import { DashboardActivityRow } from '../../types'
import { ActivityChallengeBar } from './ActivityChallengeBar'
import { ActivityMarker } from './ActivityMarker'
import { ActivityMediaTypeBadge } from './ActivityMediaTypeBadge'
import { ActivityRowDetail } from './ActivityRowDetail'
import { ActivityRowPoster } from './ActivityRowPoster'
import { ActivityRowRating } from './ActivityRowRating'

type ActivityRowProps = {
  isFirst: boolean
  isLast: boolean
  row: DashboardActivityRow
  timeZone: string
}

export function ActivityRow({ isFirst, isLast, row, timeZone }: ActivityRowProps) {
  const content = (
    <div className="flex">
      <div className="flex w-8 shrink-0 flex-col items-center">
        <span aria-hidden className={cn('w-px flex-1 bg-border', isFirst && 'invisible')} />
        <ActivityMarker kind={row.filterKind} />
        <span aria-hidden className={cn('w-px flex-1 bg-border', isLast && 'invisible')} />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3">
        <ActivityRowPoster posterPath={row.posterPath} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm font-medium">{row.label}</span>
            <span className="min-w-0 truncate text-sm">{activityRowHeadline(row)}</span>
            <ActivityRowRating filterKind={row.filterKind} rating={row.rating} />
          </div>
          <ActivityRowDetail detail={row.detail} filterKind={row.filterKind} />
          <ActivityChallengeBar filterKind={row.filterKind} progress={row.progress} />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ActivityMediaTypeBadge mediaType={row.mediaType} />
          <time
            className="text-xs whitespace-nowrap text-muted-foreground tabular-nums"
            dateTime={row.occurredAt}
          >
            {formatActivityClock(row.occurredAt, timeZone)}
          </time>
        </div>
      </div>
    </div>
  )

  if (!row.href) {
    return content
  }

  return (
    <Link
      className="block rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={row.href}
    >
      {content}
    </Link>
  )
}
