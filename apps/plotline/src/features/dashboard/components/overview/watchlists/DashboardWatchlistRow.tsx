import Link from 'next/link'

import { MediaBackdropCard } from '@/components/media/MediaBackdropCard'
import { CardContent } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { titleBackdropUrl } from '@/features/media-detail/services/media-image-url'
import { WatchlistCard } from '@/features/watchlists/cards/types'
import { WatchlistVisibilityBadge } from '@/features/watchlists/components/WatchlistVisibilityBadge'

import { DashboardWatchlistPosters } from './DashboardWatchlistPosters'

type DashboardWatchlistRowProps = {
  card: WatchlistCard
}

export function DashboardWatchlistRow({ card }: DashboardWatchlistRowProps) {
  return (
    <Link
      className="block rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={`/dashboard/watchlists/${card.slug}`}
    >
      <MediaBackdropCard
        backdropUrl={titleBackdropUrl(card.coverPath)}
        imageSizes="280px"
        size="sm"
        wrapperClassName="lg:max-xl:w-1/3"
      >
        <CardContent>
          <Item className="p-0">
            <ItemMedia>
              <DashboardWatchlistPosters previews={card.previews} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-2">{card.name}</ItemTitle>
              <ShowIf condition={card.description != null}>
                <ItemDescription>{card.description}</ItemDescription>
              </ShowIf>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground text-nowrap">
                  {card.titleCount} Titles
                </span>
                <WatchlistVisibilityBadge visibility={card.visibility} />
              </div>
            </ItemContent>
          </Item>
        </CardContent>
      </MediaBackdropCard>
    </Link>
  )
}
