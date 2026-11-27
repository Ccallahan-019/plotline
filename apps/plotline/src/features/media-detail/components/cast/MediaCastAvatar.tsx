import { MediaPoster } from '@/components/media/MediaPoster'

import { mediaImageUrl } from '../../services/media-image-url'

type MediaCastAvatarProps = {
  profilePath: null | string
}

/**
 * Portrait still for one person, in the same 2:3 frame as a title poster.
 *
 * `h632` is the large TMDB profile size. `w342` is a poster size and 404s for people.
 */
export function MediaCastAvatar({ profilePath }: MediaCastAvatarProps) {
  const src = mediaImageUrl(profilePath, 'h632')

  return (
    <MediaPoster
      className="w-full rounded-md"
      ratio={2 / 3}
      sizes="(max-width: 639px) 30vw, (max-width: 1023px) 22vw, 160px"
      src={src}
    />
  )
}
