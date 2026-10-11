import type { MediaType } from '@plotline/shared/constants'

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

const ERROR_COPY: Record<MediaType, { description: string; title: string }> = {
  movie: {
    description: 'Similar films could not be loaded.',
    title: 'Error Loading Similar Films',
  },
  tv: {
    description: 'Similar TV shows could not be loaded.',
    title: 'Error Loading Similar TV Shows',
  },
}

export function MediaSimilarTitlesError({
  isFetching,
  mediaType,
  onRetry,
}: MediaSimilarTitlesErrorProps) {
  const { description, title } = ERROR_COPY[mediaType]

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
