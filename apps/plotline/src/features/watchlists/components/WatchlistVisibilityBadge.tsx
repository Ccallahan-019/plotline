import { Watchlist } from '@plotline/payload-types'
import { Globe, Lock, LucideIcon, Users } from 'lucide-react'
import { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'

const VISIBILITY_LABELS: Record<Watchlist['visibility'], string> = {
  friends: 'Friends',
  private: 'Private',
  public: 'Public',
  unlisted: 'Unlisted',
}

const VISIBILITY_ICONS: Record<Watchlist['visibility'], LucideIcon | null> = {
  friends: Users,
  private: Lock,
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
      {VISIBILITY_LABELS[visibility]}
    </Badge>
  )
}
