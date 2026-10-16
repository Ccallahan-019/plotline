import type { DashboardSummary } from '@/features/dashboard/types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ShowIf } from '@/components/utils/ShowIf'
import { monthDayLabel, parseCalendarDateKey } from '@/features/dashboard/services/calendar'
import {
  formatDashboardQuantity,
  formatHeatmapDayLabel,
} from '@/features/dashboard/services/format-dashboard'
import {
  heatmapDaysWithTitles,
  heatmapWeekMonthLabels,
  layoutHeatmapWeeks,
} from '@/features/dashboard/services/layout-heatmap'

import { DashboardHeatmapDayCell } from './DashboardHeatmapDayCell'
import { DashboardHeatmapLegend } from './DashboardHeatmapLegend'
import { DashboardHeatmapMonthLabel } from './DashboardHeatmapMonthLabel'
import { DashboardHeatmapWeekdayLabels } from './DashboardHeatmapWeekdayLabels'

type DashboardHeatmapProps = {
  summary: DashboardSummary
}

export function DashboardHeatmap({ summary }: DashboardHeatmapProps) {
  const weeks = layoutHeatmapWeeks(summary.heatmap.days)
  const monthLabels = heatmapWeekMonthLabels(weeks)
  const titledDays = heatmapDaysWithTitles(summary.heatmap.days)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watch Calendar</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {heatmapDescription(summary)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
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

                      return <DashboardHeatmapDayCell cell={cell} key={key} />
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <ShowIf condition={titledDays.length > 0}>
          <ul className="sr-only">
            {titledDays.map((day) => (
              <li key={day.date}>{formatHeatmapDayLabel(day.date, day.count)}</li>
            ))}
          </ul>
        </ShowIf>

        <DashboardHeatmapLegend />
      </CardContent>
    </Card>
  )
}

function heatmapDescription(summary: DashboardSummary): string {
  const { heatmap } = summary
  const parts = [
    formatDashboardQuantity(heatmap.activeDays, 'Active Day'),
    `Longest Streak - ${formatDashboardQuantity(heatmap.longestStreak, 'day')}`,
    formatDashboardQuantity(heatmap.titlesThisYear, 'Title'),
  ]
  const busiest = heatmap.busiestDay
  const busiestDate = busiest ? parseCalendarDateKey(busiest.date) : null

  if (busiest && busiestDate) {
    parts.push(`Busiest Day - ${monthDayLabel(busiestDate)}`)
  }

  return parts.join(' · ')
}

function weekKey(
  week: readonly { date?: string; kind: 'day' | 'empty' }[],
  weekIndex: number,
): string {
  const day = week.find((cell) => cell.kind === 'day' && cell.date)

  return day?.date ?? `week-${weekIndex}`
}
