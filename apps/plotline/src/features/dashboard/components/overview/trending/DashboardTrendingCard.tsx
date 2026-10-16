'use client'

import type { TrendingTitles } from '@/features/dashboard/types'

import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useTrendingTitles } from '@/features/dashboard/hooks/use-trending'

import { DashboardTrendingCardContent } from './DashboardTrendingCardContent'

type DashboardTrendingCardProps = {
  initialData?: TrendingTitles
}

export function DashboardTrendingCard({ initialData }: DashboardTrendingCardProps) {
  const query = useTrendingTitles({ initialData })

  return (
    <div className="flex flex-col gap-2">
      <Item className="p-0">
        <ItemContent className="gap-0">
          <ItemTitle>Trending Now</ItemTitle>
          <ItemDescription>Movies and series trending on TMDB</ItemDescription>
        </ItemContent>
      </Item>
      <DashboardTrendingCardContent query={query} />
    </div>
  )
}
