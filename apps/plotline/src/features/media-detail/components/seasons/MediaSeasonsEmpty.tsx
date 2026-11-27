import { TvMinimal } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function MediaSeasonsEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TvMinimal />
        </EmptyMedia>
        <EmptyTitle>No Seasons Listed</EmptyTitle>
        <EmptyDescription>There are no seasons listed for this series.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
