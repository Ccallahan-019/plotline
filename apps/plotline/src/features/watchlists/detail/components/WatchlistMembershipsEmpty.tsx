'use client'

import { ListVideo, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

type WatchlistMembershipsEmptyProps = {
  onAddTitle: () => void
}

export function WatchlistMembershipsEmpty({ onAddTitle }: WatchlistMembershipsEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListVideo />
        </EmptyMedia>
        <EmptyTitle>No titles yet</EmptyTitle>
        <EmptyDescription>
          Movies and series you add to this list will show up here.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        {/* Opens the heading dialog, which stays mounted after this empty state is replaced. */}
        <Button onClick={onAddTitle} type="button" variant="outline">
          <Plus data-icon="inline-start" />
          Add Title
        </Button>
      </EmptyContent>
    </Empty>
  )
}
