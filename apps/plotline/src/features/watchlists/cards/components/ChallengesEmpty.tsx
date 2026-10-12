import { Trophy } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function ChallengesEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Trophy />
        </EmptyMedia>
        <EmptyTitle>No Challenges Yet</EmptyTitle>
        <EmptyDescription>
          Create a challenge to track a count or runtime goal through a due date.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
