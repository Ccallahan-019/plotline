import { Clapperboard, LucideIcon, PenLine, Star, Swords, Trophy } from 'lucide-react'

import { MediaPoster } from '@/components/media/MediaPoster'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

import { DashboardActivityFilterKind, DashboardActivityRow } from '../../types'

type ActivityMarkerProps = {
  row: DashboardActivityRow
}

export function ActivityMarker({ row }: ActivityMarkerProps) {
  if (row.posterPath) {
    const src = tmdbMediaUrl(row.posterPath, 'w185')

    return <MediaPoster alt="" className="w-12 rounded-sm" ratio={2 / 3} sizes="40px" src={src} />
  }

  const Icon = activityIcon(row.filterKind)

  return (
    <div className="flex h-18 w-12 items-center justify-center rounded-sm bg-muted">
      <Icon className="size-4 text-muted-foreground" />
    </div>
  )
}

function activityIcon(kind: DashboardActivityFilterKind): LucideIcon {
  switch (kind) {
    case 'challenge':
      return Swords
    case 'milestone':
      return Trophy
    case 'rated':
      return Star
    case 'reviewed':
      return PenLine
    case 'watched':
      return Clapperboard
    default: {
      const exhaustive: never = kind

      return exhaustive
    }
  }
}
