'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { useState } from 'react'

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { ShowIf } from '@/components/utils/ShowIf'
import { getErrorMessage } from '@/utils/get-error-message'

import { useWatchlist } from '../hooks/use-watchlist'
import { useWatchlistMemberships } from '../hooks/use-watchlist-memberships'
import { formatWatchlistTitleCount } from '../services/format-watchlist-title-count'
import { DEFAULT_WATCHLIST_MEMBERSHIP_SORT, type WatchlistMembershipSort } from '../types'
import { EditWatchlistDialog } from './EditWatchlistDialog'
import { WatchlistMembershipList } from './WatchlistMembershipList'
import { WatchlistMembershipsEmpty } from './WatchlistMembershipsEmpty'
import { WatchlistMembershipSortSelector } from './WatchlistMembershipSortSelector'
import { WatchlistVisibilityBadge } from './WatchlistVisibilityBadge'

const ERROR_EMPTY_PROPS = {
  description: 'Ensure the payload app is running and service credentials are configured.',
  title: 'Could not load titles',
}

type WatchlistDetailProps = {
  initialMemberships: null | WatchlistMembership[]
  initialMembershipsError?: null | string
  initialWatchlist: Watchlist
  slug: string
}

export function WatchlistDetail({
  initialMemberships,
  initialMembershipsError = null,
  initialWatchlist,
  slug,
}: WatchlistDetailProps) {
  const watchlistQuery = useWatchlist(slug, { initialData: initialWatchlist })
  const membershipsQuery = useWatchlistMemberships(slug, {
    initialData: initialMemberships ?? undefined,
  })
  const [sort, setSort] = useState<WatchlistMembershipSort>(DEFAULT_WATCHLIST_MEMBERSHIP_SORT)
  const watchlist = watchlistQuery.data ?? initialWatchlist
  const memberships = membershipsQuery.data
  const errorMessage =
    getErrorMessage(membershipsQuery.error) ?? (memberships ? null : initialMembershipsError)
  const description = watchlist.description?.trim()
  const titleCountLabel = memberships == null ? null : formatWatchlistTitleCount(memberships.length)

  return (
    <div className="flex flex-col gap-4">
      <Item className="px-0 rounded-none border-b-border">
        <ItemContent>
          <div className="flex items-center gap-2">
            <ItemTitle className="text-2xl">{watchlist.name}</ItemTitle>
            <WatchlistVisibilityBadge visibility={watchlist.visibility} />
          </div>
          <ShowIf condition={!!description}>
            <ItemDescription className="max-w-2xl text-muted-foreground">
              {description}
            </ItemDescription>
          </ShowIf>
          <ShowIf condition={titleCountLabel != null}>
            <ItemDescription>{titleCountLabel}</ItemDescription>
          </ShowIf>
        </ItemContent>

        <ItemActions>
          <EditWatchlistDialog slug={slug} watchlist={watchlist} />
        </ItemActions>
      </Item>

      <div className="flex justify-end">
        <WatchlistMembershipSortSelector onSortChange={setSort} sort={sort} />
      </div>

      <section aria-label="Titles">
        <MembershipSection
          errorMessage={errorMessage}
          isPending={membershipsQuery.isPending}
          memberships={memberships}
          slug={slug}
          sort={sort}
        />
      </section>
    </div>
  )
}

function MembershipSection({
  errorMessage,
  isPending,
  memberships,
  slug,
  sort,
}: {
  errorMessage: null | string
  isPending: boolean
  memberships: undefined | WatchlistMembership[]
  slug: string
  sort: WatchlistMembershipSort
}) {
  if (memberships) {
    return <WatchlistMembershipList memberships={memberships} slug={slug} sort={sort} />
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (errorMessage) {
    return <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />
  }

  return <WatchlistMembershipsEmpty />
}
