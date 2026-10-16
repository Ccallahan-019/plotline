'use client'

import type { DashboardRecommendations } from '@/features/dashboard/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useDashboardRecommendations } from '@/features/dashboard/hooks/use-dashboard-recommendations'

import { DashboardRecommendationsCardContent } from './DashboardRecommendationsCardContent'
import { DashboardRecommendationsCardDescription } from './DashboardRecommendationsCardDescription'

type DashboardRecommendationsCardProps = {
  initialData?: DashboardRecommendations
}

export function DashboardRecommendationsCard({ initialData }: DashboardRecommendationsCardProps) {
  const query = useDashboardRecommendations({ initialData })

  if (query.data && query.data.seeds.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended For You</CardTitle>
        <DashboardRecommendationsCardDescription recommendations={query.data} />
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <div className="pb-3.5">
            <DashboardRecommendationsCardContent query={query} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
