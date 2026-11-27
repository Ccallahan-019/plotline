'use client'

import type { MediaStatus } from '@plotline/shared/constants'

import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import type { MediaTitlePageData } from '../../types'

import { formatMediaTitleMetaLine, getTvWatchProgress } from '../../services/format-media-title'
import { mediaImageUrl, titleBackdropUrl } from '../../services/media-image-url'
import { MediaTitleActions } from './MediaTitleActions'
import { MediaTitleBackButton } from './MediaTitleBackButton'
import { MediaTitleHeroBackdrop } from './MediaTitleHeroBackdrop'
import { MediaTitlePoster } from './MediaTitlePoster'
import { MediaTitleTvProgress } from './MediaTitleTvProgress'
import { MediaTitleYourRating } from './MediaTitleYourRating'

type MediaTitleHeroProps = {
  data: MediaTitlePageData
  isPending: boolean
  logWatchSubmitting: boolean
  onMarkWatched: () => void
  onStatusChange: (status: MediaStatus) => void
}

export function MediaTitleHero({
  data,
  isPending,
  logWatchSubmitting,
  onMarkWatched,
  onStatusChange,
}: MediaTitleHeroProps) {
  const { certification, homepage, libraryItem, media } = data
  const { backdropPath, mediaType, posterPath, title, tvMeta } = media
  const progressFields = libraryItem?.progress
  const backdropUrl = titleBackdropUrl(backdropPath)
  const posterUrl = mediaImageUrl(posterPath, 'w342')
  const metaLine = formatMediaTitleMetaLine({
    certification,
    media,
  })
  const progress =
    mediaType === 'tv'
      ? getTvWatchProgress({
          episodeCount: tvMeta?.episodeCount,
          episodesWatched: progressFields?.episodesWatched,
          lastEpisode: progressFields?.lastEpisode,
          lastSeason: progressFields?.lastSeason,
          media,
          seasonsCompleted: progressFields?.seasonsCompleted,
          status: libraryItem?.status,
        })
      : null

  return (
    <section>
      <div className="relative h-72 overflow-hidden">
        <MediaTitleHeroBackdrop backdropUrl={backdropUrl} />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="hidden 2xl:block">
          <div className="absolute w-1/7 right-0 top-0 h-full bg-linear-to-l from-background via-background/60 to-transparent" />
          <div className="absolute w-1/7 left-0 top-0 h-full bg-linear-to-r from-background via-background/60 to-transparent" />
        </div>
      </div>

      <div
        className={cn(
          'relative z-10 flex flex-col gap-4 px-4 py-4 md:px-8',
          backdropUrl && '-mt-36 md:-mt-32',
        )}
      >
        <MediaTitleBackButton />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[10rem_minmax(0,1fr)] md:items-end">
          <div className="flex items-end gap-4 md:contents">
            <MediaTitlePoster homepage={homepage} posterUrl={posterUrl} title={title} />

            <div className="flex min-w-0 flex-1 flex-col gap-2 md:col-start-2 md:row-start-1">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {title}
              </h1>
              <ShowIf condition={metaLine.length > 0}>
                <p className="text-sm text-muted-foreground">{metaLine}</p>
              </ShowIf>
            </div>
          </div>

          <div className="flex flex-col gap-3 self-start md:col-start-2 md:row-start-2">
            <MediaTitleActions
              data={data}
              isPending={isPending}
              logWatchSubmitting={logWatchSubmitting}
              onMarkWatched={onMarkWatched}
              onStatusChange={onStatusChange}
            />
            <MediaTitleYourRating className="md:hidden" />
            <MediaTitleTvProgress progress={progress} />
          </div>
        </div>
      </div>
    </section>
  )
}
