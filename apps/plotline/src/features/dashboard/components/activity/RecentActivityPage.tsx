'use client'

import { PageHeading } from '@/components/pages/PageHeading'
import { DashboardWidgetSkeleton } from '@/features/dashboard/components/state/DashboardWidgetSkeleton'
import { useClientTimeZone } from '@/features/dashboard/hooks/use-client-time-zone'

import { RecentActivityFeed } from './RecentActivityFeed'

export function RecentActivityPage() {
  const timeZone = useClientTimeZone()

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        description="Watches, ratings, reviews, challenges, and milestones."
        title="Recent Activity"
      />
      {timeZone ? (
        <RecentActivityFeed timeZone={timeZone} />
      ) : (
        <DashboardWidgetSkeleton className="h-80" />
      )}
    </div>
  )
}
