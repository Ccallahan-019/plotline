import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { NewWatchlistButton } from '@/features/watchlists/cards/components/NewWatchlistButton'
import { WatchlistsGrid } from '@/features/watchlists/cards/components/WatchlistsGrid'
import { getInitialWatchlistCards } from '@/features/watchlists/cards/services/get-initial-watchlist-cards'

export const metadata = {
  title: 'My Challenges',
}

export default async function ChallengesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { initialError, initialWatchlistCards } = await getInitialWatchlistCards(
    userId,
    'challenge',
  )

  return (
    <div className="flex flex-col">
      <Item className="px-0">
        <ItemContent>
          <ItemTitle className="text-2xl">My Challenges</ItemTitle>
          <ItemDescription>
            Set a title count or runtime goal and track your pace to the due date.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <NewWatchlistButton challenge label="New Challenge" />
        </ItemActions>
      </Item>

      <WatchlistsGrid
        filter="challenge"
        initialData={initialWatchlistCards}
        initialError={initialError}
      />
    </div>
  )
}
