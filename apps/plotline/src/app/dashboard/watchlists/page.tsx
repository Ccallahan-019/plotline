import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { NewWatchlistButton } from '@/features/watchlists/components/NewWatchlistButton'
import { WatchlistsGrid } from '@/features/watchlists/components/WatchlistsGrid'
import { getInitialWatchlistCards } from '@/features/watchlists/services/get-initial-watchlist-cards'

export const metadata = {
  title: 'Watchlists',
}

export default async function WatchlistsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { initialError, initialWatchlistCards } = await getInitialWatchlistCards(userId)

  return (
    <div className="flex flex-col">
      <Item className="px-0">
        <ItemContent>
          <ItemTitle className="text-2xl">Watchlists</ItemTitle>
          <ItemDescription>
            Organize movies and shows into lists you want to watch, revisit, or finish.
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          <NewWatchlistButton />
        </ItemActions>
      </Item>

      <WatchlistsGrid initialData={initialWatchlistCards} initialError={initialError} />
    </div>
  )
}
