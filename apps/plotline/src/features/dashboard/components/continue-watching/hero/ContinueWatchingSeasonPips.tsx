'use client'

import type { Media } from '@plotline/payload-types'

import { useContinueWatchingSeasonPips } from '@/features/dashboard/hooks/use-continue-watching-season-pips'
import { SeasonPipState } from '@/features/dashboard/services/continue-watching'
import { cn } from '@/lib/utils'

const SEASON_PIP_CLASS_NAME: Record<SeasonPipState, string> = {
  unwatched: 'bg-muted',
  'up-next': 'bg-primary/70 ring-2 ring-primary',
  watched: 'bg-primary',
}

type ContinueWatchingSeasonPipsProps = {
  episode: number
  libraryItemId: number
  season: number
  seasonEpisodeCounts: NonNullable<Media['tvMeta']>['seasonEpisodeCounts']
}

export function ContinueWatchingSeasonPips({
  episode,
  libraryItemId,
  season,
  seasonEpisodeCounts,
}: ContinueWatchingSeasonPipsProps) {
  const { progress, watched } = useContinueWatchingSeasonPips({
    episode,
    libraryItemId,
    season,
    seasonEpisodeCounts,
  })

  if (progress == null || !watched.isSuccess) {
    return null
  }

  return (
    <div className="flex max-w-xl flex-col gap-2">
      <p className="text-xs text-muted-foreground">{progress.label}</p>
      <div aria-hidden className="flex flex-wrap gap-1">
        {progress.pips.map((pip) => (
          <span
            className={cn('size-2 shrink-0 rounded-full', SEASON_PIP_CLASS_NAME[pip.state])}
            key={pip.episode}
          />
        ))}
      </div>
    </div>
  )
}
