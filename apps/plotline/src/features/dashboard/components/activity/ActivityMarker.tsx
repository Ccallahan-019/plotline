import { Eye, Flag, LucideIcon, PenLine, Star, Swords } from 'lucide-react'

import { DashboardActivityFilterKind } from '../../types'

const ACTIVITY_ICONS: Record<DashboardActivityFilterKind, LucideIcon> = {
  challenge: Swords,
  milestone: Flag,
  rated: Star,
  reviewed: PenLine,
  watched: Eye,
}

type ActivityMarkerProps = {
  kind: DashboardActivityFilterKind
}

export function ActivityMarker({ kind }: ActivityMarkerProps) {
  const Icon = ACTIVITY_ICONS[kind]

  return (
    <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
      <Icon aria-hidden className="size-3.5 text-muted-foreground" />
    </span>
  )
}
