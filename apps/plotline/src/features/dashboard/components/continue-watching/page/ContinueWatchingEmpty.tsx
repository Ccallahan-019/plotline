import { StepForward } from 'lucide-react'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function ContinueWatchingEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <StepForward />
        </EmptyMedia>
        <EmptyTitle>Nothing in Progress</EmptyTitle>
        <EmptyDescription>
          Log an episode or mark a film as Watching, and it will show up here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link className={buttonVariants({ variant: 'outline' })} href="/dashboard/library">
          Browse Library
        </Link>
      </EmptyContent>
    </Empty>
  )
}
