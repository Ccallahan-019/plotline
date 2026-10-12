import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { NewWatchlistButton } from '@/features/watchlists/components/NewWatchlistButton'

export const metadata = {
  title: 'My Challenges',
}

// Auth is enforced for `/dashboard/**` by `src/proxy.ts`.
export default function ChallengesPage() {
  return (
    <div className="flex flex-col gap-2">
      <Item className="px-0">
        <ItemContent>
          <ItemTitle className="text-2xl">My Challenges</ItemTitle>
          <ItemDescription>Challenge lists are coming soon.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <NewWatchlistButton challenge label="New" />
        </ItemActions>
      </Item>
    </div>
  )
}
