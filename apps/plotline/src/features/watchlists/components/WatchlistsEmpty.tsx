import { ListChecks } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function WatchlistsEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListChecks />
        </EmptyMedia>
        <EmptyTitle>No watchlists yet</EmptyTitle>
        <EmptyDescription>
          Profiles and default watchlists are created when Clerk webhooks sync to Payload.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
