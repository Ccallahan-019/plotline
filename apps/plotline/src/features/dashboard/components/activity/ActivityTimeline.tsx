import { Fragment } from 'react/jsx-runtime'

import type { DashboardActivityGroup, DashboardActivityRow } from '@/features/dashboard/types'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShowIf } from '@/components/utils/ShowIf'
import { groupActivityRows } from '@/features/dashboard/services/activity'

import { DashboardWidgetEmpty } from '../state/DashboardWidgetEmpty'
import { ActivityRow } from './ActivityRow'

type ActivityTimelineProps = {
  rows: readonly DashboardActivityRow[]
  timeZone: string
}

export function ActivityTimeline({ rows, timeZone }: ActivityTimelineProps) {
  const groups = groupActivityRows(rows, new Date(), timeZone)

  if (groups.length === 0) {
    return <DashboardWidgetEmpty description="Nothing matches these filters." title="No Activity" />
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {groups.map((group, index) => (
          <Fragment key={group.key}>
            <ActivityTimelineGroup group={group} key={group.key} timeZone={timeZone} />
            <ShowIf condition={index !== groups.length - 1}>
              <Separator />
            </ShowIf>
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}

function ActivityTimelineGroup({
  group,
  timeZone,
}: {
  group: DashboardActivityGroup
  timeZone: string
}) {
  return (
    <section className="grid grid-cols-1 gap-1 lg:gap-0 lg:grid-cols-[12rem_1fr]">
      <header>
        <h2 className="text-sm font-semibold">{group.label}</h2>
        <ShowIf condition={group.dateLabel != null}>
          <p className="text-xs text-muted-foreground">{group.dateLabel}</p>
        </ShowIf>
      </header>
      <div>
        {group.rows.map((row, index) => (
          <ActivityRow
            isFirst={index === 0}
            isLast={index === group.rows.length - 1}
            key={row.id}
            row={row}
            timeZone={timeZone}
          />
        ))}
      </div>
    </section>
  )
}
