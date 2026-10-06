import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-16">
      <section className="flex max-w-3xl flex-col gap-6">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Media tracking for people who care what they watch
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Your watch history, watchlists, and stats in one place.
        </h1>
        <p className="text-lg text-muted-foreground">
          Plotline connects Clerk authentication with a Payload CMS backend so you can log watches,
          organize lists, and build toward Year in Review insights.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className={cn(buttonVariants({ size: 'lg' }))} href="/sign-up">
            Create account
          </Link>
          <Link className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))} href="/sign-in">
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Watchlists</CardTitle>
            <CardDescription>Organize planned, in-progress, and completed titles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className={cn(buttonVariants({ variant: 'secondary' }))}
              href="/dashboard/watchlists"
            >
              View watchlists
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Log watches</CardTitle>
            <CardDescription>
              Record movies and TV progress through the Payload BFF layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants({ variant: 'secondary' }))} href="/dashboard">
              Open dashboard
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Search TMDB</CardTitle>
            <CardDescription>
              Find titles server-side and upsert them into your library.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              TMDB search is available from authenticated API routes once keys are configured.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
