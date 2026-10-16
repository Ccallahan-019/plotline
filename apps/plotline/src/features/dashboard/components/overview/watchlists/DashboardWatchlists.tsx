'use client'

import { ChevronRight } from 'lucide-react'

import { ButtonLink } from '@/components/buttons/ButtonLink'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import { useWatchlistCards } from '@/features/watchlists/cards/hooks/use-watchlist-cards'

import { DashboardWatchlistsContent } from './DashboardWatchlistsContent'

export function DashboardWatchlists() {
  const query = useWatchlistCards({ filter: 'list' })

  return (
    <div className="flex flex-col gap-2">
      <Item className="p-0">
        <ItemContent>
          <ItemTitle>Your Watchlists</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ButtonLink href="/dashboard/watchlists" size="sm" variant="ghost">
            View All
            <ChevronRight data-icon="inline-end" />
          </ButtonLink>
        </ItemActions>
      </Item>

      <DashboardWatchlistsContent query={query} />
    </div>
  )
}
