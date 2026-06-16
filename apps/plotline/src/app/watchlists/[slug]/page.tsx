import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getWatchlistBySlug } from '@/lib/payload'
import { PayloadClientError } from '@/lib/payload/client'
import { cn } from '@/lib/utils'

type WatchlistDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: WatchlistDetailPageProps) {
  const { slug } = await params

  return {
    title: slug,
  }
}

export default async function WatchlistDetailPage({ params }: WatchlistDetailPageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  let watchlist = null

  try {
    watchlist = await getWatchlistBySlug(userId, slug)
  } catch (error) {
    if (!(error instanceof PayloadClientError) || error.status !== 404) {
      throw error
    }
  }

  if (!watchlist) {
    notFound()
  }

  const stats = watchlist.statsCache

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit" variant="secondary">
            Watchlist
          </Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{watchlist.name}</h1>
          <p className="max-w-2xl text-muted-foreground">
            {watchlist.description ?? 'Detail view stub — memberships and media grid coming next.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{watchlist.visibility}</Badge>
            {watchlist.challenge?.enabled ? <Badge>Challenge mode</Badge> : null}
          </div>
        </div>
        <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/watchlists">
          Back to lists
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stats cache</CardTitle>
          <CardDescription>Derived from Payload watchlist membership hooks.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Stat label="Completed" value={stats?.completed ?? 0} />
          <Separator className="sm:hidden" />
          <Stat label="In progress" value={stats?.inProgress ?? 0} />
          <Separator className="sm:hidden" />
          <Stat label="Remaining" value={stats?.remaining ?? 0} />
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-semibold">{value}</span>
    </div>
  )
}
