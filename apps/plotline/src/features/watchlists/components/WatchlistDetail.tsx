'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { useMemo, useState } from 'react'

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { ShowIf } from '@/components/utils/ShowIf'
import { WatchlistTitleSearchDialog } from '@/features/search/components/title-search/WatchlistTitleSearchDialog'
import { getErrorMessage } from '@/utils/get-error-message'

import { usePendingWatchlistRemoveKeys } from '../hooks/use-pending-watchlist-remove-keys'
import { useWatchlist } from '../hooks/use-watchlist'
import { useWatchlistMemberships } from '../hooks/use-watchlist-memberships'
import { buildWatchlistOnListKeys } from '../services/build-watchlist-on-list-keys'
import { formatWatchlistTitleCount } from '../services/format-watchlist-title-count'
import { omitPendingWatchlistRemoves } from '../services/pending-watchlist-remove'
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
  const [titleSearchOpen, setTitleSearchOpen] = useState(false)
  const watchlist = watchlistQuery.data ?? initialWatchlist
  const memberships = membershipsQuery.data
  const pendingRemoveKeys = usePendingWatchlistRemoveKeys(slug)
  // The cache drops a row before its DELETE finishes. Those keys stay on-list
  // so search cannot re-add the title while the membership still exists.
  const onListKeys = useMemo(
    () => buildWatchlistOnListKeys(memberships ?? [], pendingRemoveKeys),
    [memberships, pendingRemoveKeys],
  )
  // The same in-flight deletes stay out of the count. A refetch can still
  // include them until the DELETE settles.
  const listedMemberships = useMemo(
    () =>
      memberships == null
        ? null
        : omitPendingWatchlistRemoves(memberships, pendingRemoveKeys),
    [memberships, pendingRemoveKeys],
  )
  const errorMessage =
    getErrorMessage(membershipsQuery.error) ?? (memberships ? null : initialMembershipsError)
  const description = watchlist.description?.trim()
  const titleCountLabel =
    listedMemberships == null ? null : formatWatchlistTitleCount(listedMemberships.length)

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

      <div className="flex flex-wrap gap-2 justify-between">
        <WatchlistTitleSearchDialog
          onListKeys={onListKeys}
          onOpenChange={setTitleSearchOpen}
          open={titleSearchOpen}
          slug={slug}
        />
        <WatchlistMembershipSortSelector onSortChange={setSort} sort={sort} />
      </div>

      <section aria-label="Titles">
        <MembershipSection
          errorMessage={errorMessage}
          isPending={membershipsQuery.isPending}
          memberships={memberships}
          onAddTitle={() => setTitleSearchOpen(true)}
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
  onAddTitle,
  slug,
  sort,
}: {
  errorMessage: null | string
  isPending: boolean
  memberships: undefined | WatchlistMembership[]
  onAddTitle: () => void
  slug: string
  sort: WatchlistMembershipSort
}) {
  if (memberships) {
    return (
      <WatchlistMembershipList
        memberships={memberships}
        onAddTitle={onAddTitle}
        slug={slug}
        sort={sort}
      />
    )
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

  return <WatchlistMembershipsEmpty onAddTitle={onAddTitle} />
}
