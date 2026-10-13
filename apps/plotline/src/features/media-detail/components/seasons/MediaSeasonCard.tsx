import { MediaPoster } from '@/components/media/MediaPoster'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import type { MediaTitleSeason } from '../../types'

import {
  formatSeasonEpisodeCount,
  formatSeasonReleaseYear,
} from '../../services/format-media-season'
import { mediaImageUrl } from '../../services/media-image-url'
import { MediaSeasonProgress } from './MediaSeasonProgress'

type MediaSeasonCardProps = {
  fallbackPosterPath: null | string
  onSelect: (seasonNumber: number) => void
  season: MediaTitleSeason
  selected: boolean
  watchedCount: null | number
}

export function MediaSeasonCard({
  fallbackPosterPath,
  onSelect,
  season,
  selected,
  watchedCount,
}: MediaSeasonCardProps) {
  const posterUrl = mediaImageUrl(season.posterPath ?? fallbackPosterPath, 'w342')
  const episodeCountLabel = formatSeasonEpisodeCount(season.episodeCount)
  const year = formatSeasonReleaseYear(season.airDate)
  const showProgress = season.episodeCount != null && season.episodeCount > 0

  return (
    <Card
      className={cn(
        'w-64 shrink-0 flex-row gap-0 py-0 focus-within:ring-2 focus-within:ring-ring',
        selected && 'ring-2 ring-foreground',
      )}
    >
      <button
        aria-pressed={selected}
        className="flex w-full text-left outline-none"
        onClick={() => onSelect(season.seasonNumber)}
        type="button"
      >
        <MediaPoster className="min-h-36 w-24 shrink-0 self-stretch" sizes="96px" src={posterUrl} />
        <CardContent className="flex flex-1 flex-col justify-center gap-1">
          <CardTitle className="text-sm">{season.name}</CardTitle>
          <ShowIf condition={episodeCountLabel != null}>
            <CardDescription>{episodeCountLabel}</CardDescription>
          </ShowIf>
          <ShowIf condition={year != null}>
            <CardDescription>{year}</CardDescription>
          </ShowIf>
          <ShowIf condition={showProgress}>
            <MediaSeasonProgress
              episodeCount={season.episodeCount ?? 0}
              watchedCount={watchedCount}
            />
          </ShowIf>
        </CardContent>
      </button>
    </Card>
  )
}
