import type { MediaType } from '@plotline/shared/constants'

import { Film, Tv } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

type MediaSimilarTitlesEmptyProps = {
  mediaType: MediaType
}

const EMPTY_COPY: Record<MediaType, { description: string; icon: React.ReactNode; title: string }> =
  {
    movie: {
      description: 'No similar films were found for this title.',
      icon: <Film />,
      title: 'No Similar Films',
    },
    tv: {
      description: 'No similar TV shows were found for this title.',
      icon: <Tv />,
      title: 'No Similar TV Shows',
    },
  }

export function MediaSimilarTitlesEmpty({ mediaType }: MediaSimilarTitlesEmptyProps) {
  const { description, icon, title } = EMPTY_COPY[mediaType]

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
