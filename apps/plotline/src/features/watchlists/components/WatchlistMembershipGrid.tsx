'use client'

import type { WatchlistMembership } from '@plotline/payload-types'

import { MediaGrid } from '@/features/media-grid/grid/components/MediaGrid'

import { WatchlistMembershipGridItem } from './WatchlistMembershipGridItem'

type WatchlistMembershipGridProps = {
  memberships: WatchlistMembership[]
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  slug: string
}

export function WatchlistMembershipGrid({
  memberships,
  onLogWatch,
  onRemove,
  slug,
}: WatchlistMembershipGridProps) {
  return (
    <MediaGrid
      items={memberships}
      renderItem={(membership) => (
        <WatchlistMembershipGridItem
          key={membership.id}
          membership={membership}
          onLogWatch={onLogWatch}
          onRemove={onRemove}
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
