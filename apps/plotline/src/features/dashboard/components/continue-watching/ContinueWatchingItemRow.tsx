import { LibraryItem } from '@plotline/payload-types'
import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ProgressLabel } from '@/components/ui/progress'
import { Progress } from '@/components/ui/progress'
import { LogWatchPopover } from '@/features/library/log-watch/components/popover/LogWatchPopover'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

import { ContinueWatchingItem } from '../../services/continue-watching'
import { dashboardTitleHref } from '../../services/format-dashboard'

type ContinueWatchingItemRowProps = {
  item: ContinueWatchingItem
  libraryItem: LibraryItem | undefined
}

export function ContinueWatchingItemRow({ item, libraryItem }: ContinueWatchingItemRowProps) {
  const href = dashboardTitleHref(item.mediaType, item.tmdbId)
  const src = tmdbMediaUrl(item.posterPath, 'w185')

  return (
    <Item className="relative hover:bg-muted/60">
      <ItemMedia>
        <MediaPoster alt="" className="w-12 rounded-sm" ratio={2 / 3} sizes="40px" src={src} />
      </ItemMedia>
      <ItemContent>
        <Link
          className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-ring/50"
          href={href}
        >
          <ItemTitle>{item.title}</ItemTitle>
        </Link>
        <ItemDescription>{item.contextLabel}</ItemDescription>
        <ContinueWatchingProgress percent={item.percent} progressLabel={item.progressLabel} />
      </ItemContent>

      <ItemRowActions libraryItem={libraryItem} logLabel={item.logLabel} />
    </Item>
  )
}

function ContinueWatchingProgress({
  percent,
  progressLabel,
}: {
  percent: null | number
  progressLabel: string
}) {
  if (percent == null) {
    return (
      <ItemDescription className="text-xs font-normal text-muted-foreground">
        {progressLabel}
      </ItemDescription>
    )
  }

  return (
    <Progress className="flex-col-reverse gap-1 pr-2" trackClassName="h-1.5" value={percent}>
      <ProgressLabel className="text-xs font-normal text-muted-foreground">
        {progressLabel}
      </ProgressLabel>
    </Progress>
  )
}

function ItemRowActions({
  libraryItem,
  logLabel,
}: {
  libraryItem: LibraryItem | undefined
  logLabel: string
}) {
  if (!libraryItem) return null

  return (
    <ItemActions className="relative z-10 w-full md:w-auto">
      <LogWatchPopover libraryItem={libraryItem} triggerLabel={logLabel} />
    </ItemActions>
  )
}
