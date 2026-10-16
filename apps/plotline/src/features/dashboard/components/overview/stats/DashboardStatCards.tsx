import type { DashboardSummary } from '@/features/dashboard/types'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShowIf } from '@/components/utils/ShowIf'
import {
  formatDashboardCount,
  formatDashboardHours,
  formatDashboardQuantity,
  formatDashboardRating,
} from '@/features/dashboard/services/format-dashboard'

import { DashboardStatSparkline } from './DashboardStatSparkline'

type DashboardStatCardsProps = {
  summary: DashboardSummary
}

export function DashboardStatCards({ summary }: DashboardStatCardsProps) {
  const year = String(summary.year)
  const cards = [
    {
      hint: year,
      label: 'Titles Watched',
      series: summary.stats.titlesWatched.series,
      value: formatDashboardCount(summary.stats.titlesWatched.value),
    },
    {
      hint: year,
      label: 'Hours Watched',
      series: summary.stats.hoursWatched.series,
      value: formatDashboardHours(summary.stats.hoursWatched.value),
    },
    {
      hint: year,
      label: 'Longest Streak',
      series: summary.stats.longestStreak.series,
      value: formatDashboardQuantity(summary.stats.longestStreak.value, 'Day'),
    },
    {
      hint: 'Lifetime',
      label: 'Avg Rating',
      series: summary.stats.avgRating.series,
      value: formatDashboardRating(summary.stats.avgRating.value),
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>

            <ShowIf condition={card.hint != null}>
              <CardAction>
                <span className="text-xs text-muted-foreground">{card.hint}</span>
              </CardAction>
            </ShowIf>
          </CardHeader>
          <CardContent>
            <DashboardStatSparkline
              highlightMonth={summary.titlesPerMonth.highlightMonth}
              series={card.series}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
