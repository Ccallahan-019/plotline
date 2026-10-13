import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { RatingStars } from '../ratings/RatingStars'

type MediaCommunityRatingsProps = {
  voteAverage: null | number
  voteCount: null | number
}

export function MediaCommunityRatings({ voteAverage, voteCount }: MediaCommunityRatingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Ratings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CommunityRatings voteAverage={voteAverage} voteCount={voteCount} />
      </CardContent>
    </Card>
  )
}

function CommunityRatings({ voteAverage, voteCount }: MediaCommunityRatingsProps) {
  const hasScore = voteAverage != null
  const hasCount = voteCount != null

  if (hasScore) {
    const ratingCount = hasCount
      ? voteCount >= 1000
        ? `${(voteCount / 1000).toFixed(1)}k`
        : voteCount.toLocaleString()
      : null

    return (
      <div className="flex gap-3">
        <p className="font-heading text-4xl leading-none font-semibold">{voteAverage.toFixed(1)}</p>
        <div className="flex flex-col gap-1">
          <RatingStars ratingOutOfTen={voteAverage} />
          <p className="text-sm text-muted-foreground">
            {ratingCount != null ? `${ratingCount} ratings` : 'TMDB score'}
          </p>
        </div>
      </div>
    )
  }

  return <p className="text-sm text-muted-foreground">No community rating yet.</p>
}
