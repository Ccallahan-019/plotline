import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { DashboardOverview } from '@/features/dashboard/components/overview/DashboardOverview'
import { getInitialDashboardOverview } from '@/features/dashboard/services/get-initial-dashboard'

export const metadata = {
  title: 'Overview',
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const initial = await getInitialDashboardOverview(userId)

  return <DashboardOverview continueWatching={initial.continueWatching} />
}
