import { Star } from 'lucide-react'

type RatingStarsProps = {
  ratingOutOfTen: number
}

export function RatingStars({ ratingOutOfTen }: RatingStarsProps) {
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
