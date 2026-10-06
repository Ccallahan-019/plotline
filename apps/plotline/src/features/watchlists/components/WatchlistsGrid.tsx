'use client'

import type { Watchlist } from '@plotline/payload-types'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorEmpty } from '@/components/utils/ErrorEmpty'
import { useWatchlists } from '@/features/watchlists/hooks/use-watchlists'
import { getErrorMessage } from '@/utils/get-error-message'

import { WatchlistsEmpty } from './WatchlistsEmpty'

const ERROR_EMPTY_PROPS = {
  description: 'Ensure the payload app is running and service credentials are configured.',
  title: 'Could not load watchlists',
}

type WatchlistsGridProps = {
  initialData: Watchlist[]
  initialError?: null | string
}

export function WatchlistsGrid({ initialData, initialError = null }: WatchlistsGridProps) {
  const {
    data: watchlists = initialData,
    error,
    isFetching,
  } = useWatchlists(undefined, {
    initialData,
  })

  const errorMessage = getErrorMessage(error) ?? initialError

  if (errorMessage) {
    return <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />
  }

  if (watchlists.length === 0) {
    return <WatchlistsEmpty />
  }

  return (
    <div className="flex flex-col gap-4">
      {isFetching ? <p className="text-sm text-muted-foreground">Refreshing watchlists…</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {watchlists.map((watchlist) => (
          <Link href={`/dashboard/watchlists/${watchlist.slug}`} key={watchlist.id}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader>
                <CardTitle>{watchlist.name}</CardTitle>
                <CardDescription>{watchlist.description ?? 'No description'}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">{watchlist.visibility}</Badge>
                {watchlist.isSystem ? <Badge variant="secondary">System</Badge> : null}
                {watchlist.challenge?.enabled ? <Badge>Challenge</Badge> : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
