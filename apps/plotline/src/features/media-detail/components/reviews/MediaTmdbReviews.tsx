'use client'

import type { MediaType } from '@plotline/shared/constants'

import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ShowIf } from '@/components/utils/ShowIf'

import type { TmdbCommunityReview } from '../../types'

import { useTmdbReviews } from '../../hooks/use-tmdb-reviews'
import { dedupeTmdbReviews } from '../../services/dedupe-tmdb-reviews'
import { MediaTmdbReview } from './MediaTmdbReview'

type CommunityReviewListProps = {
  query: ReturnType<typeof useTmdbReviews>
  reviews: TmdbCommunityReview[]
}

type MediaTmdbReviewsProps = {
  mediaType: MediaType
  tmdbId: number
}

export function MediaTmdbReviews({ mediaType, tmdbId }: MediaTmdbReviewsProps) {
  const query = useTmdbReviews(mediaType, tmdbId)
  const reviews = dedupeTmdbReviews(query.data?.pages.flatMap((page) => page.reviews) ?? [])

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-base font-medium">Community Reviews</h2>
      <CommunityReviewList query={query} reviews={reviews} />
    </section>
  )
}

function CommunityReviewList({ query, reviews }: CommunityReviewListProps) {
  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-16 w-full" key={index} />
        ))}
      </div>
    )
  }

  if (query.isError && reviews.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Error Loading Community Reviews</EmptyTitle>
          <EmptyDescription>Community reviews could not be loaded.</EmptyDescription>
        </EmptyHeader>
        <Button
          disabled={query.isFetching}
          onClick={() => {
            void query.refetch()
          }}
          type="button"
          variant="outline"
        >
          {query.isFetching ? 'Loading…' : 'Try Again'}
        </Button>
      </Empty>
    )
  }

  if (reviews.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No Community Reviews</EmptyTitle>
          <EmptyDescription>No community reviews yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-8">
        {reviews.map((review) => (
          <MediaTmdbReview key={review.id} review={review} />
        ))}
      </div>
      <ShowIf condition={query.hasNextPage}>
        <div className="flex flex-col items-start gap-2">
          <ShowIf condition={query.isFetchNextPageError}>
            <p className="text-sm text-muted-foreground">More reviews could not be loaded.</p>
          </ShowIf>
          <Button
            disabled={query.isFetchingNextPage}
            onClick={() => {
              void query.fetchNextPage()
            }}
            type="button"
            variant="outline"
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Show More'}
          </Button>
        </div>
      </ShowIf>
    </div>
  )
}
