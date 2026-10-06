import type { MediaDisplay } from '../../types'

import {
  formatEpisodeCount,
  formatReleaseYear,
  formatRuntime,
  getTitleHref,
} from './media-display-helpers'

type GetMediaItemDisplayProps = {
  href?: string
  media: MediaDisplay
  subtitle?: string
  variant?: 'grid' | 'list'
}

export function getMediaItemDisplay({
  href,
  media,
  subtitle,
  variant = 'grid',
}: GetMediaItemDisplayProps) {
  const releaseYear = formatReleaseYear(media.releaseDate)
  const titleHref = href ?? getTitleHref(media)

  const subTitleAddon =
    media.mediaType === 'movie'
      ? formatRuntime(media.runtime)
      : formatEpisodeCount(media.episodeCount)

  const gridSubtitle =
    subtitle ??
    [media.mediaType === 'movie' ? 'Film' : 'Series', releaseYear].filter(Boolean).join(' · ')

  const listSubtitle =
    subtitle ??
    [media.mediaType === 'movie' ? 'Film' : 'Series', releaseYear, subTitleAddon]
      .filter(Boolean)
      .join(' · ')

  const cardSubtitle = variant === 'grid' ? gridSubtitle : listSubtitle

  const showMediaCondition = media.posterPath ? media.posterPath.trim().length > 0 : false

  return {
    cardSubtitle,
    showMediaCondition,
    titleHref,
  }
}
