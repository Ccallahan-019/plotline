import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import { cn } from 'cn'

import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'

import { formatEpisodeDisplayName, formatEpisodeMeta } from '../../services/format-media-season'

type MediaSeasonEpisodesProps = {
  episodes: TmdbTvSeasonEpisode[]
}

export function MediaSeasonEpisodes({ episodes }: MediaSeasonEpisodesProps) {
  const rows = [...episodes].sort((left, right) => left.episode_number - right.episode_number)

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No episodes are listed for this season.</p>
  }

  return (
    <div className="flex flex-col">
      {rows.map((episode, index) => {
        const meta = formatEpisodeMeta(episode.air_date, episode.runtime)

        return (
          <Item
            className={cn('rounded-none', index !== rows.length - 1 && 'border-b border-b-border')}
            key={episode.episode_number}
          >
            <ItemContent className="min-w-0">
              <ItemTitle className=" w-auto shrink-0 min-w-0 truncate line-clamp-1">
                <span className="shrink-0 tabular-nums text-muted-foreground mr-1.5">
                  E{episode.episode_number}
                </span>

                {formatEpisodeDisplayName(episode.name, episode.episode_number)}
              </ItemTitle>
            </ItemContent>

            <ShowIf condition={meta != null}>
              <ItemActions className="shrink-0 text-sm text-muted-foreground">{meta}</ItemActions>
            </ShowIf>
          </Item>
        )
      })}
    </div>
  )
}
