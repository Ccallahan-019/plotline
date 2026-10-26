'use client'

import { MediaPoster } from '@/components/media/MediaPoster'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import type { MediaTitlePageData } from '../../types'

import { formatMediaTitleMetaLine, getTvWatchProgress } from '../../services/format-media-title'
import { mediaImageUrl, titleBackdropUrl } from '../../services/media-image-url'
import { MediaTitleActions } from './MediaTitleActions'
import { MediaTitleBackButton } from './MediaTitleBackButton'
import { MediaTitleHeroBackdrop } from './MediaTitleHeroBackdrop'
import { MediaTitleTvProgress } from './MediaTitleTvProgress'
import { MediaTitleYourRating } from './MediaTitleYourRating'

type MediaTitleHeroProps = {
  data: MediaTitlePageData
}

export function MediaTitleHero({ data }: MediaTitleHeroProps) {
  const backdropUrl = titleBackdropUrl(data.media.backdropPath)
  const posterUrl = mediaImageUrl(data.media.posterPath, 'w342')
  const metaLine = formatMediaTitleMetaLine({
    certification: data.certification,
    media: data.media,
  })
  const progress =
    data.media.mediaType === 'tv'
      ? getTvWatchProgress({
          episodeCount: data.media.tvMeta?.episodeCount,
          episodesWatched: data.libraryItem?.progress.episodesWatched,
          lastEpisode: data.libraryItem?.progress.lastEpisode,
          lastSeason: data.libraryItem?.progress.lastSeason,
          media: data.media,
          seasonsCompleted: data.libraryItem?.progress.seasonsCompleted,
          status: data.libraryItem?.status,
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
            <MediaPoster
              className="w-24 shrink-0 rounded-md shadow-lg md:col-start-1 md:row-span-2 md:w-40"
              fallbackIconClassName="size-6"
              ratio={2 / 3}
              sizes="160px"
              src={posterUrl}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-2 md:col-start-2 md:row-start-1">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {data.media.title}
              </h1>
              <ShowIf condition={metaLine.length > 0}>
                <p className="text-sm text-muted-foreground">{metaLine}</p>
              </ShowIf>
            </div>
          </div>

          <div className="flex flex-col gap-3 self-start md:col-start-2 md:row-start-2">
            <MediaTitleActions data={data} />
            <MediaTitleYourRating className="md:hidden" />
            <MediaTitleTvProgress progress={progress} />
          </div>
        </div>
      </div>
    </section>
  )
}
