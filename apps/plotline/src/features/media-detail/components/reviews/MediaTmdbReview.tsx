import { UserRound } from 'lucide-react'

import { RatingStars } from '@/components/ratings/RatingStars'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'

import type { TmdbCommunityReview } from '../../types'

import { formatWatchActivityDate } from '../../services/format-media-title'
import { TmdbReviewBody } from './TmdbReviewBody'

type MediaTmdbReviewProps = {
  review: TmdbCommunityReview
}

export function MediaTmdbReview({ review }: MediaTmdbReviewProps) {
  const writtenLabel = review.writtenAt.trim()
    ? `Written ${formatWatchActivityDate(review.writtenAt)}`
    : null

  return (
    <article>
      <Card>
        <CardContent>
          <Item className="flex-nowrap px-0">
            <ItemMedia>
              <Avatar className="size-10">
                {review.avatarUrl ? <AvatarImage alt="" src={review.avatarUrl} /> : null}
                <AvatarFallback>{review.initials || <UserRound aria-hidden />}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="min-w-0 gap-0.5">
              <ItemTitle className="w-auto truncate">{review.name}</ItemTitle>
              <ShowIf condition={writtenLabel != null}>
                <ItemDescription>{writtenLabel}</ItemDescription>
              </ShowIf>
            </ItemContent>
            <ReviewRating rating={review.rating} />
          </Item>
          <ShowIf condition={review.body.trim().length > 0}>
            <TmdbReviewBody body={review.body} />
          </ShowIf>
        </CardContent>
      </Card>
    </article>
  )
}

function ReviewRating({ rating }: { rating: null | number }) {
  if (rating == null) {
    return null
  }

  return (
    <ItemActions className="shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium tabular-nums">{rating} / 10</span>
        <RatingStars ratingOutOfTen={rating} />
      </div>
    </ItemActions>
  )
}
