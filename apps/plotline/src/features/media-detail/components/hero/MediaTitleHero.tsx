'use client'

import type { MediaStatus } from '@plotline/shared/constants'

import { ShowIf } from '@/components/utils/ShowIf'

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
  const posterUrl = mediaImageUrl(posterPath, 'w500')
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
    <section className="relative overflow-hidden">
      <MediaTitleHeroBackdrop backdropUrl={backdropUrl} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />

      <div className="relative z-10 flex flex-col gap-5 px-4 pt-4 pb-8 text-foreground md:px-8 md:pt-8">
        <MediaTitleBackButton />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[14rem_minmax(0,1fr)] md:items-start md:gap-x-10">
          <div className="flex items-center gap-5 md:contents">
            <MediaTitlePoster homepage={homepage} posterUrl={posterUrl} title={title} />

            <div className="flex min-w-0 flex-1 flex-col gap-2 self-end md:col-start-2 md:row-start-1">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {title}
              </h1>
              <ShowIf condition={metaLine.length > 0}>
                <p className="text-sm text-muted-foreground">{metaLine}</p>
              </ShowIf>
            </div>
          </div>

          <div className="flex flex-col gap-4 self-start md:col-start-2 md:row-start-2">
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
