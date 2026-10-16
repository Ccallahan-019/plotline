'use client'

import { useMemo, useState } from 'react'

import { Spinner } from '@/components/ui/spinner'
import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { getErrorMessage } from '@/utils/get-error-message'

import { useWatchlistCards } from '../hooks/use-watchlist-cards'
import { sortWatchlistCards } from '../services/build-watchlist-cards'
import {
  DEFAULT_WATCHLIST_CARD_SORT,
  type WatchlistCard,
  type WatchlistCardFilter,
  type WatchlistCardSort,
} from '../types'
import { ChallengesEmpty } from './ChallengesEmpty'
import { WatchlistGridCard } from './WatchlistCard'
import { WatchlistCardSortSelector } from './WatchlistCardSortSelector'
import { WatchlistsEmpty } from './WatchlistsEmpty'

const ERROR_DESCRIPTION =
  'Ensure the payload app is running and service credentials are configured.'

type WatchlistsGridProps = {
  filter: WatchlistCardFilter
  initialData: WatchlistCard[]
  initialError?: null | string
}

export function WatchlistsGrid({ filter, initialData, initialError = null }: WatchlistsGridProps) {
  const [sort, setSort] = useState<WatchlistCardSort>(DEFAULT_WATCHLIST_CARD_SORT)
  const {
    data: cards = initialData,
    error,
    isFetching,
  } = useWatchlistCards({
    filter,
    initialData,
  })
  const sortedCards = useMemo(() => sortWatchlistCards(cards, sort), [cards, sort])
  const isChallenge = filter === 'challenge'

  const errorMessage = getErrorMessage(error) ?? initialError

  if (errorMessage) {
    return (
      <ErrorEmpty
        description={ERROR_DESCRIPTION}
        errorMessage={errorMessage}
        title={isChallenge ? 'Could not load challenges' : 'Could not load watchlists'}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <WatchlistCardSortSelector
          label={isChallenge ? 'Sort challenges' : 'Sort watchlists'}
          onSortChange={setSort}
          sort={sort}
        />
      </div>
      <div aria-busy={isFetching} className="relative">
        <GridContent cards={sortedCards} filter={filter} />
        <FetchingOverlay isFetching={isFetching} />
      </div>
    </div>
  )
}

const FetchingOverlay = ({ isFetching }: { isFetching: boolean }) => {
  if (!isFetching) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/60">
      <Spinner className="size-7" />
    </div>
  )
}

const GridContent = ({
  cards,
  filter,
}: {
  cards: WatchlistCard[]
  filter: WatchlistCardFilter
}) => {
  if (cards.length === 0) {
    return filter === 'challenge' ? <ChallengesEmpty /> : <WatchlistsEmpty />
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
      {cards.map((card) => (
        <WatchlistGridCard card={card} key={card.id} />
      ))}
    </div>
  )
}
