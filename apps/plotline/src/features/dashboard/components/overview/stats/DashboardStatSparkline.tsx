import { DASHBOARD_MONTH_LABELS } from '@/features/dashboard/services/format-dashboard'
import { cn } from '@/lib/utils'

type DashboardStatSparklineProps = {
  highlightMonth: null | number
  series: readonly number[]
}

export function DashboardStatSparkline({ highlightMonth, series }: DashboardStatSparklineProps) {
  const max = Math.max(...series, 0)

  return (
    <div aria-hidden className="flex h-8 w-full items-end gap-1">
      {series.map((value, index) => {
        const height = max === 0 ? 2 : Math.max(2, Math.round((value / max) * 32))
        const highlighted = index === highlightMonth

        return (
          <div
            className={cn(
              'min-w-0 flex-1 rounded-sm',
              highlighted ? 'bg-primary' : 'bg-primary/50',
            )}
            key={DASHBOARD_MONTH_LABELS[index]}
            style={{ height }}
          />
        )
      })}
    </div>
  )
}
