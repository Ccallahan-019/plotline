'use client'

import { LibraryItem } from '@plotline/payload-types'
import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { useEpisodeTitle } from '@/features/dashboard/hooks/use-episode-title'
import {
  continueWatchingEpisodeLookup,
  ContinueWatchingItem,
} from '@/features/dashboard/services/continue-watching'
import { dashboardTitleHref } from '@/features/dashboard/services/format-dashboard'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

import { ContinueWatchingItemRowActions } from './ContinueWatchingItemRowActions'
import { ContinueWatchingRowMeter } from './ContinueWatchingRowMeter'

type ContinueWatchingItemRowProps = {
  item: ContinueWatchingItem
  libraryItem: LibraryItem | undefined
}

export function ContinueWatchingItemRow({ item, libraryItem }: ContinueWatchingItemRowProps) {
  const href = dashboardTitleHref(item.mediaType, item.tmdbId)
  const src = tmdbMediaUrl(item.posterPath, 'w185')
  const episodeTitle = useEpisodeTitle(continueWatchingEpisodeLookup(item))

  return (
    <Item className="relative min-w-0 flex-wrap items-center hover:bg-muted/60 @min-[48rem]/cw:col-span-5 @min-[48rem]/cw:grid @min-[48rem]/cw:grid-cols-subgrid">
      <ItemMedia className="order-1 @min-[48rem]/cw:order-0">
        <MediaPoster alt="" className="w-12 rounded-sm" ratio={2 / 3} sizes="48px" src={src} />
      </ItemMedia>
      <ItemContent className="order-2 min-w-24 @min-[48rem]/cw:order-0 @min-[48rem]/cw:min-w-0">
        <Link
          className="block max-w-full rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-ring/50"
          href={href}
        >
          <ItemTitle className="w-full">{item.title}</ItemTitle>
        </Link>
        <div className="flex min-w-0 flex-col">
          <ItemDescription className="line-clamp-1">{item.contextLabel}</ItemDescription>
          <ShowIf condition={episodeTitle != null}>
            <ItemDescription className="line-clamp-1">{episodeTitle}</ItemDescription>
          </ShowIf>
        </div>
      </ItemContent>
      <ContinueWatchingRowMeter item={item} />
      <ContinueWatchingItemRowActions
        href={href}
        libraryItem={libraryItem}
        logLabel={item.logLabel}
        title={item.title}
      />
    </Item>
  )
}
