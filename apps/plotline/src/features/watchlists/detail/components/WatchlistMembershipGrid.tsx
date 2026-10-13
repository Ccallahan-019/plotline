'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { MediaGrid } from '@/features/media-grid/grid/components/MediaGrid'

import { WatchlistMembershipGridItem } from './WatchlistMembershipGridItem'

type WatchlistMembershipGridProps = {
  challenge: null | Watchlist['challenge']
  memberships: WatchlistMembership[]
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  showGoalCounts: boolean
  slug: string
}

export function WatchlistMembershipGrid({
  challenge,
  memberships,
  onLogWatch,
  onRemove,
  showGoalCounts,
  slug,
}: WatchlistMembershipGridProps) {
  return (
    <MediaGrid
      items={memberships}
      renderItem={(membership) => (
        <WatchlistMembershipGridItem
          challenge={challenge}
          key={membership.id}
          membership={membership}
          onLogWatch={onLogWatch}
          onRemove={onRemove}
          showGoalCounts={showGoalCounts}
          slug={slug}
        />
      )}
      state="success"
      states={{
        emptyState: null,
        errorState: null,
      }}
    />
  )
}
