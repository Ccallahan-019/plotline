'use client'

import { DashboardWidgetSkeleton } from '@/features/dashboard/components/state/DashboardWidgetSkeleton'

import { DashboardMonthlyChart } from './DashboardMonthlyChart'
import { DashboardOverviewSlot } from './DashboardOverviewSlot'
import { DashboardStreaks } from './DashboardStreaks'
import { DashboardStatCards } from './stats/DashboardStatCards'

export function DashboardMonthlyChartSection() {
  return (
    <DashboardOverviewSlot
      emptyMessage="No titles per month found."
      errorMessage="Couldn't load titles per month."
      skeleton={<DashboardWidgetSkeleton className="h-64" />}
    >
      {(summary) => <DashboardMonthlyChart summary={summary} />}
    </DashboardOverviewSlot>
  )
}

export function DashboardStatCardsSection() {
  return (
    <DashboardOverviewSlot
      emptyMessage="No stats for this year found."
      errorMessage="Couldn't load this year's stats."
      skeleton={<DashboardStatCardsSkeleton />}
    >
      {(summary) => <DashboardStatCards summary={summary} />}
    </DashboardOverviewSlot>
  )
}

export function DashboardStreaksSection() {
  return (
    <DashboardOverviewSlot
      emptyMessage="No streaks found."
      errorMessage="Couldn't load streaks."
      skeleton={<DashboardWidgetSkeleton className="h-64" />}
    >
      {(summary) => <DashboardStreaks summary={summary} />}
    </DashboardOverviewSlot>
  )
}

function DashboardStatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <DashboardWidgetSkeleton className="h-28" key={index} />
      ))}
    </div>
  )
}
