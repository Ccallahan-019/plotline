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
        description="Everything you've logged, rated and reviewed."
        title="Recent Activity"
      />
      {timeZone ? (
        <RecentActivityFeed timeZone={timeZone} />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 flex-wrap justify-between">
              <DashboardWidgetSkeleton className="h-8 w-full max-w-92" />
              <DashboardWidgetSkeleton className="h-8 w-full max-w-64" />
            </div>
            <DashboardWidgetSkeleton className="h-80" />
          </div>
          <DashboardWidgetSkeleton className="h-48" />
        </div>
      )}
    </div>
  )
}
