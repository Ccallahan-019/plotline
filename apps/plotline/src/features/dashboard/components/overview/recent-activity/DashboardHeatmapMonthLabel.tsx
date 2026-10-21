export function DashboardHeatmapMonthLabel({ label }: { label: null | string }) {
  if (!label) return null

  return (
    <div className="relative h-4 w-3">
      <span className="absolute top-0 left-0 text-[10px] whitespace-nowrap text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
