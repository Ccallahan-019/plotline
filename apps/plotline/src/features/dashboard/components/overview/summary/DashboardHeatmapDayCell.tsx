import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatHeatmapDayLabel } from '@/features/dashboard/services/format-dashboard'
import { HeatmapWeekCell } from '@/features/dashboard/services/layout-heatmap'
import { cn } from '@/lib/utils'

export function DashboardHeatmapDayCell({ cell }: { cell: HeatmapWeekCell }) {
  if (cell.kind !== 'day') {
    return <div className="size-3" />
  }

  const label = formatHeatmapDayLabel(cell.date, cell.count)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            aria-label={label}
            className={cn('size-3 rounded-xs', heatmapLevelClass(cell.count))}
            role="img"
          />
        }
      />
      <TooltipContent>
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}

export function heatmapLevelClass(count: number): string {
  if (count <= 0) {
    return 'bg-muted'
  }

  if (count === 1) {
    return 'bg-primary/30'
  }

  if (count === 2) {
    return 'bg-primary/50'
  }

  if (count <= 4) {
    return 'bg-primary/75'
  }

  return 'bg-primary'
}
