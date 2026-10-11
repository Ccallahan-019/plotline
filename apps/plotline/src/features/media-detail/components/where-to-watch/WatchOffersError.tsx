import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

type WatchOffersErrorProps = {
  isFetching: boolean
  onRetry: () => void
}

export function WatchOffersError({ isFetching, onRetry }: WatchOffersErrorProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Error Loading Watch Options</EmptyTitle>
        <EmptyDescription>Watch options could not be loaded.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button disabled={isFetching} onClick={onRetry} size="sm" type="button" variant="outline">
          {isFetching ? 'Loading…' : 'Try again'}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
