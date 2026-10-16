import Link from 'next/link'

import { RatingStars } from '@/components/ratings/RatingStars'
import {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Item } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'

import { formatActivityClock, formatDashboardRating } from '../../services/format-dashboard'
import { DashboardActivityRow } from '../../types'
import { ActivityMarker } from './ActivityMarker'

type ActivityRowProps = {
  row: DashboardActivityRow
  timeZone: string
}

export function ActivityRow({ row, timeZone }: ActivityRowProps) {
  const content = (
    <Item className="px-0">
      <ItemMedia>
        <ActivityMarker row={row} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{row.title}</ItemTitle>
        <ItemDescription>{activityMeta(row)}</ItemDescription>
      </ItemContent>
      <ItemActions className="gap-3">
        <ShowIf condition={row.filterKind === 'watched'}>
          {/* Stand in for inline ratings until ratings are implemented */}
          <RatingStars ratingOutOfTen={row.rating ?? 0} />
        </ShowIf>
        <time
          className="shrink-0 text-xs text-muted-foreground tabular-nums"
          dateTime={row.occurredAt}
        >
          {formatActivityClock(row.occurredAt, timeZone)}
        </time>
      </ItemActions>
    </Item>
  )

  if (!row.href) {
    return content
  }

  return <Link href={row.href}>{content}</Link>
}

function activityMeta(row: DashboardActivityRow): string {
  const parts = [row.label]

  if (row.detail) {
    parts.push(row.detail)
  }

  if (row.rating != null) {
    parts.push(formatDashboardRating(row.rating))
  }

  return parts.join(' · ')
}
