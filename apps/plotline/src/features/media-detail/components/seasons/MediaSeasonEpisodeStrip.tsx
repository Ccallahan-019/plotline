'use client'

import { useState } from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import { episodesInSeasonOrder, resolveSelectedEpisode } from '../../services/format-media-season'
import { MediaSeasonEpisodeCard, seasonEpisodeCardClassName } from './MediaSeasonEpisodeCard'
import { MediaSeasonEpisodeDetail } from './MediaSeasonEpisodeDetail'
import { MediaSeasonEpisodesProps, seasonEpisodeStripClassName } from './MediaSeasonEpisodes'

export function MediaSeasonEpisodeStrip({
  backdropPath,
  episodes,
  logWatchSubmitting,
  onLogEpisode,
  seasonNumber,
  title,
}: MediaSeasonEpisodesProps) {
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<null | number>(null)
  const rows = episodesInSeasonOrder(episodes)
  const selected = resolveSelectedEpisode(rows, selectedEpisodeNumber)

  function handleSelectEpisode(episodeNumber: number) {
    setSelectedEpisodeNumber(episodeNumber)
  }

  return (
    <div className="flex flex-col gap-6">
      <ScrollArea>
        <ul aria-label="Episodes" className={seasonEpisodeStripClassName}>
          {rows.map((episode) => (
            <li className={seasonEpisodeCardClassName} key={episode.episode_number}>
              <MediaSeasonEpisodeCard
                backdropPath={backdropPath}
                episode={episode}
                logWatchSubmitting={logWatchSubmitting}
                onLogEpisode={onLogEpisode}
                onSelect={handleSelectEpisode}
                seasonNumber={seasonNumber}
                selected={episode.episode_number === selected?.episode_number}
                title={title}
              />
            </li>
          ))}
        </ul>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {selected && (
        <MediaSeasonEpisodeDetail
          episode={selected}
          logWatchSubmitting={logWatchSubmitting}
          onLogEpisode={onLogEpisode}
          seasonNumber={seasonNumber}
          title={title}
        />
      )}
    </div>
  )
}
