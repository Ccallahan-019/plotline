import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'
import type { MouseEvent } from 'react'

import { Check } from 'lucide-react'

import { MediaPoster } from '@/components/media/MediaPoster'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { logWatchTriggerAccessibleName } from '@/features/library/log-watch/services/log-watch-trigger'
import { cn } from '@/lib/utils'

import { formatEpisodeCode, formatEpisodeDisplayName } from '../../services/format-media-season'
import { episodeStillUrl } from '../../services/media-image-url'

/** Width of one episode still in the horizontal strip. */
export const seasonEpisodeCardClassName = 'w-64 shrink-0'

const EPISODE_STILL_RATIO = 16 / 9
const EPISODE_STILL_SIZES = '18rem'

type MediaSeasonEpisodeCardProps = {
  backdropPath: null | string
  episode: TmdbTvSeasonEpisode
  logWatchDisabled: boolean
  onLogEpisode: (seasonNumber: number, episodeNumber: number) => void
  onSelect: (episodeNumber: number) => void
  seasonNumber: number
  selected: boolean
  title: string
}

export function MediaSeasonEpisodeCard({
  backdropPath,
  episode,
  logWatchDisabled,
  onLogEpisode,
  onSelect,
  seasonNumber,
  selected,
  title,
}: MediaSeasonEpisodeCardProps) {
  const { episode_number, name, still_path } = episode
  const displayName = formatEpisodeDisplayName(name, episode_number)
  const episodeCode = formatEpisodeCode(seasonNumber, episode_number)
  const stillUrl = episodeStillUrl(still_path, backdropPath)
  const accessibleName = logWatchTriggerAccessibleName(title, `Log ${episodeCode}`)

  function handleLogEpisode(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onLogEpisode(seasonNumber, episode_number)
  }

  function handleSelect() {
    onSelect(episode_number)
  }

  return (
    <Card
      className={cn(
        'relative w-full min-w-0 pt-0 focus-within:ring-2 focus-within:ring-ring',
        selected && 'ring-2 ring-foreground',
      )}
      size="sm"
    >
      {/* Covers the still without wrapping the log button, which must stay a separate control. */}
      <button
        aria-label={`${displayName}, ${episodeCode}`}
        aria-pressed={selected}
        className="absolute inset-0 z-0 bg-transparent outline-none"
        onClick={handleSelect}
        type="button"
      />
      <MediaPoster
        className="pointer-events-none w-full"
        ratio={EPISODE_STILL_RATIO}
        sizes={EPISODE_STILL_SIZES}
        src={stillUrl}
      />
      <CardHeader className="pointer-events-none relative z-10">
        <CardTitle aria-hidden className="line-clamp-2">
          {displayName}
        </CardTitle>
        <CardDescription aria-hidden className="text-xs tabular-nums">
          {episodeCode}
        </CardDescription>

        {/* Above the select overlay so logging does not change the selected episode. */}
        <CardAction className="pointer-events-auto">
          <Button
            aria-label={accessibleName}
            className="pointer-events-auto"
            disabled={logWatchDisabled}
            onClick={handleLogEpisode}
            size="icon-sm"
            type="button"
          >
            <Check />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
