export function DashboardHeatmapLegend() {
  return (
    <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
      <span>Less</span>
      <span className="size-3 rounded-xs bg-muted" />
      <span className="size-3 rounded-xs bg-primary/30" />
      <span className="size-3 rounded-xs bg-primary/50" />
      <span className="size-3 rounded-xs bg-primary/75" />
      <span className="size-3 rounded-xs bg-primary" />
      <span>More</span>
    </div>
  )
}
