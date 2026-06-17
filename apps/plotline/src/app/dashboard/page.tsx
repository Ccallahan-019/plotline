import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          Protected
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Signed in as <span className="font-mono text-sm">{userId}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
            <CardDescription>Jump into the MVP surfaces wired to Payload.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Link className="text-primary underline-offset-4 hover:underline" href="/dashboard/watchlists">
              Browse watchlists
            </Link>
            <Link className="text-primary underline-offset-4 hover:underline" href="/api/tmdb/search?q=inception">
              Test TMDB search API
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming soon</CardTitle>
            <CardDescription>Roadmap items documented in the app README.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PlaceholderRow label="Year in Review" />
            <Separator />
            <PlaceholderRow label="Recommendations" />
            <Separator />
            <PlaceholderRow label="Social feed" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function PlaceholderRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
