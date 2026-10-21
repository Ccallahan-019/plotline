'use client'

import { pickChallengeSpotlight } from '@/features/dashboard/services/challenge-spotlight'
import { useWatchlistCards } from '@/features/watchlists/cards/hooks/use-watchlist-cards'

import { DashboardWidgetError } from '../../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'
import { DashboardChallengeSpotlightCard } from './DashboardChallengeSpotlightCard'
import { DashboardChallengeSpotlightEmpty } from './DashboardChallengeSpotlightEmpty'

export function DashboardChallengeSpotlight() {
  const { data, isError, isLoading, refetch } = useWatchlistCards({ filter: 'challenge' })

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-48" />
  }

  if (isError) {
    const handleRetry = () => {
      void refetch()
    }

    return <DashboardWidgetError message="Couldn't load challenges." onRetry={handleRetry} />
  }

  if (!data || data.length === 0) {
    return <DashboardChallengeSpotlightEmpty />
  }

  const card = pickChallengeSpotlight(data)

  if (!card) {
    return <DashboardChallengeSpotlightEmpty />
  }

  return <DashboardChallengeSpotlightCard card={card} />
}
