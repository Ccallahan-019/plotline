import { Badge } from '@/components/ui/badge'

export function NoFiltersBadge() {
  return (
    <Badge className="rounded-full text-xs h-6.5" variant="secondary">
      <span className="text-muted-foreground">No filters applied</span>
    </Badge>
  )
}
