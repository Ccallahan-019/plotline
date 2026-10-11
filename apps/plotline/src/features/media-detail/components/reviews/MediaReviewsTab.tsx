import type { MediaType } from '@plotline/shared/constants'

import dynamic from 'next/dynamic'

import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty'

import { MediaCommunityRatings } from '../overview/MediaCommunityRatings'

// Loaded on demand so the markdown and HTML parsing stack stays out of the initial title-page bundle.
const MediaTmdbReviews = dynamic(() =>
  import('./MediaTmdbReviews').then((module) => module.MediaTmdbReviews),
)

type MediaReviewsTabProps = {
  mediaType: MediaType
  tmdbId: number
  voteAverage: null | number
  voteCount: null | number
}

type ReviewPlaceholderProps = {
  description: string
  title: string
}

export function MediaReviewsTab({
  mediaType,
  tmdbId,
  voteAverage,
  voteCount,
}: MediaReviewsTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-72">
        <MediaCommunityRatings voteAverage={voteAverage} voteCount={voteCount} />
      </div>
      <MediaTmdbReviews mediaType={mediaType} tmdbId={tmdbId} />
      <ReviewPlaceholder
        description="Public reviews from Plotline will show here."
        title="Public Reviews"
      />
      <ReviewPlaceholder
        description="Reviews from your friends will show here."
        title="Friends' Reviews"
      />
    </div>
  )
}

function ReviewPlaceholder({ description, title }: ReviewPlaceholderProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-base font-medium">{title}</h2>
      <Empty className="border">
        <EmptyHeader>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}
