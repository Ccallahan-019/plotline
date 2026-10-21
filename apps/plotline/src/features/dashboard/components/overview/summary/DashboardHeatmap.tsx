import type { DashboardSummary } from '@/features/dashboard/types'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { heatmapFooterFigures } from '@/features/dashboard/services/activity-display'
import {
  heatmapWeekMonthLabels,
  layoutHeatmapWeeks,
} from '@/features/dashboard/services/layout-heatmap'
import { cn } from '@/lib/utils'

import { DashboardHeatmapDayCell } from './DashboardHeatmapDayCell'
import { DashboardHeatmapLegend } from './DashboardHeatmapLegend'
import { DashboardHeatmapMonthLabel } from './DashboardHeatmapMonthLabel'
import { DashboardHeatmapWeekdayLabels } from './DashboardHeatmapWeekdayLabels'
import { ViewingYearSelector } from './ViewingYearSelector'

type DashboardHeatmapProps = {
  busy?: boolean
  onSelectDay: (date: string) => void
  onYearChange: (year: number) => void
  selectedDate: null | string
  summary: DashboardSummary
  year: number
  years: readonly number[]
}

export function DashboardHeatmap({
  busy = false,
  onSelectDay,
  onYearChange,
  selectedDate,
  summary,
  year,
  years,
}: DashboardHeatmapProps) {
  const weeks = layoutHeatmapWeeks(summary.heatmap.days)
  const monthLabels = heatmapWeekMonthLabels(weeks)
  const figures = heatmapFooterFigures(summary.heatmap)

  return (
    <Card aria-busy={busy}>
      <CardHeader>
        <CardTitle>Your Viewing Year</CardTitle>
        <CardDescription>Click a day to jump to that date in the feed</CardDescription>
        <CardAction>
          <ViewingYearSelector onYearChange={onYearChange} year={year} years={years} />
        </CardAction>
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-2', busy && 'opacity-60')}>
        <ScrollArea>
          <div className="flex w-max gap-2 pb-3">
            <DashboardHeatmapWeekdayLabels />
            <div className="flex flex-col gap-1">
              <div className="flex h-4 gap-1">
                {monthLabels.map((label, index) => (
                  <div className="relative h-4 w-3" key={`${label ?? 'month'}-${index}`}>
                    <DashboardHeatmapMonthLabel label={label} />
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div className="grid grid-rows-7 gap-1" key={weekKey(week, weekIndex)}>
                    {week.map((cell, dayIndex) => {
                      const key = cell.kind === 'day' ? cell.date : `${weekIndex}-${dayIndex}`

                      return (
                        <DashboardHeatmapDayCell
                          cell={cell}
                          key={key}
                          onSelectDay={onSelectDay}
                          selected={cell.kind === 'day' && cell.date === selectedDate}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DashboardHeatmapLegend />
      </CardContent>
      <CardFooter>
        <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {figures.map((figure) => (
            <div key={figure.label}>
              <dt className="text-xs text-muted-foreground">{figure.label}</dt>
              <dd className="text-sm font-medium tabular-nums">{figure.value}</dd>
            </div>
          ))}
        </dl>
      </CardFooter>
    </Card>
  )
}

function weekKey(
  week: readonly { date?: string; kind: 'day' | 'empty' }[],
  weekIndex: number,
): string {
  const day = week.find((cell) => cell.kind === 'day' && cell.date)

  return day?.date ?? `week-${weekIndex}`
}
