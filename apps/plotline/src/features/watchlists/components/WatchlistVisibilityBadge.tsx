import { Watchlist } from '@plotline/payload-types'
import { Globe, LucideIcon, ShieldUser, Users } from 'lucide-react'
import { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'

import { formatWatchlistVisibilityLabel } from '../services/format-watchlist-visibility'

const VISIBILITY_ICONS: Record<Watchlist['visibility'], LucideIcon | null> = {
  friends: Users,
  private: ShieldUser,
  public: Globe,
  unlisted: null,
}

type WatchlistVisibilityBadgeProps = {
  variant?: ComponentProps<typeof Badge>['variant']
  visibility: Watchlist['visibility']
}

export function WatchlistVisibilityBadge({
  variant = 'secondary',
  visibility,
}: WatchlistVisibilityBadgeProps) {
  const Icon = VISIBILITY_ICONS[visibility]

  return (
    <Badge className="w-fit" variant={variant}>
      {Icon && <Icon data-icon="inline-start" />}
      {formatWatchlistVisibilityLabel(visibility)}
    </Badge>
  )
}
