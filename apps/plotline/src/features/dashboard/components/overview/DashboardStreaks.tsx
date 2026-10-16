import { ClockCheck, Film, Flame, Swords, Zap } from 'lucide-react'

import type { DashboardSummary } from '@/features/dashboard/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatDashboardCount,
  formatDashboardHours,
  formatDashboardQuantity,
} from '@/features/dashboard/services/format-dashboard'

type DashboardStreaksProps = {
  summary: DashboardSummary
}

export function DashboardStreaks({ summary }: DashboardStreaksProps) {
  const { streaks } = summary
  const rows = [
    {
      icon: Zap,
      label: 'Current Streak',
      value: formatDashboardQuantity(streaks.currentStreak, 'day'),
    },
    {
      icon: Film,
      label: 'Films Completed',
      value: formatDashboardCount(streaks.filmsCompleted),
    },
    {
      icon: ClockCheck,
      label: 'Lifetime Hours',
      value: formatDashboardHours(streaks.lifetimeHours),
    },
    {
      icon: Swords,
      label: 'Challenges Completed',
      value: formatDashboardCount(streaks.challengesCompleted),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-sm bg-muted p-1">
            <Flame className="size-4.5 text-primary" />
          </div>
          <CardTitle>Streaks & Milestones</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-3">
          {rows.map((row) => {
            const Icon = row.icon

            return (
              <div className="flex items-center justify-between gap-3" key={row.label}>
                <dt className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{row.label}</span>
                </dt>
                <dd className="shrink-0 text-sm font-medium tabular-nums">{row.value}</dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}
