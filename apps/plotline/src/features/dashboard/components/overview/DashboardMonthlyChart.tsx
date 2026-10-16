import type { DashboardSummary } from '@/features/dashboard/types'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DASHBOARD_MONTH_LABELS,
  formatDashboardQuantity,
} from '@/features/dashboard/services/format-dashboard'
import { cn } from '@/lib/utils'

type DashboardMonthlyChartProps = {
  summary: DashboardSummary
}

export function DashboardMonthlyChart({ summary }: DashboardMonthlyChartProps) {
  const counts = summary.titlesPerMonth.counts
  const max = Math.max(...counts, 0)
  const highlightMonth = summary.titlesPerMonth.highlightMonth

  return (
    <Card>
      <CardHeader>
        <CardTitle>Titles per Month</CardTitle>
        <CardDescription>Your viewing year, so far</CardDescription>
        <CardAction>
          <Badge variant="secondary">Stats {summary.year}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5">
          {counts.map((count, index) => {
            const label = DASHBOARD_MONTH_LABELS[index] ?? ''
            const height = max === 0 ? 4 : Math.max(4, Math.round((count / max) * 128))
            const highlighted = index === highlightMonth

            return (
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={label}>
                <div className="flex h-32 w-full items-end justify-center">
                  <div
                    className={cn(
                      'w-full max-w-8 rounded-sm',
                      highlighted ? 'bg-primary' : 'bg-primary/35',
                    )}
                    style={{ height }}
                    title={`${label}: ${formatDashboardQuantity(count, 'title')}`}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] leading-none',
                    highlighted ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
        <ul className="sr-only">
          {counts.map((count, index) => (
            <li key={DASHBOARD_MONTH_LABELS[index]}>
              {DASHBOARD_MONTH_LABELS[index]}: {formatDashboardQuantity(count, 'title')}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
