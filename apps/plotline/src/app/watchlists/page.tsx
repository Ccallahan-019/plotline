import type { Watchlist } from '@plotline/payload-types'

import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWatchlists } from '@/lib/payload'
import { PayloadClientError } from '@/lib/payload/client'

export const metadata = {
  title: 'Watchlists',
}

export default async function WatchlistsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  let watchlists: Watchlist[] = []
  let errorMessage: null | string = null

  try {
    watchlists = await getWatchlists(userId)
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      watchlists = []
    } else if (error instanceof Error) {
      errorMessage = error.message
    } else {
      errorMessage = 'Failed to load watchlists'
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          Library
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Watchlists</h1>
        <p className="text-muted-foreground">
          Loaded from Payload via the BFF layer using your Clerk session.
        </p>
      </div>

      {errorMessage ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Could not reach Payload</CardTitle>
            <CardDescription>
              Ensure the payload app is running on {process.env.PAYLOAD_URL ?? 'PAYLOAD_URL'} and
              service credentials are configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-destructive">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : watchlists.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No watchlists yet</CardTitle>
            <CardDescription>
              Profiles and default watchlists are created when Clerk webhooks sync to Payload.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {watchlists.map((watchlist) => (
            <Link href={`/watchlists/${watchlist.slug}`} key={watchlist.id}>
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
      )}
    </div>
  )
}
