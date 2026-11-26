import { TvMinimal } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function MediaSeasonEpisodesEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TvMinimal />
        </EmptyMedia>
        <EmptyTitle>No Episodes Listed</EmptyTitle>
        <EmptyDescription>There are no episodes listed for this season.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
