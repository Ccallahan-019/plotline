import { ShowIf } from '@/components/utils/ShowIf'
import {
  ContinueWatchingHero,
  continueWatchingHeroDetail,
} from '@/features/dashboard/services/continue-watching'

type ContinueWatchingHeroDetailProps = {
  hero: ContinueWatchingHero
}

export function ContinueWatchingHeroDetail({ hero }: ContinueWatchingHeroDetailProps) {
  const detail = continueWatchingHeroDetail(hero, new Date())

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
        <p className="text-base">{detail.episodeLabel}</p>
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
