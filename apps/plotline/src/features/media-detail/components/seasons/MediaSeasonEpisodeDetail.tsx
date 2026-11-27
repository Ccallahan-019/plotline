import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { logWatchTriggerAccessibleName } from '@/features/library/log-watch/services/log-watch-trigger'

import {
  formatEpisodeCode,
  formatEpisodeDisplayName,
  formatEpisodeHeading,
  formatEpisodeMeta,
  formatEpisodeOverview,
} from '../../services/format-media-season'

type MediaSeasonEpisodeDetailProps = {
  episode: TmdbTvSeasonEpisode
  logWatchDisabled: boolean
  onLogEpisode: (seasonNumber: number, episodeNumber: number) => void
  seasonNumber: number
  title: string
}

export function MediaSeasonEpisodeDetail({
  episode,
  logWatchDisabled,
  onLogEpisode,
  seasonNumber,
  title,
}: MediaSeasonEpisodeDetailProps) {
  const { air_date, episode_number, name, overview, runtime } = episode
  const displayName = formatEpisodeDisplayName(name, episode_number)
  const heading = formatEpisodeHeading(seasonNumber, episode_number)
  const episodeCode = formatEpisodeCode(seasonNumber, episode_number)
  const meta = formatEpisodeMeta(air_date, runtime)
  const overviewText = formatEpisodeOverview(overview)
  const accessibleName = logWatchTriggerAccessibleName(title, `Log ${episodeCode}`)

  function handleLogEpisode() {
    onLogEpisode(seasonNumber, episode_number)
  }

  return (
    <section className="flex flex-col">
      <Item className="px-0">
        <ItemContent>
          <ItemTitle>{displayName}</ItemTitle>
          <ItemDescription>{heading}</ItemDescription>
        </ItemContent>

        <ItemActions>
          <Button
            aria-label={accessibleName}
            disabled={logWatchDisabled}
            onClick={handleLogEpisode}
            type="button"
          >
            <Check />
            Log watch
          </Button>
        </ItemActions>
      </Item>
      <div className="flex flex-col gap-1">
        <ShowIf condition={meta != null}>
          <p className="text-sm text-muted-foreground">{meta}</p>
        </ShowIf>
        <ShowIf condition={overviewText != null}>
          <p className="text-sm leading-relaxed text-pretty lg:text-base">{overviewText}</p>
        </ShowIf>
      </div>
    </section>
  )
}
