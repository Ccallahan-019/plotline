import { Fragment } from 'react/jsx-runtime'

import type { DashboardActivityRow } from '@/features/dashboard/types'

import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { groupActivityRows } from '@/features/dashboard/services/activity'

import { ActivityRow } from './ActivityRow'

type ActivityTimelineProps = {
  emptyLabel: string
  rows: readonly DashboardActivityRow[]
  timeZone: string
}

export function ActivityTimeline({ emptyLabel, rows, timeZone }: ActivityTimelineProps) {
  const groups = groupActivityRows(rows, new Date(), timeZone)

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section className="flex flex-col gap-1" key={group.key}>
          <p className="text-sm font-medium text-muted-foreground">{group.label}</p>
          <ItemGroup className="gap-0">
            {group.rows.map((row, index) => (
              <Fragment key={row.id}>
                <ActivityRow row={row} timeZone={timeZone} />
                <ShowIf condition={index < group.rows.length - 1}>
                  <ItemSeparator />
                </ShowIf>
              </Fragment>
            ))}
          </ItemGroup>
        </section>
      ))}
    </div>
  )
}
