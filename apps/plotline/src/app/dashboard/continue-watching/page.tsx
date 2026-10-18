import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { ContinueWatchingPage } from '@/features/dashboard/components/continue-watching/page/ContinueWatchingPage'
import { getInitialContinueWatching } from '@/features/dashboard/services/get-initial-dashboard'

export const metadata = {
  title: 'Continue Watching',
}

export default async function ContinueWatchingRoute() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const initialData = await getInitialContinueWatching(userId)

  return <ContinueWatchingPage initialData={initialData} />
}
