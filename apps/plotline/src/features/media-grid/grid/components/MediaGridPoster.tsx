import Image from 'next/image'

import { RatingBadge } from '@/components/ratings/RatingsBadge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ShowIf } from '@/components/utils/ShowIf'
import { getPosterUrl } from '@/features/media-grid/grid/services/media-display-helpers'
import { MediaDisplay } from '@/features/media-grid/types'
import { cn } from '@/lib/utils'

import { MediaGridPosterEmpty } from './MediaGridPosterEmpty'

type MediaGridPosterProps = {
  className?: string
  media: MediaDisplay
  ratio: number
}

export function MediaGridPoster({ className, media, ratio }: MediaGridPosterProps) {
  const posterUrl = getPosterUrl(media.posterPath, 'w780')

  const showRating = media.voteAverage !== undefined

  if (!posterUrl) {
    return <MediaGridPosterEmpty className={className} rating={media.voteAverage} ratio={ratio} />
  }

  return (
    <AspectRatio
      className={cn('w-full relative bg-muted rounded-md overflow-hidden', className)}
      ratio={ratio}
    >
      <ShowIf condition={showRating}>
        <RatingBadge rating={media.voteAverage} />
      </ShowIf>
      <Image
        alt={`${media.title} poster`}
        className="absolute inset-0 object-cover"
        fill
        sizes="(max-width: 479px) 100vw, (max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, (max-width: 1535px) 25vw, 20vw"
        src={posterUrl}
      />
    </AspectRatio>
  )
}
