'use client'

import { useMemo, useState } from 'react'

import { Spinner } from '@/components/ui/spinner'
import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { useWatchlistCards } from '@/features/watchlists/hooks/use-watchlist-cards'
import { sortWatchlistCards } from '@/features/watchlists/services/build-watchlist-cards'
import { getErrorMessage } from '@/utils/get-error-message'

import { DEFAULT_WATCHLIST_CARD_SORT, type WatchlistCard, type WatchlistCardSort } from '../types'
import { WatchlistGridCard } from './WatchlistCard'
import { WatchlistCardSortSelector } from './WatchlistCardSortSelector'
import { WatchlistsEmpty } from './WatchlistsEmpty'

const ERROR_EMPTY_PROPS = {
  description: 'Ensure the payload app is running and service credentials are configured.',
  title: 'Could not load watchlists',
}

type WatchlistsGridProps = {
  initialData: WatchlistCard[]
  initialError?: null | string
}

export function WatchlistsGrid({ initialData, initialError = null }: WatchlistsGridProps) {
  const [sort, setSort] = useState<WatchlistCardSort>(DEFAULT_WATCHLIST_CARD_SORT)
  const {
    data: cards = initialData,
    error,
    isFetching,
  } = useWatchlistCards({
    initialData,
  })
  const sortedCards = useMemo(() => sortWatchlistCards(cards, sort), [cards, sort])

  const errorMessage = getErrorMessage(error) ?? initialError

  if (errorMessage) {
    return <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <WatchlistCardSortSelector onSortChange={setSort} sort={sort} />
      </div>
      <div aria-busy={isFetching} className="relative">
        <GridContent cards={sortedCards} />
        <FetchingOverlay isFetching={isFetching} />
      </div>
    </div>
  )
}

const FetchingOverlay = ({ isFetching }: { isFetching: boolean }) => {
  if (!isFetching) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
      <Spinner className="size-7" />
    </div>
  )
}

const GridContent = ({ cards }: { cards: WatchlistCard[] }) => {
  if (cards.length === 0) {
    return <WatchlistsEmpty />
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
      {cards.map((card) => (
        <WatchlistGridCard card={card} key={card.id} />
      ))}
    </div>
  )
}
