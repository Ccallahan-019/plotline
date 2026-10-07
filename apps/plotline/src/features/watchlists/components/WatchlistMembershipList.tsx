'use client'

import type { WatchlistMembership } from '@plotline/payload-types'

import { DragDropProvider, DragEndEvent } from '@dnd-kit/react'
import { useMemo } from 'react'

import { ItemGroup } from '@/components/ui/item'

import type { WatchlistMembershipSort } from '../types'

import { useWatchlistMembershipList } from '../hooks/use-watchlist-membership-list'
import { sortWatchlistMemberships } from '../services/sort-watchlist-memberships'
import { WatchlistLogWatchDialog } from './WatchlistLogWatchDialog'
import { WatchlistMembershipGrid } from './WatchlistMembershipGrid'
import { WatchlistMembershipRow } from './WatchlistMembershipRow'
import { WatchlistMembershipsEmpty } from './WatchlistMembershipsEmpty'

type WatchlistMembershipListProps = {
  memberships: WatchlistMembership[]
  slug: string
  sort: WatchlistMembershipSort
}

export function WatchlistMembershipList({ memberships, slug, sort }: WatchlistMembershipListProps) {
  const { handleDragEnd, handleRemove, logTarget, reorder, rows, setLogTarget } =
    useWatchlistMembershipList({
      memberships,
      slug,
    })
  // Manual order is the hook's row order, including an in-progress drag. Re-sorting
  // that array would make drag indexes point at the wrong rows.
  const rowsToRender = useMemo(
    () => (sort === 'manual' ? rows : sortWatchlistMemberships(rows, sort)),
    [rows, sort],
  )
  const manualOrder = sort === 'manual'

  const handleDragEndWrapper = (event: DragEndEvent) => {
    if (!manualOrder) {
      return
    }

    handleDragEnd(event)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setLogTarget(null)
    }
  }

  if (rowsToRender.length === 0) {
    return <WatchlistMembershipsEmpty />
  }

  return (
    <>
      <div className="md:hidden">
        <WatchlistMembershipGrid
          memberships={rowsToRender}
          onLogWatch={setLogTarget}
          onRemove={handleRemove}
          slug={slug}
        />
      </div>

      <div className="hidden md:block">
        <DragDropProvider onDragEnd={handleDragEndWrapper}>
          <ItemGroup className="gap-1.5">
            {rowsToRender.map((membership, index) => (
              <WatchlistMembershipRow
                index={index}
                key={membership.id}
                membership={membership}
                onLogWatch={setLogTarget}
                onRemove={handleRemove}
                reorderDisabled={reorder.isPending}
                showDragHandle={manualOrder}
                slug={slug}
              />
            ))}
          </ItemGroup>
        </DragDropProvider>
      </div>

      <WatchlistLogWatchDialog
        key={logTarget?.id}
        membership={logTarget}
        onOpenChange={handleOpenChange}
        open
      />
    </>
  )
}
