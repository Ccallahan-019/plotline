import { WatchlistCard } from '@/features/watchlists/cards/types'

import { DashboardWatchlistRow } from './DashboardWatchlistRow'

type DashboardWatchlistRowsProps = {
  cards: readonly WatchlistCard[]
}

export function DashboardWatchlistRows({ cards }: DashboardWatchlistRowsProps) {
  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <DashboardWatchlistRow card={card} key={card.id} />
      ))}
    </div>
  )
}
