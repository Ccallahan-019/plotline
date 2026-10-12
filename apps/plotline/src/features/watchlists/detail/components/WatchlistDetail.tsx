'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { PencilLine } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { TitleBreadcrumbParentProvider } from '@/features/navigation/breadcrumbs/components/TitleBreadcrumbParentProvider'
import { WatchlistTitleSearchDialog } from '@/features/search/components/title-search/WatchlistTitleSearchDialog'
import { cn } from '@/lib/utils'

import { WatchlistVisibilityBadge } from '../../components/WatchlistVisibilityBadge'
import { useWatchlistDetail } from '../hooks/use-watchlist-detail'
import { ChallengeProgressCard } from './ChallengeProgressCard'
import { WatchlistMembershipSection } from './WatchlistMembershipSection'
import { WatchlistMembershipSortSelector } from './WatchlistMembershipSortSelector'
import { WatchlistMembershipViewToggle } from './WatchlistMembershipViewToggle'

export type WatchlistDetailSurface = 'challenge' | 'watchlist'

type WatchlistDetailProps = {
  initialMemberships: null | WatchlistMembership[]
  initialMembershipsError?: null | string
  initialWatchlist: Watchlist
  slug: string
  surface: WatchlistDetailSurface
}

export function WatchlistDetail({
  initialMemberships,
  initialMembershipsError = null,
  initialWatchlist,
  slug,
  surface,
}: WatchlistDetailProps) {
  const {
    description,
    errorMessage,
    isChallenge,
    isPending,
    membershipLayout,
    memberships,
    onListKeys,
    parentHref,
    setSort,
    setTitleSearchOpen,
    sort,
    titleCountLabel,
    titleSearchOpen,
    watchlist,
  } = useWatchlistDetail({
    initialMemberships,
    initialMembershipsError,
    initialWatchlist,
    slug,
    surface,
  })

  return (
    <TitleBreadcrumbParentProvider href={parentHref} label={watchlist.name}>
      <div className="flex flex-col gap-4">
        <Item className="px-0 rounded-none border-b-border">
          <ItemContent>
            <div className="flex flex-wrap items-center gap-2">
              <ItemTitle className="text-2xl">{watchlist.name}</ItemTitle>
              <ShowIf condition={isChallenge}>
                <Badge variant="secondary">Challenge</Badge>
              </ShowIf>
              <WatchlistVisibilityBadge visibility={watchlist.visibility} />
            </div>
            <ShowIf condition={!!description}>
              <ItemDescription className="max-w-2xl text-muted-foreground">
                {description}
              </ItemDescription>
            </ShowIf>
            <ShowIf condition={!isChallenge && titleCountLabel != null}>
              <ItemDescription>{titleCountLabel}</ItemDescription>
            </ShowIf>
          </ItemContent>

          <ItemActions>
            <Link
              className={cn(buttonVariants({ variant: 'outline' }))}
              href={`/dashboard/watchlists/${encodeURIComponent(slug)}/edit`}
            >
              <PencilLine data-icon="inline-start" />
              Edit
            </Link>
          </ItemActions>
        </Item>

        <ShowIf condition={isChallenge}>
          <ChallengeProgressCard watchlist={watchlist} />
        </ShowIf>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="hidden md:contents">
            <WatchlistMembershipViewToggle
              layout={membershipLayout.active}
              onLayoutChange={membershipLayout.setLayout}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <WatchlistTitleSearchDialog
              onListKeys={onListKeys}
              onOpenChange={setTitleSearchOpen}
              open={titleSearchOpen}
              slug={slug}
            />
            <WatchlistMembershipSortSelector onSortChange={setSort} sort={sort} />
          </div>
        </div>

        <section aria-label="Titles">
          <WatchlistMembershipSection
            challenge={watchlist.challenge ?? null}
            errorMessage={errorMessage}
            isPending={isPending}
            layout={membershipLayout.locked}
            memberships={memberships}
            onAddTitle={() => setTitleSearchOpen(true)}
            showGoalCounts={isChallenge}
            slug={slug}
            sort={sort}
          />
        </section>
      </div>
    </TitleBreadcrumbParentProvider>
  )
}
