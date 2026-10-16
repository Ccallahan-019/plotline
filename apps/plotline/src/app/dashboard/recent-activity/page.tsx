import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { RecentActivityPage } from '@/features/dashboard/components/activity/RecentActivityPage'

export const metadata = {
  title: 'Recent Activity',
}

export default async function RecentActivityRoute() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <RecentActivityPage />
}
