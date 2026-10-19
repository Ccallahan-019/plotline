'use client'

import { ShowIf } from '@/components/utils/ShowIf'
import { useEpisodeTitle } from '@/features/dashboard/hooks/use-episode-title'
import {
  continueWatchingEpisodeLookup,
  ContinueWatchingHero,
  continueWatchingHeroDetail,
} from '@/features/dashboard/services/continue-watching'

type ContinueWatchingHeroDetailProps = {
  hero: ContinueWatchingHero
}

export function ContinueWatchingHeroDetail({ hero }: ContinueWatchingHeroDetailProps) {
  const detail = continueWatchingHeroDetail(hero, new Date())
  const episodeTitle = useEpisodeTitle(continueWatchingEpisodeLookup(hero))

  if (
    detail.episodeLabel == null &&
    detail.lastWatchedLabel == null &&
    detail.statusLabel == null
  ) {
    return null
  }

  return (
    <div className="flex flex-col gap-0.5">
      <ShowIf condition={detail.episodeLabel != null}>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <p className="text-base">{detail.episodeLabel}</p>
          <ShowIf condition={episodeTitle != null}>
            <p className="text-base text-muted-foreground">{episodeTitle}</p>
          </ShowIf>
        </div>
      </ShowIf>
      <ShowIf condition={detail.statusLabel != null}>
        <p className="text-sm text-muted-foreground">{detail.statusLabel}</p>
      </ShowIf>
      <ShowIf condition={detail.lastWatchedLabel != null}>
        <p className="text-sm text-muted-foreground">{detail.lastWatchedLabel}</p>
      </ShowIf>
    </div>
  )
}
