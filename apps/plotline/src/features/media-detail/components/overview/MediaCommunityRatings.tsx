import { Star } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CommunityRatingsProps = {
  voteAverage: null | number
  voteCount: null | number
}

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

function CommunityRatings({ voteAverage, voteCount }: CommunityRatingsProps) {
  const hasScore = voteAverage != null
  const hasCount = voteCount != null

  if (hasScore) {
    const ratingCount = hasCount
      ? voteCount > 1000
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

function RatingStars({ ratingOutOfTen }: { ratingOutOfTen: number }) {
  const value = ratingOutOfTen / 2

  return (
    <div
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className="flex items-center gap-0.5"
      role="img"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const amount = Math.min(1, Math.max(0, value - index))

        return (
          <span className="relative size-4" key={index}>
            <Star className="size-4 text-muted-foreground" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${amount * 100}%` }}
            >
              <Star className="size-4 fill-current text-foreground" />
            </span>
          </span>
        )
      })}
    </div>
  )
}
