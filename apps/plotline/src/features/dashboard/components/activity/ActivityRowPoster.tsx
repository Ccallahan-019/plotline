import { MediaPoster } from '@/components/media/MediaPoster'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

type ActivityRowPosterProps = {
  posterPath: null | string
}

export function ActivityRowPoster({ posterPath }: ActivityRowPosterProps) {
  if (!posterPath) {
    return null
  }

  return (
    <MediaPoster
      alt=""
      className="w-8 rounded-sm"
      ratio={2 / 3}
      sizes="32px"
      src={tmdbMediaUrl(posterPath, 'w185')}
    />
  )
}
