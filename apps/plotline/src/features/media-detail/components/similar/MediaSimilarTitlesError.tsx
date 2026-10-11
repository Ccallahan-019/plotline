import { MediaType } from '@plotline/shared/constants'
import { MonitorOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

type MediaSimilarTitlesErrorProps = {
  isFetching: boolean
  mediaType: MediaType
  onRetry: () => void
}

export function MediaSimilarTitlesError({
  isFetching,
  mediaType,
  onRetry,
}: MediaSimilarTitlesErrorProps) {
  const title =
    mediaType === 'movie' ? 'Error Loading Similar Films' : 'Error Loading Similar TV Shows'
  const description =
    mediaType === 'movie'
      ? 'Similar films could not be loaded.'
      : 'Similar TV shows could not be loaded.'

  const buttonText = isFetching ? 'Loading…' : 'Try Again'

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MonitorOff />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button disabled={isFetching} onClick={onRetry} type="button" variant="outline">
          {buttonText}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
