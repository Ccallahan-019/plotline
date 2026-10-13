'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { DragDropProvider, DragEndEvent } from '@dnd-kit/react'
import { useMemo } from 'react'

import { ItemGroup } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import type { MembershipLayout } from '../hooks/use-membership-layout'
import type { WatchlistMembershipSort } from '../types'

import { useWatchlistMembershipList } from '../hooks/use-watchlist-membership-list'
import { sortWatchlistMemberships } from '../services/sort-watchlist-memberships'
import { WatchlistLogWatchDialog } from './WatchlistLogWatchDialog'
import { WatchlistMembershipGrid } from './WatchlistMembershipGrid'
import { WatchlistMembershipRow } from './WatchlistMembershipRow'
import { WatchlistMembershipsEmpty } from './WatchlistMembershipsEmpty'

type WatchlistMembershipListProps = {
  challenge: null | Watchlist['challenge']
  layout: MembershipLayout | null
  memberships: WatchlistMembership[]
  onAddTitle: () => void
  showGoalCounts: boolean
  slug: string
  sort: WatchlistMembershipSort
}

export function WatchlistMembershipList({
  challenge,
  layout,
  memberships,
  onAddTitle,
  showGoalCounts,
  slug,
  sort,
}: WatchlistMembershipListProps) {
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
  // Grid below `md`, even after a rows pick. That pick applies from `md` up.
  const { gridClassName, rowsClassName } = membershipLayoutVisibility(layout)

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
    return <WatchlistMembershipsEmpty onAddTitle={onAddTitle} />
  }

  return (
    <>
      <div className={gridClassName}>
        <WatchlistMembershipGrid
          challenge={challenge}
          memberships={rowsToRender}
          onLogWatch={setLogTarget}
          onRemove={handleRemove}
          showGoalCounts={showGoalCounts}
          slug={slug}
        />
      </div>

      <ShowIf condition={layout !== 'grid'}>
        <div className={cn(rowsClassName, layout === 'rows' && 'overflow-x-auto')}>
          <DragDropProvider onDragEnd={handleDragEndWrapper}>
            <ItemGroup className="gap-1.5">
              {rowsToRender.map((membership, index) => (
                <WatchlistMembershipRow
                  challenge={challenge}
                  index={index}
                  key={membership.id}
                  membership={membership}
                  onLogWatch={setLogTarget}
                  onRemove={handleRemove}
                  reorderDisabled={reorder.isPending}
                  showDragHandle={manualOrder}
                  showGoalCounts={showGoalCounts}
                  slug={slug}
                />
              ))}
            </ItemGroup>
          </DragDropProvider>
        </div>
      </ShowIf>

      <WatchlistLogWatchDialog
        key={logTarget?.id}
        membership={logTarget}
        onOpenChange={handleOpenChange}
        open
      />
    </>
  )
}

// Below `md` the grid is always visible. A rows pick only applies from `md` up.
function membershipLayoutVisibility(layout: MembershipLayout | null): {
  gridClassName: string
  rowsClassName: string
} {
  if (layout === 'grid') {
    return { gridClassName: 'block', rowsClassName: 'hidden' }
  }

  return { gridClassName: 'md:hidden', rowsClassName: 'hidden md:block' }
}
