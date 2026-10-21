'use client'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { DashboardChallengeSpotlight } from '@/features/dashboard/components/overview/challenge/DashboardChallengeSpotlight'
import { DashboardUpNext } from '@/features/dashboard/components/overview/continue-watching/DashboardUpNext'
import {
  DashboardMonthlyChartSection,
  DashboardStatCardsSection,
  DashboardStreaksSection,
} from '@/features/dashboard/components/overview/DashboardOverviewSections'
import { DashboardRecentlyWatched } from '@/features/dashboard/components/overview/recent-activity/DashboardRecentlyWatched'
import { DashboardRecommendationsCard } from '@/features/dashboard/components/overview/recommendations/DashboardRecommendationsCard'
import { DashboardTrendingCard } from '@/features/dashboard/components/overview/trending/DashboardTrendingCard'
import { DashboardWatchlists } from '@/features/dashboard/components/overview/watchlists/DashboardWatchlists'

type DashboardOverviewProps = {
  continueWatching?: LibraryItemsResponse
}

export function DashboardOverview({ continueWatching }: DashboardOverviewProps) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <DashboardStatCardsSection />
        <DashboardChallengeSpotlight />
        <DashboardUpNext initialData={continueWatching} />
        <DashboardMonthlyChartSection />
        <DashboardRecentlyWatched />
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <DashboardWatchlists />
        <DashboardStreaksSection />
        <DashboardTrendingCard />
        <DashboardRecommendationsCard />
      </div>
    </div>
  )
}
