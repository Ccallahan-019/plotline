'use client'

import type { LibraryItem, Media } from '@plotline/payload-types'

import type { ContinueWatchingHero } from '@/features/dashboard/services/continue-watching'

import { MediaBackdropCard } from '@/components/media/MediaBackdropCard'
import { CardContent } from '@/components/ui/card'
import { continueWatchingHeroEyebrow } from '@/features/dashboard/services/continue-watching'
import { dashboardTitleHref } from '@/features/dashboard/services/format-dashboard'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'
import { titleBackdropUrl } from '@/features/media-detail/services/media-image-url'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

import { ContinueWatchingHeroActions } from './ContinueWatchingHeroActions'
import { ContinueWatchingHeroDetail } from './ContinueWatchingHeroDetail'
import { ContinueWatchingHeroPoster } from './ContinueWatchingHeroPoster'
import { ContinueWatchingHeroProgress } from './ContinueWatchingHeroProgress'
import { ContinueWatchingSeasonPips } from './ContinueWatchingSeasonPips'

type ContinueWatchingHeroCardProps = {
  hero: ContinueWatchingHero
  libraryItem: LibraryItem | undefined
}

export function ContinueWatchingHeroCard({ hero, libraryItem }: ContinueWatchingHeroCardProps) {
  const href = dashboardTitleHref(hero.mediaType, hero.tmdbId)
  const media = libraryItem ? getMediaFromLibraryItem(libraryItem) : null
  const backdropUrl = titleBackdropUrl(media?.backdropPath)
  const src = tmdbMediaUrl(hero.posterPath, 'w185')
  const eyebrow = continueWatchingHeroEyebrow(hero.mediaType)
  const { id, logLabel, percent, progressLabel, stalledLabel, title, upNextEpisode, upNextSeason } =
    hero

  return (
    <MediaBackdropCard backdropUrl={backdropUrl} imageSizes="640px">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ContinueWatchingHeroPoster src={src} stalledLabel={stalledLabel} />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {eyebrow}
              </p>
              <p className="font-heading text-xl font-medium">{title}</p>
              <ContinueWatchingHeroDetail hero={hero} />
            </div>
            <SeasonPips
              episode={upNextEpisode}
              libraryItemId={id}
              season={upNextSeason}
              seasonEpisodeCounts={media?.tvMeta?.seasonEpisodeCounts}
            />
            <ContinueWatchingHeroProgress percent={percent} progressLabel={progressLabel} />
            <ContinueWatchingHeroActions
              href={href}
              libraryItem={libraryItem}
              logLabel={logLabel}
            />
          </div>
        </div>
      </CardContent>
    </MediaBackdropCard>
  )
}

function SeasonPips({
  episode,
  libraryItemId,
  season,
  seasonEpisodeCounts,
}: {
  episode: null | number
  libraryItemId: number
  season: null | number
  seasonEpisodeCounts: NonNullable<Media['tvMeta']>['seasonEpisodeCounts']
}) {
  if (episode == null || season == null) return null

  return (
    <ContinueWatchingSeasonPips
      episode={episode}
      libraryItemId={libraryItemId}
      season={season}
      seasonEpisodeCounts={seasonEpisodeCounts}
    />
  )
}
