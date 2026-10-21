import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatHeatmapDayLabel } from '@/features/dashboard/services/format-dashboard'
import { heatmapLevelClass, HeatmapWeekCell } from '@/features/dashboard/services/layout-heatmap'
import { cn } from '@/lib/utils'

type DashboardHeatmapDayCellProps = {
  cell: HeatmapWeekCell
  onSelectDay: (date: string) => void
  selected: boolean
}

export function DashboardHeatmapDayCell({
  cell,
  onSelectDay,
  selected,
}: DashboardHeatmapDayCellProps) {
  if (cell.kind !== 'day') {
    return <div className="size-3" />
  }

  const date = cell.date
  const label = formatHeatmapDayLabel(date, cell.count)

  function handleSelectDay() {
    onSelectDay(date)
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            aria-pressed={selected}
            className={cn(
              'size-3 min-h-3 min-w-3 rounded-xs p-0',
              heatmapLevelClass(cell.count),
              selected && 'z-10 ring-2 ring-foreground',
            )}
            onClick={handleSelectDay}
            size="icon-xs"
            type="button"
            variant="ghost"
          />
        }
      />
      <TooltipContent>
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}
