import { ListVideo } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function WatchlistMembershipsEmpty() {
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
    </Empty>
  )
}
