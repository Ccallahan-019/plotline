'use client'

import { Activity, Search, Star, TvMinimal, UsersRound } from 'lucide-react'
import { useState } from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShowIf } from '@/components/utils/ShowIf'

import type { MediaTitlePageData } from '../../types'

import { MediaActivityTab } from '../activity/MediaActivityTab'
import { MediaCastTab } from '../cast/MediaCastTab'
import { MediaOverviewTab } from '../overview/MediaOverviewTab'
import { MediaReviewsTab } from '../reviews/MediaReviewsTab'
import { MediaSeasonsTab } from '../seasons/MediaSeasonsTab'
import { MediaSimilarTab } from '../similar/MediaSimilarTab'

type MediaTitleTabsProps = {
  data: MediaTitlePageData
  logWatchSubmitting: boolean
  onLogEpisode: (seasonNumber: number, episodeNumber: number) => void
}

export function MediaTitleTabs({ data, logWatchSubmitting, onLogEpisode }: MediaTitleTabsProps) {
  const {
    cast,
    crew,
    keyCredits,
    libraryItem,
    media,
    seasons,
    voteAverage,
    voteCount,
    watchEvents,
  } = data
  const { backdropPath, mediaType, posterPath, title, tmdbId } = media
  const [tab, setTab] = useState('overview')
  const showSeasons = mediaType === 'tv'

  const handleTabChange = (value: null | string) => {
    if (value) {
      setTab(value)
    }
  }

  function handleShowCast() {
    setTab('cast')
  }

  return (
    <Tabs onValueChange={handleTabChange} value={tab}>
      <ScrollArea>
        <div className="pb-5">
          <TabsList className="w-max min-w-full justify-start" variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {showSeasons ? (
              <TabsTrigger value="seasons">
                <TvMinimal />
                Seasons
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="cast">
              <UsersRound />
              Cast & Crew
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity />
              Your Activity
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star />
              Ratings & Reviews
            </TabsTrigger>
            <TabsTrigger value="similar">
              <Search />
              Similar
            </TabsTrigger>
          </TabsList>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <TabsContent className="pt-4" value="overview">
        <MediaOverviewTab data={data} onShowCast={handleShowCast} />
      </TabsContent>
      <ShowIf condition={showSeasons}>
        <TabsContent className="pt-4" value="seasons">
          <MediaSeasonsTab
            backdropPath={backdropPath ?? null}
            enabled={tab === 'seasons'}
            fallbackPosterPath={posterPath ?? null}
            lastSeason={libraryItem?.progress.lastSeason ?? null}
            libraryItemId={libraryItem?.id ?? null}
            logWatchSubmitting={logWatchSubmitting}
            onLogEpisode={onLogEpisode}
            seasons={seasons}
            title={title}
            tmdbId={tmdbId}
          />
        </TabsContent>
      </ShowIf>
      <TabsContent className="pt-4" value="cast">
        <MediaCastTab cast={cast} crew={crew} keyCredits={keyCredits} />
      </TabsContent>
      <TabsContent className="pt-4" value="activity">
        <MediaActivityTab watchEvents={watchEvents} />
      </TabsContent>
      <TabsContent className="pt-4" value="reviews">
        <MediaReviewsTab
          mediaType={mediaType}
          tmdbId={tmdbId}
          voteAverage={voteAverage}
          voteCount={voteCount}
        />
      </TabsContent>
      <TabsContent className="pt-4" value="similar">
        <MediaSimilarTab enabled={tab === 'similar'} mediaType={mediaType} tmdbId={tmdbId} />
      </TabsContent>
    </Tabs>
  )
}
