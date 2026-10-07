'use client'

import type { WatchlistMembership } from '@plotline/payload-types'

import { DragDropProvider } from '@dnd-kit/react'

import { ItemGroup } from '@/components/ui/item'

import { useWatchlistMembershipList } from '../hooks/use-watchlist-membership-list'
import { WatchlistLogWatchDialog } from './WatchlistLogWatchDialog'
import { WatchlistMembershipGrid } from './WatchlistMembershipGrid'
import { WatchlistMembershipRow } from './WatchlistMembershipRow'
import { WatchlistMembershipsEmpty } from './WatchlistMembershipsEmpty'

type WatchlistMembershipListProps = {
  memberships: WatchlistMembership[]
  slug: string
}

export function WatchlistMembershipList({ memberships, slug }: WatchlistMembershipListProps) {
  const { handleDragEnd, handleRemove, logTarget, reorder, rows, setLogTarget } =
    useWatchlistMembershipList({
      memberships,
      slug,
    })

  if (rows.length === 0) {
    return <WatchlistMembershipsEmpty />
  }

  return (
    <>
      <div className="md:hidden">
        <WatchlistMembershipGrid
          memberships={rows}
          onLogWatch={setLogTarget}
          onRemove={handleRemove}
          slug={slug}
        />
      </div>

      <div className="hidden md:block">
        <DragDropProvider onDragEnd={handleDragEnd}>
          <ItemGroup className="gap-1.5">
            {rows.map((membership, index) => (
              <WatchlistMembershipRow
                index={index}
                key={membership.id}
                membership={membership}
                onLogWatch={setLogTarget}
                onRemove={handleRemove}
                reorderDisabled={reorder.isPending}
                slug={slug}
              />
            ))}
          </ItemGroup>
        </DragDropProvider>
      </div>

      <WatchlistLogWatchDialog
        key={logTarget?.id}
        membership={logTarget}
        onOpenChange={(open) => {
          if (!open) {
            setLogTarget(null)
          }
        }}
        open
      />
    </>
  )
}
