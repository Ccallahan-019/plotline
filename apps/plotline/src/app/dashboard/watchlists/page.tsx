import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { WatchlistsGrid } from '@/features/watchlists/components/WatchlistsGrid'
import { getInitialWatchlists } from '@/features/watchlists/services/get-initial-watchlists'

export const metadata = {
  title: 'Watchlists',
}

export default async function WatchlistsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { initialError, initialWatchlists } = await getInitialWatchlists(userId)

  return (
    <>
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          Library
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Watchlists</h1>
        <p className="text-muted-foreground">
          Server-prefetched data hydrated into TanStack Query for live updates after mutations.
        </p>
      </div>

      <WatchlistsGrid initialData={initialWatchlists} initialError={initialError} />
    </>
  )
}
