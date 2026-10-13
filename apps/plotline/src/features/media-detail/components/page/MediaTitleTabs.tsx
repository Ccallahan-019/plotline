'use client'

import { Activity, Search, Star, Tv, UsersRound } from 'lucide-react'
import { useState } from 'react'

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
}

export function MediaTitleTabs({ data }: MediaTitleTabsProps) {
  const [tab, setTab] = useState('overview')
  const showSeasons = data.media.mediaType === 'tv'

  const handleTabChange = (value: null | string) => {
    if (value) {
      setTab(value)
    }
  }

  return (
    <Tabs onValueChange={handleTabChange} value={tab}>
      <div className="overflow-x-auto pb-2">
        <TabsList className="w-max min-w-full justify-start" variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {showSeasons ? (
            <TabsTrigger value="seasons">
              <Tv />
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

      <TabsContent className="pt-4" value="overview">
        <MediaOverviewTab data={data} onShowCast={() => setTab('cast')} />
      </TabsContent>
      <ShowIf condition={showSeasons}>
        <TabsContent className="pt-4" value="seasons">
          <MediaSeasonsTab
            enabled={tab === 'seasons'}
            fallbackPosterPath={data.media.posterPath ?? null}
            lastSeason={data.libraryItem?.progress.lastSeason ?? null}
            libraryItemId={data.libraryItem?.id ?? null}
            seasons={data.seasons}
            tmdbId={data.media.tmdbId}
          />
        </TabsContent>
      </ShowIf>
      <TabsContent className="pt-4" value="cast">
        <MediaCastTab cast={data.cast} crew={data.crew} keyCredits={data.keyCredits} />
      </TabsContent>
      <TabsContent className="pt-4" value="activity">
        <MediaActivityTab watchEvents={data.watchEvents} />
      </TabsContent>
      <TabsContent className="pt-4" value="reviews">
        <MediaReviewsTab
          mediaType={data.media.mediaType}
          tmdbId={data.media.tmdbId}
          voteAverage={data.voteAverage}
          voteCount={data.voteCount}
        />
      </TabsContent>
      <TabsContent className="pt-4" value="similar">
        <MediaSimilarTab
          enabled={tab === 'similar'}
          mediaType={data.media.mediaType}
          tmdbId={data.media.tmdbId}
        />
      </TabsContent>
    </Tabs>
  )
}
