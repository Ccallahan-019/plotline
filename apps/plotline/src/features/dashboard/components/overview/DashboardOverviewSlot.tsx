import { ReactNode } from 'react'

import { useClientTimeZone } from '@/features/dashboard/hooks/use-client-time-zone'
import { useDashboardSummary } from '@/features/dashboard/hooks/use-dashboard-summary'
import { calendarDateInTimeZone } from '@/features/dashboard/services/calendar'
import { DashboardSummary } from '@/features/dashboard/types'

import { DashboardWidgetEmpty } from '../state/DashboardWidgetEmpty'
import { DashboardWidgetError } from '../state/DashboardWidgetError'

type DashboardOverviewSlotProps = {
  children: (summary: DashboardSummary) => ReactNode
  emptyMessage: string
  errorMessage: string
  skeleton: ReactNode
}

// Each block subscribes on its own so a failed summary request replaces only
// that card. Up next, activity, watchlists, trending, and recommendations use
// separate queries and stay on the page.
export function DashboardOverviewSlot({
  children,
  emptyMessage,
  errorMessage,
  skeleton,
}: DashboardOverviewSlotProps) {
  const timeZone = useClientTimeZone()

  if (!timeZone) {
    return skeleton
  }

  return (
    <DashboardOverviewSlotBody
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      skeleton={skeleton}
      timeZone={timeZone}
    >
      {children}
    </DashboardOverviewSlotBody>
  )
}

export function DashboardOverviewSlotBody({
  children,
  emptyMessage,
  errorMessage,
  skeleton,
  timeZone,
}: { timeZone: string } & DashboardOverviewSlotProps) {
  const year = calendarDateInTimeZone(new Date(), timeZone).year
  const { data, isError, isPending, refetch } = useDashboardSummary({ timeZone, year })

  if (data) {
    return children(data)
  }

  if (isError) {
    return (
      <DashboardWidgetError
        message={errorMessage}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (isPending) {
    return skeleton
  }

  return <DashboardWidgetEmpty description={emptyMessage} title="No Data Found" />
}
