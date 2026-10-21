'use client'

import type { LibraryItem } from '@plotline/payload-types'

import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
import { Item, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item'
import { type ContinueWatchingItem } from '@/features/dashboard/services/continue-watching'
import { dashboardTitleHref } from '@/features/dashboard/services/format-dashboard'
import { useHover } from '@/hooks/use-hover'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

import { UpNextPosterOverlay } from './UpNextPosterOverlay'

type DashboardUpNextPosterProps = {
  item: ContinueWatchingItem
  libraryItem: LibraryItem | undefined
}

export function DashboardUpNextPoster({ item, libraryItem }: DashboardUpNextPosterProps) {
  const [ref, isHovered] = useHover<HTMLDivElement>()
  const href = dashboardTitleHref(item.mediaType, item.tmdbId)

  return (
    <div className="group/up-next w-36 shrink-0" ref={ref}>
      <Item className="relative p-0">
        <Link
          className="block w-full rounded-lg outline-none hover:bg-transparent focus-visible:ring-3 focus-visible:ring-ring/50"
          href={href}
        >
          <div className="flex flex-col gap-2">
            <ItemHeader className="basis-auto">
              <MediaPoster
                alt=""
                className="w-full rounded-md"
                ratio={2 / 3}
                sizes="144px"
                src={tmdbMediaUrl(item.posterPath, 'w185')}
              />
            </ItemHeader>
            <ItemContent>
              <ItemTitle>{item.title}</ItemTitle>
            </ItemContent>
          </div>
        </Link>
        <UpNextPosterOverlay isHovered={isHovered} item={item} libraryItem={libraryItem} />
      </Item>
    </div>
  )
}
