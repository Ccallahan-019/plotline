import { MediaType } from '@plotline/shared/constants'
import { Film, Tv } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

type MediaSimilarTitlesEmptyProps = {
  mediaType: MediaType
}

export function MediaSimilarTitlesEmpty({ mediaType }: MediaSimilarTitlesEmptyProps) {
  const title = mediaType === 'movie' ? 'No Similar Films' : 'No Similar TV Shows'
  const description =
    mediaType === 'movie'
      ? 'No similar films were found for this title.'
      : 'No similar TV shows were found for this title.'
  const icon = mediaType === 'movie' ? <Film /> : <Tv />

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
