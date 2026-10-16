'use client'

import { ChevronRight } from 'lucide-react'

import { ButtonLink } from '@/components/buttons/ButtonLink'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClientTimeZone } from '@/features/dashboard/hooks/use-client-time-zone'

import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'
import { DashboardRecentlyWatchedList } from './DashboardRecentlyWatchedList'

export function DashboardRecentlyWatched() {
  const timeZone = useClientTimeZone()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Watched</CardTitle>
        <CardAction>
          <ButtonLink href="/dashboard/recent-activity" size="sm" variant="ghost">
            Your Activity
            <ChevronRight data-icon="inline-end" />
          </ButtonLink>
        </CardAction>
      </CardHeader>
      <CardContent>
        {timeZone ? (
          <DashboardRecentlyWatchedList timeZone={timeZone} />
        ) : (
          <DashboardWidgetSkeleton className="h-40" />
        )}
      </CardContent>
    </Card>
  )
}
