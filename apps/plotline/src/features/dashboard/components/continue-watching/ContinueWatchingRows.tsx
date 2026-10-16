'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { SquareArrowOutUpRight } from 'lucide-react'
import { useRouter } from 'nextjs-toploader/app'

import type { ContinueWatchingItem } from '@/features/dashboard/services/continue-watching'

import { MediaPoster } from '@/components/media/MediaPoster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Progress, ProgressLabel } from '@/components/ui/progress'
import { ShowIf } from '@/components/utils/ShowIf'
import { dashboardTitleHref } from '@/features/dashboard/services/format-dashboard'
import { LogWatchPopover } from '@/features/library/log-watch/components/popover/LogWatchPopover'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

type ContinueWatchingHeroCardProps = {
  hero: { stalledLabel: null | string } & ContinueWatchingItem
  libraryItem: LibraryItem | undefined
}

export function ContinueWatchingHeroCard({ hero, libraryItem }: ContinueWatchingHeroCardProps) {
  const href = dashboardTitleHref(hero.mediaType, hero.tmdbId)
  const src = tmdbMediaUrl(hero.posterPath, 'w185')
  const router = useRouter()

  const handleViewTitle = () => {
    router.push(href)
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <Item className="p-0">
          <ItemMedia>
            <MediaPoster alt="" className="w-32 rounded-sm" ratio={2 / 3} sizes="128px" src={src} />
          </ItemMedia>
          <ItemContent>
            <ItemDescription className="text-xs uppercase tracking-wide">Up Next</ItemDescription>
            <div className="flex items-center gap-2">
              <ItemTitle className="text-xl">{hero.title}</ItemTitle>

              <ShowIf condition={hero.stalledLabel != null}>
                <Badge
                  className="border-amber-500/40 text-amber-700 dark:text-amber-300"
                  variant="outline"
                >
                  {hero.stalledLabel}
                </Badge>
              </ShowIf>
            </div>
            <ItemDescription className="text-base">{hero.contextLabel}</ItemDescription>

            <ShowIf condition={hero.percent != null}>
              <Progress
                className="flex-col-reverse gap-1 mb-1 max-w-2xl"
                trackClassName="h-2"
                value={hero.percent}
              >
                <ProgressLabel className="text-xs font-normal text-muted-foreground">
                  {hero.progressLabel}
                </ProgressLabel>
              </Progress>
            </ShowIf>

            <HeroActions
              libraryItem={libraryItem}
              logLabel={hero.logLabel}
              onViewTitle={handleViewTitle}
            />
          </ItemContent>
        </Item>
      </CardContent>
    </Card>
  )
}

function HeroActions({
  libraryItem,
  logLabel,
  onViewTitle,
}: {
  libraryItem: LibraryItem | undefined
  logLabel: string
  onViewTitle: () => void
}) {
  if (!libraryItem) return null

  return (
    <div className="flex items-center gap-2">
      <LogWatchPopover libraryItem={libraryItem} triggerLabel={logLabel} />
      <Button onClick={onViewTitle} variant="outline">
        <SquareArrowOutUpRight data-icon="inline-start" />
        View Title
      </Button>
    </div>
  )
}
