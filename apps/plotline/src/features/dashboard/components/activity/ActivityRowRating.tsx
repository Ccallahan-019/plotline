import { RatingStars } from '@/components/ratings/RatingStars'

import { activityRowShowsRating } from '../../services/activity-display'
import { DashboardActivityFilterKind } from '../../types'

type ActivityRowRatingProps = {
  filterKind: DashboardActivityFilterKind
  rating: null | number
}

export function ActivityRowRating({ filterKind, rating }: ActivityRowRatingProps) {
  if (!activityRowShowsRating({ filterKind, rating }) || rating == null) {
    return null
  }

  return (
    <span className="shrink-0">
      <RatingStars ratingOutOfTen={rating} />
    </span>
  )
}
