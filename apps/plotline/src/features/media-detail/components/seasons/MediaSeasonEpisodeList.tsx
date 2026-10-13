import { Skeleton } from '@/components/ui/skeleton'
import { useTvSeasonEpisodes } from '@/features/library/log-watch/hooks/use-tv-season-episodes'

import { MediaTitleSeason } from '../../types'
import { MediaSeasonEpisodes } from './MediaSeasonEpisodes'

type MediaSeasonEpisodeListProps = {
  enabled: boolean
  query: ReturnType<typeof useTvSeasonEpisodes>
  selectedSeason?: MediaTitleSeason
}

export function MediaSeasonEpisodeList({
  enabled,
  query,
  selectedSeason,
}: MediaSeasonEpisodeListProps) {
  if (!enabled || selectedSeason == null) {
    return null
  }

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton className="h-9 w-full" key={index} />
        ))}
      </div>
    )
  }

  if (query.isError) {
    return (
      <p className="text-sm text-muted-foreground">Episodes for this season could not be loaded.</p>
    )
  }

  return <MediaSeasonEpisodes episodes={query.data?.episodes ?? []} />
}
