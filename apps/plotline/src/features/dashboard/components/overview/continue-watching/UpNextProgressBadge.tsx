import { Badge } from '@/components/ui/badge'
import { ContinueWatchingItem } from '@/features/dashboard/services/continue-watching'
import { cn } from '@/lib/utils'

type UpNextProgressBadgeProps = {
  isHovered: boolean
  item: ContinueWatchingItem
}

export function UpNextProgressBadge({ isHovered, item }: UpNextProgressBadgeProps) {
  const percent = tvPosterProgressPercent(item)

  if (percent == null) {
    return null
  }

  return (
    <Badge
      aria-label={`${percent}% watched`}
      className={cn(
        'h-6.5 rounded-md shadow-sm transition-opacity',
        isHovered
          ? 'opacity-100'
          : 'can-hover:opacity-0 can-hover:group-focus-within/up-next:opacity-100',
      )}
      variant="secondary"
    >
      {percent}%
    </Badge>
  )
}

// Films store a sort percent and do not show it. TV omits it without an episode total.
function tvPosterProgressPercent(item: ContinueWatchingItem): null | number {
  if (item.mediaType !== 'tv') {
    return null
  }

  return item.percent
}
